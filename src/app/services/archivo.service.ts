import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Filesystem, Directory } from '@capacitor/filesystem'
import { environment } from '../../environments/environment'
import { UtilService } from './util.service';
import { Reporte } from '../model/generales';

declare var window: any

@Injectable({
    providedIn: 'root'
})
export class ArchivoService {

    constructor(private http: HttpClient,
        private utilService: UtilService) { }

    borrarArchivos() {
        // console.log(this.platform.platforms())
        // if (this.platform.is('cordova')) {
        //     this.file.listDir(this.file.dataDirectory, '').then(archivos => {
        //         console.log('archivos :>> ', archivos.length);
        //         for (let index = 0; index < archivos.length; index++) {
        //             if (archivos[index].isFile) {
        //                 this.file.removeFile(this.file.dataDirectory, archivos[index].name).then(res => {
        //                     console.log('res borrado:>> ', res);
        //                 })
        //             }
        //         }
        //     })
        // }
    }

    // async obtenerLinkFoto(nidArchivo: number) {
    //     const ok = await this.utilService.evaluarConexion()
    //     console.log(ok);
    //     if (!ok) { return }
    //     const resp: any = await this.sgpService.obtenerLinkFoto(nidArchivo)
    //     return resp
    // }


    async descargarReporte(guardar: boolean, reporte: Reporte, codigoProyecto: string, nidAgente: number, periodo: string, partida?: string) {
        const ok = await this.utilService.evaluarConexion()
        if (!ok) { return null}

        try {
            // const response = await fetch(archivo.urlArchivoHttp)
            // const blob = await response.blob()
    
            // const formData = new FormData()
            // formData.append('doc_archivo', blob, nombreArchivo)
            // formData.append('nid_modulo', environment.nidModulo.toString(),)
            // formData.append('cod_sitio', environment.site)
            // formData.append('flg_confidencial', '0')
    
            const body = {
                cod_reporte: reporte.cod_parametro,
                cod_zonal: codigoProyecto.substring(0,2),
                cod_anho: codigoProyecto.substring(2,6),
                cod_proyecto: codigoProyecto.substring(6,10),   
                nid_agente: nidAgente,
                cod_periodo: periodo,
                cod_partida: partida
            }
            console.log('body :>> ', body);
            return new Promise<any>( resolve => {
                let url = `${environment.urlBase}/${reporte.txt_metadato.replace('-','pdf')}`
                if (environment.urlBase === 'http://devapi.foncodes.gob.pe') {url = url.replace('/apisgpConsulta', ':3105')} // OJO para usar http en dev

                const upload$ = this.http.post<Blob>(url, body, {
                    responseType: 'blob' as 'json'
                })
                console.log('url descargarReporte :>> ', url);
                upload$.subscribe({
                    next: async (resp) => {
                        console.log('resp :>> ', resp);

                        const archivo = await this.convertBlobToBase64(resp) as string;
                        const fileName1 = `Reporte.pdf`
                        const fileName2 = `Reporte_${reporte.cod_parametro}_${codigoProyecto}_${nidAgente}_${periodo}.pdf`
                        const savedFile = await Filesystem.writeFile({
                            path: guardar ? fileName2 : fileName1,
                            data: archivo,
                            directory: guardar ? Directory.Documents : Directory.Cache
                        })
                        console.log('savedFile :>> ', savedFile);
                        // const res = {
                        //     filepath: savedFile.uri,
                        //     webviewPath: window.Ionic.WebView.convertFileSrc(savedFile.uri)
                        // }
                        // console.log('res :>> ', res);
                        const url = window.Ionic.WebView.convertFileSrc(savedFile.uri)
                        resolve(url)
                    },
                    error: (error: any) => {
                        console.error(error)
                        // if (error.body) {return JSON.parse(error.body)} else {return null}
                    }
                })
            })      
        } catch(error) {
            console.log('Error al tomar la foto :>> ', error);
        }
    }

    private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => {
            resolve(reader.result)
        }
        reader.readAsDataURL(blob)
    })

    // Download Blob file using httpClient
    // async downloadAsFile(reporte: Reporte): Promise<Blob> {
    //     const body = {
    //         cod_reporte: '44',
    //         cod_zonal: '19',
    //         cod_anho: '2021',
    //         cod_proyecto: '0001',   
    //         nid_agente: 29988,
    //         cod_periodo: '202301',
    //         cod_partida: 'P14515.12'
    //     }
    //     const url = 'https://server_endpoint';
    //     const file = await this.http
    //     .post<Blob>(url, body, {
    //         responseType: 'blob' as 'json'
    //     })
    //     .toPromise();
    //     file
    //     return file;
    // }

    async guardarImagenDataUrl (imagen: any) {
        // recibe una imagen como data URL
                // Convert photo to base64 format, required by Filesystem API to save
                // const base64Data = await this.readAsBase64(photo);
      
                // Write the file to the data directory
                const fileName = Date.now() + '.jpeg';
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: imagen,
                    directory: Directory.Data
                })
                return {
                    filepath: savedFile.uri,
                    webviewPath: window.Ionic.WebView.convertFileSrc(savedFile.uri)
                }

    }
}
