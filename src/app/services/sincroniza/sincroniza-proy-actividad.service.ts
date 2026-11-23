import { Injectable } from '@angular/core';
import { SgpService } from '../sgp.service';
import { DataLocalService } from '../data-local.service';
import { UiServiceService } from '../ui-service.service';
import { UtilService } from '../util.service';
import { ProyActividad } from '../../model/actividades';
import { SincronizaProyectoService } from './sincroniza-proyecto.service';

@Injectable({
    providedIn: 'root'
})
export class SincronizaProyActividadService {
   
    constructor(private sgpService: SgpService,
        private dataLocalService: DataLocalService,
        private utilService: UtilService,
        private uiService: UiServiceService,
        private sincronizaProyecto: SincronizaProyectoService
    ) { }

        async proyActividad(actividad: ProyActividad, sincNotif?: boolean) {
            const ok = await this.utilService.evaluarConexion()
            if (!ok) { return null}
    
            if (actividad.actividadCambio && !actividad.flg_completo) {
                await this.uiService.dismissLoading()
                await this.uiService.alertaInformativa('La actividad tiene datos incompletos.')
                return null
            }
    
            await this.uiService.dismissLoading()
            await this.uiService.presentLoading(`Sincronizando... Por favor espere...`)
            // if (sincNotif) {this.notificacionesNuevas()}
    
            if (actividad.actividadCambio) {
                actividad = await this.enviarProyActividad(actividad)
                if (!actividad) {return null}
            }
    
            // if (planActividad.actividadEjecutadaCambio || planActividad.samCambio) {
            //     // const resp = await this.sgpService.guardarPlanActividad(planActividad)
            //     planActividad = await this.enviarPlanActividad(planActividad, index)
            //     if (!planActividad) {return null}
            // }
            // console.log('obtiene actividad');
            const orden = actividad.orden
            actividad = await this.sgpService.obtenerActividad(actividad.codigo_expediente, actividad.nid_funcion, actividad.nid_facilitador, actividad.nid_actividad)
            console.log('actividad de obtenerActividad :>> ', actividad);
            if (actividad) {
                actividad.orden = orden
                await this.dataLocalService.guardarActividad(actividad)
            }
            await this.uiService.dismissLoading()
            console.log('resp obtener proyActividad :>> ', actividad);
            return actividad
        }
    
        async enviarProyActividad(actividad: ProyActividad) {
            const resp = await this.sgpService.guardarProyActividadEjec(actividad).catch(async error => {
                console.log('resp guardarActividadEjecutada:>> ', resp);
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar la actividad ejecutada. ${error.message}`)
                return null
            })
            console.log('resp guardarActividadEjecutada:>> ', resp);
            if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
                console.log('entra aquí guardarActividadEjecutada>> ')
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(resp.message)
                return null
            }
            // if (!actividad.informe.nid_informe) {actividad.informe.nid_informe = resp.result}
            if (actividad.tip_actividad === '5') {
                if (actividad.detalle) {
                    for (let index = 0; index < actividad.detalle.length; index++) {
                        if (actividad.detalle[index].fotosDetalle && actividad.detalle[index].fotosDetalle.length > 0) {
                            const atributos = `${actividad.nid_funcion}|${actividad.nid_facilitador}|${actividad.nid_actividad}|${actividad.cod_grupo_usuario}|${actividad.detalle[index].nid_miembro}|1`
                            const nombreArchivo = `ACT_PROY_${actividad.nid_funcion}_${actividad.nid_facilitador}_${actividad.nid_actividad}_${actividad.cod_grupo_usuario}_${actividad.detalle[index].nid_miembro}`
                            const fotosOk = await this.sincronizaProyecto.enviarProyectoFoto(actividad.detalle[index].fotosDetalle, actividad.codigo_expediente, atributos, actividad.nid_funcion, actividad.nid_facilitador, nombreArchivo).catch(async error => {
                                await this.uiService.dismissLoading()
                                this.uiService.alertaInformativa(`Error al enviar fotos de la actividad de seguimiento. ${error.message} (ID: ${actividad.nid_actividad})`)
                                return null
                            })
                            console.log('fotosOk :>> ', fotosOk);
                            if (!fotosOk) {
                                await this.dataLocalService.guardarActividad(actividad)
                                await this.uiService.dismissLoading()
                                await this.uiService.alertaInformativa(`Error al enviar los datos.`)
                                return null
                            }
                            actividad.detalle[index].fotosDetalle = fotosOk
                        }
                    }
                }
            } else {
                if (actividad.fotos && actividad.fotos.length > 0) {
                    const atributos = `${actividad.nid_funcion}|${actividad.nid_facilitador}|${actividad.nid_actividad}`
                    const nombreArchivo = `ACT_PROY_${actividad.nid_funcion}_${actividad.nid_facilitador}_${actividad.nid_actividad}`
                    const fotosOk = await this.sincronizaProyecto.enviarProyectoFoto(actividad.fotos, actividad.codigo_expediente, atributos, actividad.nid_funcion, actividad.nid_facilitador, nombreArchivo).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar fotos de la actividad ejecutada. ${error.message} (ID: ${actividad.nid_actividad})`)
                        return null
                    })
                    console.log('fotosOk :>> ', fotosOk);
                    if (!fotosOk) {
                        await this.dataLocalService.guardarActividad(actividad)
                        await this.uiService.dismissLoading()
                        await this.uiService.alertaInformativa(`Error al enviar los datos.`)
                        return null
                    }
                    actividad.fotos = fotosOk
                }
            }
    
            actividad.actividadCambio = false
            await this.dataLocalService.guardarActividad(actividad)
            return actividad
        }
    
        async actividadEnvioRecepcion(codigoProyecto: string, nidFuncion: number, nidPersonal: number, envia?: boolean) {
            if (envia) {
                const listaActividades = await this.dataLocalService.leerActividades(codigoProyecto)
    
                for (let index = 0; index < listaActividades.length; index++) {
                    if (listaActividades[index].actividadCambio) {
                        if (!listaActividades[index].flg_completo) {
                            await this.uiService.dismissLoading()
                            await this.uiService.alertaInformativa(`Existen actividades con datos incompletos. Sincronización incompleta.`)
                            return null
                        }
                        const respEnvio = await this.enviarProyActividad(listaActividades[index])
                        if (!respEnvio) {return false}
                    } 
                }
            }
    
            await this.sgpService.obtenerProyActividadList(codigoProyecto, nidFuncion, nidPersonal).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error obtener la lista de activiades. ${error.message})`)
                return null
            })
    
            return true
        }

}
