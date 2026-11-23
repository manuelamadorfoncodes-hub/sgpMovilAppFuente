import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController, ActionSheetController, IonList } from '@ionic/angular';
import { DataLocalService } from './../../services/data-local.service';
import { UiServiceService } from './../../services/ui-service.service';
import { Usuario, ActividadProductiva, ActividadProdDetalle, LineaBase } from './../../model/usuarios';
import { ActividadProdEditPage } from '../actividad-prod-edit/actividad-prod-edit.page';

@Component({
    selector: 'app-actividad-prod-list',
    templateUrl: './actividad-prod-list.page.html',
    styleUrls: ['./actividad-prod-list.page.scss'],
})
export class ActividadProdListPage implements OnInit {

    @ViewChild('listaActividadProd', { static: true}) listaActividadProd: IonList

    @Input() usuario: Usuario
    @Input() consulta = false
    @Input() nuevoUsuario = false
    @Input() actividadesProductivas: ActividadProductiva[] = []
    @Input() linea = 0
    actividadProductivaConfig: ActividadProductiva[]
    indexLinea: number

    constructor(private modalController: ModalController,
        private actionSheetCtrl: ActionSheetController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        console.log('this.indexLinea :>> ', this.indexLinea);
        console.log('this.actividadesProductivas :>> ', this.actividadesProductivas);
        console.log('this.nuevoUsuario :>> ', this.nuevoUsuario);
        if (!this.nuevoUsuario) {
            console.log('this.linea :>> ', this.linea);
            if (this.linea > 0) {
                console.log('this.usuario.lineaBase :>> ', this.usuario.lineaBase);
                if (!this.usuario.lineaBase) {
                    this.actividadesProductivas = []
                    this.indexLinea = 0
                } else {
                    this.indexLinea = this.usuario.lineaBase.findIndex(item => item.nidLinea === this.linea) 
                    if (this.indexLinea >= 0) {
                        if (this.usuario.lineaBase[this.indexLinea].actividadesProductivas) {this.actividadesProductivas = this.usuario.lineaBase[this.indexLinea].actividadesProductivas}
                    } else {
                        //aplicará cuando exista otra línea
                        this.actividadesProductivas = []
                        this.indexLinea = this.usuario.lineaBase.length
                    }
                }
            } else {
                if (!this.usuario.actividadesProductivas) { this.usuario.actividadesProductivas = [] }
                this.actividadesProductivas = this.usuario.actividadesProductivas
            }
        }
    }

    async agregarActividad() {
        
        this.abrirActividad({
            usuario: this.usuario,
            nuevo: true,
            producto: false,
            nuevoUsuario: this.nuevoUsuario,
            actividadList: this.actividadesProductivas,
            linea: this.linea,
            indexLinea: this.indexLinea
        })
    }

    async abrirOpciones(actividadProd: ActividadProductiva, idxList: number, actividad?: ActividadProdDetalle, index?: number, detalle?: boolean) {
        if (this.consulta) {
            if (detalle) {
                this.abrirActividad({
                    usuario: this.usuario,
                    actividadProd,
                    idxList,
                    nuevo: false,
                    detalle: true,
                    actividad,
                    index,
                    consulta: this.consulta,
                    nuevoUsuario: this.nuevoUsuario,
                    actividadList: this.actividadesProductivas,
                    linea: this.linea,
                    indexLinea: this.indexLinea
                })
            } else {
                this.abrirActividad({
                    usuario: this.usuario,
                    actividadProd,
                    idxList,
                    nuevo: false,
                    detalle: false,
                    consulta: this.consulta,
                    nuevoUsuario: this.nuevoUsuario,
                    actividadList: this.actividadesProductivas,
                    linea: this.linea,
                    indexLinea: this.indexLinea
                })
            }
        } else {
            const buttons = []
            const opciones = [
                {
                    text: 'Modificar foto', icon: 'camera-outline', objeto: 'editarFoto', // cssClass: 'action-dark',
                    handler: () => {
                        this.abrirActividad({
                            usuario: this.usuario,
                            actividadProd,
                            idxList,
                            nuevo: false,
                            detalle: false,
                            consulta: this.consulta,
                            nuevoUsuario: this.nuevoUsuario,
                            actividadList: this.actividadesProductivas,
                            linea: this.linea,
                            indexLinea: this.indexLinea
                        })
                    }
                },
                {
                    text: 'Agregar producto', icon: 'add-outline', objeto: 'nuevoDetalle', // cssClass: 'action-dark',
                    handler: () => {
                        this.abrirActividad({
                            usuario: this.usuario,
                            actividadProd,
                            idxList,
                            nuevo: true,
                            detalle: true,
                            index,
                            nuevoUsuario: this.nuevoUsuario,
                            actividadList: this.actividadesProductivas,
                            linea: this.linea,
                            indexLinea: this.indexLinea
                        })
                    }
                },
                {
                    text: 'Editar', icon: 'create-outline', objeto: 'editar', // cssClass: 'action-dark',
                    handler: () => {
                        this.abrirActividad({
                            usuario: this.usuario,
                            actividadProd,
                            idxList,
                            nuevo: false,
                            detalle: true,
                            actividad,
                            index,
                            consulta: this.consulta,
                            nuevoUsuario: this.nuevoUsuario,
                            actividadList: this.actividadesProductivas,
                            linea: this.linea,
                            indexLinea: this.indexLinea
                        })
                    }
                },
                {
                    text: 'Cancelar', icon: 'close', role: 'cancel', objeto: 'cancelar',
                    handler: () => { console.log('Cancel clicked') }
                }
            ]
    
            opciones.map(item => {
                if (item.objeto === 'editarFoto' && (
                    (detalle) // || // !registrarSolicitud ||
                    // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0) ||
                    // (usuario.solicitud && usuario.solicitud.tip_cambio && usuario.solicitud.tip_cambio !== 'CD')
                )) { return }
                if (item.objeto === 'nuevoDetalle' && (
                    (detalle) || actividadProd.nid_actividad === 0 ||
                    ((!actividadProd.productos || (actividadProd.productos && actividadProd.productos.length === 0)) && !actividadProd.actividadDetalle[0].nid_producto) ||
                    this.consulta
                )) { return }
                if (item.objeto === 'editar' && (
                    (!detalle)
                )) { return }
                buttons.push(item)
            })
    
            const actionSheet = await this.actionSheetCtrl.create({ buttons });
            await actionSheet.present();
        }

    }

