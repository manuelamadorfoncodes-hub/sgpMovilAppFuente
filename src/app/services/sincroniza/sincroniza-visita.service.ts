import { EventEmitter, Injectable } from '@angular/core';
import { SgpService } from '../sgp.service';
import { DataLocalService } from '../data-local.service';
import { UiServiceService } from '../ui-service.service';
import { UtilService } from '../util.service';
import { Archivo } from '../../model/generales';
import { Visita } from '../../model/visitas';
import { SincronizaProyectoService } from './sincroniza-proyecto.service';

@Injectable({
    providedIn: 'root'
})
export class SincronizaVisitaService {
    mensajeListener = new EventEmitter<string>()
    
    constructor(private sgpService: SgpService,
        private dataLocalService: DataLocalService,
        private utilService: UtilService,
        private uiService: UiServiceService,
        private sincronizaProyecto: SincronizaProyectoService
    ) { }


    async enviarVisita(visita: Visita, index: number) {
        const resp = await this.sgpService.guardarVisita(visita).catch(async error => {
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(`Error al enviar la visita. ${error.message}`)
            return null
        })
        console.log('resp enviarVisita:>> ', resp);
        if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
            await this.uiService.dismissLoading()
            this.uiService.alertaInformativa(resp.message)
            return null
        }
        if (!visita.nid_visita) {visita.nid_visita = resp.result}

