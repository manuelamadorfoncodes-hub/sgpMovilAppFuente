import { EventEmitter, Injectable } from '@angular/core';
import { SgpService } from '../sgp.service';
import { DataLocalService } from '../data-local.service';
import { UiServiceService } from '../ui-service.service';
import { UtilService } from '../util.service';
import { Archivo } from '../../model/generales';

@Injectable({
    providedIn: 'root'
})
export class SincronizaProyectoService {
    mensajeListener = new EventEmitter<string>()
    
    constructor(private sgpService: SgpService,
        private dataLocalService: DataLocalService,
        private utilService: UtilService,
        private uiService: UiServiceService) { }

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

        for (let index = 0; index < fotos.length; index++) {
            if (fotos[index] && fotos[index].nueva) {
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

}