    async abrirActividad(componentProps) {
        const modal = await this.modalController.create({
            component: ActividadProdEditPage,
            componentProps
        })
        await modal.present();
        const { data } = await modal.onDidDismiss()
    }

    async eliminarActividad(idxList: number, index: number) {
        console.log('this.actividadesProductivas :>> ', this.actividadesProductivas);
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la actividad?`).then(async (resp) => {
            if (resp) {
                this.actividadesProductivas[idxList].actividadDetalle.splice(index,1)
                if (this.actividadesProductivas[idxList].actividadDetalle.length === 0) {
                    this.actividadesProductivas.splice(idxList, 1)
                }
                console.log('this.actividadesProductivas :>> ', this.actividadesProductivas);
                if (!this.nuevoUsuario) {
                    if (this.linea > 0) {
                        this.usuario.lineaBase[this.indexLinea].actividadesProductivas = this.actividadesProductivas
                        this.usuario.lineaBase[this.indexLinea].cambioActividadProd = this.evaluarExisteCambio()
                        this.usuario.lineaBase[this.indexLinea].actividadProdIncompleto = this.evaluarExisteCambioIncompleto()
                        await this.dataLocalService.guardarUsuario(this.usuario, false)
                    } else {
                        this.usuario.actividadesProductivas = this.actividadesProductivas
                        this.usuario.cambioActividadProd = this.evaluarExisteCambio()
                        this.usuario.actividadProdIncompleto = this.evaluarExisteCambioIncompleto()
                        await this.dataLocalService.guardarUsuario(this.usuario, false)
                    }
                }
            }
        })
        this.listaActividadProd.closeSlidingItems()
    }

    evaluarExisteCambio() {
        if (this.actividadesProductivas && this.actividadesProductivas.length > 0) {
            for (let index = 0; index < this.actividadesProductivas.length; index++) {
                if (this.actividadesProductivas[index].cambioFoto) {return true}
                for (let idx = 0; idx < this.actividadesProductivas[index].actividadDetalle.length; idx++) {
                    if (this.actividadesProductivas[index].actividadDetalle[idx].cambio) {return true}
                }
            }
        }
        return false
    }

    evaluarExisteCambioIncompleto() {
        if (this.actividadesProductivas && this.actividadesProductivas.length > 0) {
            for (let index = 0; index < this.actividadesProductivas.length; index++) {
                if (this.actividadesProductivas[index].incompleto) {return true}
                for (let idx = 0; idx < this.actividadesProductivas[index].actividadDetalle.length; idx++) {
                    if (this.actividadesProductivas[index].actividadDetalle[idx].incompleto) {return true}
                }
            }
        }
        return false
    }

    salir() {
        if (this.nuevoUsuario) {
            this.modalController.dismiss(this.actividadesProductivas)
        } else {
            this.modalController.dismiss()
        }
    }

}
