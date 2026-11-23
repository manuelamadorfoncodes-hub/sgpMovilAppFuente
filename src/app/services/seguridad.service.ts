import { AlertController, NavController } from '@ionic/angular'
import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { JwtHelperService } from '@auth0/angular-jwt'
import { Device } from '@capacitor/device';
import { environment } from '../../environments/environment'
import { UiServiceService } from './ui-service.service'
import { StorageService } from './storage.service';
import { DobleFactorService } from './doble-factor.service';
import { User, Modulo, ZonalModulo, Funcion } from '../model/generales'

const helper = new JwtHelperService()

@Injectable({
    providedIn: 'root'
})
export class SeguridadService {
    token: string = null

    constructor(private http: HttpClient,
        private storage: StorageService,
        private navController: NavController,
        private alertController: AlertController,
        private uiService: UiServiceService,
        private dobleFactorService: DobleFactorService
        ) { }

    async obtenerReferencia() {
        const info = await Device.getInfo()
        return `SGP Móvil versión ${environment.version}. Equipo: ${info.manufacturer} ${info.model}. SO: ${info.operatingSystem} ${info.osVersion}`
    }
    
    async login(idusuario: string, clave: string) {
        const referencia = await this.obtenerReferencia()
        // Doble factor: servicio nuevo /dobleFactor/autenticar (la clave ya no se escribe en la consola)
        const data = { idusuario, clave, nidmodulo: environment.nidModulo, referencia, equipo: this.dobleFactorService.obtenerIdentificadorEquipo() }
        this.dobleFactorService.limpiarReto()
        return new Promise<string>(resolve => {

            this.http.post(`${environment.urlSeguridad}/dobleFactor/autenticar`, data)
                .subscribe({
                    next: async (resp) => {
                        if (resp['status'] === 1) {
                            // Usuario y contraseña correctos: falta el segundo factor
                            this.dobleFactorService.iniciarReto(resp)
                            resolve('df');
                        } else if (resp['status'] !== 0) {
                            this.token = null;
                            this.storage.clear();
                            resolve(resp['message']);
                        } else {
                            await this.guardarToken(resp)
                            let modulo = resp['modulo']
                            let acuerdo = modulo.confidencialidad
                            if (acuerdo) {
                                resolve('ok');
                            } else {
                                // OJO no pasa a producción (11/08/2021)
                                resolve('ok')
                                // resolve(await this.acuerdoConfidencialidad())
                            }
                        }
                    },
                    error: (error: any) => {
                        console.error('Error en el login: ', error);
                        resolve(error.error)
                    },
                })

                // .subscribe(async resp => {
                //     if (resp['status'] !== 0) {
                //         this.token = null;
                //         this.storage.clear();
                //         resolve(resp['message']);
                //     } else {
                //         await this.guardarToken(resp)
                //         let modulo = resp['modulo']
                //         let acuerdo = modulo.confidencialidad
                //         if (acuerdo) {
                //             resolve('ok');
                //         } else {
                //             // OJO no pasa a producción (11/08/2021)
                //             resolve('ok')
                //             // resolve(await this.acuerdoConfidencialidad())
                //         }
                //     }
                // }, error => {
                //     console.error('Error en el login: ', error);
                //     resolve(error.error)
                // });
        });
    }

    solicitarCodigo(correo: string, dni: string, accion: string) {
        const data = { correo, dni, accion, nidmodulo: environment.nidModulo };
        return new Promise(resolve => {
            this.http.post(`${environment.urlSeguridad}/usuario/solicitarCodigo`, data)
                .subscribe(async resp => {
                    if (resp) {
                        resolve(resp);
                    } else {
                        resolve('error');
                    }
                }, error => {
                    resolve(error.error)
                });
        });
    }

    registrar(correo: string, dni: string, codigo: string, clave: string, accion: string) {
        const data = { correo, dni, codigo, clave, accion, nidmodulo: environment.nidModulo };
        return new Promise(resolve => {
            this.http.post(`${environment.urlSeguridad}/usuario/registrar`, data)
                .subscribe(async resp => {
                    if (resp) {
                        resolve(resp);
                    } else {
                        resolve('error');
                    }
                }, error => {
                    console.error('error al registrar el usuario', error);
                    resolve(error.error)
                });
        });
    }

