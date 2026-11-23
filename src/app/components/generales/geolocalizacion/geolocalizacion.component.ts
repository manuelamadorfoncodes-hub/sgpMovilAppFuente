import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UiServiceService } from 'src/app/services/ui-service.service';

@Component({
    selector: 'app-geolocalizacion',
    templateUrl: './geolocalizacion.component.html',
    styleUrls: ['./geolocalizacion.component.scss'],
})
export class GeolocalizacionComponent implements OnInit {

    @Input() nombreFoto: string
    @Input() latitud = 0
    @Input() longitud = 0

    constructor(public popoverController: PopoverController,
        private uiService: UiServiceService) { }

    ngOnInit() {}

    async copiar(dato) {
        // this.clipboard.copy(dato.toString())
        // await this.uiService.presentToast('Copiado')
    }

    async pegarLatitud() {
        // const latitud = await this.clipboard.paste()
        // if (!isNaN(latitud)) {
        //     this.latitud = parseFloat(latitud)
        // }
    }

    async pegarLongitud() {
        // const longitud = await this.clipboard.paste()
        // if (!isNaN(longitud)) {
        //     this.longitud = parseFloat(longitud)
        // }
    }

    async aceptar() {

        // o	Latitud = > Solo aceptar valores entre -19 , 0; con 8 decimales.
        // o	Longitud = > Solo aceptar valores entre -81, -67; con 8 decimales.

        const latitud = this.latitud.toString().split('')
        for (let i = 0; i < latitud.length; i++) {
            if (!'-.0123456789'.includes(latitud[i])) {
                await this.uiService.alertaInformativa('El valor registrado en latitud no es un número.')
                return
            }
        }

        const longitud = this.longitud.toString().split('')
        for (let i = 0; i < longitud.length; i++) {
            if (!'-.0123456789'.includes(longitud[i])) {
                await this.uiService.alertaInformativa('El valor registrado en longitud no es un número.')
                return
            }
        }

        if ((this.latitud.toString().length - this.latitud.toString().lastIndexOf('.') - 1 > 8) || (this.longitud.toString().length - this.longitud.toString().lastIndexOf('.') - 1 > 8)) {
            await this.uiService.alertaInformativa('Los datos deben tener máximo 8 decimales.')
            return
        }

        if (this.latitud < -19 || this.latitud > 0) {
            await this.uiService.alertaInformativa('La latitud debe estar entre -19 y 0.')
            return
        }

        if (this.longitud < -81 || this.longitud > -67) {
            await this.uiService.alertaInformativa('La longitud debe estar entre -81 y -67.')
            return
        }

        if (isNaN(this.latitud)) {
            await this.uiService.alertaInformativa('Latitud: Valor no válido.')
            return
        }

        if (isNaN(this.longitud)) {
            await this.uiService.alertaInformativa('Longitud: Valor no válido.')
            return
        }

        this.popoverController.dismiss({latitud: this.latitud, longitud: this.longitud})
    }
}
