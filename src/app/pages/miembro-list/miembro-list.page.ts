import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonList, ModalController } from '@ionic/angular';
import { MiembroEditPage } from '../miembro-edit/miembro-edit.page';
import { DataLocalService } from '../../services/data-local.service';
import { Usuario, UsuarioParametro, Miembro } from '../../model/usuarios';

@Component({
    selector: 'app-miembro-list',
    templateUrl: './miembro-list.page.html',
    styleUrls: ['./miembro-list.page.scss'],
})
export class MiembroListPage implements OnInit {
    @ViewChild('listaMiembros', { static: true}) listaActividadProd: IonList

    @Input() usuario: Usuario
    @Input() consulta = false
    @Input() miembros: Miembro[] = []
    @Input() nuevoUsuario = false
    parametros: UsuarioParametro

    constructor(private modalController: ModalController,
        private dataLocalService: DataLocalService) { }

    async ngOnInit() {
        console.log('this.consulta :>> ', this.consulta);
        // const opcion = await this.dataLocalService.leerOpcion('integrantes')
        // this.consulta = opcion.flgconsulta
        this.parametros = await this.dataLocalService.leerUsuariosParametro()
        if (!this.nuevoUsuario) {this.miembros = this.usuario.miembros || []}
    }

    async abrirMiembro(nuevo, miembro?, idxList?) {
        const modal = await this.modalController.create({
            component: MiembroEditPage,
            componentProps: {
                parametros: this.parametros,
                usuario: this.usuario,
                miembrosList: this.miembros,
                miembro,
                idxList,
                nuevo,
                consulta: this.consulta,
                nuevoUsuario: this.nuevoUsuario
            }
        })
        await modal.present();
        const { data } = await modal.onDidDismiss()
        if (data) {this.miembros = data}
        if (!this.nuevoUsuario) {this.miembros = this.usuario.miembros || []}
    }

    async eliminarMiembro(index) {
        this.miembros.splice(index,1)
        if (!this.nuevoUsuario) {
            this.usuario.miembros = this.miembros
            this.usuario.cambioMiembros = this.evaluarExisteCambio()
            this.usuario.miembrosIncompleto = this.evaluarExisteCambioIncompleto()
            await this.dataLocalService.guardarUsuario(this.usuario, false)
        }
    }

    evaluarExisteCambio() {
        if (this.miembros && this.miembros.length > 0) {
            for (let index = 0; index < this.miembros.length; index++) {
                if (this.miembros[index].cambioMiembro) {return true}
            }
        }
        return false
    }

    evaluarExisteCambioIncompleto() {
        if (this.miembros && this.miembros.length > 0) {
            for (let index = 0; index < this.miembros.length; index++) {
                if (!this.miembros[index].flg_ficha_completa) {return true}
            }
        }
        return false
    }

    salir() {
        if (this.nuevoUsuario) {
            this.modalController.dismiss(this.miembros)
        } else {
            this.modalController.dismiss()
        }
    }
}
