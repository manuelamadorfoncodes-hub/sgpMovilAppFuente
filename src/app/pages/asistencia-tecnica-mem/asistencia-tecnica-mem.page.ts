import { Component, Input, OnInit } from '@angular/core';
import { IonItemSliding, ModalController } from '@ionic/angular';
import { Usuario } from '../../model/usuarios';
import { AsistenciaTecnicaMemEditPage } from '../asistencia-tecnica-mem-edit/asistencia-tecnica-mem-edit.page';
import { DataLocalService } from '../../services/data-local.service';

@Component({
    selector: 'app-asistencia-tecnica-mem',
    templateUrl: './asistencia-tecnica-mem.page.html',
    styleUrls: ['./asistencia-tecnica-mem.page.scss'],
})
export class AsistenciaTecnicaMemPage implements OnInit {

    @Input() usuario: Usuario
    fichaList = []
    
    constructor(private modalController: ModalController,
        private dataLocalService: DataLocalService
    ) { }

    ngOnInit() {
        if (this.usuario.asistenciaTecnicaMemList) {this.fichaList = this.usuario.asistenciaTecnicaMemList}
    }

    async salir() {
        this.modalController.dismiss();
    }

    async registrar(index: number, consulta?: boolean) {
        console.log('consulta :>> ', consulta)
        let fichaTexto
        let ultimaFichaTexto
        if(consulta) { fichaTexto = JSON.stringify(this.usuario.asistenciaTecnicaMemList[index].ultimaFicha) }
        if (!consulta && this.usuario.asistenciaTecnicaMemList[index].nuevaFicha) { fichaTexto = JSON.stringify(this.usuario.asistenciaTecnicaMemList[index].nuevaFicha) }
        if (!consulta && this.usuario.asistenciaTecnicaMemList[index].ultimaFicha) { ultimaFichaTexto = JSON.stringify(this.usuario.asistenciaTecnicaMemList[index].ultimaFicha) }
        
        const modal = await this.modalController.create({
            component: AsistenciaTecnicaMemEditPage,
            componentProps: {
                usuario: this.usuario,
                index,
                consulta,
                fichaTexto,
                ultimaFichaTexto
            }
        })
        await modal.present();
    }

    async eliminar(index: number, slidingItem: IonItemSliding) {
        this.usuario.asistenciaTecnicaMemList[index].nuevaFicha = null
        this.usuario.asistenciaTecnicaMemList[index].cambioFicha = false
        this.usuario.cambioAsistTecMem = this.evaluarUsuarioAsistTecMemCambio()
        this.usuario.asistTecMemIncompleta = this.evaluarUsuarioAsistTecMemCompelta()
        await this.dataLocalService.guardarUsuario(this.usuario, false)
        slidingItem.close()
    }

    evaluarUsuarioAsistTecMemCambio() {
        let cambio = false
        this.usuario.asistenciaTecnicaMemList.forEach(ficha => {
            if (ficha.cambioFicha) { cambio = true }
        })
        return cambio
    }

    evaluarUsuarioAsistTecMemCompelta() {
        let incompleta = false
        this.usuario.asistenciaTecnicaMemList.forEach(ficha => {
            if (ficha.nuevaFicha) {
                if (!ficha.nuevaFicha.flg_completa) { incompleta = true }
            }
        })
        return incompleta
    }
}
