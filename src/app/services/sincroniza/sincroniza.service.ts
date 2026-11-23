import { EventEmitter, Injectable } from '@angular/core';
import { SgpService } from '../sgp.service';
import { DataLocalService } from '../data-local.service';
import { UiServiceService } from '../ui-service.service';
import { UtilService } from '../util.service';
import { ActividadDetalle, PlanActividad, SamAccion } from '../../model/plan-actividad';
import { Integrante, Usuario, ActividadProductiva, FichaVivienda } from '../../model/usuarios';
import { Archivo } from '../../model/generales';
import { User, Funcion } from '../../model/generales';
import { Notificacion } from '../../model/notificaciones';
import { Visita } from '../../model/visitas';
import { ProyActividad } from '../../model/actividades';
import { Eri } from '../../model/eri';
import { TecnologiaColectivaDetalle, TecnologiaColectiva } from '../../model/proyectos';
import { Agente } from '../../model/agentes';

@Injectable({
    providedIn: 'root'
})
export class SincronizaService {
    usuarioEnvio: Usuario
    mensajeListener = new EventEmitter<string>()
    planActividadesListener = new EventEmitter<PlanActividad[]>()
    accionesListener = new EventEmitter<PlanActividad[]>()
    
    constructor(private sgpService: SgpService,
        private dataLocalService: DataLocalService,
        private utilService: UtilService,
        private uiService: UiServiceService) { }

    // async enviarActividadSuper(actividad: ActividadSuper, index: number) {

    //     const nidActividad: number = await this.sgpService.enviarActividadSuper(actividad)
    //     if (nidActividad) {
    //         actividad.nid_actividad = nidActividad
    //         // await this.dataLocalService.guardarActividadSuper(actividad, index)
    //     }
    //     const proyectos = actividad.proyectoSelec.filter(proyecto => proyecto.seleccionado).map(item => item.codigo_expediente).toString()
    //     if (nidActividad) {
    //         const resp = await this.sgpService.enviarActividadProyectos(nidActividad, proyectos)
    //     }
    //     const participantes = actividad.participantes.filter(participante => participante.seleccionado)
    //     for (let idx = 0; idx < participantes.length; idx++) {
    //         participantes[idx].nid_actividad = nidActividad
    //         await this.sgpService.enviarActividadParticipante(participantes[idx])
    //     }

    //     for (let idx = 0; idx < actividad.fotos.length; idx++) {
    //         if (actividad.fotos[idx].urlArchivoFile) {
    //             // await this.sgpService.enviarActividadFoto(actividad.fotos[idx])
    //             // const nidArchivo = await this.sgpService.enviarFoto(actividad.fotos[idx].urlArchivo)
    //             const nidArchivo = 2000 + idx
    //             actividad.fotos[idx].nid_archivo = nidArchivo
    //             await this.sgpService.enviarActividadFoto(actividad.fotos[idx])

    //         }
    //     }

    //     actividad.est_actividad = 'E'
    //     // await this.dataLocalService.guardarActividadSuper(actividad, index)

    //     return nidActividad
    // }