    async guardarToken(resp: any) {
        console.log('guarda token', resp);
        this.token = resp['token'];
        await this.storage.set('token', this.token);
        const decodedToken = helper.decodeToken(this.token);
        const user: User = {
            nidUsuario: decodedToken.nidusr,
            apellidoPaterno: decodedToken.apepat,
            apellidoMaterno: decodedToken.apemat,
            nombres: decodedToken.nombres,
            email: decodedToken.email,
            nidPersonal: decodedToken.nidper,
            nidControlAccesoWeb: decodedToken.nidctrl,
            codZonal: decodedToken.codzonal,
            zonal: decodedToken.nomzonal
        }
        let modulo: Modulo = resp['modulo']
        modulo = await this.obtieneFunciones(user.nidPersonal, modulo)
        // Mientras el servicio no permisos por zonal y perfil
        modulo.zonales.forEach(zonal => {zonal.perfil = modulo.perfiles.find(item => zonal.txtperfiles.includes(item.txtperfil))})
        await this.storage.set('modulo', modulo)
        await this.verificarPermisos(user, modulo)

        // user.perfil = modulo.perfiles[0]
        // await this.storage.set('user', user)
        // await this.storage.set('modulo', modulo)
    }

    async obtieneFunciones(nidPersonal: number, modulo: Modulo) {
        for (let index = 0; index < modulo.perfiles.length; index++) {
            if (modulo.perfiles[0].nidperfil == 11) {
                modulo.perfiles[index].funcion = await this.obtenerFuncionAgente(modulo.perfiles[index].nidperfil, nidPersonal)
            } else {
                modulo.perfiles[index].funcion = await this.obtenerFuncion(modulo.perfiles[index].nidperfil)
                if (!modulo.perfiles[index].funcion) {
                    modulo.perfiles[index].funcion = await this.obtenerFuncionAgente(modulo.perfiles[index].nidperfil, nidPersonal)
                }
                console.log('obtieneFunciones :>> ', modulo.perfiles[index].funcion);
            }  
        }
        return modulo
    }

    async verificarPermisos(user: User, modulo: Modulo) {
        let permisoZonal: ZonalModulo = await this.storage.get('permisoZonal')
        if (permisoZonal) {
            // renueva
            if (modulo.zonales.length > 0) {
                const index = modulo.zonales.findIndex(item => item.codzonal === permisoZonal.codzonal && item.perfil.nidperfil === permisoZonal.perfil.nidperfil)
                if (index >= 0) {
                    permisoZonal.opciones = modulo.zonales[index].opciones
                    await this.actualizaPermisos(user, permisoZonal)
                }
            }
        } else {
            // inicio
            if (modulo.zonales.length === 1) {
                permisoZonal = modulo.zonales[0]
            } else {
                // selecciona
                permisoZonal = await this.seleccionaPermiso(modulo)
                if (!permisoZonal) {return}
            }
            await this.actualizaPermisos(user, permisoZonal)
        }

    }

    async actualizaPermisos(user: User, permisoZonal: ZonalModulo) {
        user.codZonal = permisoZonal.codzonal
        user.zonal = permisoZonal.txtzonal
        user.perfil = permisoZonal.perfil
        await this.storage.set('user', user)
        await this.storage.set('permisoZonal', permisoZonal)
        if (permisoZonal.perfil.funcion) {await this.storage.set('funcion', permisoZonal.perfil.funcion)}
    }

    async seleccionaPermiso(modulo: Modulo) {
        let permisoZonal: ZonalModulo
        const opciones = []
        modulo.zonales.forEach(zonal => {
            opciones.push({label: `${zonal.txtzonal} - ${zonal.perfil.txtperfil}` , type: 'radio', value: zonal, mode: 'md'})
        })

        const alert = await this.alertController.create({
            cssClass: 'permisos-alert',
            mode: 'ios',
            header: 'Cambiar Unidad Territorial',
            //   message: 'Ingrese su contraseña:',
            subHeader: 'Seleccione la Unidad Territorial y Perfil con el que desea trabajar:',
            inputs: opciones,
            buttons: [
                { text: 'Cancelar', role: 'cancel', cssClass: 'secondary', handler: () => { console.log('Confirm Cancel')} },
                { text: 'Aceptar', handler: (data) => {permisoZonal = data} }
            ]
        })

        await alert.present()
        await alert.onDidDismiss()
        if (!permisoZonal) {
            console.log('no seleccionó zonal');
            return null
        }
        return permisoZonal
    }

