import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Usuario } from '../../model/usuarios';
import { ModalController } from '@ionic/angular';
import { UiServiceService } from '../../services/ui-service.service';
import { DataLocalService } from '../../services/data-local.service';

@Component({
  selector: 'app-usuario-edit',
  templateUrl: './usuario-edit.page.html',
  styleUrls: ['./usuario-edit.page.scss'],
})
export class UsuarioEditPage implements OnInit, OnDestroy {

    @Input() titulo = ''
    @Input() usuario: Usuario
    @Input() consulta = true
    @Input() yachachiqs = []
    edit = false
    existeArchivoDj = false

    constructor(private modalController: ModalController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        if (this.usuario.archivoHogarEmancipado && this.usuario.archivoHogarEmancipado.length > 0) {
            if (this.usuario.archivoHogarEmancipado[0].nid_archivo) {this.existeArchivoDj = true}
        }
    }

    async guardar() {
        console.log('this.usuario.nidYachachiq :>> ', this.usuario.nidYachachiq);
        if (this.usuario.txt_yachachiq && !this.usuario.fecFinYachachiq) {
            await this.uiService.alertaInformativa('Falta registrar la fecha de término del Yachachiq anterior.')
            return
        }
        if (this.usuario.nidYachachiq === undefined || this.usuario.nidYachachiq === null || (this.usuario.nidYachachiq === 0 && !this.usuario.nid_personal_yachachiq)) {
            await this.uiService.alertaInformativa('Falta seleccionar al Yachachiq.')
            return
        }
        if (!this.usuario.fecYachachiq && this.usuario.nidYachachiq > 0) {
            await this.uiService.alertaInformativa('Falta registrar la fecha de asignación.')
            return
        }

        this.usuario.flg_cambio_yachachiq = true

        const yachachiq = this.yachachiqs.find(item => item.nidPersonal === this.usuario.nidYachachiq)
        this.usuario.txtYachachiq = yachachiq.nombre

        await this.uiService.presentLoading('Guardando...')
        const mensaje = await this.dataLocalService.guardarUsuario(this.usuario, false)
        await this.uiService.dismissLoading()

        this.modalController.dismiss();
    }

    async salir() {
        this.modalController.dismiss();
    }

    async ngOnDestroy() {
        if (this.consulta && this.usuario.fotos && this.usuario.fotos.length > 0) {
            let guardar = false
            for (let index = 0; index < this.usuario.fotos.length; index++) {
                if (this.usuario.fotos[index].descargada) {
                    guardar = true
                    this.usuario.fotos[index].descargada = false
                }
            }
            if (guardar) {
                console.log('this.usuario.fotos :>> ', this.usuario.fotos);
                await this.uiService.presentLoading('Guardando...')
                const mensaje = await this.dataLocalService.guardarUsuario(this.usuario, false)
                await this.uiService.dismissLoading()
            }
        }
    }
}