    async usuario(usuario: Usuario, sincNotif?: boolean) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}
        await this.uiService.dismissLoading()
        await this.uiService.presentLoading(`Sincronizando... Usuario DNI ${usuario.txt_documento_identidad}`)
        if (sincNotif) {this.notificacionesNuevas()}

        if (usuario.registroAvanceIncompleto || usuario.cambioTecnologiaIncompleto || usuario.fichaCaracterizIncompleto || usuario.entregaInsumosIncompleto ||
            usuario.asistTecMemIncompleta || usuario.seleccionMemNoSincroniza || usuario.lineaBaseMemIncompleta || usuario.lineaSalidaMemIncompleta) {
        // if (usuario.registroAvanceIncompleto || usuario.cambioTecnologiaIncompleto || usuario.fichaCaracterizIncompleto || usuario.entregaInsumosIncompleto || usuario.asistTecMemIncompleta) {
        await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa(`El usuario con DNI ${usuario.txt_documento_identidad} tiene datos incompletos.`)
            return null
        }

        this.usuarioEnvio = usuario
        let respEnvio = await this.enviarUsuario(usuario).catch(async error => {
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(`ER01: Error al enviar los datos. (${error.message})`)
            return null
        })
        console.log('Respuesta del envio respEnvio :>> ', respEnvio);

        if (!respEnvio || (respEnvio.envia && respEnvio.error)) {
            await this.dataLocalService.guardarUsuario(this.usuarioEnvio, false)
            await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa(`ER02: Error al enviar los datos.`)
            return null
        }
        if (!respEnvio.envia) { respEnvio = null }
        const orden = usuario.orden
        const id = usuario.id

        await this.uiService.dismissLoading()
        await this.uiService.presentLoading(`Sincronizando... Recibiendo usuario DNI ${usuario.txt_documento_identidad}`)
        usuario = await this.sgpService.obtenerUsuario(usuario.codigo_expediente, (respEnvio && respEnvio.nidPersonalProyecto) ? respEnvio.nidPersonalProyecto : (usuario.nid_personal_proyecto ? usuario.nid_personal_proyecto : 0), (respEnvio && respEnvio.nidSolicitud) ? respEnvio.nidSolicitud : (usuario.solicitud ? usuario.solicitud.nid_solicitud : (usuario.nid_solicitud ? usuario.nid_solicitud : 0)))
        console.log('RECIBIDO usuario :>> ', usuario);

        let respUsuario: Usuario
        if (usuario) {
            usuario.orden = orden
            usuario.id = id
            respUsuario = await this.dataLocalService.guardarUsuario(usuario, false)
            console.log('guarda usuario');
        }
        await this.uiService.dismissLoading()
        console.log('respUsuario :>> ', respUsuario);
        return respUsuario
    }

    async fotosSolicitud(fotos: Archivo[], codidgoProyecto: string, nidSolicitud: number, nidCambio: number, tecnologia: string, partida: string, dni: string) {
        for (let index = 0; index < fotos.length; index++) {
            if (fotos[index].nueva) {
                const resp = await this.sgpService.guardarSolicitudFoto(fotos[index], codidgoProyecto, nidSolicitud, nidCambio, tecnologia, partida, dni)
                if (!resp) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa('No se ha enviado la foto.')
                    return null
                }
                if (resp.status !== 0) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(resp.message)
                    return null
                }
                fotos[index].nid_archivo = resp.result
                fotos[index].nueva = false
                fotos[index].enviada = true
            }
        }
        return fotos
    }

    async usuariosEnvio(codigoProyecto: string) {
        const listaUsuarios = await this.dataLocalService.leerUsuariosProyecto(codigoProyecto)
        let existeIncompletos = false
        for (let index = 0; index < listaUsuarios.length; index++) {
            if (listaUsuarios[index].txt_estado_solicitud || listaUsuarios[index].cambioTecnologia || listaUsuarios[index].registroAvanceTec || listaUsuarios[index].flg_cambio_yachachiq
                || listaUsuarios[index].cambioFicha || listaUsuarios[index].cambioActividadProd || listaUsuarios[index].cambioCaracterizacion || listaUsuarios[index].cambioMiembros 
                || listaUsuarios[index].cambioFichaMujer || listaUsuarios[index].cambioAsistTecMem || listaUsuarios[index].cambioSeleccionMem || listaUsuarios[index].cambioLineaBaseMem
                || listaUsuarios[index].cambioLineaSalidaMem) {
                if (listaUsuarios[index].registroAvanceIncompleto || listaUsuarios[index].cambioTecnologiaIncompleto || listaUsuarios[index].fichaCaracterizIncompleto
                    || listaUsuarios[index].asistTecMemIncompleta || listaUsuarios[index].seleccionMemNoSincroniza || listaUsuarios[index].lineaBaseMemIncompleta
                    || listaUsuarios[index].lineaSalidaMemIncompleta) {
                    // || listaUsuarios[index].asistTecMemIncompleta) {
                    existeIncompletos = true
                } else {
                    const usuario = await this.dataLocalService.leerUsuario(codigoProyecto, listaUsuarios[index].id)
                    if ((usuario.solicitud && usuario.solicitud.est_solicitud === 'R') || usuario.registroAvanceTec || usuario.flg_cambio_yachachiq || usuario.cambioFicha || usuario.cambioActividadProd || usuario.cambioCaracterizacion || usuario.cambioMiembros || usuario.cambioFichaMujer) {
                        const respEnvio = await this.usuario(usuario)
                        if (!respEnvio) {
                            return false
                        }
                    }
                }
            }
        }
        if (existeIncompletos) {
            await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa(`Existen usuarios con datos incompletos. Sincronización incompleta.`)
            return false
        }
        return true
    }

    async usuariosEnvioRecepcion(codigoProyecto: string, envia: boolean, desde?: number, hasta?: number) {
        const listaUsuarios = await this.dataLocalService.leerUsuariosProyecto(codigoProyecto)
        let existeIncompletos = false
        for (let index = (desde ? desde-1 : 0); index < (hasta ? hasta : listaUsuarios.length); index++) {
            if (envia) {
                if (listaUsuarios[index].txt_estado_solicitud || listaUsuarios[index].cambioTecnologia || listaUsuarios[index].registroAvanceTec || listaUsuarios[index].flg_cambio_yachachiq 
                    || listaUsuarios[index].cambioFicha || listaUsuarios[index].cambioActividadProd  || listaUsuarios[index].cambioCaracterizacion || listaUsuarios[index].cambioMiembros 
                    || listaUsuarios[index].cambioFichaMujer || listaUsuarios[index].cambioAsistTecMem || listaUsuarios[index].cambioSeleccionMem || listaUsuarios[index].cambioLineaBaseMem
                    || listaUsuarios[index].cambioLineaSalidaMem) {
                    if (listaUsuarios[index].registroAvanceIncompleto || listaUsuarios[index].cambioTecnologiaIncompleto || listaUsuarios[index].fichaCaracterizIncompleto
                        || listaUsuarios[index].asistTecMemIncompleta || listaUsuarios[index].seleccionMemNoSincroniza || listaUsuarios[index].lineaBaseMemIncompleta
                        || listaUsuarios[index].lineaSalidaMemIncompleta) {
                        existeIncompletos = true
                    } else {
                        
                        let usuario = await this.dataLocalService.leerUsuario(codigoProyecto, listaUsuarios[index].id)
                        if (!usuario) {usuario = listaUsuarios[index]}
                            if ((usuario.solicitud && usuario.solicitud.est_solicitud === 'R') || usuario.registroAvanceTec || usuario.flg_cambio_yachachiq || usuario.cambioFicha || usuario.cambioActividadProd || usuario.cambioCaracterizacion || usuario.cambioMiembros || usuario.cambioFichaMujer) {
                                const respEnvio = await this.usuario(usuario)
                                if (!respEnvio) {
                                    return false
                                }
                            }
                        }
                } else {
                    await this.recibirUsuario(listaUsuarios[index])
                }
            } else {
                await this.recibirUsuario(listaUsuarios[index])
                // if (index > 1000 ) {return}
            }
        }
        if (existeIncompletos) {
            await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa(`Existen usuarios con datos incompletos. Sincronización incompleta.`)
            return false
        }
        return true
    }

    cambioLineaSalida(usuario: Usuario) {
        if (!usuario.lineaBase || usuario.lineaBase.length === 0) {return false}
        for (let index = 0; index < usuario.lineaBase.length; index++) {
            if (usuario.lineaBase[index].cambioActividadProd || usuario.lineaBase[index].cambioFichaVivienda) {return true}
        }
        return false
    }

    async enviarUsuario(usuario: Usuario) {
        const respEnvio: any = {
            envia: false,
            nidPersonalProyecto: 0,
            nidSolicitud: 0,
            error: false
        }

        let user: User
        let funcion: Funcion
        
        if ((usuario.solicitud && usuario.solicitud.est_solicitud === 'R') || usuario.cambioTecnologia || usuario.registroAvanceTec || usuario.flg_cambio_yachachiq 
            || usuario.cambioActividadProd || usuario.cambioFicha || usuario.cambioCaracterizacion || usuario.cambioMiembros || usuario.cambioFichaMujer 
            || this.cambioLineaSalida(usuario) || usuario.cambioAsistTecMem || usuario.cambioSeleccionMem) {
            respEnvio.envia = true
            console.log('ENVIA USUARIO', usuario);
            // await this.uiService.dismissLoading()
            // await this.uiService.presentLoading(`Sincronizando... Enviando usuario DNI ${usuario.txt_documento_identidad}`)
            this.mensajeListener.emit(`Enviando: Usuario DNI ${usuario.txt_documento_identidad}`)
            user = await this.dataLocalService.leerUser()
            funcion = await this.dataLocalService.leerFuncion()

            // if (usuario.est_personal === 'U' && usuario.nid_solicitud) {respEnvio.nidSolicitud = usuario.nid_solicitud}
            if (usuario.solicitud && usuario.solicitud.tip_cambio === 'NU') {
                const resp = await this.sgpService.validarSolicitudAprobada(usuario.codigo_expediente, usuario.solicitud.fec_solicitud, funcion.nid_funcion, user.nidPersonal)
                if (resp) {
                    if (resp.txt_dni != usuario.solicitud.usuario1.txt_documento_identidad) {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`No es posible enviar la solicitud porque está aprobada, el usuario está activo y corresponde al DNI ${resp.txt_dni}.`)
                        return null
                    }
                    usuario.nid_solicitud = resp['nid_solicitud']
                    usuario.nid_personal_proyecto = resp['nid_personal_proyecto']
                    usuario.solicitud.nid_solicitud = resp['nid_solicitud']
                    usuario.solicitud.nid_personal_proyecto = resp['nid_personal_proyecto']
                    usuario.solicitud.nid_usuario_act_prod = resp['nid_usuario_act_prod']
                    usuario.solicitud.nid_ficha = resp['nid_ficha']
                    usuario.solicitud.est_solicitud = 'A'
                    respEnvio.nidSolicitud = resp['nid_solicitud']
                    respEnvio.nidPersonalProyecto = resp['nid_personal_proyecto']
                    this.usuarioEnvio = usuario
                }
            }
        }

        if (usuario.cambioActividadProd) {
            if (usuario.solicitud && usuario.solicitud.tip_cambio === 'NU' && usuario.solicitud.est_solicitud === 'O') {usuario.solicitud.est_solicitud = 'R'}
            const resActProd = await this.envioActividadesProd(usuario.actividadesProductivas, respEnvio)
            if (resActProd) {
                if (resActProd.respEnvio) {return resActProd.respEnvio}
                if (usuario.solicitud && usuario.solicitud.tip_cambio === 'NU') { usuario.solicitud.nid_usuario_act_prod = resActProd.nidUsuarioActividad }
                usuario.actividadesProductivas = resActProd.actividadesProductivas
                this.usuarioEnvio = usuario
            } 
        }

        if (usuario.cambioFicha) {
            console.log('usuario si cambio ficha :>> ', usuario);
            if (usuario.solicitud && usuario.solicitud.tip_cambio === 'NU' && usuario.solicitud.est_solicitud === 'O') {usuario.solicitud.est_solicitud = 'R'}
            const respFicha = await this.envioFicha(usuario.ficha, respEnvio)

            if (respFicha) {
                if (respFicha.respEnvio) {return respFicha.respEnvio}
                if (usuario.solicitud && usuario.solicitud.tip_cambio === 'NU') { usuario.solicitud.nid_ficha = respFicha.ficha.nid_ficha }
                usuario.ficha = respFicha.ficha
                this.usuarioEnvio = usuario
            } 
        }

        if (usuario.solicitud && usuario.solicitud.est_solicitud === 'R') {
            if ('RE,IR,IT'.includes(usuario.solicitud.tip_cambio)) {
                if (usuario.solicitud.usuario2.actividadesProductivas) {
                    const resActProd = await this.envioActividadesProd(usuario.solicitud.usuario2.actividadesProductivas, respEnvio)
                    if (resActProd) {
                        if (resActProd.respEnvio) {return resActProd.respEnvio}
                        usuario.solicitud.nid_usuario_act_prod = resActProd.nidUsuarioActividad
                        usuario.solicitud.usuario2.actividadesProductivas = resActProd.actividadesProductivas
                        this.usuarioEnvio = usuario
                    } 
                }
                if (usuario.solicitud.usuario2.ficha) {
                    const respFicha = await this.envioFicha(usuario.solicitud.usuario2.ficha, respEnvio)
                    if (respFicha) {
                        if (respFicha.respEnvio) {return respFicha.respEnvio}
                        usuario.solicitud.nid_ficha = respFicha.ficha.nid_ficha
                        usuario.solicitud.usuario2.ficha = respFicha.ficha
                        this.usuarioEnvio = usuario
                    } 
                }
            }

            if (!usuario.solicitud.cod_zonal_solicitud) {usuario.solicitud.cod_zonal_solicitud = usuario.solicitud.codigo_expediente.substring(0,2)}
            const resp = await this.sgpService.enviarSolicitdCambio(usuario).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar solicitud. ${error.message}`)
                return null
            })
            if (!resp || resp.status !== 0 || !resp.result || !resp.result.nidSolicitud || parseInt(resp.result.nidSolicitud) < 1) {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(resp.message)
                respEnvio.error = true
                return respEnvio
            }

            respEnvio.nidSolicitud = resp.result.nidSolicitud
            usuario.solicitud.nid_solicitud = respEnvio.nidSolicitud
            this.usuarioEnvio.solicitud.nid_solicitud = respEnvio.nidSolicitud
            
            if (usuario.solicitud.usuario1) {
                let nidCambio = 1
                if (usuario.solicitud.usuario1.fotos) {
                    if (usuario.solicitud.tip_cambio === 'CD') { nidCambio = 2 }
                    const fotosOk = await this.fotosSolicitud(usuario.solicitud.usuario1.fotos, usuario.codigo_expediente, respEnvio.nidSolicitud, nidCambio, ' ', ' ', usuario.txt_documento_identidad).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar fotos de usuario. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                        return null
                    })
                    if (!fotosOk) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    this.usuarioEnvio.solicitud.usuario1.fotos = fotosOk
                }

                if (usuario.solicitud.usuario1.archivoHogarEmancipado) {
                    const archivoOk = await this.fotosSolicitud(usuario.solicitud.usuario1.archivoHogarEmancipado, usuario.codigo_expediente, respEnvio.nidSolicitud, nidCambio, ' ', ' ', usuario.txt_documento_identidad).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error el archivo de hogar emancipado. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                        return null
                    })
                    if (!archivoOk) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    this.usuarioEnvio.solicitud.usuario1.archivoHogarEmancipado = archivoOk
                }

                if (usuario.solicitud.usuario1.tecnologiaNoOfertada) {
                    for (let index = 0; index < usuario.solicitud.usuario1.tecnologiaNoOfertada.length; index++) {
                        const tecnologia = usuario.solicitud.usuario1.tecnologiaNoOfertada[index]
                        if (tecnologia.solicitudTecnologia && tecnologia.solicitudTecnologia.fotos) {
                            const respFotoTec = await this.fotosSolicitud(tecnologia.solicitudTecnologia.fotos, usuario.codigo_expediente, respEnvio.nidSolicitud, nidCambio, tecnologia.cod_tecnologia, tecnologia.cod_partida, usuario.txt_documento_identidad).catch(async error => {
                                await this.uiService.dismissLoading()
                                this.uiService.alertaInformativa(`Error al enviar fotos de tecnologías nuevas. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                                return null
                            })
                            if (!respFotoTec) {
                                respEnvio.error = true
                                return respEnvio
                            }
                            this.usuarioEnvio.solicitud.usuario1.tecnologiaNoOfertada[index].solicitudTecnologia.fotos = respFotoTec
                        }
                    }
                }
            }

            if (usuario.solicitud.usuario2) {
                const nidCambio = 2
                if (usuario.solicitud.usuario2.archivoHogarEmancipado) {
                    const archivoOk = await this.fotosSolicitud(usuario.solicitud.usuario2.archivoHogarEmancipado, usuario.codigo_expediente, respEnvio.nidSolicitud, nidCambio, ' ', ' ', usuario.solicitud.usuario2.txt_documento_identidad).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar el archivo de hogar emancipado. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                        return null
                    })
                    if (!archivoOk) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    this.usuarioEnvio.solicitud.usuario2.archivoHogarEmancipado = archivoOk
                }

                if (usuario.solicitud.usuario2.fotos) {
                    const fotosOk = await this.fotosSolicitud(usuario.solicitud.usuario2.fotos, usuario.codigo_expediente, respEnvio.nidSolicitud, nidCambio, ' ', ' ', usuario.solicitud.usuario2.txt_documento_identidad).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar fotos de usuario. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                        return null
                    })
                    if (!fotosOk) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    this.usuarioEnvio.solicitud.usuario2.fotos = fotosOk
                }

                if (usuario.solicitud.usuario2.tecnologiaNoOfertada) {
                    for (let index = 0; index < usuario.solicitud.usuario2.tecnologiaNoOfertada.length; index++) {
                        const tecnologia = usuario.solicitud.usuario2.tecnologiaNoOfertada[index]
                        if (tecnologia.solicitudTecnologia && tecnologia.solicitudTecnologia.fotos) {
                            const respFotoTec = await this.fotosSolicitud(tecnologia.solicitudTecnologia.fotos, usuario.codigo_expediente, respEnvio.nidSolicitud, nidCambio, tecnologia.cod_tecnologia, tecnologia.cod_partida, usuario.solicitud.usuario2.txt_documento_identidad).catch(async error => {
                                await this.uiService.dismissLoading()
                                this.uiService.alertaInformativa(`Error al enviar fotos de tecnologías nuevas. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                                return null
                            })
                            if (!respFotoTec) {
                                respEnvio.error = true
                                return respEnvio
                            }
                            this.usuarioEnvio.solicitud.usuario2.tecnologiaNoOfertada[index].solicitudTecnologia.fotos = respFotoTec
                        }
                    }
                }

                if (usuario.solicitud.usuario2.actividadesProductivas) {
                    for (let index = 0; index < usuario.solicitud.usuario2.actividadesProductivas.length; index++) {
                        if (usuario.solicitud.usuario2.actividadesProductivas[index].cambioFoto && usuario.solicitud.usuario2.actividadesProductivas[index].fotos) {
                            const atributos = `${usuario.solicitud.usuario2.actividadesProductivas[index].nid_usuario_actividad}|${usuario.solicitud.usuario2.actividadesProductivas[index].nid_act_productiva}`
                            const nombreArchivo = `ACT-PROD_U${usuario.solicitud.usuario2.actividadesProductivas[index].nid_usuario_actividad}A${usuario.solicitud.usuario2.actividadesProductivas[index].nid_act_productiva}`
                            const fotosOk = await this.enviarProyectoFoto(usuario.solicitud.usuario2.actividadesProductivas[index].fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                                await this.uiService.dismissLoading()
                                this.uiService.alertaInformativa(`Error al enviar fotos de usuario. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                                return null
                            })
                            if (!fotosOk) {
                                respEnvio.error = true
                                return respEnvio
                            }
                            this.usuarioEnvio.solicitud.usuario2.actividadesProductivas[index].fotos = fotosOk
                        }
                    }
                }

                if (usuario.solicitud.usuario2.ficha) {
                    if (usuario.solicitud.usuario2.ficha.fotos) {
                        const atributos = `${usuario.solicitud.usuario2.ficha.nid_ficha}`
                        const nombreArchivo = `VIVIENDA_F${usuario.solicitud.usuario2.ficha.nid_ficha}`
                        const fotosOk = await this.enviarProyectoFoto(usuario.solicitud.usuario2.ficha.fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al enviar fotos de vivienda saludable. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                            return null
                        })
                        if (!fotosOk) {
                            respEnvio.error = true
                            return respEnvio
                        }
                        this.usuarioEnvio.solicitud.usuario2.ficha.fotos = fotosOk
                    }
        
                    if (usuario.solicitud.usuario2.ficha.emprendimientos) {
                        for (let index = 0; index < usuario.solicitud.usuario2.ficha.emprendimientos.length; index++) {
                            const atributos = `${usuario.solicitud.usuario2.ficha.nid_ficha}|${usuario.solicitud.usuario2.ficha.emprendimientos[index].nid_ficha_emprendimiento}`
                            const nombreArchivo = `EMPREND_F${usuario.solicitud.usuario2.ficha.nid_ficha}E${usuario.solicitud.usuario2.ficha.emprendimientos[index].nid_ficha_emprendimiento}`
                            const fotosEmp = await this.enviarProyectoFoto(usuario.solicitud.usuario2.ficha.emprendimientos[index].fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                                await this.uiService.dismissLoading()
                                this.uiService.alertaInformativa(`Error al enviar fotos de emprendimientos. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                                return null
                            })
                            if (!fotosEmp) {
                                respEnvio.error = true
                                return respEnvio
                            }
                            this.usuarioEnvio.solicitud.usuario2.ficha.emprendimientos[index].fotos = fotosEmp
                        }
                    }
                }

                if (usuario.solicitud.usuario2.miembros) {
                    for (let index = 0; index < usuario.solicitud.usuario2.miembros.length; index++) {
                        if (usuario.solicitud.usuario2.miembros[index].cambioMiembro) {
                            // if (usuario.solicitud && usuario.solicitud.tip_cambio === 'NU') {
                                usuario.solicitud.usuario2.miembros[index].nid_solicitud_cambio = (usuario.solicitud.nid_solicitud ? usuario.solicitud.nid_solicitud : respEnvio.nidSolicitud)
                                if (respEnvio.nidPersonalProyecto) {usuario.solicitud.usuario2.miembros[index].nid_personal_proyecto = respEnvio.nidPersonalProyecto}
                                this.usuarioEnvio.solicitud.usuario2.miembros[index] = usuario.solicitud.usuario2.miembros[index]
                            // }
                            const respMiembro = await this.sgpService.guardarMiembro(usuario.solicitud.usuario2.miembros[index]).catch(async error => {
                                await this.uiService.dismissLoading()
                                this.uiService.alertaInformativa(`Error al enviar los intregrantes del hogar. ${error.message}`)
                                return null
                            })
                            if (!respMiembro) {
                                respEnvio.error = true
                                return respEnvio
                            }
                            this.usuarioEnvio.solicitud.usuario2.miembros[index].nid_identificador = respMiembro.result.id
                        }
                    }
                }
            
                if (usuario.solicitud.usuario2.fichaMujer) {
                    usuario.solicitud.usuario2.fichaMujer.nid_solicitud_cambio = (usuario.solicitud.nid_solicitud ? usuario.solicitud.nid_solicitud : respEnvio.nidSolicitud)
                    if (respEnvio.nidPersonalProyecto) {usuario.solicitud.usuario2.fichaMujer.nid_personal_proyecto = respEnvio.nidPersonalProyecto}
                    this.usuarioEnvio.solicitud.usuario2.fichaMujer = usuario.solicitud.usuario2.fichaMujer
                    
                    console.log('usuario.solicitud.usuario2.fichaMujer :>> ', usuario.solicitud.usuario2.fichaMujer);
                    const respSolFichaMujer = await this.sgpService.guardarFichaMujer(usuario.solicitud.usuario2.fichaMujer).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar la ficha de caracterización MEM de la solicitud de cambio. ${error.message}`)
                        return null
                    })
                    console.log('respSolFichaMujer :>> ', respSolFichaMujer);
                    if (!respSolFichaMujer) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    this.usuarioEnvio.solicitud.usuario2.fichaMujer.nid_ficha = respSolFichaMujer.result.id
                }
            }

            if (usuario.cambioTecnologia && usuario.tecnologias) {
                for (let index = 0; index < usuario.tecnologias.length; index++) {
                    const tecnologia = usuario.tecnologias[index]
                    if (tecnologia.solicitudTecnologia && tecnologia.solicitudTecnologia.fotos) {
                        const respFotoTec = await this.fotosSolicitud(tecnologia.solicitudTecnologia.fotos, usuario.codigo_expediente, respEnvio.nidSolicitud, 1, tecnologia.cod_tecnologia, tecnologia.cod_partida, usuario.txt_documento_identidad).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al enviar fotos de tecnologías. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                            return null
                        })
                        if (!respFotoTec) {
                            respEnvio.error = true
                            return respEnvio
                        }
                        this.usuarioEnvio.tecnologias[index].solicitudTecnologia.fotos = respFotoTec
                    }
                }
            }

            if (usuario.cambioTecnologia && usuario.tecnologiasColectivas) {
                for (let index = 0; index < usuario.tecnologiasColectivas.length; index++) {
                    const tecnologia = usuario.tecnologiasColectivas[index]
                    if (tecnologia.solicitudTecnologia && tecnologia.solicitudTecnologia.fotos) {
                        const respFotoTec = await this.fotosSolicitud(tecnologia.solicitudTecnologia.fotos, usuario.codigo_expediente, respEnvio.nidSolicitud, 1, tecnologia.cod_tecnologia, tecnologia.cod_partida, usuario.txt_documento_identidad).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al enviar fotos de tecnologías. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                            return null
                        })
                        if (!respFotoTec) {
                            respEnvio.error = true
                            return respEnvio
                        }
                        this.usuarioEnvio.tecnologiasColectivas[index].solicitudTecnologia.fotos = respFotoTec
                    }
                }
            }

            if (usuario.cambioTecnologia && usuario.tecnologiaNoOfertada) {
                for (let index = 0; index < usuario.tecnologiaNoOfertada.length; index++) {
                    const tecnologia = usuario.tecnologiaNoOfertada[index]
                    if (tecnologia.solicitudTecnologia && tecnologia.solicitudTecnologia.fotos) {
                        const respFotoTec = await this.fotosSolicitud(tecnologia.solicitudTecnologia.fotos, usuario.codigo_expediente, respEnvio.nidSolicitud, 1, tecnologia.cod_tecnologia, tecnologia.cod_partida, usuario.txt_documento_identidad).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al enviar fotos de tecnologías. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                            return null
                        })
                        if (!respFotoTec) {
                            respEnvio.error = true
                            return respEnvio
                        }
                        this.usuarioEnvio.tecnologiaNoOfertada[index].solicitudTecnologia.fotos = respFotoTec
                    }
                }
            }

            console.log('respEnvio :>> ', respEnvio);
            if (respEnvio && respEnvio.nidSolicitud > 0) {
                const respObserva = await this.sgpService.observarSolicitudCambio(usuario.codigo_expediente, respEnvio.nidSolicitud).catch(async error => {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(`Error al verificar solicitud. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                    respEnvio.error = true
                    return null
                })
                console.log('respObserva :>> ', respObserva);
                if (funcion.nid_funcion === 359 && respObserva == 0) {
                    console.log('ENTRA A APROBAR SOLICITUD');
                    const respAprobacion = await this.sgpService.aprobarSolicitudCambio(usuario.codigo_expediente, respEnvio.nidSolicitud).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al aprobar solicitud. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                        respEnvio.error = true
                        return null
                    })
                    console.log('respAprobacion :>> ', respAprobacion);
                    if (respAprobacion > 0) { respEnvio.nidPersonalProyecto = respAprobacion }
                }
            }

        }

        if (usuario.cambioMiembros) {
            console.log('usuario :>> ', usuario);
            console.log('respEnvio :>> ', respEnvio);
            for (let index = 0; index < usuario.miembros.length; index++) {
                if (usuario.miembros[index].cambioMiembro) {
                    if (usuario.solicitud && usuario.solicitud.tip_cambio === 'NU') {
                        usuario.miembros[index].nid_solicitud_cambio = (usuario.solicitud.nid_solicitud ? usuario.solicitud.nid_solicitud : respEnvio.nidSolicitud)
                        if (respEnvio.nidPersonalProyecto) {usuario.miembros[index].nid_personal_proyecto = respEnvio.nidPersonalProyecto}
                        this.usuarioEnvio.miembros[index] = usuario.miembros[index]
                    }
                    console.log('miembro :>> ', usuario.miembros[index]);
                    const respMiembro = await this.sgpService.guardarMiembro(usuario.miembros[index]).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar los intregrantes del hogar. ${error.message}`)
                        return null
                    })
                    if (!respMiembro) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    this.usuarioEnvio.miembros[index].nid_identificador = respMiembro.result.id
                }
            }
        }

        if (usuario.cambioFichaMujer) {
            if (usuario.solicitud && usuario.solicitud.tip_cambio === 'NU') {
                usuario.fichaMujer.nid_solicitud_cambio = (usuario.solicitud.nid_solicitud ? usuario.solicitud.nid_solicitud : respEnvio.nidSolicitud)
                if (respEnvio.nidPersonalProyecto) {usuario.fichaMujer.nid_personal_proyecto = respEnvio.nidPersonalProyecto}
                
            }
            const respFichaMujer = await this.sgpService.guardarFichaMujer(usuario.fichaMujer).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar la ficha de caracterización MEM. ${error.message}`)
                return null
            })
            console.log('respFichaMujer :>> ', respFichaMujer);
            if (!respFichaMujer) {
                respEnvio.error = true
                return respEnvio
            }
            this.usuarioEnvio.fichaMujer.nid_ficha = respFichaMujer.result.id
        }

        if (usuario.actividadesProductivas) {
            for (let index = 0; index < usuario.actividadesProductivas.length; index++) {
                if (usuario.actividadesProductivas[index].cambioFoto && usuario.actividadesProductivas[index].fotos) {
                    const atributos = `${usuario.actividadesProductivas[index].nid_usuario_actividad}|${usuario.actividadesProductivas[index].nid_act_productiva}`
                    const nombreArchivo = `ACT-PROD_U${usuario.actividadesProductivas[index].nid_usuario_actividad}A${usuario.actividadesProductivas[index].nid_act_productiva}`
                    const fotosOk = await this.enviarProyectoFoto(usuario.actividadesProductivas[index].fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar fotos de usuario. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                        return null
                    })
                    if (!fotosOk) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    this.usuarioEnvio.actividadesProductivas[index].fotos = fotosOk
                }
            }
        }

        if (usuario.cambioFicha && usuario.ficha.fotos) {
            const atributos = `${usuario.ficha.nid_ficha}`
            const nombreArchivo = `VIVIENDA_F${usuario.ficha.nid_ficha}`
            const fotosOk = await this.enviarProyectoFoto(usuario.ficha.fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar fotos de vivienda saludable. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                return null
            })
            if (!fotosOk) {
                respEnvio.error = true
                return respEnvio
            }
            this.usuarioEnvio.ficha.fotos = fotosOk

            if (usuario.ficha.emprendimientos) {
                for (let index = 0; index < usuario.ficha.emprendimientos.length; index++) {
                    const atributos = `${usuario.ficha.nid_ficha}|${usuario.ficha.emprendimientos[index].nid_ficha_emprendimiento}`
                    const nombreArchivo = `EMPREND_F${usuario.ficha.nid_ficha}E${usuario.ficha.emprendimientos[index].nid_ficha_emprendimiento}`
                    const fotosEmp = await this.enviarProyectoFoto(usuario.ficha.emprendimientos[index].fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar fotos de emprendimientos. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                        return null
                    })
                    if (!fotosEmp) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    this.usuarioEnvio.ficha.emprendimientos[index].fotos = fotosEmp
                }
            }
        }

        if (usuario.registroAvanceTec) {
            for (let index = 0; index < usuario.tecnologias.length; index++) {
                const tecnologia = usuario.tecnologias[index]
                if (tecnologia.avance) {
                    const respAvance = await this.sgpService.guardarTecnologiaAvance(tecnologia.avance).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar avance de tecnologías. ${error.message}`)
                        return null
                    })
                    if (!respAvance) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    usuario.tecnologias[index].avance.nid_avance = respAvance.result
                    if (usuario.tecnologias[index].avance.plan_actividad_id) {await this.actualizaActividadTecnologia(usuario.tecnologias[index].avance.plan_actividad_id, respAvance.result, usuario.codigo_expediente, usuario.nid_personal_proyecto, usuario.tecnologias[index].nid_tecnologia)}
                    
                    if (tecnologia.avance.avanceProd) {
                        for (let idx = 0; idx < tecnologia.avance.avanceProd.length; idx++) {
                            if (tecnologia.avance.avanceProd[idx]) {
                                tecnologia.avance.avanceProd[idx].codigo_expediente = usuario.codigo_expediente
                                tecnologia.avance.avanceProd[idx].nid_personal_proyecto = usuario.nid_personal_proyecto
                                tecnologia.avance.avanceProd[idx].nid_tecnologia = tecnologia.nid_tecnologia
                                tecnologia.avance.avanceProd[idx].nid_avance = respAvance.result
                                const respAvanceProd = await this.sgpService.guardarTecnologiaAvanceProd(tecnologia.avance.avanceProd[idx]).catch(async error => {
                                    await this.uiService.dismissLoading()
                                    this.uiService.alertaInformativa(`Error al enviar los datos de la producción. ${error.message}`)
                                    return null
                                })
                                if (!respAvanceProd) {
                                    respEnvio.error = true
                                    return respEnvio
                                }
                                this.usuarioEnvio.tecnologias[index].avance.avanceProd[idx].nid_avance_prod = respAvanceProd.result
                            }
                        }
                    }

                    if (tecnologia.avance.fotos) {
                        const fotosOk = await this.enviarProyectoArchivo(tecnologia.avance.fotos, usuario.codigo_expediente, usuario.nid_personal_proyecto, tecnologia.nid_tecnologia, respAvance.result, tecnologia.avance.nid_funcion, tecnologia.avance.nid_personal, tecnologia.cod_tecnologia, usuario.txt_documento_identidad).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al enviar fotos de usuario. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                            return null
                        })
                        if (!fotosOk) {
                            respEnvio.error = true
                            return respEnvio
                        }
                        tecnologia.avance.fotos = fotosOk
                    }
                }
            }
        }

        
        if (usuario.cambioEntregaInsumos) {
            for (let index = 0; index < usuario.tecnologias.length; index++) {
                const tecnologia = usuario.tecnologias[index]
                if (tecnologia.entregaInsumos && tecnologia.cambioEntregaInsumos) {
                    for (let idxEntrega = 0; idxEntrega < tecnologia.entregaInsumos.length; idxEntrega++) {
                        if (tecnologia.entregaInsumos[idxEntrega].est_entrega === 'R') {

                            const respEntrega = await this.sgpService.guardarEntregaActivo(tecnologia.entregaInsumos[idxEntrega]).catch(async error => {
                                await this.uiService.dismissLoading()
                                this.uiService.alertaInformativa(`Error al enviar entrega de insumos. ${error.message}`)
                                return null
                            })
                            if (!respEntrega) {
                                respEnvio.error = true
                                return respEnvio
                            }
                            usuario.tecnologias[index].entregaInsumos[idxEntrega].nid_entrega = respEntrega.result
                            
                            console.log('respEntrega.result :>> ', respEntrega.result);
                            if (tecnologia.entregaInsumos[idxEntrega].insumos) {
                                for (let idx = 0; idx < tecnologia.entregaInsumos[idxEntrega].insumos.length; idx++) {
                                    if (tecnologia.entregaInsumos[idxEntrega].insumos[idx]) {
                                        tecnologia.entregaInsumos[idxEntrega].insumos[idx].nid_entrega = respEntrega.result
                                        const respInsumo = await this.sgpService.guardarEntregaInsumo(tecnologia.entregaInsumos[idxEntrega].insumos[idx]).catch(async error => {
                                            await this.uiService.dismissLoading()
                                            this.uiService.alertaInformativa(`Error al enviar la entrega de insumos. ${error.message}`)
                                            return null
                                        })
                                        if (!respInsumo) {
                                            respEnvio.error = true
                                            return respEnvio
                                        }
                                        this.usuarioEnvio.tecnologias[index].entregaInsumos[idxEntrega].insumos[idx].nid_insumo = respInsumo.result
                                    }
                                }
                            }
                            
                            if (tecnologia.entregaInsumos[idxEntrega].firmas) {
                                const atributos = tecnologia.entregaInsumos[idxEntrega].nid_entrega.toString()
                                const firmasOk = await this.enviarProyectoFoto(tecnologia.entregaInsumos[idxEntrega].firmas, usuario.codigo_expediente, atributos, null, null, `firma_entrega_${usuario.codigo_expediente}_${tecnologia.entregaInsumos[idxEntrega].nid_entrega}`).catch(async error => {
                                    await this.uiService.dismissLoading()
                                    this.uiService.alertaInformativa(`Error al enviar la firma. ${error.message}`)
                                    return null
                                })
                                if (!firmasOk) {
                                    respEnvio.error = true
                                    return respEnvio
                                }
                                tecnologia.entregaInsumos[idxEntrega].firmas = firmasOk
                            }
                        }
                    }
                }
            }
        }

        if (usuario.flg_cambio_yachachiq) {
            const respYachachiq = await this.sgpService.enviarAsignacionYachachiq(usuario.codigo_expediente, usuario.nid_personal_proyecto, usuario.nidYachachiq, usuario.fecYachachiq, usuario.fecFinYachachiq).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al guardar la asignación del Yachachiq. ${error.message})`)
                respEnvio.error = true
                return null
            })
        }

        if (usuario.cambioCaracterizacion) {
            const respFicha = await this.sgpService.guardarFichaCaracterizacion(usuario.fichaCaracterizacion).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar la ficha de caracterización del usuario. ${error.message}`)
                return null
            })
            if (!respFicha) {
                respEnvio.error = true
                return respEnvio
            }
            if (usuario.fichaCaracterizacion.fotos) {
                const atributos = `${usuario.nid_personal_proyecto}|${usuario.fichaCaracterizacion.nid_ficha}`
                const nombreArchivo = `CARACT_U${usuario.nid_personal_proyecto}F${usuario.fichaCaracterizacion.nid_ficha}`
                const fotosOk = await this.enviarProyectoFoto(usuario.fichaCaracterizacion.fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(`Error al enviar la foto de la ficha de caracterización del usuario. ${error.message} (U: ${usuario.nid_personal_proyecto})`)
                    return null
                })
                if (!fotosOk) {
                    respEnvio.error = true
                    return respEnvio
                }
                this.usuarioEnvio.fichaCaracterizacion.fotos = fotosOk
            }
        }

        if (usuario.lineaBase && usuario.lineaBase.length > 0) {
            for (let idxLinea = 0; idxLinea < usuario.lineaBase.length; idxLinea++) {
                if (usuario.lineaBase[idxLinea].cambioActividadProd) {
                    const resActProd = await this.envioActividadesProd(usuario.lineaBase[idxLinea].actividadesProductivas, respEnvio)
                    if (resActProd) {
                        if (resActProd.respEnvio) {return resActProd.respEnvio}
                        usuario.lineaBase[idxLinea].actividadesProductivas = resActProd.actividadesProductivas
                        this.usuarioEnvio = usuario
                        for (let index = 0; index < usuario.lineaBase[idxLinea].actividadesProductivas.length; index++) {
                            if (usuario.lineaBase[idxLinea].actividadesProductivas[index].cambioFoto && usuario.lineaBase[idxLinea].actividadesProductivas[index].fotos) {
                                const atributos = `${usuario.lineaBase[idxLinea].actividadesProductivas[index].nid_usuario_actividad}|${usuario.lineaBase[idxLinea].actividadesProductivas[index].nid_act_productiva}`
                                const nombreArchivo = `ACT-PROD_U${usuario.lineaBase[idxLinea].actividadesProductivas[index].nid_usuario_actividad}A${usuario.lineaBase[idxLinea].actividadesProductivas[index].nid_act_productiva}`
                                const fotosOk = await this.enviarProyectoFoto(usuario.lineaBase[idxLinea].actividadesProductivas[index].fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                                    await this.uiService.dismissLoading()
                                    this.uiService.alertaInformativa(`Error al enviar fotos de usuario. ${error.message} (Sol: ${respEnvio.nidSolicitud})`)
                                    return null
                                })
                                if (!fotosOk) {
                                    respEnvio.error = true
                                    return respEnvio
                                }
                                this.usuarioEnvio.lineaBase[idxLinea].actividadesProductivas[index].fotos = fotosOk
                            }
                        }
                    } 
                }
                if (usuario.lineaBase[idxLinea].cambioFichaVivienda) {
                    const respFicha = await this.envioFicha(usuario.lineaBase[idxLinea].fichaVivienda, respEnvio)
                    
                    if (respFicha) {
                        if (respFicha.respEnvio) {return respFicha.respEnvio}
                        usuario.lineaBase[idxLinea].fichaVivienda = respFicha.ficha
                        this.usuarioEnvio = usuario

                        if (usuario.lineaBase[idxLinea].cambioFichaVivienda && usuario.lineaBase[idxLinea].fichaVivienda.fotos) {
                            const atributos = `${usuario.lineaBase[idxLinea].fichaVivienda.nid_ficha}`
                            const nombreArchivo = `VIVIENDA_F${usuario.lineaBase[idxLinea].fichaVivienda.nid_ficha}`
                            const fotosOk = await this.enviarProyectoFoto(usuario.lineaBase[idxLinea].fichaVivienda.fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                                await this.uiService.dismissLoading()
                                this.uiService.alertaInformativa(`Error al enviar fotos de vivienda saludable de la linea de salida. ${error.message}`)
                                return null
                            })
                            if (!fotosOk) {
                                respEnvio.error = true
                                return respEnvio
                            }
                            this.usuarioEnvio.lineaBase[idxLinea].fichaVivienda.fotos = fotosOk
                
                            if (usuario.lineaBase[idxLinea].fichaVivienda.emprendimientos) {
                                for (let index = 0; index < usuario.lineaBase[idxLinea].fichaVivienda.emprendimientos.length; index++) {
                                    const atributos = `${usuario.lineaBase[idxLinea].fichaVivienda.nid_ficha}|${usuario.lineaBase[idxLinea].fichaVivienda.emprendimientos[index].nid_ficha_emprendimiento}`
                                    const nombreArchivo = `EMPREND_F${usuario.lineaBase[idxLinea].fichaVivienda.nid_ficha}E${usuario.lineaBase[idxLinea].fichaVivienda.emprendimientos[index].nid_ficha_emprendimiento}`
                                    const fotosEmp = await this.enviarProyectoFoto(usuario.lineaBase[idxLinea].fichaVivienda.emprendimientos[index].fotos, usuario.codigo_expediente, atributos, funcion.nid_funcion, user.nidPersonal, nombreArchivo).catch(async error => {
                                        await this.uiService.dismissLoading()
                                        this.uiService.alertaInformativa(`Error al enviar fotos de emprendimientos de la linea de salida. ${error.message}`)
                                        return null
                                    })
                                    if (!fotosEmp) {
                                        respEnvio.error = true
                                        return respEnvio
                                    }
                                    this.usuarioEnvio.lineaBase[idxLinea].fichaVivienda.emprendimientos[index].fotos = fotosEmp
                                }
                            }
                        }
                    } 
                }
            }
        }

        if (usuario.cambioAsistTecMem) {
            for (let index = 0; index < usuario.asistenciaTecnicaMemList.length; index++) {
                const ficha = usuario.asistenciaTecnicaMemList[index]
                if (ficha.cambioFicha) {
                    const respFichaAsisTecMem = await this.sgpService.guardarFichaAsistTecMem(ficha.nuevaFicha).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar la ficha de asistencia técnica MEM. ${error.message}`)
                        return null
                    })
                    console.log('respAsistTecMEM :>> ', respFichaAsisTecMem);
                    if (!respFichaAsisTecMem) {
                        respEnvio.error = true
                        return respEnvio
                    }
                    this.usuarioEnvio.asistenciaTecnicaMemList[index].nuevaFicha.nid_ficha = respFichaAsisTecMem.result
                    if (ficha.codigoFicha === '05' || ficha.codigoFicha === '04') {
                        const atributos = `${respFichaAsisTecMem.result}`
                        const nombreArchivo = `AT-MEM-${usuario.codigo_expediente}-${respFichaAsisTecMem.result}`
                        console.log('ficha.nuevaFicha.fotos :>> ', ficha.nuevaFicha.fotos);
                        const fotosEmp = await this.enviarProyectoFoto(ficha.nuevaFicha.fotos, usuario.codigo_expediente, atributos, ficha.nuevaFicha.nid_funcion, ficha.nuevaFicha.nid_personal, nombreArchivo).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al enviar la foto de la ficha de asistencia ténica MEM. ${error.message}`)
                            return null
                        })
                        if (!fotosEmp) {
                            respEnvio.error = true
                            return respEnvio
                        }
                        this.usuarioEnvio.asistenciaTecnicaMemList[index].nuevaFicha.fotos = fotosEmp 
                    }
                }
            }
        }

        if (usuario.cambioSeleccionMem) {
            const respFichaSeleccionMem = await this.sgpService.guardarFichaSeleccionMem(usuario.fichaSeleccionMem).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar la ficha de asistencia técnica MEM. ${error.message}`)
                return null
            })
            console.log('respAsistTecMEM :>> ', respFichaSeleccionMem);
            if (!respFichaSeleccionMem) {
                respEnvio.error = true
                return respEnvio
            }
            this.usuarioEnvio.fichaSeleccionMem.nid_ficha = respFichaSeleccionMem.result
        }

        if (usuario.cambioLineaBaseMem) {
            const respLineaBaseMem = await this.sgpService.guardarLineaBaseMem(usuario.lineaBaseMem).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar la ficha de línea de base MEM. ${error.message}`)
                return null
            })
            console.log('respLineaBaseMEM :>> ', respLineaBaseMem);
            if (!respLineaBaseMem) {
                respEnvio.error = true
                return respEnvio
            }
            this.usuarioEnvio.lineaBaseMem.nid_ficha = respLineaBaseMem.result
        }

        if (usuario.cambioLineaSalidaMem) {
            const respLineaSalidaMem = await this.sgpService.guardarLineaBaseMem(usuario.lineaSalidaMem).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar la ficha de línea de salida MEM. ${error.message}`)
                return null
            })
            console.log('respLineaSalidaMEM :>> ', respLineaSalidaMem);
            if (!respLineaSalidaMem) {
                respEnvio.error = true
                return respEnvio
            }
            this.usuarioEnvio.lineaBaseMem.nid_ficha = respLineaSalidaMem.result
        }

        return respEnvio
    }

    async actualizaActividadTecnologia(nidActividad: number, nidAvance: number, codigoProyecto: string, nidUsuario: number, nidTecnologia: number) {
        const actividadList = await this.dataLocalService.leerPlanActividades()

        const index = actividadList.findIndex(item => item.id === nidActividad)
        
        console.log('actividadList[index].avanceTecnologia :>> ', actividadList[index].actividadEjecutada.avanceTecnologia);
        if (actividadList[index].actividadEjecutada.avanceTecnologia && actividadList[index].actividadEjecutada.avanceTecnologia.length > 0) {
            const idx = actividadList[index].actividadEjecutada.avanceTecnologia.findIndex(item => item.codigo_expediente === codigoProyecto && item.nid_persona === nidUsuario && item.nid_tecnologia === nidTecnologia)
            console.log('index :>> ', index);
            if (index && index >= 0) {
                actividadList[index].actividadEjecutada.avanceTecnologia[idx].nid_avance = nidAvance
                actividadList[index].actividadEjecutadaCambio = true
                await this.dataLocalService.guardarPlanActividad(actividadList[index])
            }
        } 
    }

    async recibirUsuario(usuario: Usuario) {
        //if (!this.usuarioEnvio) {this.usuarioEnvio = usuario}
        this.mensajeListener.emit('Importando: Usuario con DNI ' + usuario.txt_documento_identidad)
        const usuarioRecibido = await this.sgpService.obtenerUsuario(usuario.codigo_expediente, usuario.nid_personal_proyecto ? usuario.nid_personal_proyecto : 0, usuario.solicitud ? (usuario.solicitud.nid_solicitud ? usuario.solicitud.nid_solicitud : 0) : (usuario.nid_solicitud ? usuario.nid_solicitud : 0)).catch(error => console.error('error :>> ', error))
        let respUsuario: Usuario
        if (usuarioRecibido) {
            usuarioRecibido.orden = usuario.orden
            usuarioRecibido.id = usuario.id
            respUsuario = await this.dataLocalService.guardarUsuario(usuarioRecibido, false)
        }
    }

    async enviarProyectoArchivo(fotos: Archivo[], codidgoProyecto: string, nidPersProy: number, nidTecnologia: number, nidAvance: number, nidFuncion: number, nidPersonal: number, tecnologia: string, dni: string) {
        for (let index = 0; index < fotos.length; index++) {
            if (fotos[index].nueva) {
                const atributos = `${nidPersProy}|${nidTecnologia}|${nidAvance}`
                const fecha = new Date(fotos[index].fec_archivo)
                const nombreArchivo = `${dni}_Avance_${tecnologia}_${('0' + fecha.getDate().toString()).slice(-2)}${('0' + (fecha.getMonth() + 1)).toString().slice(-2)}${fecha.getFullYear()}_${nidAvance}${fotos[index].cod_archivo}.jpg`
                const resp = await this.sgpService.guardarProyectoArchivo(fotos[index], codidgoProyecto, atributos, nidFuncion, nidPersonal, nombreArchivo)
                if (!resp) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa('No se ha enviado la foto.')
                    return null
                }
                if (resp.status !== 0) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(resp.message)
                    return null
                }
                fotos[index].nid_archivo = resp.result
                fotos[index].nueva = false
                fotos[index].enviada = true
            }
        }
        return fotos
    }

    async enviarProyectoFoto(fotos: Archivo[], codidgoProyecto: string, atributos: string, nidFuncion: number, nidPersonal: number, nombreArchivo: string) {

        if (!nidFuncion) {
            const funcion = await this.dataLocalService.leerFuncion()
            nidFuncion = funcion.nid_funcion
        }
        if (!nidPersonal) {
            const user = await this.dataLocalService.leerUser()
            nidPersonal = user.nidPersonal
        }

        for (let index = 0; index < fotos.length; index++) {
            if (fotos[index].nueva) {
                const fecha = new Date(fotos[index].fec_archivo)
                const nombreArchivoFinal = `${nombreArchivo}_${('0' + fecha.getDate().toString()).slice(-2)}${('0' + (fecha.getMonth() + 1)).toString().slice(-2)}${fecha.getFullYear()}_${fotos[index].cod_archivo}.jpg`
                const resp = await this.sgpService.guardarProyectoArchivo(fotos[index], codidgoProyecto, atributos, nidFuncion, nidPersonal, nombreArchivoFinal)
                console.log('resp guardarProyectoArchivo:>> ', resp);
                if (!resp) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa('No se ha enviado la foto.')
                    return null
                }
                if (resp.status !== 0) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(resp.message)
                    return null
                }
                fotos[index].nid_archivo = resp.result
                fotos[index].nueva = false
                fotos[index].enviada = true
            }
        }
        return fotos
    }

    async obtenerLinkFoto(nidArchivo: number) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return }
        const resp: any = await this.sgpService.obtenerLinkFoto(nidArchivo)
        return resp
    }

    // async obtenerArchivo(nidArchivo: number, rutaArchivo: string) {
    //     const ok = await this.utilService.evaluarConexion()
    //     if (!ok) { return }
    //     const resp: any = await this.sgpService.obtenerArchivo(nidArchivo, rutaArchivo)
    //     return resp
    // }

    async notificaciones() {
        const resp = await this.notificacionesEnviar()
        console.log('resp Enviar Notificaciones:>> ', resp);
        if (resp) {
            const notificaciones: Notificacion[] = await this.sgpService.obtenerNotificaciones().catch(error => {
                console.error(error)
                this.uiService.alertaInformativa('No se ha podido sincronizar las notificaciones.')
                return null
            })
            console.log('notificaciones :>> ', notificaciones);
            return notificaciones
        }
        return null
    }

    async notificacionesNuevas() {
        let ultimaNotificacion = 0
        const notificacionesList = await this.dataLocalService.leerNotificaciones()
        if (notificacionesList && notificacionesList.length > 0) {ultimaNotificacion = notificacionesList[0].nid_notificacion}
        const resp = await this.notificacionesEnviar()
        if (resp) {
            const notificaciones: Notificacion[] = await this.sgpService.obtenerNotificacionesNuevas(ultimaNotificacion).catch(error => {
                console.error(error)
                this.uiService.presentToast('No se ha podido sincronizar las notificaciones.')
                return null
            })
            if (notificaciones && notificaciones.length > 0) {
                this.uiService.presentToast(`Has recibido ${notificaciones.length} notificacación(es).`)
                await this.dataLocalService.guardarNotificacionesNuevas(notificaciones)
            }
            return notificaciones
        }
        return null
    }

    async notificacionesEnviar(omitirAlertas?: boolean) {
        const ok = await this.utilService.evaluarConexion(omitirAlertas, true)
        if (!ok) { return false }
        const leidas: Notificacion[] = await this.dataLocalService.leerNotificacionesLeidas()
        if (leidas && (await leidas).length > 0) {
            for (let index = 0; index < leidas.length; index++) {
                const resp = await this.sgpService.marcarLeidoNotificacion(leidas[index].nid_notificacion, leidas[index].fec_lectura).catch(async error => {
                    return false
                })
            }
        }

        const eliminadas: Notificacion[] = await this.dataLocalService.leerNotificacionesEliminadas()
        if (eliminadas && (await eliminadas).length > 0) {
            for (let index = 0; index < eliminadas.length; index++) {
                const resp = await this.sgpService.eliminarNotificacion(eliminadas[index].nid_notificacion, eliminadas[index].fec_eliminacion).catch(async error => {
                    return false
                })
            }
        }
        return true
    }

    async integrantes(usuario: Usuario) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}

        await this.uiService.presentLoading(`Descargando... Por favor espere.`)

        const usuarioGuardado = await this.dataLocalService.leerUsuario(usuario.codigo_expediente, usuario.id)
        const integrantes: Integrante[] = await this.sgpService.obtenerIntegrantes(usuario.codigo_expediente, usuario.nid_personal_proyecto).catch(async error => {
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(`Error al descargar los integrantes. ${error.message}`)
            return null
        })
        if (integrantes && integrantes.length > 0) {
            usuarioGuardado.integrantes = integrantes
            usuarioGuardado.orden = usuario.orden
            await this.dataLocalService.guardarUsuario(usuarioGuardado, false)
            await this.uiService.dismissLoading()
            return integrantes
        } else {
            await this.uiService.dismissLoading()
            return null
        }
    }

    async envioActividadesProd(actividadesProductivas: ActividadProductiva[], respEnvio: any) {
        let nidUsuarioActividad = actividadesProductivas[0].nid_usuario_actividad
        for (let index = 0; index < actividadesProductivas.length; index++) {
            let nidActPproductiva = actividadesProductivas[index].nid_act_productiva
            const actividadDetList = actividadesProductivas[index].actividadDetalle
            for (let idx = 0; idx < actividadDetList.length; idx++) {
                if (actividadDetList[idx].cambio) {
                    if (nidUsuarioActividad) { actividadDetList[idx].nid_usuario_actividad = nidUsuarioActividad }
                    if (nidActPproductiva) { actividadDetList[idx].nid_act_productiva = nidActPproductiva }
                    if (respEnvio.nidPersonalProyecto) { actividadDetList[idx].nid_personal_proyecto = respEnvio.nidPersonalProyecto }
                    let respAct = await this.sgpService.guardarActividadProductiva(actividadDetList[idx]).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar actividades productivas. ${error.message}`)
                        return null
                    })
                    if (!respAct) {
                        respEnvio.error = true
                        return {respEnvio}
                    }
                    if (!nidUsuarioActividad) { nidUsuarioActividad = respAct.result.idUsr }
                    if (!nidActPproductiva) { nidActPproductiva = respAct.result.idAct }
                    actividadDetList[idx].nid_proyecto_act_prod = respAct.result.id
                    actividadDetList[idx].nid_usuario_actividad = respAct.result.idUsr
                    actividadDetList[idx].nid_act_productiva = respAct.result.idAct
                    actividadDetList[idx].cambio = false
                }
            }
            actividadesProductivas[index].nid_usuario_actividad = nidUsuarioActividad
            actividadesProductivas[index].nid_act_productiva = nidActPproductiva
            actividadesProductivas[index].actividadDetalle = actividadDetList
        }
        return {actividadesProductivas, nidUsuarioActividad}
    }
    
    async envioFicha(ficha: FichaVivienda, respEnvio: any) {
        if (respEnvio.nidPersonalProyecto) {ficha.nid_personal_proyecto = respEnvio.nidPersonalProyecto}
        const respFicha = await this.sgpService.guardarFichaUsuario(ficha).catch(async error => {
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(`Error al enviar la ficha de la vivienda. ${error.message}`)
            return null
        })
        if (!respFicha) {
            respEnvio.error = true
            return respEnvio
        }
        ficha.nid_ficha = respFicha.result
        console.log('ficha.nid_ficha :>> ', ficha.nid_ficha);
        if (ficha.emprendimientos) {
            console.log('ficha.emprendimientos :>> ', ficha.emprendimientos);
            for (let index = 0; index < ficha.emprendimientos.length; index++) {
                ficha.emprendimientos[index].codigo_expediente = ficha.codigo_expediente
                ficha.emprendimientos[index].nid_ficha = ficha.nid_ficha
                const emp = ficha.emprendimientos[index]
                if (emp.cod_tiempo || emp.cod_tipo || emp.imp_ingresos || emp.num_integrantes || index === 0) {
                    const respEmp = await this.sgpService.guardarFichaEmprendimiento(ficha.emprendimientos[index]).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar los emprendimientos. ${error.message}`)
                        return null
                    })
                    console.log('respEmp :>> ', respEmp);
                    if (!respEmp) {
                        respEnvio.error = true
                        return {respEnvio}
                    }
                    ficha.emprendimientos[index].nid_ficha_emprendimiento = respEmp.result
                }
            }
        }
        console.log('ficha :>> ', ficha);
        return {ficha}
    }
    
    async planActividadesRecepcion(nidFuncion: number, nidPersonal: number) {
        await this.sgpService.obtenerPlanList(nidFuncion, nidPersonal)
        const planActividadesList = await this.sgpService.obtenerPlanActividadList(nidFuncion, nidPersonal)
        this.planActividadesListener.emit(planActividadesList)
        await this.sgpService.obtenerAccionesList(nidFuncion)
    }

    async planActividad(planActividad: PlanActividad, sincNotif?: boolean) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}

        if (planActividad.actividadEjecutada?.incompleto) {
            await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa('La actividad tiene datos incompletos impcompletos.')
            return null
        }

        await this.uiService.dismissLoading()
        await this.uiService.presentLoading(`Sincronizando... Por favor espere...`)
        if (sincNotif) {this.notificacionesNuevas()}

        if (planActividad.actividadEjecutadaCambio || planActividad.samCambio) {
            // const resp = await this.sgpService.guardarPlanActividad(planActividad)
            planActividad = await this.enviarPlanActividad(planActividad)
            if (!planActividad) {return null}
        }
        console.log('obtiene actividad');
        const id = planActividad.id
        planActividad = await this.sgpService.obtenerPlanActividad(planActividad.nid_plan, planActividad.nid_actividad, planActividad.nid_detalle)
        console.log('planActividad :>> ', planActividad);
        if (planActividad) {
            planActividad.id = id
            await this.dataLocalService.guardarPlanActividad(planActividad)
        }
        await this.uiService.dismissLoading()
        console.log('resp obtener planActividad :>> ', planActividad);
        return planActividad
    }

    async enviarPlanActividad(actividad: PlanActividad) {
        console.log('actividad 00000:>> ', actividad);
        if (actividad.actividadEjecutada.avanceTecnologia && actividad.actividadEjecutada.avanceTecnologia.length > 0) {
            const incompleto = this.evaluarExisteDetalleIncompleto(actividad.actividadEjecutada.avanceTecnologia)
            if (incompleto) {
                await this.uiService.dismissLoading()
                await this.uiService.alertaInformativa('Existe avances/seguimientos con datos impcompletos')
                return null
            } else {    
                for (let index = 0; index < actividad.actividadEjecutada.avanceTecnologia.length; index++) {
                    console.log('actividad.avanceTecnologia[index].nid_avance :>> ', actividad.actividadEjecutada.avanceTecnologia[index].nid_avance);
                    if (!actividad.actividadEjecutada.avanceTecnologia[index].nid_avance) {
                        console.log('No tiene nid_avance actividad.actividadEjecutada.avanceTecnologia[index] :>> ', actividad.actividadEjecutada.avanceTecnologia[index]);
                        const usuario = await this.dataLocalService.leerUsuario(actividad.actividadEjecutada.avanceTecnologia[index].codigo_expediente, actividad.actividadEjecutada.avanceTecnologia[index].index)
                        console.log('usuario :>> ', usuario);
                        const idxTecnologia = usuario.tecnologias.findIndex(item => item.nid_tecnologia === actividad.actividadEjecutada.avanceTecnologia[index].nid_tecnologia)
                        console.log('idxTecnologia :>> ', idxTecnologia);
                        const nidAvance = await this.actividadAvanceTecnologia(usuario, idxTecnologia)
                        console.log('nidAvance :>> ', nidAvance);
                        if (!nidAvance) {
                            await this.uiService.dismissLoading()
                            console.log('Error en el avance idxTecnologia guardar actividad:>> ', idxTecnologia);
                            await this.dataLocalService.guardarPlanActividad(actividad)
                            return null
                        }
                        actividad.actividadEjecutada.avanceTecnologia[index].nid_avance = nidAvance
                    }
                }
            }
            for (let index = 0; index < actividad.actividadEjecutada.avanceTecnologia.length; index++) {
                if (!actividad.actividadEjecutada.avanceTecnologia[index].nid_avance) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa('Falta sincronizar los avances/seguimiento.')
                    // await this.dataLocalService.guardarPlanActividad(actividad, index)
                    return null
                }
            }
        }
        
        const resp = await this.sgpService.guardarPlanActividad(actividad).catch(async error => {
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(`Error al guardar la actividad. ${error.message}`)
            return null
        })
        console.log('guardarPlanActividad resp :>> ', resp);
        if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
            await this.uiService.dismissLoading()
            await this.dataLocalService.guardarPlanActividad(actividad)
            this.uiService.alertaInformativa(resp.message)
            return null
        }
        console.log('resp.result id actividad:>> ', resp.result);
        if (!actividad.nid_actividad) {actividad.nid_actividad = resp.result}
        if (actividad.nid_actividad && actividad.actividadEjecutada && actividad.actividadEjecutada.fotos && actividad.actividadEjecutada.fotos.length > 0) {
            const fotosOk = await this.enviarActividadArchivo(actividad.actividadEjecutada.fotos, `${actividad.nid_plan}|${actividad.nid_actividad}|${actividad.nid_detalle}`, actividad.nid_funcion, actividad.nid_personal, `Actividad_${actividad.nid_plan}_${actividad.nid_actividad}_${actividad.nid_detalle}`).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar fotos de visitas. ${error.message} (ID: ${actividad.nid_plan, actividad.nid_actividad, actividad.nid_detalle})`)
                return null
            })
            if (!fotosOk) {
                await this.dataLocalService.guardarPlanActividad(actividad)
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar los datos.`)
                return null
            }
            actividad.actividadEjecutada.fotos = fotosOk
        }

        if (actividad.nid_actividad && actividad.actividadEjecutada && actividad.actividadEjecutada.eriDetalle?.length > 0) {
            // this.enviaEriDetalle(actividad.actividadEjecutada.eriDetalle, actividad.nid_actividad)
            for (let idx = 0; idx < actividad.actividadEjecutada.eriDetalle.length; idx++) {
                actividad.actividadEjecutada.eriDetalle[idx].nid_plan = actividad.nid_plan
                actividad.actividadEjecutada.eriDetalle[idx].nid_actividad = actividad.nid_actividad
                actividad.actividadEjecutada.eriDetalle[idx].nid_detalle = actividad.nid_detalle
                const resp = await this.sgpService.guardarActEjecDetalle(actividad.actividadEjecutada.eriDetalle[idx]).catch(async error => {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(`Error al guardar el detalle del ERI. ${error.message}`)
                    return null
                })
                console.log('guardarPlanActividad resp :>> ', resp);
                if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(resp.message)
                    return null
                }
    
                actividad.actividadEjecutada.eriDetalle[idx].nid_act_ejecutada_det = resp.result

                if (actividad.actividadEjecutada.eriDetalle[idx].fotosDetalle?.length > 0) {
                    const fotosDet = await this.enviarActividadArchivo(actividad.actividadEjecutada.eriDetalle[idx].fotosDetalle, `${actividad.nid_plan}|${actividad.nid_actividad}|${actividad.nid_detalle}|1|${actividad.actividadEjecutada.eriDetalle[idx].nid_act_ejecutada_det}`, actividad.nid_funcion, actividad.nid_personal, `ActDetalle_${actividad.nid_plan}_${actividad.nid_actividad}_${actividad.nid_detalle}_1_${actividad.actividadEjecutada.eriDetalle[idx].nid_act_ejecutada_det}`).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar fotos del detalle de la actividad. ${error.message} (ID: ${actividad.nid_plan, actividad.nid_actividad, actividad.nid_detalle, actividad.actividadEjecutada.eriDetalle[idx].nid_act_ejecutada_det})`)
                        return null
                    })
                    if (!fotosDet) {
                        await this.dataLocalService.guardarPlanActividad(actividad)
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar los datos.`)
                        return null
                    }
                    actividad.actividadEjecutada.eriDetalle[idx].fotosDetalle = fotosDet

                }
                
            }
        }

        actividad.actividadEjecutadaCambio = false
        console.log('Guarda actividad :>> ', actividad);
        await this.dataLocalService.guardarPlanActividad(actividad)
        return actividad
    }

    // async enviaEriDetalle(eriDetalle: ActividadDetalle[], nidActividad: number) {
    //     for (let idx = 0; idx < eriDetalle.length; idx++) {
    //         eriDetalle[idx].nid_actividad = nidActividad
    //         const resp = await this.sgpService.guardarActEjecDetalle(eriDetalle[idx]).catch(async error => {
    //             await this.uiService.dismissLoading()
    //             this.uiService.alertaInformativa(`Error al guardar el detalle del ERI. ${error.message}`)
    //             return null
    //         })
    //         console.log('guardarPlanActividad resp :>> ', resp);
    //         if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
    //             await this.uiService.dismissLoading()
    //             this.uiService.alertaInformativa(resp.message)
    //             return null
    //         }

    //         eriDetalle[idx].nid_actividad = resp.result
    //         if (eriDetalle[idx].fotosDetalle?.length > 0) {
    //             const fotosDet = await this.enviarActividadArchivo(eriDetalle[idx].fotosDetalle, `${actividad.nid_plan}|${actividad.nid_actividad}|${actividad.nid_detalle}`, actividad.nid_funcion, actividad.nid_personal, `Actividad_${actividad.nid_plan}_${actividad.nid_actividad}_${actividad.nid_detalle}`).catch(async error => {
    //                 await this.uiService.dismissLoading()
    //                 this.uiService.alertaInformativa(`Error al enviar fotos de visitas. ${error.message} (ID: ${actividad.nid_plan, actividad.nid_actividad, actividad.nid_detalle})`)
    //                 return null
    //             })
    //             if (!fotosDet) {
    //                 await this.dataLocalService.guardarPlanActividad(actividad, idx)
    //                 await this.uiService.dismissLoading()
    //                 this.uiService.alertaInformativa(`Error al enviar los datos.`)
    //                 return null
    //             }
    //             actividad.actividadEjecutada.fotos = fotosDet

    //         }
            
    //     }
    // }

    async enviarActividadArchivo(fotos: Archivo[], atributos: string, nidFuncion: number, nidPersonal: number, nombreArchivo: string) {
        for (let index = 0; index < fotos.length; index++) {
            if (fotos[index].nueva) {
                const fecha = new Date(fotos[index].fec_archivo)
                nombreArchivo = `${nombreArchivo}_${('0' + fecha.getDate().toString()).slice(-2)}${('0' + (fecha.getMonth() + 1)).toString().slice(-2)}${fecha.getFullYear()}.jpg`
                const resp = await this.sgpService.guardarActividadArchivo(fotos[index], atributos, nidFuncion, nidPersonal, nombreArchivo)
                if (!resp) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa('No se ha enviado la foto.')
                    return null
                }
                if (resp.status !== 0) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(resp.message)
                    return null
                }
                fotos[index].nid_archivo = resp.result
                fotos[index].nueva = false
                fotos[index].enviada = true
            }
        }
        return fotos
    }

    async accionesRecepcion(nidFuncion: number, nidPersonal: number) {
        const AccionActividadList = await this.sgpService.obtenerAccionesList(nidPersonal)
        this.accionesListener.emit(AccionActividadList)
    }

    async accionActividad(accion: SamAccion, index: number, sincNotif?: boolean) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}

        if (accion.actividad && accion.actividad.incompleto) {
            await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa('La actividad tiene datos incompletos.')
            return null
        }

        await this.uiService.dismissLoading()
        await this.uiService.presentLoading(`Sincronizando... Por favor espere...`)
        if (sincNotif) {this.notificacionesNuevas()}

        if (accion.actividadCambio) {
            // const resp = await this.sgpService.guardarPlanActividad(planActividad)
            accion = await this.enviarAccionActividad(accion, index)
            if (!accion) {return null}
        }
        console.log('obtiene actividad');
        const id = accion.id
        accion = await this.sgpService.obtenerAccion(accion.nid_plan, accion.nid_actividad, accion.nid_detalle, accion.nid_accion)
        console.log('planActividad :>> ', accion);
        if (accion) {
            accion.id = id
            await this.dataLocalService.guardarAccionActividad(accion, index)
        }
        await this.uiService.dismissLoading()
        console.log('resp obtener planActividad :>> ', accion);
        return accion
    }

    async enviarAccionActividad(accion: SamAccion, index: number) {
        console.log('actividad 00000:>> ', accion);
        if (accion?.actividad?.avanceTecnologia && accion.actividad.avanceTecnologia.length > 0) {
            for (let index = 0; index < accion.actividad.avanceTecnologia.length; index++) {
                console.log('actividad.avanceTecnologia[index].nid_avance :>> ', accion.actividad.avanceTecnologia[index].nid_avance);
                if (!accion.actividad.avanceTecnologia[index].nid_avance) {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(`Debe sincronizar primero los informes de seguimiento a las tecnologías relacionados a la actividad.`)
                    return null
                }
                
            }
        }
        
        const resp = await this.sgpService.guardarAccionActividad(accion).catch(async error => {
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(`Error al guardar la acción. ${error.message}`)
            return null
        })
        if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(resp.message)
            return null
        }
        console.log('resp.result id actividad:>> ', resp.result);
        if (!accion.nid_actividad) {accion.nid_actividad = resp.result}

        if (accion.nid_actividad && accion.actividad && accion.actividad.fotos && accion.actividad.fotos.length > 0) {
            let nidFuncion = accion.nid_funcion
            if (!nidFuncion) {
                const permiso = await this.dataLocalService.leerPermisoZonal()
                nidFuncion = permiso.perfil.funcion.nid_funcion
            }
            const fotosOk = await this.enviarActividadArchivo(accion.actividad.fotos, `${accion.nid_plan}|${accion.nid_actividad}|${accion.nid_detalle}|1|${accion.nid_accion}|1`, nidFuncion, accion.nid_responsable, `Accion_Actividad`).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar fotos de visitas. ${error.message} (ID: ${accion.nid_actividad, accion.nid_actividad, accion.nid_detalle, accion.nid_accion})`)
                return null
            })
            if (!fotosOk) {
                await this.dataLocalService.guardarAccionActividad(accion, index)
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar los datos.`)
                return null
            }
            accion.actividad.fotos = fotosOk
        }
        accion.actividadCambio = false
        console.log('Guarda actividad :>> ', accion);
        await this.dataLocalService.guardarAccionActividad(accion, index)
        return accion
    }

    async actividadAvanceTecnologia(usuario, index) {
        if (usuario.registroAvanceTec) {
            console.log('usuario.registroAvanceTec :>> ', usuario.registroAvanceTec);
            // for (let index = 0; index < usuario.tecnologias.length; index++) {
                const tecnologia = usuario.tecnologias[index]
                if (tecnologia.avance) {
                    console.log('actividadAvanceTecnologia tecnologia.avence :>> ', tecnologia.avence);
                    const respAvance = await this.sgpService.guardarTecnologiaAvance(tecnologia.avance).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar avance de tecnologías. ${error.message}`)
                        return null
                    })
                    if (!respAvance) {
                        // respEnvio.error = true
                        // return respEnvio
                        return null
                    }
                    console.log('respAvance :>> ', respAvance);
                    usuario.tecnologias[index].avance.nid_avance = respAvance.result
                    // if (usuario.tecnologias[index].avance.plan_actividad_id) {await this.actualizaActividadTecnologia(usuario.tecnologias[index].avance.plan_actividad_id, respAvance.result, usuario.codigo_expediente, usuario.nid_personal_proyecto, usuario.tecnologias[index].nid_tecnologia)}
                    
                    if (tecnologia.avance.avanceProd) {
                        for (let idx = 0; idx < usuario.tecnologias.length; idx++) {
                            if (tecnologia.avance.avanceProd[idx]) {
                                tecnologia.avance.avanceProd[idx].codigo_expediente = usuario.codigo_expediente
                                tecnologia.avance.avanceProd[idx].nid_personal_proyecto = usuario.nid_personal_proyecto
                                tecnologia.avance.avanceProd[idx].nid_tecnologia = tecnologia.nid_tecnologia
                                tecnologia.avance.avanceProd[idx].nid_avance = respAvance.result
                                const respAvanceProd = await this.sgpService.guardarTecnologiaAvanceProd(tecnologia.avance.avanceProd[idx]).catch(async error => {
                                    await this.uiService.dismissLoading()
                                    this.uiService.alertaInformativa(`Error al enviar los datos de la producción. ${error.message}`)
                                    return null
                                })
                                if (!respAvanceProd) {
                                    // respEnvio.error = true
                                    // return respEnvio
                                    return
                                }
                                this.usuarioEnvio.tecnologias[index].avance.avanceProd[idx].nid_avance_prod = respAvanceProd.result
                            }
                        }
                    }

                    if (tecnologia.avance.fotos) {
                        const fotosOk = await this.enviarProyectoArchivo(tecnologia.avance.fotos, usuario.codigo_expediente, usuario.nid_personal_proyecto, tecnologia.nid_tecnologia, respAvance.result, tecnologia.avance.nid_funcion, tecnologia.avance.nid_personal, tecnologia.cod_tecnologia, usuario.txt_documento_identidad).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al enviar fotos de usuario. ${error.message}`)
                            return null
                        })
                        if (!fotosOk) {
                            // respEnvio.error = true
                            // return respEnvio
                            return
                        }
                        tecnologia.avance.fotos = fotosOk
                    }
                    usuario.tecnologias[index].avance = null
                    usuario.tecnologias[index].avanceIncompleto = null
                    usuario.registroAvanceTec = this.evaluarExisteAvance(usuario)
                    if (!usuario.registroAvanceTec) {usuario.tipoAvance = null}
                    usuario.registroAvanceIncompleto = this.evaluarExisteAvanceIncompleto(usuario)
                    await this.dataLocalService.guardarUsuario(usuario, false)

                    return respAvance.result
                }
            // }
        }
    }

    evaluarExisteAvance(usuario) {
        for (let index = 0; index < usuario.tecnologias.length; index++) {
            if (usuario.tecnologias[index].avance) {return true}
        }
        return false
    }

    evaluarExisteAvanceIncompleto(usuario) {
        for (let index = 0; index < usuario.tecnologias.length; index++) {
            if (usuario.tecnologias[index].avanceIncompleto) {return true}
        }
        return false
    }

    evaluarExisteDetalleIncompleto(actividadDetalle: ActividadDetalle[]) {
        for (let index = 0; index < actividadDetalle.length; index++) {
            if (actividadDetalle[index].avanceIncompleto) {return true}
        }
        return false
    }





    async agente(agente: Agente, sincNotif?: boolean) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}
        await this.uiService.dismissLoading()
        await this.uiService.presentLoading(`Sincronizando... Por favor espere...`)
        if (sincNotif) {this.notificacionesNuevas()}

        if (agente.evaluacionIcompleto) {
            await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa(`La evaluación está incompleta.`)
            return null
        }

        if (agente.cambioEvaluacion) {
            agente = await this.enviarAgenteEvaluacion(agente).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar la evaluación. ${error.message}`)
                return null
            })
            if (!agente) {return null}
            console.log('Enviar evaluación agente :>> ', agente);
        }

        const id = agente.id
        agente = await this.sgpService.obtenerAgente(agente.codigo_expediente, agente.nid_funcion, agente.nid_personal, agente.nid_asignacion, id)
        if (agente) {
            console.log('Agente recuperado :>> ', agente)
            agente.id = id
            await this.dataLocalService.guardarAgente(agente)
        }

        await this.uiService.dismissLoading()
        return agente
    }

    async enviarAgenteEvaluacion(agente: Agente) {
        const resp = await this.sgpService.guardarEvaluacion(agente.evaluacion).catch(async error => {
            console.log('resp enviarAgenteEvaluacion:>> ', resp);
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(`Error al enviar la evaluación. ${error.message}`)
            return null
        })
        console.log('resp guardarInformeEri:>> ', resp);
        if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
            console.log('entra aquí >> ')
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(resp.message)
            return null
        }
        agente.evaluacion.nid_evaluacion = resp.result
        return agente
    }

}