        if (visita.nid_visita) {
            if (visita.fotos && visita.fotos.length > 0) {
                const atributos = `${visita.nid_visita}`
                const nombreArchivo = `VISITA_ID${visita.nid_visita}`
                const fotosOk = await this.sincronizaProyecto.enviarProyectoFoto(visita.fotos, visita.codigo_expediente, atributos, visita.nid_funcion, visita.nid_personal, nombreArchivo).catch(async error => {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(`Error al enviar fotos de visitas. ${error.message} (ID: ${visita.nid_visita})`)
                    return null
                })
                if (!fotosOk) {
                    await this.dataLocalService.guardarVisita(visita, index)
                    await this.uiService.dismissLoading()
                    await this.uiService.alertaInformativa(`Error al enviar los datos.`)
                    return null
                }
                visita.fotos = fotosOk
            }
    
            if (visita.presupuesto.ablEstructura && visita.presupuesto.ablEstructura.length > 0) {
                for (let idxSubppto = 0; idxSubppto < visita.presupuesto.ablEstructura.length; idxSubppto++) {
                    const subPpto = visita.presupuesto.ablEstructura[idxSubppto];
                    if (subPpto.grupoPartida && subPpto.grupoPartida.length > 0) {
                        for (let idxGrupo = 0; idxGrupo < subPpto.grupoPartida.length; idxGrupo++) {
                            const grupo = subPpto.grupoPartida[idxGrupo];
                            if (grupo.visitaFoto && grupo.visitaFoto.length > 0) {
                                for (let idxVisitaFoto = 0; idxVisitaFoto < grupo.visitaFoto.length; idxVisitaFoto++) {
                                    const visitaFoto = grupo.visitaFoto[idxVisitaFoto];
                                    visitaFoto.nid_visita = visita.nid_visita
                                    if (visitaFoto.eliminada) {
                                        const respElimina = await this.sgpService.eliminarVisitaFoto(visitaFoto).catch(async error => {
                                            await this.uiService.dismissLoading()
                                            this.uiService.alertaInformativa(`Error al enviar la foto de la visita. ${error.message}`)
                                            return null
                                        })
                                        console.log('respElimina :>> ', respElimina);
                                    } else {
                                        const respFoto = await this.sgpService.guardarVisitaFoto(visitaFoto).catch(async error => {
                                            await this.uiService.dismissLoading()
                                            this.uiService.alertaInformativa(`Error al enviar la foto de la visita. ${error.message}`)
                                            return null
                                        })
                                        console.log('respFoto enviarVisita:>> ', respFoto);
                                        if (!respFoto || respFoto.status !== 0 || !respFoto.result || parseInt(respFoto.result) < 1) {
                                            await this.uiService.dismissLoading()
                                            this.uiService.alertaInformativa(respFoto.message)
                                            return null
                                        }
                                        if (!visitaFoto.nid_fotografia) {visitaFoto.nid_fotografia = respFoto.result}
                                        if (visitaFoto.fotos && visitaFoto.fotos.length > 0) {
                                            const atributos = `${visitaFoto.cod_rubro}|${visitaFoto.cod_presupuesto}|${visitaFoto.nid_grupo}|${visitaFoto.nid_visita}|${visitaFoto.nid_fotografia}`
                                            console.log('atributos 1:>> ', atributos);
                                            const nombreArchivo = `VISITA_ID${visitaFoto.cod_zonal}${visitaFoto.cod_anho}${visitaFoto.cod_proyecto}_${visitaFoto.nid_visita}-${visitaFoto.nid_fotografia}`
                                            console.log('nombreArchivo 1:>> ', nombreArchivo);
                                            const fotosOk = await this.sincronizaProyecto.enviarProyectoFoto(visitaFoto.fotos, visita.codigo_expediente, atributos, visita.nid_funcion, visita.nid_personal, nombreArchivo).catch(async error => {
                                                await this.uiService.dismissLoading()
                                                this.uiService.alertaInformativa(`Error al enviar fotos de visitas. ${error.message} (ID: ${visita.nid_visita})`)
                                                return null
                                            })
                                            if (!fotosOk) {
                                                await this.dataLocalService.guardarVisita(visita, index)
                                                await this.uiService.dismissLoading()
                                                await this.uiService.alertaInformativa(`Error al enviar los datos.`)
                                                return null
                                            }
                                            if (fotosOk && fotosOk[0].nid_archivo && fotosOk[0].nid_archivo > 0) {
    
                                            }
                                            visitaFoto.fotos = fotosOk
                                            visitaFoto.nid_archivo = fotosOk[0].nid_archivo
                                            const respFotoActual = await this.sgpService.guardarVisitaFoto(visitaFoto).catch(async error => {
                                                await this.uiService.dismissLoading()
                                                this.uiService.alertaInformativa(`Error al enviar la foto de la visita. ${error.message}`)
                                                return null
                                            })
                                        }
                                    }
                                    

                                    grupo.visitaFoto[idxVisitaFoto] = visitaFoto
                                }
                            }

                            if (grupo.observacionFoto && grupo.observacionFoto.length > 0) {
                                for (let idxObserFoto = 0; idxObserFoto < grupo.observacionFoto.length; idxObserFoto++) {
                                    const observacionFoto = grupo.observacionFoto[idxObserFoto];
                                    observacionFoto.nid_visita = visita.nid_visita
                                    const respFoto = await this.sgpService.guardarVisitaFoto(observacionFoto).catch(async error => {
                                        await this.uiService.dismissLoading()
                                        this.uiService.alertaInformativa(`Error al enviar la foto de la observación. ${error.message}`)
                                        return null
                                    })
                                    console.log('respFoto enviarVisita:>> ', respFoto);
                                    if (!respFoto || respFoto.status !== 0 || !respFoto.result || parseInt(respFoto.result) < 1) {
                                        await this.uiService.dismissLoading()
                                        this.uiService.alertaInformativa(respFoto.message)
                                        return null
                                    }
                                    if (!observacionFoto.nid_fotografia) {observacionFoto.nid_fotografia = respFoto.result}
                                    if (observacionFoto.fotos && observacionFoto.fotos.length > 0) {
                                        const atributos = `${observacionFoto.cod_rubro}|${observacionFoto.cod_presupuesto}|${observacionFoto.nid_grupo}|${observacionFoto.nid_visita}|${observacionFoto.nid_fotografia}`
                                        console.log('atributos 2:>> ', atributos);
                                        const nombreArchivo = `VISITA_ID${observacionFoto.cod_zonal}${observacionFoto.cod_anho}${observacionFoto.cod_proyecto}_${atributos}`
                                        console.log('nombreArchivo 2:>> ', nombreArchivo);
                                        const fotosOk = await this.sincronizaProyecto.enviarProyectoFoto(observacionFoto.fotos, visita.codigo_expediente, atributos, visita.nid_funcion, visita.nid_personal, nombreArchivo).catch(async error => {
                                            await this.uiService.dismissLoading()
                                            this.uiService.alertaInformativa(`Error al enviar fotos de observaciones. ${error.message} (ID: ${visita.nid_visita})`)
                                            return null
                                        })
                                        if (!fotosOk) {
                                            await this.dataLocalService.guardarVisita(visita, index)
                                            await this.uiService.dismissLoading()
                                            await this.uiService.alertaInformativa(`Error al enviar los datos.`)
                                            return null
                                        }
                                        if (fotosOk && fotosOk[0].nid_archivo && fotosOk[0].nid_archivo > 0) {

                                        }
                                        observacionFoto.fotos = fotosOk
                                        observacionFoto.nid_archivo = fotosOk[0].nid_archivo
                                        const respFotoActual = await this.sgpService.guardarVisitaFoto(observacionFoto).catch(async error => {
                                            await this.uiService.dismissLoading()
                                            this.uiService.alertaInformativa(`Error al enviar la foto de la observación. ${error.message}`)
                                            return null
                                        })
                                    }

                                    grupo.observacionFoto[idxObserFoto] = observacionFoto
                                }
                            }
                            subPpto.grupoPartida[idxGrupo] = grupo
                        }
                    }
                    visita.presupuesto.ablEstructura[idxSubppto] = subPpto
                }
            }

        }
        visita.cambio = false
        await this.dataLocalService.guardarVisita(visita, index)
        return visita
    }

    async visita(visita: Visita, index: number, sincNotif?: boolean) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}
        await this.uiService.dismissLoading()
        await this.uiService.presentLoading(`Sincronizando... Por favor espere...`)
        // if (sincNotif) {this.notificacionesNuevas()}

        if (visita.cambio) {
            visita = await this.enviarVisita(visita, index)
            if (!visita) {return null}
        }

        if (visita.nid_visita && !visita.cambio) {
            visita = await this.sgpService.obtenerVisita(visita.codigo_expediente, visita.nid_visita)
            if (visita) {
                await this.dataLocalService.guardarVisita(visita, index)
            }
        }
        await this.sgpService.obtenerProyectoDatosBase(visita.codigo_expediente, visita.nid_funcion, visita.nid_personal)
        await this.uiService.dismissLoading()
        return visita
    }

    async visitasEnvioRecepcion(codigoProyecto: string, nidFuncion: number, nidPersonal: number, envia?: boolean) {
        if (envia) {
            const listaVisitas = await this.dataLocalService.leerVisitasProyecto(codigoProyecto)
            for (let index = 0; index < listaVisitas.length; index++) {
                if (listaVisitas[index].cambio) {
                    const respEnvio = await this.enviarVisita(listaVisitas[index], index)
                    if (!respEnvio) {return false}
                } 
            }
        }
        await this.sgpService.obtenerVisitas(codigoProyecto, nidFuncion, nidPersonal)
        return true

    }
}