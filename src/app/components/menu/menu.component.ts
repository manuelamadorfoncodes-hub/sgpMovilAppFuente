import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SincronizaService } from '../../services/sincroniza/sincroniza.service';
import { ArchivoService } from '../../services/archivo.service';
import { SeguridadService } from '../../services/seguridad.service';
import { UiServiceService } from '../../services/ui-service.service';
import { DataLocalService } from '../../services/data-local.service';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
    accesoConsultasReportes = false

    constructor(private navCtrl: NavController,
        private uiService: UiServiceService,
        private seguridadService: SeguridadService,
        private archivoService: ArchivoService,
        private sincronizaService: SincronizaService,
        private dataLocalService: DataLocalService,
        private router: Router) { }

    async ngOnInit() {}

    async validarAccesos() {
        const menu = await this.dataLocalService.leerOpcion('menu')
        if (menu?.opciones.findIndex(op => op.txtnombreobjeto === 'consultasReportes') >= 0) {this.accesoConsultasReportes = true}
    }

    async confirmarContrasenha() {
        const resp = await this.seguridadService.abrirConfirmarClave()
        console.log('resp :>> ', resp);
    }

    async onClick() {
        // await this.seguridadService.confirmarContrasenha()
    }

    cambiarContrasenha() {
        this.navCtrl.navigateForward('/cambio-clave', { animated: true })
    }

    async cerrarSesion() {
        await this.uiService.alertaConfirmacion('Si cierra la sesión perderá toda la información registrada que no haya sincronizado. ¿Está seguro de cerrar la sesión?.').then(async (resp) => {
            if (resp) {
                await this.sincronizaService.notificacionesEnviar(true)
                this.seguridadService.limpiarToken()
                this.navCtrl.navigateRoot('/login', { animated: true });
                this.archivoService.borrarArchivos()
            }
        })
    }

    async acuerdoConfidencialidad() {
        const resp = await this.seguridadService.acuerdoConfidencialidad()
        console.log('resp :>> ', resp);
        if (resp != 'ok') {
            this.uiService.presentToast(resp)
        }
    }

    async cambiarZonal() {
        const resp = await this.seguridadService.cambiarPermiso()
        console.log('resp cambiarZonal :>> ', resp);
    }

    async reportesAvanceTec() {
        this.navCtrl.navigateRoot('/tabsPrincipal/tabsPrincipal/reportes', { animated: true })
    }

}
