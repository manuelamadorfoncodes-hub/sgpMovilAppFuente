import { Component, OnInit } from '@angular/core';
import { ActionSheetController, IonItemSliding, ModalController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DataLocalService } from '../../services/data-local.service';
import { SincronizaService } from '../../services/sincroniza/sincroniza.service';
import { User} from '../../model/generales';
import { Proyecto } from '../../model/proyectos';
import { ActividadEditPage } from '../proy-actividad-edit/actividad-edit.page';
import { ProyActividad } from '../../model/actividades';
import { UiServiceService } from 'src/app/services/ui-service.service';
import { SincronizaProyActividadService } from 'src/app/services/sincroniza/sincroniza-proy-actividad.service';

@Component({
    selector: 'app-actividades',
    templateUrl: './actividades.page.html',
    styleUrls: ['./actividades.page.scss'],
})
export class ActividadesPage implements OnInit {

    proyecto: Proyecto
    codigoProyecto = ''
    actividades: ProyActividad[] = []
    defaultHref = '/tabsPrincipal/tabsPrincipal/proyectos'
    user: User
    textoBuscar = ''
    actividades$: Observable<ProyActividad[]>
    flagCargando = false

    constructor(public dataLocalService: DataLocalService,
        private modalController: ModalController,
        private actionSheetCtrl: ActionSheetController,
        private sincronizaProyActividadService: SincronizaProyActividadService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        this.flagCargando = true
        this.proyecto = await this.dataLocalService.leerProyectoSeleccionado()
        this.actividades = await this.dataLocalService.leerActividades(this.proyecto.codigo_expediente)
        console.log('this.actividades :>> ', this.actividades);
        this.flagCargando = false
        this.codigoProyecto = this.proyecto.codigo_expediente
        this.actividades$ = this.dataLocalService.leerActividades$();
        this.actividades$.subscribe(actividades => this.actividades = actividades);
    }

    buscar(event) {
        this.textoBuscar = event.detail.value;
    }

    async abrirOpciones(actividad: ProyActividad, index: number) {
        console.log('index :>> ', index);
        console.log('actividad :>> ', actividad);
        const buttons = []
        const opciones = [
            {
                text: 'Registrar ejecución', icon: 'create-outline', objeto: 'editarActividad',
                handler: () => { this.editarActividad(actividad, false) }
            },
            {
                text: 'Consultar actividad', icon: 'body-outline', objeto: 'consultarActividad', 
                handler: () => { this.editarActividad(actividad, true) }
            },
            {
                text: 'Sincronizar', icon: 'sync-outline', objeto: 'sincroniza',
                handler: () => { this.enviar(actividad) }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel', objeto: 'cancelar',
                handler: () => { console.log('Cancel clicked') }
            }
        ]

        opciones.map(item => {
            if (item.objeto === 'editarActividad' && (
                actividad.est_actividad !== 'R' //||
                // actividad.est_actividad !== 'E'
                
            )) { return }
            if (item.objeto === 'consultarActividad' && (
                actividad.est_actividad === 'R' // ||
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            buttons.push(item)
        })

        const actionSheet = await this.actionSheetCtrl.create({ buttons });
        await actionSheet.present();
    }

    async editarActividad(actividad: ProyActividad, consulta: boolean) {
        const modal = await this.modalController.create({
            component: ActividadEditPage,
            componentProps: {
                actividadTexto : JSON.stringify(actividad), 
                consulta
            }
        })
        await modal.present();
    }

    async enviar (actividad: ProyActividad) {
        const respActividad = await this.sincronizaProyActividadService.proyActividad(actividad, true)
        if (!respActividad) {this.uiService.alertaInformativa('No se sincronizó la información.')}
    }

    async eliminarCambios(actividad: ProyActividad, slidingItem: IonItemSliding) {
        if (actividad.actividadCambio && actividad.backupRegistro) {
            actividad = JSON.parse(actividad.backupRegistro)
        }
        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarActividad(actividad)
        slidingItem.close()
        await this.uiService.dismissLoading()
    }
}
