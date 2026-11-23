import { UiServiceService } from './../../services/ui-service.service';
import { SincronizaService } from '../../services/sincroniza/sincroniza.service';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonList, ModalController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { PlanActividad } from '../../model/plan-actividad';
import { Opcion } from './../../model/generales';
import { PlanActividadEditPage } from '../plan-actividad-edit/plan-actividad-edit.page';
import { PlanSamPage } from '../plan-sam/plan-sam.page';

@Component({
    selector: 'app-plan-actividades',
    templateUrl: './plan-actividades.page.html',
    styleUrls: ['./plan-actividades.page.scss'],
})
export class PlanActividadesPage implements OnInit {

    @ViewChild('lista', { static: true}) lista: IonList
    defaultHref = ''
    nidUsuario: number
    nidFuncion: number
    titulo = 'SGP-Movil'
    actividades: PlanActividad[] = []
    opcion: Opcion
    botonNuevo = false
    textoBuscar = ''

    constructor(private dataLocalService: DataLocalService,
        private modalController: ModalController,
        private actionSheetCtrl: ActionSheetController,
        private sincronizaService: SincronizaService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        console.log('Está Aquí :>>>>>>>>>>>>>>>> ');
        this.opcion = await this.dataLocalService.leerOpcion('actividadSuper')
        console.log('this.opcion :>> ', this.opcion);
        if (this.opcion.opciones && this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'nuevaActividad') >= 0) {this.botonNuevo = true}

        this.actividades = await this.dataLocalService.leerPlanActividades()
        this.sincronizaService.planActividadesListener.subscribe(actividades => this.actividades = actividades)
        this.dataLocalService.planActividadesListener.subscribe(actividades => this.actividades = actividades)
    }

    async abrirOpciones(actividad: PlanActividad) {
        console.log('ACTIVIDAD :>> ', actividad);
        const buttons = []
        const opciones = [
            {
                text: 'Editar actividad no programada', icon: 'create-outline', objeto: 'nuevaActividad',
                handler: () => { this.ejecutarActividad(actividad, true) }
            },
            {
                text: 'Registrar la ejecución de la actividad', icon: 'checkbox-outline', objeto: 'registrarEjecucion',
                handler: () => { this.ejecutarActividad(actividad, false) }
            },
            {
                text: 'Solicitud de acción de mejora', icon: 'receipt-outline', objeto: 'registrarSam',
                handler: () => { this.registrarSam(actividad) }
            },
            {
                text: 'Sincronizar', icon: 'sync-outline', objeto: 'sincronizarActividad',
                handler: () => { this.sincronizarActividad(actividad) }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel-outline', objeto: 'cancelar',
                handler: () => { console.log('Cancel clicked') }
            }
        ]

        opciones.map(item => {
            if (item.objeto === 'nuevaActividad' && (
                actividad.nid_actividad ||
                actividad.est_actividad === 'P' || actividad.est_actividad === 'E' ||
                // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                !this.opcion.opciones || this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'registrarEjecucion' && (
                !actividad.nid_actividad ||
                // !ofertada ||
                // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                !this.opcion.opciones || this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'registrarSam' && (
                actividad.noEjecutada || actividad.est_actividad === 'N' ||
                !actividad.actividadEjecutada ||
                // !ofertada ||
                // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                !this.opcion.opciones || this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }

            buttons.push(item)
        })

        const actionSheet = await this.actionSheetCtrl.create({ buttons });
        await actionSheet.present();
    }

    async ejecutarActividad(actividad: PlanActividad, nuevo: boolean) {
        this.abrirModal(actividad, 'Ejecutar actividad', nuevo)
    }

    private async abrirModal(actividad: PlanActividad, titulo: string, nuevo: boolean) {
        const modal = await this.modalController.create({
            component: PlanActividadEditPage,
            componentProps: {
                titulo,
                actividad,
                nuevo,
            }
        })
        await modal.present();

    }

    async sincronizarActividad(actividad: PlanActividad) {
        const respActividad = await this.sincronizaService.planActividad(actividad, true)
        if (!respActividad) {this.uiService.alertaInformativa('No se sincronizó la información.')}
    }

    async nuevaActividad() {
        this.abrirModal({}, 'Nueva actividad', true)
    }

    async registrarSam(actividad: PlanActividad) {
        const modal = await this.modalController.create({
            component: PlanSamPage,
            componentProps: {
                actividadData: JSON.stringify(actividad)
            }
        })
        await modal.present();
    }

    async eliminar(index) {
        console.log('this.actividades[index] :>> ', this.actividades[index])
        console.log('this.actividades[index].flg_no_programada :>> ', this.actividades[index].flg_no_programada);
        if (this.actividades[index].flg_no_programada) {
            await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la actividad no programada?`).then(async (resp) => {
                if (resp) {
                    // this.actividades.splice(index,1)    
                    await this.dataLocalService.eliminarPlanActividad(index)
                }
            })
        } else {
            if (this.actividades[index].est_actividad === 'P' && this.actividades[index].actividadEjecutadaCambio) {
                if (this.actividades[index].noEjecutada) {
                    await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la actualización de la actividad no ejecutada?`).then(async (resp) => {
                        if (resp) {
                            this.actividades[index].noEjecutada = false
                            this.actividades[index].actividadEjecutadaCambio = false
                            await this.dataLocalService.guardarPlanActividad(this.actividades[index])
                        }
                    })
                } else {
                    await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la información de la ejecución de la actividad?`).then(async (resp) => {
                        if (resp) {
                            this.actividades[index].actividadEjecutada = null
                            this.actividades[index].actividadEjecutadaCambio = false
                            this.actividades[index].sam = null
                            this.actividades[index].samCambio = false
                            await this.dataLocalService.guardarPlanActividad(this.actividades[index])
                        }
                    })
                }
            } else {
                if (this.actividades[index].sam && !this.actividades[index].sam.nid_sam && this.actividades[index].samCambio) {
                    await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la SAM?`).then(async (resp) => {
                        if (resp) {
                            this.actividades[index].sam = null
                            this.actividades[index].samCambio = false
                            await this.dataLocalService.guardarPlanActividad(this.actividades[index])
                        }
                    })
                }
            }
        }
        this.lista.closeSlidingItems()
    }
 
    buscar(event) {
        this.textoBuscar = event.detail.value;
        console.log('entra a buscar');
    }
}
