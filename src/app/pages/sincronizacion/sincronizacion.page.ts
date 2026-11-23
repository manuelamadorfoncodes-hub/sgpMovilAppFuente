import { Component, OnInit } from '@angular/core'

import { SeguridadService } from './../../services/seguridad.service'
import { SincronizaService } from '../../services/sincroniza/sincroniza.service'
import { DataLocalService } from '../../services/data-local.service'
import { SgpService } from '../../services/sgp.service'
import { UiServiceService } from '../../services/ui-service.service'
import { UtilService } from '../../services/util.service'
import { ReportesService } from './../../services/reportes.service';
import { SincronizaTecColectivaService } from '../../services/sincroniza/sincroniza-tec-colectiva.service'

import { Funcion, User } from '../../model/generales'
import { Proyecto } from '../../model/proyectos'
import { SincronizaVisitaService } from '../../services/sincroniza/sincroniza-visita.service'
import { SincronizaEriService } from '../../services/sincroniza/sincroniza-eri.service'
import { SincronizaProyActividadService } from '../../services/sincroniza/sincroniza-proy-actividad.service'

@Component({
    selector: 'app-sincronizacion',
    templateUrl: './sincronizacion.page.html',
    styleUrls: ['./sincronizacion.page.scss'],
})
export class SincronizacionPage implements OnInit {
    loading: any
    titulo = 'SGP Móvil'
    defaultHref = ''
    proyectos: Proyecto[]
    paramProy = []

    planActividadCheck = false
    accionesCheck = false

    operacionProyCheck = ''

    opcionesCheck = false
    actividadesCheck = false
    usuariosCheck = false
    parametrosCheck = false

    proyectosListCheck = false
    botonDescargarProy = false
    mensaje = ''
    advertenciaSoloRecibir = true

    sincronizaPlanesActivSup = false
    sincronizaAcciones = false
    sincronizaTecColectiva = false
    sincronizaActividadEri = false
    sincronizaUsuarios = false
    sincronizaVisitas = false
    // progreso = 0
    // pesoTotal = 0
    // cantidadProyectos = 0
    // cantidadUsuarios = 0

    constructor(private dataLocalService: DataLocalService,
        private uiService: UiServiceService,
        private sgpService: SgpService,
        private utilService: UtilService,
        private sincronizaService: SincronizaService,
        private sincTecPartidaService: SincronizaTecColectivaService,
        private seguridadService: SeguridadService,
        private reportesService: ReportesService,
        private sincronizaVisitaService: SincronizaVisitaService,
        private sincronizaEriService: SincronizaEriService,
        private sincProyActivService: SincronizaProyActividadService
    ) { }

    async ngOnInit() {
        console.log('entra sincronizacion');
        this.sincronizaService.mensajeListener.subscribe(mensaje => this.mensaje = mensaje)

        this.proyectos = await this.dataLocalService.leerProyectos()
        console.log('this.proyectos :>> ', this.proyectos);
        this.creaParametrosProyecto()

        let opcion
        opcion = await this.dataLocalService.leerOpcion('actividadSuper')
        if (opcion) {this.sincronizaPlanesActivSup = true}
        opcion = await this.dataLocalService.leerOpcion('acciones')
        if (opcion) {this.sincronizaAcciones = true}
        opcion = await this.dataLocalService.leerOpcion('tecnologiasColectivas')
        if (opcion) {this.sincronizaTecColectiva = true}
        opcion = await this.dataLocalService.leerOpcion('actividades')
        if (opcion) {this.sincronizaActividadEri = true}
        opcion = await this.dataLocalService.leerOpcion('eri')
        if (opcion) {this.sincronizaActividadEri = true}
        opcion = await this.dataLocalService.leerOpcion('usuarios')
        if (opcion) {this.sincronizaUsuarios = true}
        opcion = await this.dataLocalService.leerOpcion('visitas')
        if (opcion) {this.sincronizaVisitas = true}
                
        // OJO no pasa a producción (11/08/2021)
        // opcion = await this.dataLocalService.leerOpcion('sincronizacion')
        // if (opcion.opciones.findIndex(op => op.txtnombreobjeto === 'descargarProyecto') >= 0) {this.botonDescargarProy = true}
        console.log('entra sincronizacion :>> FIN');
    }