    async cambiarPermiso() {
        const ok = await this.renuevaToken()
        console.log('respuesta de renueva token en cambia permiso ok :>> ', ok);
        if (!ok) { return }
        const modulo: Modulo = await this.storage.get('modulo')
        if (modulo) {
            const permisoZonal = await this.seleccionaPermiso(modulo)
            if (permisoZonal) {
                if (modulo.zonales.length >= 2 || (modulo.zonales.length === 1 && modulo.zonales[0].codzonal === permisoZonal.codzonal && modulo.zonales[0].perfil.nidperfil === permisoZonal.perfil.nidperfil)) {
                    const user: User = await this.storage.get('user')
                    if (permisoZonal.codzonal != user.codZonal || permisoZonal.perfil.nidperfil != user.perfil.nidperfil)
                    await this.uiService.alertaConfirmacion('Si cambia de Unidad Territorial o perfil perderá toda la información registrada que no haya sincronizado. ¿Está seguro de realizar el cambio?').then(async (resp) => {
                        if (resp) {
                            await this.actualizaPermisos(user, permisoZonal)
                            await this.storage.set('flagDataInicial', 0)
                            this.navController.navigateRoot('/inicio')
                        }
                    })
                } else {
                    await this.uiService.alertaInformativa('No es posible cambiar, no tiene más permisos.')
                }
            }
        } else {
            await this.uiService.alertaInformativa('Todos sus permisos han sido revocados.')
        }
    }

    async evaluaPermisos() {
        const user: User = await this.storage.get('user')
        const modulo: Modulo = await this.storage.get('modulo')
        if (modulo && modulo.zonales && modulo.zonales.length > 0) {
            console.log('evalua modulo :>> ', modulo, user);
            for (let index = 0; index < modulo.zonales.length; index++) {
                console.log('zonal :>> ', modulo.zonales[index]);
                console.log('modulo.zonales[index].codzonal === user.codZonal :>> ', modulo.zonales[index].codzonal, user.codZonal)
                console.log('modulo.zonales[index].perfil.nidperfil == user.perfil.nidperfil :>> ', modulo.zonales[index].perfil.nidperfil, user.perfil.nidperfil);
                if (modulo.zonales[index].codzonal === user.codZonal && modulo.zonales[index].perfil.nidperfil == user.perfil.nidperfil) {

                    console.log('confirma');
                    return true
                }
            }
            console.log('rechaza');
            return false
        } else {
            return false
        }
    }

    async guardarPermisoZonal(modulo: Modulo) {
        if (modulo.zonales.length === 1) {
            await this.storage.set('permisoZonal', modulo.zonales[0])
        } else {

        }
    }

    /**
     * La sesión debe volver a verificarse (doble factor). Solo se quita el token: se conservan los datos
     * guardados en el celular (incluidos los no sincronizados) y los permisos elegidos.
     */
    async sesionNoVerificada(mensaje?: string) {
        this.token = null
        await this.storage.remove('token')
        this.navController.navigateRoot('/login')
        await this.uiService.alertaInformativa(mensaje || 'Debe iniciar sesión nuevamente para verificar su identidad.')
    }

    async limpiarToken() {
        this.token = null
        this.storage.clear()
    }

    async cargarToken() {
        this.token = await this.storage.get('token') || null
        return this.token
    }

    async existeToken(): Promise<boolean> {
        await this.cargarToken()
        if (!this.token) {
            this.navController.navigateRoot('/login')
            return Promise.resolve(false)
        }
        console.log('Si existe token');
        return Promise.resolve(true)
    }

    async evaluarToken() {
        await this.cargarToken()
        if (!this.token) {
            this.navController.navigateRoot('/login')
            return Promise.resolve(false)
        }
        if (helper.isTokenExpired(this.token)) {
            const resp = await this.renuevaToken()
            if (resp) {
                console.log('EvaluarToken: token renovado', resp);
                return Promise.resolve(true)
            } else {
                console.log('EvaluarToken: error al renovar token');
                return Promise.resolve(false)
            }
        }
        return Promise.resolve(true)
    }

    async renuevaToken() {
        return new Promise<boolean>(async resolve => {
            this.http.post(`${environment.urlSeguridad}/dobleFactor/token/renovar`, { nidmodulo: environment.nidModulo, referencia: await this.obtenerReferencia() })
                .subscribe(async resp => {
                    if (resp['status'] === -3) {
                        // Sesión sin doble factor o de más de DF_DIAS_MAXIMO_SESION días
                        await this.sesionNoVerificada(resp['message'])
                        resolve(false)
                        return
                    }
                    if (resp['status'] !== 0) {
                        console.log('renuevaToken resp del servicio :>> ', resp);
                        if (resp['status'] === -2) {
                            const res = await this.abrirConfirmarClave()
                            if (res) {resolve(true)}
                            resolve(false)
                        }
                        await this.storage.remove('modulo')
                        resolve(resp['message'])
                    } else {
                        const res = await this.guardarToken(resp)
                        console.log('Respuesta de Renueva Token :>> ', res);
                        resolve(true);
                    }
                }, error => {
                    console.error('Error al renovar el token', error);
                    resolve(false)
                });
        });
    }

