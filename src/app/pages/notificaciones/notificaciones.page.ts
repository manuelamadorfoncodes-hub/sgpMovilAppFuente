import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { SincronizaService } from '../../services/sincroniza/sincroniza.service';
import { Notificacion } from '../../model/notificaciones';

@Component({
    selector: 'app-notificaciones',
    templateUrl: './notificaciones.page.html',
    styleUrls: ['./notificaciones.page.scss'],
})
export class NotificacionesPage implements OnInit {

    defaultHref = ''
    notificaciones: Notificacion[]

    constructor(private alertController: AlertController,
        private sincronizaService: SincronizaService,
        private dataLocalService: DataLocalService) { }

    async ngOnInit() {
        this.notificaciones = await this.dataLocalService.leerNotificaciones()
        this.dataLocalService.notificacionesListener.subscribe(notificaciones => this.notificaciones = notificaciones)
    }

    async refrescar(event) {
        setTimeout(() => {
            console.log('Async operation has ended')
            event.target.complete()
        }, 10000);
        await this.sincronizaService.notificacionesNuevas().catch(error => {
            console.error(error)
            event.target.complete()
        }) || []
        event.target.complete()
    }

    async abrirDetalle(notificacion: Notificacion, index: number) {
        const fecha = new Date(notificacion.fec_notificacion)

        const alert = await this.alertController.create({
            cssClass: 'acuerdo-alert',
            mode: 'ios',
            header: notificacion.txt_nombre,
            subHeader: fecha.toLocaleString(),
            message: notificacion.txt_mensaje_html ? notificacion.txt_mensaje_html : notificacion.txt_mensaje ,
            buttons: [
                { text: 'Cerrar', role: 'cancel', cssClass: 'secondary', handler: () => {console.log('Confirm Cancel') } },
            ]
        });

        await alert.present()
        await alert.onDidDismiss()
        if (!notificacion.flg_leido) {
            this.notificaciones[index].flg_leido = true
            this.notificaciones[index].fec_lectura = new Date()
            console.log('this.notificaciones[index].fec_lectura :>> ', this.notificaciones[index].fec_lectura);
            await this.dataLocalService.marcarNotificacionLeida(this.notificaciones, notificacion)
        }
    }

    async eliminar(notificacion: Notificacion, index: number) {
        notificacion.flg_eliminado = true
        notificacion.fec_eliminacion = new Date()
        this.notificaciones.splice(index,1)
        await this.dataLocalService.eliminarNotificacion(this.notificaciones, notificacion)
    }
}