    async sicronizar() {
        // this.progreso = 0
        this.mensaje = 'Conectando...'
        await this.uiService.presentLoading('Sincronizando... Por favor espere...')
        
        if (this.opcionesCheck) {
            this.mensaje = 'Importando: Configuración de opciones y permisos.'
            await this.seguridadService.renuevaToken()
        }
        
        const ok = await this.utilService.evaluarConexion()
        if (!ok) {
            await this.uiService.dismissLoading()
            this.mensaje = 'Proceso cancelado.'
            return
        }

        const funcion: Funcion = await this.dataLocalService.leerFuncion()
        const user: User = await this.dataLocalService.leerUser()
        if (!funcion) {
            await this.uiService.dismissLoading()
            return
        }
        
        await this.sincronizaService.notificacionesNuevas()

        console.log('this.operacionProyCheck :>> ', this.operacionProyCheck);
        console.log('this.proyectos :>> ', this.proyectos);
        // 1 - Enviar y recibir,   2 - Sólo recibir

        if (this.proyectos && (this.operacionProyCheck == '1' || this.operacionProyCheck == '2')) {
            let detener = false
            if (!(await this.evaluarChecks())) {return}
            let envia = false
            if (this.operacionProyCheck == '1') {envia = true}
            for (let index = 0; index < this.proyectos.length; index++) {
                if (this.proyectos[index].seleccionado) {
                    // Datos básicos del proyecto
                    if (this.paramProy[index].datosBasicos) {
                        this.mensaje = 'Importando: Datos base del proyecto ' + this.proyectos[index].codigo_expediente
                        const proyecto = await this.sgpService.obtenerProyectoDatosBase(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al recuperar datos del proyecto. ${error.message})`)
                            return null
                        })
                        this.proyectos[index].fec_inicio = proyecto.fec_inicio
                        this.proyectos[index].nombre_ne = proyecto.nombre_ne
                        this.proyectos[index].nombre_nec = proyecto.nombre_nec
                        this.proyectos[index].nid_tipo_proyecto = proyecto.nid_tipo_proyecto
                        this.proyectos[index].nid_sub_tipo_proyecto = proyecto.nid_sub_tipo_proyecto
                        this.proyectos[index].txt_incompleto = proyecto.txt_incompleto
                        await this.dataLocalService.guardarProyectoLista(this.proyectos[index])
                    }

                    // Tecnologias colectivas
                    if (this.paramProy[index].tecColectiva) {
                        if (envia) {
                            const resp = await this.sincTecPartidaService.enviarLista(this.proyectos[index].codigo_expediente)
                            this.mensaje = 'Proceso interrumpido.'
                            if (!resp) {return}
                        }
                        console.log('this.paramProy[index].tecColectiva :>> ', this.paramProy[index].tecColectiva);
                        this.mensaje = 'Importando: Tecnologías colectivas ' + this.proyectos[index].codigo_expediente
                        await this.sgpService.obtenerTecnologiaColectivaList(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error obtener la lista de tecnologías colectivas. ${error.message})`)
                            return null
                        })
                    }

                    // Actividades y ERI // solo activiades y solo recibir hasta que se termine
                    if (this.paramProy[index].actividadEri) {
                        this.mensaje = 'Sincronizadno información de ERIs del proyecto ' + this.proyectos[index].codigo_expediente
                        await this.sincronizaEriService.eriEnvioRecepcion(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal, user.perfil.nidperfil, envia)
                        this.mensaje = 'Sincronizadno información de actividades del proyecto ' + this.proyectos[index].codigo_expediente
                        await this.sincProyActivService.actividadEnvioRecepcion(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal, envia)
                        // if (envia) {
                        //     // const resp = await this.sincTecPartidaService.enviarLista(this.proyectos[index].codigo_expediente)
                        //     // this.mensaje = 'Proceso interrumpido.'
                        //     // if (!resp) {return}
                        // }
                        // console.log('this.paramProy[index].actividadEri :>> ', this.paramProy[index].actividadEri);
                        // this.mensaje = 'Importando: ERI y Actividades del proyecto ' + this.proyectos[index].codigo_expediente
                        // if (user.perfil.nidperfil === 34) {
                        //     await this.sgpService.obtenerEriPorAgente(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal).catch(async error => {
                        //         await this.uiService.dismissLoading()
                        //         this.uiService.alertaInformativa(`Error obtener la lista de ERIs por agente. ${error.message})`)
                        //         return null
                        //     })
                        // } else {
                        //     await this.sgpService.obtenerEriList(this.proyectos[index].codigo_expediente).catch(async error => {
                        //         await this.uiService.dismissLoading()
                        //         this.uiService.alertaInformativa(`Error obtener la lista de ERIs por agente. ${error.message})`)
                        //         return null
                        //     })
                        // }
                    }

                    // Lista de usuarios
                    if (this.paramProy[index].listaUsuarios) {
                        if (envia) {
                            const resp = await this.sincronizaService.usuariosEnvio(this.proyectos[index].codigo_expediente)
                            if (!resp) {return}
                        }
                        this.mensaje = 'Importando: Lista de usuarios del proyecto ' + this.proyectos[index].codigo_expediente
                        const usuariosList = await this.sgpService.obtenerListaUsuarios(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal)
                        if (usuariosList) {
                            this.proyectos[index].cantidadUsuarios = usuariosList.length
                            await this.dataLocalService.guardarProyectoLista(this.proyectos[index])
                        }
                    }

                    // Datos de todos los usuarios
                    if (this.paramProy[index].datosUsuarios) {
                        await this.sincronizaService.usuariosEnvioRecepcion(this.proyectos[index].codigo_expediente, envia)
                    }

                    // Datos de usuarios por grupos
                    if (this.paramProy[index].flagGrupoUsuarios && this.paramProy[index].grupoSeleccionado) {
                        const param = this.paramProy[index].grupoUsuarios
                        const grupoSeleccionado = this.paramProy[index].grupoSeleccionado
                        const desde = grupoSeleccionado * param.valor - param.valor + 1
                        const hasta = (grupoSeleccionado * param.valor) < this.proyectos[index].cantidadUsuarios ? (grupoSeleccionado * param.valor) : this.proyectos[index].cantidadUsuarios
                        await this.sincronizaService.usuariosEnvioRecepcion(this.proyectos[index].codigo_expediente, envia, desde, hasta)
                    }

                    // Visitas
                    if (this.paramProy[index].datosVisitas) {
                        this.mensaje = 'Sincronizadno información de visitas del proyecto ' + this.proyectos[index].codigo_expediente
                        await this.sincronizaVisitaService.visitasEnvioRecepcion(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal, envia)
                        await this.sgpService.obtenerProyectoDatosBase(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal)
                    }
                }
            }
        }

        // 3 - reiniciar proyectos
        if (this.operacionProyCheck == '3') {
            await this.uiService.dismissLoading()
            await this.uiService.alertaConfirmacion('Si reinicia la información de proyectos perderá los datos registrados que no haya sincronizado. ¿Está seguro de continuar?.').then(async (resp) => {
                if (resp) {
                    await this.uiService.presentLoading('Sincronizando... Por favor espere...')
                    this.mensaje = 'Importando: Lista de proyectos.'
                    await this.dataLocalService.eliminarProyectos()

                    if (this.sincronizaPlanesActivSup) {
                        this.proyectos = await this.sgpService.obtenerPlanProyectos(funcion.nid_funcion, user.nidPersonal, user.codZonal)
                    } else {
                        this.proyectos = await this.sgpService.obtenerProyectosPorAgente(funcion.nid_funcion, user.nidPersonal, user.codZonal)
                    }
                    if (this.proyectos) {
                        for (let index = 0; index < this.proyectos.length; index++) {
                            this.mensaje = `Importando: Datos básicos del proyecto ${this.proyectos[index].codigo_expediente}`
                            await this.sgpService.obtenerProyectoDatosBase(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal)
                            if (this.proyectos[index].nid_tipo_proyecto === 27) {
                                this.mensaje = `Importando: Lista de usuarios del proyecto ${this.proyectos[index].codigo_expediente}`
                                const usuariosList = await this.sgpService.obtenerListaUsuarios(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal)
                                if (usuariosList) {
                                    this.proyectos[index].cantidadUsuarios = usuariosList.length
                                    await this.dataLocalService.guardarProyectoLista(this.proyectos[index])
                                }
                                this.mensaje = `Importando: Lista de tecnologías colectivas ${this.proyectos[index].codigo_expediente}`
                                await this.sgpService.obtenerTecnologiaColectivaList(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal)
                                
                            } else {
                                this.mensaje = `Importando: Lista de visitas del proyecto ${this.proyectos[index].codigo_expediente}`
                                await this.sgpService.obtenerVisitas(this.proyectos[index].codigo_expediente, funcion.nid_funcion, user.nidPersonal)
                            }
                        }
                    }
                }
            })
        }

        if (this.planActividadCheck) {
            this.mensaje = 'Importando: Actividades del plan de viajes.'
            await this.sincronizaService.planActividadesRecepcion(funcion.nid_funcion, user.nidPersonal)
        }
       
        if (this.accionesCheck) {
            this.mensaje = 'Importando: Acciones y actividades que implemntan las SAM.'
            await this.sincronizaService.accionesRecepcion(funcion.nid_funcion, user.nidPersonal)
        }

        if (this.usuariosCheck) {
            this.mensaje = 'Importando: Configuración de usuarios y tecnologías.'
            await this.sgpService.obtenerUsuarioParametro()
            await this.sgpService.obtenerActividadProductiva()
            if (![3,53].includes(user.perfil.nidperfil)) {await this.sgpService.obtenerTecnologiaFase()}
        }

        if (this.parametrosCheck) {
            this.mensaje = 'Importando: Configuración de fotos y otros parámetros.'
            await this.sgpService.obtenerArchivosConfigurados()
            await this.reportesService.obtenerReportes()
            await this.sgpService.obtenerEriParametros()
            if (this.sincronizaVisitas) {
                this.mensaje = 'Importando: Configuración de parámetros de visitas.'
                await this.sgpService.obtenerVisitaParametro()
            }
            if (this.sincronizaPlanesActivSup || this.sincronizaAcciones) {
                this.mensaje = 'Importando: Configuración de parámetros de actividades y/o acciones.'
                await this.sgpService.obtenerActividadParametros()
                await this.sgpService.obtenerPortafolios()
                // await this.sgpService.obtenerEriParametros()
            }
            // if (funcion.nid_funcion == 417) {
                await this.sgpService.obtenerAgenteParametro()
            // }
            if (this.sincronizaActividadEri) {
                this.mensaje = 'Importando: Configuración de parámetros de actividades.'
                await this.sgpService.obtenerParametrosProyAct()
            }
        }
        this.uiService.dismissLoading()
        this.mensaje = 'Proceso terminado.'
    }

    async evaluarChecks() {
        let proyectoOk = false
        let opcionOk = true
        let grupoOk = true
        let existeDatosEnvio = false
        let mensaje: string = null
        let detener = false

        if (this.operacionProyCheck == '1' || this.operacionProyCheck == '2') {
            this.proyectos.forEach((proyecto, index) => {
                if (proyecto.seleccionado) {
                    proyectoOk = true
                    if (!this.paramProy[index].datosBasicos && !this.paramProy[index].tecColectiva && !this.paramProy[index].listaUsuarios && !this.paramProy[index].datosUsuarios && !this.paramProy[index].flagGrupoUsuarios && !this.paramProy[index].datosVisitas && !this.paramProy[index].actividadEri) {opcionOk = false}
                    if (this.paramProy[index].flagGrupoUsuarios && !this.paramProy[index].grupoSeleccionado) {grupoOk = false}
                    if (this.operacionProyCheck == '2' && (this.paramProy[index].listaUsuarios || this.paramProy[index].datosUsuarios || this.paramProy[index].flagGrupoUsuarios)) {existeDatosEnvio = true}
                }
            });
        }

        if (!proyectoOk) {mensaje = 'No se ha marcado ningún proyecto para sincronizar.'}
        if (!opcionOk) {mensaje = 'No se ha marcado los datos del proyecto a sincronizar.'}
        if (!grupoOk) {mensaje = 'No se ha marcado el grupo de usuarios a sincronizar.'}

        if (mensaje) {
            await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa(mensaje)
            this.mensaje = 'Proceso terminado.'
            return false
        }

        if (this.operacionProyCheck == '2' && existeDatosEnvio) {
            await this.uiService.dismissLoading()
            await this.uiService.alertaConfirmacion('Si sólo recibe la información de proyectos perderá los datos registrados que no haya sincronizado. ¿Está seguro de continuar?.').then(async (resp) => {
                if (!resp) {
                    detener = true
                    this.mensaje = 'Proceso terminado.'
                } else {
                    await this.uiService.presentLoading('Sincronizando... Por favor espere...')
                }
            })
        }
        if (detener) {return false}
        return true
    }

    // async descargarProyecto() {
    //     const proyectos = await this.sincronizaService.descargarProyecto()
    //     if (proyectos) {this.proyectos = proyectos}
    // }

    creaParametrosProyecto() {
        if (this.proyectos) {
            this.paramProy = []
            for (let index = 0; index < this.proyectos.length; index++) {
                this.proyectos[index].seleccionado = false
                const parametros = {
                    datosBasicos: false,
                    tecColectiva: false,
                    actividadEri: false,
                    actividadYEri: false,
                    listaUsuarios: false,
                    datosUsuarios: false,
                    flagGrupoUsuarios: false,
                    grupoUsuarios: this.generarGrupoUsuarios(this.proyectos[index].cantidadUsuarios),
                    datosVisitas: false
                }
                this.paramProy.push(parametros)
            }
        }
    }

    recalculaGrupos(index, event) {
        this.paramProy[index].grupoUsuarios = this.generarGrupoUsuarios(this.proyectos[index].cantidadUsuarios, event.detail.value)
    }

    generarGrupoUsuarios(cantidadUsuarios: number, valor?: number) {
        if (!cantidadUsuarios || cantidadUsuarios < 30) {return null}
        let incremento = 20
        // if (cantidadUsuarios > 80) {incremento = 20}
        if (cantidadUsuarios > 300) {incremento = 40}
        const maxGrupo = (Math.round(cantidadUsuarios / 2 / incremento) + 1) * incremento
        if (!valor && cantidadUsuarios < 40) {valor = 20}
        if (!valor) {valor = Math.round(cantidadUsuarios / 4 / incremento) * incremento}
        const filasGrupo = Math.round(cantidadUsuarios / 2 / valor) + 1
        const grupos = []
        // for (let fila = 1; fila <= filasGrupo; fila++) { 
        for (let fila = 1; fila <= filasGrupo && fila<= 100; fila++) { 
            const grupo = {
                valor1: fila * 2 - 1,
                desde1: (fila * 2 - 1) * valor - valor + 1,
                hasta1: ((fila * 2 -1) * valor) < cantidadUsuarios ? ((fila * 2 - 1) * valor) : cantidadUsuarios,
                valor2: fila * 2,
                desde2: (fila * 2) * valor - valor + 1,
                hasta2: ((fila * 2) * valor) < cantidadUsuarios ? ((fila * 2) * valor) : cantidadUsuarios               
            }
            grupos.push(grupo)
        }
        const grupoUsuarios = {
            incremento,
            filasGrupo,
            maxGrupo,
            grupos,
            valor
        }
        return grupoUsuarios
    }    

    // calculaProgreso(mensaje: string) {
    //     let descuento = 0
    //     if (this.parametrosCheck) {descuento += 1}
    //     if (this.usuariosCheck) {descuento += 1}
    //     if (this.opcionesCheck) {descuento += 1}
    //     if (mensaje.startsWith('#')) {
    //         if (mensaje.includes('P')) {
    //             this.progreso += 0.01
    //             this.cantidadUsuarios = parseInt(mensaje.substr(3))
    //         }
    //         if (mensaje.includes('U')) {
    //             this.progreso += (99 - descuento - this.cantidadProyectos) / this.cantidadProyectos / this.cantidadUsuarios / 100
    //         }

    //     } else {
    //         this.mensaje = 'Importando: ' + mensaje
    //     }
    // }

}
