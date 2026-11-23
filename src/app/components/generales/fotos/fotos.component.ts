import { Component, OnInit, Input, ViewChild, ElementRef, } from '@angular/core'
import { PopoverController, IonList } from '@ionic/angular'
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';

import { Browser } from '@capacitor/browser'
import { register } from 'swiper/element/bundle';

import { PhotoService } from './../../../services/photo.service'
import { UiServiceService } from './../../../services/ui-service.service'
import { SincronizaService } from '../../../services/sincroniza/sincroniza.service'
import { GeolocalizacionComponent } from '../geolocalizacion/geolocalizacion.component'
import { PopoverListComponent } from '../popover-list/popover-list.component'
import { Archivo } from '../../../model/generales'

register();

@Component({
    selector: 'app-fotos',
    templateUrl: './fotos.component.html',
    styleUrls: ['./fotos.component.scss'],
})
export class FotosComponent implements OnInit {
    @ViewChild(IonModal) modalFoto: IonModal;
    @ViewChild('swiper')
    swiperRef: ElementRef | undefined
    @ViewChild('lista', { static: true}) lista: IonList
    @Input() fotos: Archivo[] = []
    @Input() consulta = false
    @Input() multiple = false
    @Input() verMapa = false
    noFoto = '../../../assets/imagenes/no-photo-available.png'
    siFoto = '../../../assets/imagenes/visto-bueno.png'
    // urlFoto = '../../../assets/imagenes/no-photo-available.png'
    urlFoto = ''
    message = 'This modal example uses triggers to automatically open a modal when the button is clicked.';
    name: string;
    sliderOptions = {
        zoom: {
            maxRatio: 2
        }
    }

    
    constructor(public popoverController: PopoverController,
        private uiService: UiServiceService,
        private sincronizaService: SincronizaService,
        private photoService: PhotoService) { }

    ngOnInit() { }
    ngAfterContentChecked() {
        if (this.swiperRef) {this.swiperRef.nativeElement.allowTouchMove = false}
    }

    async tomarFoto(idx: number) {
        // this.fotos[idx].flagCargando = true
        const foto = await this.photoService.tomarFoto(this.fotos[idx])
        if (foto) {this.fotos[idx] = foto}
        // this.fotos[idx].flagCargando = false
    }

    async cargarFoto(idx: number) {
        // this.fotos[idx].flagCargando = true
        const foto = await this.photoService.cargarFoto(this.fotos[idx])
        if (foto) {this.fotos[idx] = foto}
        // this.fotos[idx].flagCargando = false
    }

    async verFoto(idx: number, ev: any) {
        if (!this.fotos[idx].urlArchivoFile) {
            if (this.fotos[idx].nid_archivo) {
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
                    const link = await this.sincronizaService.obtenerLinkFoto(this.fotos[idx].nid_archivo)
                    await Browser.open({ url: link })
                }
                if (data && data.id === 2) {
                    this.fotos[idx].flagCargando = true
                    const link = await this.sincronizaService.obtenerLinkFoto(this.fotos[idx].nid_archivo)
                    const foto = await this.photoService.descargarFoto(link)
                    console.log('foto :>> ', foto);
                    if (foto) {
                        this.fotos[idx].urlArchivoFile = foto.filepath
                        this.fotos[idx].urlArchivoHttp = foto.webviewPath
                        this.fotos[idx].descargada = true
                    }
                    this.fotos[idx].flagCargando = false
                }
            }
        } else {
            this.urlFoto = this.fotos[idx].urlArchivoHttp
            this.modalFoto.present()
        }
    }

    async registrarGeolocalizacion(idx: number) {
        const popover = await this.popoverController.create({
            component: GeolocalizacionComponent,
            cssClass: 'popover-edit',
            translucent: true,
            componentProps: {
                nombreFoto: this.fotos[idx].txt_archivo,
                latitud: this.fotos[idx].num_latitud,
                longitud: this.fotos[idx].num_longitud
            }
        });
        await popover.present();
        const {data} = await popover.onDidDismiss()
        if (data) {
            this.fotos[idx].num_latitud = data.latitud
            this.fotos[idx].num_longitud = data.longitud
        }
    }

    async eliminarFoto(idx: number) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la foto${this.fotos[idx].flg_georeferencia ? ' y sus coordenadas' : ''}?`).then((resp) => {
            if (resp) {
                this.fotos[idx].urlArchivoFile = null
                this.fotos[idx].urlArchivoHttp = null
                this.fotos[idx].fec_archivo = null
                this.fotos[idx].nueva = false
                this.fotos[idx].num_latitud = null
                this.fotos[idx].num_longitud = null
            }
        })
        this.lista.closeSlidingItems()
    }

    async eliminaRegistro(index: number) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar el registro?`).then((resp) => {
            if (resp) {
                this.fotos.splice(index,1)
            }
        })
        this.lista.closeSlidingItems()
    }

    cancel() {
        this.modalFoto.dismiss(null, 'cancel');
    }

    onWillDismiss(event: Event) {
        const ev = event as CustomEvent<OverlayEventDetail<string>>;
        if (ev.detail.role === 'confirm') {
            this.message = `Hello, ${ev.detail.data}!`;
        }
    }

    async abrirMapa(index) {
        const url = `https://www.google.com/maps/place/${this.fotos[index].num_latitud.toString()},${this.fotos[index].num_longitud.toString()}`
        await Browser.open({ url })
    }

}
