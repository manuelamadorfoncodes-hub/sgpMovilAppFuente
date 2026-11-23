import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
// import { FileTransfer, FileUploadOptions, FileTransferObject } from '@ionic-native/file-transfer/ngx';
import { SeguridadService } from './seguridad.service';
import { Archivo } from '../model/generales';


@Injectable({ providedIn: 'root' })
export class ApiService {
    public _baseUri: string;

    constructor(private http: HttpClient,
        private seguridadService: SeguridadService,
        // private fileTransfer: FileTransfer
        ) { }

    getHeaders() {
        // const headers = new HttpHeaders({
        //     'Authorization': 'bearer ' + this.seguridadService.token
        // });

        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'application/json');

        return headers;
    }

    getHeadersFormData() {

        let headers = new HttpHeaders();
        headers = headers.set('Content-Type', 'multipart/form-data');
        // headers = headers.set('Content-Type', 'application/json');

        return headers;
    }

    getHeadersFile() {
        const headers = {
            'authorization': 'Bearer ' + this.seguridadService.token
            // 'enctype': 'multipart/form-data;'
        }
        return headers;
    }

    setUrlPathApi(baseUri: string): void {
        this._baseUri = environment.urlSgpMovil + baseUri;
    }

    setUrlPathApiCorreo(baseUri: string): void {
        this._baseUri = environment.urlCorreo + baseUri;
    }

    setUrlPathApiArchivo(baseUri: string): void {
        this._baseUri = environment.urlArchivos + baseUri;
    }

    setUrlPathApiReporte(baseUri: string): void {
        this._baseUri = environment.urlReportes + baseUri;
    }

    setUrlPathApiBase(baseUri: string): void {
        this._baseUri = environment.urlBase + baseUri;
    }

    execPostJson(data?: any): any {
        console.log(this._baseUri);
        return this.http.post(this._baseUri, data, { headers: this.getHeaders() });
    }

    execGetJson(data?: any): any {
        console.log(this._baseUri);
        return this.http.get(this._baseUri, { params: data, headers: this.getHeaders() });
    }

    execPutJson(data?: any): any {
        return this.http.put(this._baseUri, data, { headers: this.getHeaders() });
    }

    // execPostFile(data: any): any {
    //     // return this.http.post(this._baseUri, data, { headers: this.getHeadersFormData() })
    //     return this.http.post(this._baseUri, data, { headers: this.getHeadersFormData() })
    // }

    async execPostFile(archivo: Archivo, nombreArchivo: string) {
        try {
            const response = await fetch(archivo.urlArchivoHttp)
            const blob = await response.blob()
    
            const formData = new FormData()
            formData.append('doc_archivo', blob, nombreArchivo)
            formData.append('nid_modulo', environment.nidModulo.toString(),)
            formData.append('cod_sitio', environment.site)
            formData.append('flg_confidencial', '0')
    
            return new Promise<any>( resolve => {
                this.setUrlPathApiArchivo(`/archivo/guardar`)
                const upload$ = this.http.post(this._baseUri, formData)
                upload$.subscribe({
                    next: (resp) => {
                        resolve(resp)
                    },
                    error: (error: any) => {
                        console.error(error)
                        if (error.body) {return JSON.parse(error.body)} else {return null}
                    }
                })
            })      
        } catch(error) {
            console.log('Error al tomar la foto :>> ', error);
        }
    }

// Convert the base64 to blob data
// and create  formData with it
// async startUpload(file: LocalFile) {
//     const response = await fetch(file.data);
//     const blob = await response.blob();
//     const formData = new FormData();
//     formData.append('file', blob, file.name);
//     this.uploadData(formData);
// }

    // uploadFile(options: any, archivo: Archivo) {
        // const fileTransfer: FileTransferObject = this.fileTransfer.create();
        // const transferOptions: FileUploadOptions = options

        // console.log('transferOptions :>> ', transferOptions);
        // transferOptions.headers = {
        //     'Authorization': `${environment.tokenWord} ${this.seguridadService.token}`
        // }

        // return fileTransfer.upload(archivo.urlArchivoFile, this._baseUri, transferOptions)
        //     .then((data) => {
        //         return JSON.parse(data.response)
        //     }, (err) => {
        //         console.error(err);
        //         if (err.body) {return JSON.parse(err.body)} else {return null}
        //     })
        // return null // OJO esto no estaba, añadido cuando se comentó lo de arriba
    // }

    // downloadFile(rutaArchivo: string) {
        // const fileTransfer: FileTransferObject = this.fileTransfer.create();
        // const transferOptions: FileUploadOptions = {}

        // transferOptions.headers = {
        //     'Authorization': `${environment.tokenWord} ${this.seguridadService.token}`
        // }

        // return fileTransfer.download(this._baseUri, rutaArchivo, true, transferOptions)
        //     .then((data) => {
        //         return data
        //     }, (err) => {
        //         console.error(err);
        //         if (err.body) {return JSON.parse(err.body)} else {return null}
        //     })

    // }

}
