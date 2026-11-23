import { EventEmitter, Injectable } from '@angular/core';
import { SgpService } from '../sgp.service';
import { DataLocalService } from '../data-local.service';
import { UtilService } from '../util.service';
import { UiServiceService } from '../ui-service.service';
import { EntregaInsumo, TecnologiaColectiva, TecnologiaColectivaDetalle } from '../../model/proyectos';
import { SincronizaProyectoService } from './sincroniza-proyecto.service';

@Injectable({
    providedIn: 'root'
})
export class SincronizaTecColectivaService {
    // usuarioEnvio: Usuario
    // mensajeListener = new EventEmitter<string>()
    // planActividadesListener = new EventEmitter<PlanActividad[]>()
    // accionesListener = new EventEmitter<PlanActividad[]>()
    
    constructor(private sgpService: SgpService,
        private dataLocalService: DataLocalService,
        private sincronizaProyecto: SincronizaProyectoService,
        private utilService: UtilService,
        private uiService: UiServiceService,
        
    ) { }
    
        // async enviarTecPartidaDetalle(tecnologia: TecnologiaColectiva, index: number, detalle: TecnologiaColectivaDetalle, idx: number) {


    async detalle(indexTec: number, detalle: TecnologiaColectivaDetalle, indexDetalle: number, sincNotif?: boolean) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}
        await this.uiService.dismissLoading()
        await this.uiService.presentLoading(`Sincronizando... Por favor espere...`)
        // if (sincNotif) {this.notificacionesNuevas()}
        console.log('inicia sincronización detalle');

        if (detalle.avanceIncompleto || detalle.entregaInsumosIncompleto) {
            await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa(`El ${detalle.avance.flg_informacion_contraste ? 'seguimiento' : 'avance'} tiene datos incompletos.`)
            return null
        }

        if (detalle.cambio || detalle.cambioAvance || detalle.flg_cambio_yachachiq) {
            detalle = await this.enviarDetalle(indexTec, detalle, indexDetalle)
            if (!detalle) {return null}
        }

        if (detalle.nid_detalle && !detalle.cambio) {
            console.log('Envío correcto!!! detalle.nid_detalle :>> ', detalle.nid_detalle);
            detalle = await this.sgpService.obtenerTecColectivaDetalle(detalle.codigo_expediente, detalle.nid_detalle)
            if (detalle) {
                await this.dataLocalService.guardarTecnologiaColectivaDetalle(indexTec, detalle, indexDetalle)
            }
        }

        await this.uiService.dismissLoading()
        return detalle
    }

    async enviarDetalle(indexTec: number, detalle: TecnologiaColectivaDetalle, indexDetalle: number) {
        console.log('llega a enviar detalle');
        if (detalle.cambio) {
            const resp = await this.sgpService.guardarTecColectivaDetalle(detalle).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar la tecnología partida detalle. ${error.message}`)
                return null
            })
            console.log('resp :>> ', resp);
            if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(resp.message)
                return null
            }
            if (!detalle.nid_detalle) {detalle.nid_detalle = resp.result}
            detalle.cambio = false
        }

        if (detalle.nid_detalle && detalle.avance && detalle.cambioAvance) {
            console.log('detalle.avance :>> ', detalle.avance);
            detalle.avance.nid_detalle = detalle.nid_detalle
            const respAvance = await this.sgpService.guardarTecColectivaAvance(detalle.avance).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al enviar la tecnología partida avance. ${error.message}`)
                return null
            })
            console.log('respAvance :>> ', respAvance);
            if (!respAvance) {return null}
            detalle.avance.nid_avance = respAvance.result

            if (detalle.avance.avanceProd) {
                for (let idx = 0; idx < detalle.avance.avanceProd.length; idx++) {
                    if (detalle.avance.avanceProd[idx]) {
                        detalle.avance.avanceProd[idx].codigo_expediente = detalle.codigo_expediente
                        detalle.avance.avanceProd[idx].nid_detalle = detalle.nid_detalle
                        detalle.avance.avanceProd[idx].nid_avance = respAvance.result
                        const respAvanceProd = await this.sgpService.guardarTecnologiaAvanceProd(detalle.avance.avanceProd[idx]).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al enviar los datos de la producción. ${error.message}`)
                            return null
                        })
                        if (!respAvanceProd) {return null}
                        detalle.avance.avanceProd[idx].nid_avance_prod = respAvanceProd.result
                    }
                }
            }

            if (detalle.avance.fotos) {
                const atributos = `tc|${detalle.nid_detalle}|${detalle.avance.nid_avance}`
                const nombreArchivo = `tc-${detalle.codigo_expediente}-${detalle.nid_detalle}-${detalle.avance.nid_avance}`
                const fotosOk = await this.sincronizaProyecto.enviarProyectoFoto(detalle.avance.fotos, detalle.codigo_expediente, atributos, detalle.avance.nid_funcion, detalle.avance.nid_personal, nombreArchivo).catch(async error => {
                    await this.uiService.dismissLoading()
                    this.uiService.alertaInformativa(`Error al enviar fotos del avance. ${error.message})`)
                    return null
                })
                if (!fotosOk) {null}
                detalle.avance.fotos = fotosOk
            }
            detalle.cambioAvance = false
        }

        console.log('detalle.nid_detalle, detalle.flg_cambio_yachachiq :>> ', detalle.nid_detalle, detalle.flg_cambio_yachachiq);
        if (detalle.nid_detalle && detalle.flg_cambio_yachachiq) {
            console.log('entra a sincronizar yachachiq :>> 00000000000');
            const respYachachiq = await this.sgpService.enviarAsignacionTecDetalleYachachiq(detalle.codigo_expediente, detalle.nid_detalle, detalle.nidYachachiq, detalle.fecYachachiq, detalle.fecFinYachachiq).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error al guardar la asignación del Yachachiq. ${error.message})`)
                return null
            })
        }
        
        if (detalle.nid_detalle && detalle.cambioEntregaInsumos) {
            console.log('sincroniza entrega activos - detalle.cambioEntregaInsumos :>> ', detalle.cambioEntregaInsumos);
            for (let index = 0; index < detalle.entregaInsumos.length; index++) {
                const element = detalle.entregaInsumos[index];
                if (detalle.entregaInsumos[index].est_entrega === 'R') {
                    const resp = await this.sgpService.guardarEntregaActivo(detalle.entregaInsumos[index]).catch(async error => {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar la entrega de activos de la tecnología colectiva. ${error.message}`)
                        return null
                    })
                    console.log('resp :>> ', resp);
                    if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(resp.message)
                        return null
                    }
                    if (!detalle.entregaInsumos[index].nid_entrega) {detalle.entregaInsumos[index].nid_entrega = resp.result}
                    
                    if (detalle.entregaInsumos[index].nid_entrega && detalle.entregaInsumos[index].insumos) {
                        for (let idx = 0; idx < detalle.entregaInsumos[index].insumos.length; idx++) {
                            if (detalle.entregaInsumos[index].insumos[idx]) {
                                detalle.entregaInsumos[index].insumos[idx].nid_entrega = resp.result
                                const respInsumo = await this.sgpService.guardarEntregaInsumo(detalle.entregaInsumos[index].insumos[idx]).catch(async error => {
                                    await this.uiService.dismissLoading()
                                    this.uiService.alertaInformativa(`Error al enviar la entrega de insumos. ${error.message}`)
                                    return null
                                })
                                if (!respInsumo) {
                                    return null
                                }
                                detalle.entregaInsumos[index].insumos[idx].nid_insumo = respInsumo.result
                            }
                        }
                        
                        if (detalle.entregaInsumos[index].firmas) {
                            const atributos = detalle.entregaInsumos[index].nid_entrega.toString()
                            const firmasOk = await this.sincronizaProyecto.enviarProyectoFoto(detalle.entregaInsumos[index].firmas, detalle.entregaInsumos[index].codigo_expediente, atributos, null, null, `firma_entrega_${detalle.entregaInsumos[index].codigo_expediente}_${detalle.entregaInsumos[index].nid_entrega}`).catch(async error => {
                                await this.uiService.dismissLoading()
                                this.uiService.alertaInformativa(`Error al enviar la firma. ${error.message}`)
                                return null
                            })
                            if (!firmasOk) {
                                return null
                            }
                            detalle.entregaInsumos[index].firmas = firmasOk
                        }
                    }
                }
                
            }
    
        }
        await this.dataLocalService.guardarTecnologiaColectivaDetalle(indexTec, detalle, indexDetalle)
        return detalle
    }

    // async lista(codidgoProyecto: string, envia: boolean) {
    //     if (envia) {

    //     }
    //     await this.sgpService.obtenerTecnologiaColectivaList(codidgoProyecto)
    //     return true
    // }

    async enviarLista(codigoProyecto: string) {
        const listaTecPartida = await this.dataLocalService.leerTecnologiaColectiva(codigoProyecto)
        let existeIncompletos = false
        for (let index = 0; index < listaTecPartida.length; index++) {
            for (let idx = 0; idx < listaTecPartida[index].detalle?.length; idx++) {
                if (listaTecPartida[index].detalle[idx].cambio || listaTecPartida[index].detalle[idx].cambioAvance) {
                    if (listaTecPartida[index].detalle[idx].avanceIncompleto) {
                        existeIncompletos = true
                    } else {
                        const resp = await this.enviarDetalle(index, listaTecPartida[index].detalle[idx], idx)
                        if (!resp) {return false}
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

    // async entregaInsumos(tecnologia: TecnologiaColectiva, index: number, sincNotif?: boolean) {
    //     const ok = await this.utilService.evaluarConexion()
    //     if (!ok) { return null}
    //     await this.uiService.dismissLoading()
    //     await this.uiService.presentLoading(`Sincronizando... Por favor espere...`)
    //     // if (sincNotif) {this.notificacionesNuevas()}
    //     console.log('inicia sincronización detalle');

    //     // if (detalle.avanceIncompleto) {
    //     //     await this.uiService.dismissLoading()
    //     //     await this.uiService.alertaInformativa(`El ${detalle.avance.flg_informacion_contraste ? 'seguimiento' : 'avance'} tiene datos incompletos.`)
    //     //     return null
    //     // }

    //     let entrega: EntregaInsumo
    //     if (tecnologia.entregaInsumos && tecnologia.cambioEntregaInsumos) {
    //         entrega = await this.enviarEntregaInsumos(tecnologia, index)
    //         if (!entrega) {return null}
    //     }

    //     console.log('entrega 11111111:>> ', entrega);

    //     if (entrega.nid_entrega) {
    //         entrega = await this.sgpService.obtenerEntregaInsumo(entrega.codigo_expediente, entrega.cod_partida)
    //         console.log('entrega 1212121212 :>> ', entrega);
    //         if (entrega) {
    //             tecnologia.entregaInsumos = entrega
    //             tecnologia.cambioEntregaInsumos = false
    //             await this.dataLocalService.guardarTecnologiaColectiva(tecnologia, index)
    //         }
    //     }

    //     console.log('tecnologia 2222222222222 :>> ', tecnologia);

    //     await this.uiService.dismissLoading()
    //     return tecnologia.entregaInsumos
    // }

    // async enviarEntregaInsumos(tecnologia: TecnologiaColectiva, index: number) {
    //     console.log('llega a enviar detalle');
    //     const resp = await this.sgpService.guardarEntregaActivo(tecnologia.entregaInsumos).catch(async error => {
    //         await this.uiService.dismissLoading()
    //         this.uiService.alertaInformativa(`Error al enviar la entrega de activos de la tecnología colectiva. ${error.message}`)
    //         return null
    //     })
    //     console.log('resp :>> ', resp);
    //     if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
    //         await this.uiService.dismissLoading()
    //         this.uiService.alertaInformativa(resp.message)
    //         return null
    //     }
    //     if (!tecnologia.entregaInsumos.nid_entrega) {tecnologia.entregaInsumos.nid_entrega = resp.result}
    //     console.log('tecnologia 55555555:>> ', tecnologia);
        
    //     if (tecnologia.entregaInsumos.nid_entrega && tecnologia.entregaInsumos.insumos) {
    //         for (let idx = 0; idx < tecnologia.entregaInsumos.insumos.length; idx++) {
    //             if (tecnologia.entregaInsumos.insumos[idx]) {
    //                 tecnologia.entregaInsumos.insumos[idx].nid_entrega = resp.result
    //                 const respInsumo = await this.sgpService.guardarEntregaInsumo(tecnologia.entregaInsumos.insumos[idx]).catch(async error => {
    //                     await this.uiService.dismissLoading()
    //                     this.uiService.alertaInformativa(`Error al enviar la entrega de insumos. ${error.message}`)
    //                     return null
    //                 })
    //                 if (!respInsumo) {
    //                     return null
    //                 }
    //                 tecnologia.entregaInsumos.insumos[idx].nid_insumo = respInsumo.result
    //             }
    //         }
            
    //         console.log('tecnologia  66666666666666:>> ', tecnologia);
    //         if (tecnologia.entregaInsumos.firmas) {
    //             const atributos = tecnologia.entregaInsumos.nid_entrega.toString()
    //             const firmasOk = await this.sincronizaProyecto.enviarProyectoFoto(tecnologia.entregaInsumos.firmas, tecnologia.entregaInsumos.codigo_expediente, atributos, null, null, `firma_entrega_${tecnologia.entregaInsumos.codigo_expediente}_${tecnologia.entregaInsumos.nid_entrega}`).catch(async error => {
    //                 await this.uiService.dismissLoading()
    //                 this.uiService.alertaInformativa(`Error al enviar la firma. ${error.message}`)
    //                 return null
    //             })
    //             if (!firmasOk) {
    //                 return null
    //             }
    //             tecnologia.entregaInsumos.firmas = firmasOk
    //         }
    //     }
        
    //     await this.dataLocalService.guardarTecnologiaColectiva(tecnologia, index)
    //     console.log('tecnologia  77777777777: >> ', tecnologia );
    //     return tecnologia.entregaInsumos
    // }
}