    async validaAcceso() {
        console.log('Entra a valida accesos');
        const acceso = await this.validarControlAcceso()
        if (!acceso) {
            const confirma = await this.abrirConfirmarClave()
            if (confirma) {return true}
        } else {
            return true
        }
        return false
    }

    validarControlAcceso () {
        return new Promise<boolean>(async resolve => {
            this.http.post(`${environment.urlSeguridad}/usuario/validarControlAcceso`, { nidmodulo: environment.nidModulo })
                .subscribe(async resp => {
                    if (resp['status'] === 0) { resolve(true)}
                    resolve(false);
                }, error => {
                    console.log('error al validar accesos', error);
                    resolve(false)
                });
        });
    }

    async abrirConfirmarClave() {
        let clave = ''
        const alert = await this.alertController.create({
            cssClass: 'my-custom-class',
            mode: 'ios',
            //   header: 'Ingrese su contraseña:',
            //   message: 'Ingrese su contraseña:',
            subHeader: 'Ingrese su contraseña:',
            inputs: [{ name: 'clave', type: 'password', id: 'id1', placeholder: 'Contraseña' }],
            buttons: [
                { text: 'Cancelar', role: 'cancel', cssClass: 'secondary', handler: () => { console.log('Confirm Cancel')} },
                { text: 'Aceptar', handler: (data) => {clave = data.clave} }
            ]
        });

        await alert.present()
        await alert.onDidDismiss()
        if (clave !== '') {
            const resp = await this.llamarConfirmarClave(clave)
            if (resp) {return true}
            return false
        }
        return false
    }

    llamarConfirmarClave (clave: string) {
        return new Promise<boolean>(async resolve => {
            const parametros = {clave, nidmodulo: environment.nidModulo, referencia: await this.obtenerReferencia()};
            this.http.post(`${environment.urlSeguridad}/dobleFactor/clave/confirmar`, parametros)
            .subscribe(async resp => {
                if (resp['status'] === -3) {
                    await this.sesionNoVerificada(resp['message'])
                    resolve(false)
                    return
                }
                if (resp['status'] !== 0) {
                    this.uiService.presentToast(resp['message'] ? resp['message'] : 'Error')
                    resolve(false);
                } else {
                    await this.guardarToken(resp);
                    this.uiService.presentToast('Conforme.')
                    resolve(true);
                }
            }, error => {
                console.error('error confirmar clave', error);
                resolve(false)
            });
        });
    }

    async validaAcuerdo() {
        const modulo: Modulo = await this.storage.get('modulo')
        console.log('Entra a valida acuerdo');
        if (modulo.confidencialidad) {return true}
        return false
    }

    async acuerdoConfidencialidad() {
        const modulo: Modulo = await this.storage.get('modulo')
        const acuerdo = await this.uiService.alertaAcuerdo(modulo.confidencialidad)
        return new Promise<string>(async resolve => {
            if (modulo.confidencialidad) {resolve('ok')}
            if (acuerdo) {
                const tokenOk = await this.evaluarToken()
                if (!tokenOk) {
                    resolve('Error al guardar el acuerdo de confidencialidad. Falta permisos.')
                } else {
                    this.http.post(`${environment.urlSeguridad}/usuario/guardarAcuerdoConfidencial`, {nidmodulo: environment.nidModulo})
                        .subscribe(async resp => {
                            if (resp  && resp['status'] == 0) {

                                modulo.confidencialidad = true
                                await this.storage.set('modulo',modulo)
                                resolve('ok')
                            } else {
                                resolve('Error al guardar el acuerdo de confidencialidad.')
                            }
                        })
                }
            } else {
                resolve('No aceptó el acuerdo de confidencialidad de la información.')
            }
        })
    }

    obtenerFuncion(perfil: number) {
        console.log('seguridad obtenerFuncion');
        return new Promise<Funcion>( resolve => {
            this.http.get(`${environment.urlSgpMovil}/agente/obtenerFuncion/${perfil}`).subscribe(async resp => {
                if (!resp['result']) { resolve(null) }
                const funcion: Funcion = resp['result']
                await this.storage.set('funcion', funcion)
                resolve(funcion)
            })
        })
    }

    obtenerFuncionAgente(perfil: number, nidPersonal: number) {
        console.log('seguridad obtenerFuncionAgente');
        return new Promise<Funcion>( resolve => {
            this.http.get(`${environment.urlSgpMovil}/agente/obtenerFuncionAgente/${perfil}/${nidPersonal}`).subscribe(async resp => {
                if (!resp['result']) { resolve(null) }
                const funcion: Funcion = resp['result']
                await this.storage.set('funcion', funcion)
                resolve(funcion)
            })
        })
    }
}

