import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { IonModal, PopoverController } from '@ionic/angular';
import { Geolocation } from '@capacitor/geolocation'
import { UiServiceService } from '../../services/ui-service.service';
import { Archivo } from '../../model/generales';
import { PopoverListComponent } from '../generales/popover-list/popover-list.component';
import { SincronizaService } from 'src/app/services/sincroniza/sincroniza.service';
import { PhotoService } from 'src/app/services/photo.service';
import { Browser } from '@capacitor/browser';

@Component({
    selector: 'app-firmar',
    templateUrl: './firmar.component.html',
    styleUrls: ['./firmar.component.scss'],
})
export class FirmarComponent implements OnInit {

    @ViewChild(IonModal) modalFoto: IonModal;
    @ViewChild('canvas', { static: true }) canvasPadElement: ElementRef
    @ViewChild(IonModal) modalFirma: IonModal;
    @Input() firmas: Archivo[] = []
    @Input() consulta = false
    canvasPad: any
    noFoto = '../../assets/imagenes/no-photo-available.png'
    siFoto = '../../assets/imagenes/visto-bueno.png'
    index = -1
    urlFoto = ''
    
    constructor(private uiService: UiServiceService,
        private popoverController: PopoverController,
        private sincronizaService: SincronizaService,
        private photoService: PhotoService
    ) {}

    ngOnInit() {}

    registrarFirma(index) {
        this.index = index
        this.modalFirma.present()
    }

    cancelar() {
        this.modalFirma.dismiss(null, 'cancel');
    }

    async registrar(data) {
        console.log('this.firma :>> ', this.firmas);
        console.log('data :>> ', data);

        await this.uiService.presentLoading('Procesando...')
        if (data && this.index >= 0) {
            const coordinates = await Geolocation.getCurrentPosition().catch(error =>{console.log('Erron en la geolocalizacion :>> ', error)})
            if (coordinates) {
                this.firmas[this.index].num_latitud = coordinates.coords.latitude
                this.firmas[this.index].num_longitud = coordinates.coords.longitude
            }
            this.firmas[this.index].urlArchivoFile = data.urlFile
            this.firmas[this.index].urlArchivoHttp = data.urlHttp
            this.firmas[this.index].fec_archivo = new Date() 
            this.firmas[this.index].nueva = true
        }
        await this.uiService.dismissLoading()
        this.modalFirma.dismiss();
    }
    
    async verFoto(idx: number, ev: any) {
        if (!this.firmas[idx].urlArchivoFile) {
            if (this.firmas[idx].nid_archivo) {
                const popover = await this.popoverController.create({
                    component: PopoverListComponent,
                    cssClass: 'popover-list',
                    event: ev,
                    mode: 'ios',
                    translucent: true,
                    componentProps: {items: [
                        {id: 1, nombre: 'Ver online', visible: true},
                        {id: 2, nombre: 'Descargar', visible: this.consulta}
                    ]}
                });
                await popover.present();
                const {data} = await popover.onDidDismiss()
                if (data && data.id === 1) {
                    const link = await this.sincronizaService.obtenerLinkFoto(this.firmas[idx].nid_archivo)
                    await Browser.open({ url: link })
                }
                if (data && data.id === 2) {
                    this.firmas[idx].flagCargando = true
                    const link = await this.sincronizaService.obtenerLinkFoto(this.firmas[idx].nid_archivo)
                    const foto = await this.photoService.descargarFoto(link)
                    console.log('foto :>> ', foto);
                    if (foto) {
                        this.firmas[idx].urlArchivoFile = foto.filepath
                        this.firmas[idx].urlArchivoHttp = foto.webviewPath
                        this.firmas[idx].descargada = true
                    }
                    this.firmas[idx].flagCargando = false
                }
            }
        } else {
            this.urlFoto = this.firmas[idx].urlArchivoHttp
            this.modalFoto.present()
        }
    }

}
