import { Component, OnInit } from '@angular/core';
import { NavController, ModalController, PopoverController } from '@ionic/angular';
import { SincronizaService } from '../../../services/sincroniza/sincroniza.service';
import { SeguridadService } from '../../../services/seguridad.service'
import { DataLocalService } from '../../../services/data-local.service'
import { UiServiceService } from '../../../services/ui-service.service'
import { User, Funcion, Modulo } from '../../../model/generales';
import { environment } from '../../../../environments/environment';
import { ArchivoService } from '../../../services/archivo.service';
import { ZonalModulo } from './../../../model/generales';

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {

    user: User = {}
    funcion: Funcion = {}
    zonales: ZonalModulo[] = []
    version = ''

    constructor(private navCtrl: NavController,
        private dataLocalService: DataLocalService,
        private seguridadService: SeguridadService,
        private sincronizaService: SincronizaService,
        private modalController: ModalController,
        private uiService: UiServiceService,
        private archivoService: ArchivoService,
        public popoverController: PopoverController,
    ) {}

    async ngOnInit() {
        this.user = await this.dataLocalService.leerUser()
        console.log('this.user :>> ', this.user);
        this.funcion = await this.dataLocalService.leerFuncion()
        const modulo: Modulo = await this.dataLocalService.leerModulo()
        console.log('modulo',modulo);
        if (modulo) {this.zonales = modulo.zonales}
        this.version = environment.version
    }

    async cerrarSeseion() {
        await this.uiService.alertaConfirmacion('Si cierra la sesión perderá toda la información registrada que no haya sincronizado. ¿Está seguro de cerrar la sesión?.').then(async (resp) => {
            if (resp) {
                await this.sincronizaService.notificacionesEnviar(true)
                this.seguridadService.limpiarToken()
                this.modalController.dismiss();
                this.navCtrl.navigateRoot('/login', { animated: true });
                this.archivoService.borrarArchivos()
            }
        })

        // const resp = await this.seguridadService.cerrarSesion()
        // if (resp) {
        //     console.log('resp :>> ', resp);
        //     this.modalController.dismiss()
        // }
    }

    salir() {
        this.modalController.dismiss(this.user);
    }
}
