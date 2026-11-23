import { Component, OnInit } from '@angular/core';
import { ActionSheetController, IonItemSliding, ModalController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { Opcion, User } from '../../model/generales';
import { Proyecto } from '../../model/proyectos';
import { Eri } from 'src/app/model/eri';
import { EriInformePage } from '../eri-informe/eri-informe.page';
import { SincronizaService } from '../../services/sincroniza/sincroniza.service';
import { UiServiceService } from '../../services/ui-service.service';
import { SincronizaEriService } from '../../services/sincroniza/sincroniza-eri.service';

@Component({
    selector: 'app-eri',
    templateUrl: './eri.page.html',
    styleUrls: ['./eri.page.scss'],
})
export class EriPage implements OnInit {
    defaultHref = '/tabsPrincipal/tabsPrincipal/proyectos'
    textoBuscar = ''
    user: User
    proyecto: Proyecto
    codigoProyecto = ''
    eriList: Eri[] = []
    // informacionContraste = false

    opcion: Opcion

    constructor(public dataLocalService: DataLocalService,
        private modalController: ModalController,
        private actionSheetCtrl: ActionSheetController,
        private sincronizaEriService: SincronizaEriService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        // this.eriList = await this.dataLocalService.leerEris()
        this.opcion = await this.dataLocalService.leerOpcion('eri')
        this.proyecto = await this.dataLocalService.leerProyectoSeleccionado()
        this.codigoProyecto = this.proyecto.codigo_expediente
        this.eriList = await this.dataLocalService.leerEri(this.codigoProyecto)
        // this.user = await this.dataLocalService.leerUser()
        // const opcion = await this.dataLocalService.leerOpcion('eri')
        // if (opcion.opciones[0].txtnombreobjeto === 'informeSeguimientoEri') {
        //     this.informacionContraste = true
        // }
        this.dataLocalService.eriListener.subscribe(eriList => this.eriList = eriList)
        console.log('this.eriList :>> ', this.eriList);
    }

    buscar(event) {
        this.textoBuscar = event.detail.value;
    }

    async abrirOpciones(eri: Eri) {
        console.log('ERI :>> ', eri);
        const buttons = []
        const opciones = [
            {
                text: 'Agregar informe', icon: 'create-outline', objeto: 'informeAsistenciaTecnicaEri',
                handler: () => { this.abrirInforme(eri, null, false) }
            },
            // {
            //     text: 'Registrar seguimiento', icon: 'checkbox-outline', objeto: 'informeSeguimientoEri',
            //     handler: () => { this.abrirSeguimiento(eri, index) }
            // },
            {
                text: 'Sincronizar', icon: 'sync-outline', objeto: 'sincronizarEri',
                handler: () => { this.sincronizar(eri) }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel-outline', objeto: 'cancelar',
                handler: () => { console.log('Cancel clicked') }
            }
        ]

        opciones.map(item => {
            if (item.objeto === 'informeAsistenciaTecnicaEri' && (
                // eri.est_actividad === 'P' || eri.est_actividad === 'E' ||
                // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                !this.opcion.opciones || this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            buttons.push(item)
        })

        const actionSheet = await this.actionSheetCtrl.create({ buttons });
        await actionSheet.present();
    }

    async abrirOpcionesInforme(eri: Eri, index: number) {
        console.log('ERI :>> ', eri);
        const buttons = []
        const opciones = [
            {
                text: 'Editar informe', icon: 'create-outline', objeto: 'informeAsistenciaTecnicaEri',
                handler: () => { this.abrirInforme(eri, index, false) }
            },
            {
                text: 'Consultar informe', icon: 'create-outline', objeto: 'consultarInforme',
                handler: () => { this.abrirInforme(eri, index, true) }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel-outline', objeto: 'cancelar',
                handler: () => { console.log('Cancel clicked') }
            }
        ]

        opciones.map(item => {
            console.log('eri.informes[index].est_informe :>> ', eri.informes[index].est_informe);
            if (item.objeto === 'informeAsistenciaTecnicaEri' && (
                eri.informes[index].est_informe === 'E' ||
                // eri.est_actividad === 'P' || eri.est_actividad === 'E' ||
                // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                !this.opcion.opciones || this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'consultarInforme' && (
                eri.informes[index].est_informe !== 'E' ||
                // eri.est_actividad === 'P' || eri.est_actividad === 'E' ||
                // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                !this.opcion.opciones || this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'informeAsistenciaTecnicaEri') < 0
            )) { return }
            buttons.push(item)
        })

        const actionSheet = await this.actionSheetCtrl.create({ buttons });
        await actionSheet.present();
    }

    async abrirInforme(eri: Eri, index: number, consulta: boolean) {
        const eriParametro = await this.dataLocalService.leerEriParametro()
        const modal = await this.modalController.create({
            component: EriInformePage,
            componentProps: {
                eri,
                informeTexto: (eri.informes && eri.informes[index]) ? JSON.stringify(eri.informes[index]) : '',
                index,
                consulta,
                eriParametro
            }
        })
        await modal.present();
    }

    async sincronizar(eri) {
        const respActividad = await this.sincronizaEriService.eri(eri, true)
        if (!respActividad) {this.uiService.alertaInformativa('No se sincronizó la información.')}
    }

    async eliminarInforme(eri: Eri, index: number, slidingItem: IonItemSliding) {
        eri.informes.splice(index,1)
        eri.cambioInforme = false
        eri.informeIncompleto = false
        if (eri.informes && eri.informes.length > 0) {
            if (eri.informes.find(item => item.cambio)) {eri.cambioInforme = true}
            if (eri.informes.find(item => item.incompleto)) {eri.informeIncompleto = true}
        }
        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarEri(eri)
        slidingItem.close()
        await this.uiService.dismissLoading()
    }

}
