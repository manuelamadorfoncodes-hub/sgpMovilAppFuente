import { Component, OnInit } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { SamAccion } from '../../model/plan-actividad';
import { Opcion } from './../../model/generales';
import { DataLocalService } from './../../services/data-local.service';
import { UiServiceService } from './../../services/ui-service.service';
import { SincronizaService } from '../../services/sincroniza/sincroniza.service';
import { AccionActividadPage } from '../accion-actividad/accion-actividad.page';

@Component({
    selector: 'app-acciones',
    templateUrl: './acciones.page.html',
    styleUrls: ['./acciones.page.scss'],
})
export class AccionesPage implements OnInit {

    acciones: SamAccion[] = []
    opcion: Opcion
  
    constructor(private dataLocalService: DataLocalService,
        private modalController: ModalController,
        private actionSheetCtrl: ActionSheetController,
        private sincronizaService: SincronizaService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        console.log('Acciones');
        this.opcion = await this.dataLocalService.leerOpcion('acciones')
        this.acciones = await this.dataLocalService.leerAcciones()
        this.sincronizaService.accionesListener.subscribe(actividades => this.acciones = actividades)
        this.dataLocalService.accionesListener.subscribe(actividades => this.acciones = actividades)   
    }

    async abrirOpciones(accion: SamAccion, index: number) {
        console.log('ACTIVIDAD :>> ', accion);
        const buttons = []
        const opciones = [
            {
                text: 'Registrar actividad', icon: 'create-outline', objeto: 'accionActividad',
                handler: () => { this.registarActividad(accion, index, true) }
            },
            // {
            //     text: 'Registrar la ejecución de la actividad', icon: 'checkbox-outline', objeto: 'registrarEjecucion',
            //     handler: () => { this.ejecutarActividad(accion, index, false) }
            // },
            // {
            //     text: 'Solicitud de acción de mejora', icon: 'receipt-outline', objeto: 'registrarSam',
            //     handler: () => { this.registrarSam(accion, index) }
            // },
            {
                text: 'Sincronizar', icon: 'sync-outline', objeto: 'sincronizarActividad',
                handler: () => { this.sincronizarActividad(accion, index) }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel-outline', objeto: 'cancelar',
                handler: () => { console.log('Cancel clicked') }
            }
        ]

        opciones.map(item => {
            if (item.objeto === 'accionActividad' && (
                // accion.txt_accion // ||
                // accion.est_actividad === 'P' || accion.est_actividad === 'E'
                // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            // )) { return }
            // if (item.objeto === 'registrarEjecucion' && (
                // !accion.nid_actividad
                // !ofertada ||
                // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            // )) { return }
            // if (item.objeto === 'registrarSam' && (
                // accion.noEjecutada || accion.est_actividad === 'N' ||
                // !accion.actividadEjecutada
                // !ofertada ||
                // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }

            buttons.push(item)
        })

        const actionSheet = await this.actionSheetCtrl.create({ buttons });
        await actionSheet.present();
    }

    async registarActividad(accion: SamAccion, index: number, nuevo: boolean) {
        this.abrirModal(accion, 'Registrar actividad', index, nuevo)
    }

    private async abrirModal(accion: SamAccion, titulo: string, index: number, nuevo: boolean) {
        const modal = await this.modalController.create({
            component: AccionActividadPage,
            componentProps: {
                titulo,
                accion,
                index,
                nuevo
            }
        })
        await modal.present();

    }

    async sincronizarActividad(accion: SamAccion, index: number) {
        const respActividad = await this.sincronizaService.accionActividad(accion, index, true)
        if (!respActividad) {this.uiService.alertaInformativa('No se sincronizó la información.')}
    }

}
