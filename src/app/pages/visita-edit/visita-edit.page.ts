import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataLocalService } from './../../services/data-local.service';
import { UiServiceService } from './../../services/ui-service.service';
import { Proyecto } from './../../model/proyectos';
import { Visita } from '../../model/visitas';
import { Archivo, Tipo } from '../../model/generales';
import { Presupuesto } from '../../model/presupuesto';

@Component({
    selector: 'app-visita-edit',
    templateUrl: './visita-edit.page.html',
    styleUrls: ['./visita-edit.page.scss'],
})
export class VisitaEditPage implements OnInit {

    @Input() proyecto: Proyecto
    @Input() visitaTexto: string
    // @Input() index: number
    // @Input() etapas: Tipo[] = []
    @Input() titulo = 'Editar'
    @Input() consulta = false
    visita: Visita = {}
    fotos: Archivo[] = []
    nueva = false

    constructor(private modalController: ModalController,
        public dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        if (this.visitaTexto) {
            this.visita = JSON.parse(this.visitaTexto)
            if (this.visita.fotos) {this.fotos = this.visita.fotos}
        } else {
            this.titulo = 'Nueva'
            const funcion = await this.dataLocalService.leerFuncion()
            const user = await this.dataLocalService.leerUser()
            this.visita = {
                codigo_expediente: this.proyecto.codigo_expediente,
                nid_funcion: funcion.nid_funcion,
                nid_personal: user.nidPersonal,
                fec_visita: new Date(),
                cambio: true,
                est_visita: '01',
                txt_estado_visita: 'Abierta',
                tip_visita: user.perfil.nidperfil === 52 ? '01' : '02'
            }
        }
        if (this.visita.fotos) {
            this.fotos = this.visita.fotos
        }
        if (this.fotos.length === 0) {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            this.fotos = archivos.visita.filter(foto => foto.cod_archivo === '0100')
        }
        await this.crearPresupuesto()
    }

    async crearPresupuesto() {
        if (!this.visita.presupuesto) {
            const presupuesto: Presupuesto = await this.dataLocalService.leerPresupuestoProyecto(this.proyecto.codigo_expediente)
            if (presupuesto) {
                this.visita.presupuesto = presupuesto
                this.nueva = true
            } 
        }
    }

    async agregarFoto() {
        const texto = await this.uiService.alertaRegistraTexto('Descripción de la foto','Descripción')
        if (!texto) {return}
        const archivos = await this.dataLocalService.leerArchivosConfig()
        archivos.visita[0].txt_archivo = texto
        this.fotos.push(archivos.visita[0])
    }

    async guardar() {
        if (!this.visita.presupuesto) {
            this.uiService.alertaInformativa('No se encuentra la información del presupuesto. Sincronice los datos básicos del proyecto.')
            return
        }
        
        if (!this.fotos || this.fotos.length === 0 || (!this.fotos[0].nueva && !this.fotos[0].enviada && !this.fotos[0].nid_archivo)) {
            this.uiService.alertaInformativa('Falta agregar la fotografía.')
            return
        }

        this.visita.fotos = this.fotos
        this.visita.cambio = true
        this.visita.incompleto = this.evaluarIncompleto()
        
        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarVisita(this.visita, this.visita.index, this.nueva)
        await this.uiService.dismissLoading()
        this.modalController.dismiss()
    }

    evaluarIncompleto() {
        if (!this.visita.fotos || this.visita.fotos.length === 0 ) {return true}
        if (!this.visita.fotos[0].nueva && !this.visita.fotos[0].enviada && !this.visita.fotos[0].nid_archivo) {return true}
    }

    salir() {
        this.modalController.dismiss()
    }
}
