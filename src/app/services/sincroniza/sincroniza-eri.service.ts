import { Injectable } from '@angular/core';
import { SgpService } from '../sgp.service';
import { DataLocalService } from '../data-local.service';
import { UtilService } from '../util.service';
import { UiServiceService } from '../ui-service.service';
import { SincronizaProyectoService } from './sincroniza-proyecto.service';
import { Eri } from '../../model/eri';

@Injectable({
    providedIn: 'root'
})
export class SincronizaEriService {

    constructor(private sgpService: SgpService,
        private dataLocalService: DataLocalService,
        private sincronizaProyecto: SincronizaProyectoService,
        private utilService: UtilService,
        private uiService: UiServiceService,
        
    ) { }

    async eri(eri: Eri, sincNotif?: boolean) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}
        await this.uiService.dismissLoading()
        await this.uiService.presentLoading(`Sincronizando... Por favor espere...`)
        // if (sincNotif) {this.notificacionesNuevas()}

        if (eri.informeIncompleto) {
            await this.uiService.dismissLoading()
            await this.uiService.alertaInformativa(`El ERI tiene datos incompletos.`)
            return null
        }

        if (eri.cambioInforme) {
            eri = await this.enviarEri(eri)
            if (!eri) {return null}
        }

        const user = await this.dataLocalService.leerUser()
        const funcion = await this.dataLocalService.leerFuncion()

        const id = eri.id
        if (user.perfil.nidperfil === 34) {
            eri = await this.sgpService.obtenerEri(eri.codigo_nec, eri.cod_nri, funcion.nid_funcion, user.nidPersonal).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error obtener la lista de ERIs por agente. ${error.message})`)
                return null
            })
        } else {
            eri = await this.sgpService.obtenerEri(eri.codigo_nec, eri.cod_nri).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error obtener la lista de ERIs. ${error.message})`)
                return null
            })
        }
        console.log('planActividad :>> ', eri);
        if (eri) {
            eri.id = id
            await this.dataLocalService.guardarEri(eri)
        }

        await this.uiService.dismissLoading()
        return eri
    }

    async enviarEri(eri: Eri) {
        if (eri.cambioInforme) {
            for (let index = 0; index < eri.informes.length; index++) {
                if (eri.informes[index].cambio) {
                    console.log('eri.informes[index] :>> ', eri.informes[index]);
                    const resp = await this.sgpService.guardarInformeEri(eri.informes[index]).catch(async error => {
                        console.log('resp guardarInformeEri:>> ', resp);
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(`Error al enviar el informe del ERI. ${error.message}`)
                        return null
                    })
                    
                    console.log('resp guardarInformeEri:>> ', resp);
                    if (!resp || resp.status !== 0 || !resp.result || parseInt(resp.result) < 1) {
                        console.log('entra aquí >> ')
                        await this.uiService.dismissLoading()
                        this.uiService.alertaInformativa(resp.message)
                        return null
                    }
                    if (!eri.informes[index].nid_informe) {eri.informes[index].nid_informe = resp.result}
            
                    if (eri.informes[index] && eri.informes[index].fotos && eri.informes[index].fotos.length > 0) {
                        const atributos = `${eri.codigo_nec}|${eri.cod_nri}|${eri.informes[index].nid_asistente_tecnico}|${eri.informes[index].nid_funcion}|${eri.informes[index].nid_informe}`
                        const nombreArchivo = `ERI_INFORME_${eri.codigo_nec}_${eri.cod_nri}_${eri.informes[index].nid_informe}`
                        const fotosOk = await this.sincronizaProyecto.enviarProyectoFoto(eri.informes[index].fotos, eri.codigo_expediente, atributos, eri.informes[index].nid_funcion, eri.informes[index].nid_asistente_tecnico, nombreArchivo).catch(async error => {
                            await this.uiService.dismissLoading()
                            this.uiService.alertaInformativa(`Error al enviar fotos del informe del ERI. ${error.message} (ID: ${eri.informes[index].nid_informe})`)
                            return null
                        })
                        if (!fotosOk) {
                            await this.dataLocalService.guardarEri(eri)
                            await this.uiService.dismissLoading()
                            await this.uiService.alertaInformativa(`Error al enviar los datos.`)
                            return null
                        }
                        eri.informes[index].fotos = fotosOk
                    }
                    eri.cambioInforme = false
                    await this.dataLocalService.guardarEri(eri)
                }
            }
            
        }
        return eri
    }


    async eriEnvioRecepcion(codigoProyecto: string, nidFuncion: number, nidPersonal: number, nidPerfil: number, envia?: boolean) {
        if (envia) {
            const listaEri = await this.dataLocalService.leerEri(codigoProyecto)

            for (let index = 0; index < listaEri.length; index++) {
                if (listaEri[index].cambioInforme) {
                    if (listaEri[index].informeIncompleto) {
                        await this.uiService.dismissLoading()
                        await this.uiService.alertaInformativa(`Existen ERIs con datos incompletos. Sincronización incompleta.`)
                        return null
                    }
                    const respEnvio = await this.enviarEri(listaEri[index])
                    if (!respEnvio) {return false}
                } 
            }
        }

        if (nidPerfil === 34) {
            await this.sgpService.obtenerEriPorAgente(codigoProyecto, nidFuncion, nidPersonal).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error obtener la lista de ERIs por agente. ${error.message})`)
                return null
            })
        } else {
            await this.sgpService.obtenerEriList(codigoProyecto).catch(async error => {
                await this.uiService.dismissLoading()
                this.uiService.alertaInformativa(`Error obtener la lista de ERIs. ${error.message})`)
                return null
            })
        }

        return true
    }

}