import { Injectable } from '@angular/core'
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Geolocation } from '@capacitor/geolocation'
import { Archivo } from '../model/generales'

declare var window: any

@Injectable({
  providedIn: 'root'
})
export class PhotoService {

    constructor() { }

    async tomarFoto(archivo: Archivo) {
        try {
            const image = await Camera.getPhoto({
                quality: 100,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                saveToGallery: true,
                width: 800,
                height: 800,
                source: CameraSource.Camera
            }).catch(error => {console.log('Error al tomar la foto: ', error)})
            
            if (image) {
                const savedImageFile = await this.savePicture(image);
                archivo.urlArchivoFile = savedImageFile.filepath
                archivo.urlArchivoHttp = savedImageFile.webviewPath
                archivo.fec_archivo = new Date()
                archivo.nueva = true
                
                if (archivo.flg_georeferencia) {
                    const coordinates = await Geolocation.getCurrentPosition({enableHighAccuracy: true}).catch(error =>{console.log('Erron en la geolocalizacion :>> ', error)})
                    if (coordinates) {
                        archivo.num_latitud = coordinates.coords.latitude
                        archivo.num_longitud = coordinates.coords.longitude
                    }
                }
            }
            return archivo
        } catch(error) {
            console.log('error :>> ', error);
        }  
        return archivo
    }

    async cargarFoto(archivo: Archivo) {
        const image = await Camera.getPhoto({
            quality: 100,
            allowEditing: false,
            resultType: CameraResultType.Uri,
            saveToGallery: false,
            width: 800,
            height: 800,
            source: CameraSource.Photos
        })
        if (image) {
            const savedImageFile = await this.savePicture(image);
            archivo.urlArchivoFile = savedImageFile.filepath
            archivo.urlArchivoHttp = savedImageFile.webviewPath
            archivo.fec_archivo = new Date()
            archivo.nueva = true
        }
        return archivo
    }


    private async savePicture(photo: Photo) {
        // Convert photo to base64 format, required by Filesystem API to save
        const base64Data = await this.readAsBase64(photo);
      
        // Write the file to the data directory
        const fileName = Date.now() + '.jpeg';
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data
        })
        return {
            filepath: savedFile.uri,
            webviewPath: window.Ionic.WebView.convertFileSrc(savedFile.uri)
        }
    }

    private async readAsBase64(photo: Photo) {
        // Fetch the photo, read as a blob, then convert to base64 format
        const response = await fetch(photo.webPath!)
        const blob = await response.blob()
      
        return await this.convertBlobToBase64(blob) as string;
    }
      
    private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onerror = reject
        reader.onload = () => {
            resolve(reader.result)
        }
        reader.readAsDataURL(blob)
    })

    async descargarFoto(url: string) {
        try {
            const fileName = Date.now() + '.jpeg'
            const foto = await Filesystem.downloadFile({url,path: fileName,directory: Directory.Data})
            console.log('foto descargarFoto:>> ', foto);
            if (foto) {
                await Filesystem.copy({from: fileName, to: fileName, directory: Directory.Data, toDirectory: Directory.Documents})
                // Convert photo to base64 format, required by Filesystem API to save
                // const base64Data = await this.readAsBase64(foto.blob);
            
                // Write the file to the data directory
                // const fileName = Date.now() + '.jpeg';
                // const savedFile = await Filesystem.writeFile({
                //     path: fileName,
                //     data: foto.path,
                //     directory: Directory.Data
                // })

                return {
                    filepath: foto.path,
                    webviewPath: window.Ionic.WebView.convertFileSrc(foto.path)
                }
            }
        } catch (error) {
            console.error('error :>> ', error);
        }
    }
}


