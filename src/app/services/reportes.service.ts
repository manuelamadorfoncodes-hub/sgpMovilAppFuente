import { EriParametro } from './../model/eri';
import { Injectable } from '@angular/core';
import { Reporte } from '../model/generales';
import { SgpService } from './sgp.service';
import { StorageService } from './storage.service';
import { UtilService } from './util.service';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

    constructor(private sgpService: SgpService,
        private storage: StorageService,
        private utilService: UtilService) { }


    async obtenerReportes() {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}
        const parametros = {
            nid_tabla: 77,
            grupo: 'YAQ, MOVIL'
        }
        console.log('parametros :>> ', parametros);
        return new Promise<Reporte[]>( resolve => {
            this.sgpService.postReporte(`/parametro/listar`, parametros).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const reporte: Reporte[] = resp.result
                await this.storage.set(`reportes`, reporte)
                resolve(reporte)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    async obtenerDataReportes(parametros) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}
        console.log('parametros :>> ', parametros);
        return new Promise<any>( resolve => {
            this.sgpService.postReporte(`/reporte/yachachiq/listar`, parametros).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                console.log('resp :>> ', resp);
                const reporte = resp.result
                console.log('reporte :>> ', reporte);
                resolve(reporte)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    async enviarReporte(parametros) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}
        const body = {
            parametros: JSON.stringify(parametros)
        }
        return new Promise<any>( resolve => {
            this.sgpService.post(`/reporte/enviarReporte`, body).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

}
