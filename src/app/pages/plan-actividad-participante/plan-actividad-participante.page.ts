import { UiServiceService } from '../../services/ui-service.service';
import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IonList, ModalController, PopoverController } from '@ionic/angular';
import { ActividadDetalle } from '../../model/plan-actividad';
import { RegistrarDatosComponent } from '../../components/registrar-datos/registrar-datos.component';

@Component({
    selector: 'app-plan-actividad-participante',
    templateUrl: './plan-actividad-participante.page.html',
    styleUrls: ['./plan-actividad-participante.page.scss'],
})
export class PlanActividadParticipantePage implements OnInit {

    @ViewChild('lista', { static: true}) lista: IonList
    @Input() titulo = 'Registro de Participantes'
    @Input() participantes: ActividadDetalle[] = []
    @Input() botonOtro = false
    @Input() respuestaUnica = false
    textoBuscar = ''
    otroParticipante: ActividadDetalle
    participanteSeleccionado: ActividadDetalle

    constructor(private modalController: ModalController,
        private popoverController: PopoverController,
        private uiService: UiServiceService) { }

    ngOnInit() {
        this.participantes.forEach((item, index) => item.index = index)
    }

    buscar(event) {
        this.textoBuscar = event.detail.value;
    }

    async agregarParticipante() {
        this.otroParticipante = {}
        const popover = await this.popoverController.create({
            component: RegistrarDatosComponent,
            componentProps: {
                datos: {},
                titulo: 'Agregar Participante',
                cssClass: 'registrar-datos-popover',
                idPopover: 2
            }
        })
        await popover.present();
        const { data } = await popover.onDidDismiss()
        console.log('data :>> ', data);
        // const datos = await this.uiService.alertaRegistraPersona('Usuario Participante')
        if (!data) {return}

        const participante: ActividadDetalle = {
            txt_documento_identidad: data.dni,
            txt_apellido_paterno: data.apePat.toUpperCase(),
            txt_apellido_materno: data.apeMat.toUpperCase(),
            txt_nombres: data.nombres.toUpperCase(),
            txt_cargo: data.cargo,
            txt_institucion: data.institucion,
            txt_tipo: 'OTRO',
            cod_variable: '14',
            seleccionado: true,
            index: this.participantes.length
        }
        this.participantes.push(participante)
    }

    async editar(index) {
        const datos = {
            dni: this.participantes[index].txt_documento_identidad,
            apePat: this.participantes[index].txt_apellido_paterno,
            apeMat: this.participantes[index].txt_apellido_materno,
            nombres: this.participantes[index].txt_nombres,
            cargo: this.participantes[index].txt_cargo,
            institucion: this.participantes[index].txt_institucion
        }

        const popover = await this.popoverController.create({
            component: RegistrarDatosComponent,
            componentProps: {
                datos,
                titulo: 'Agregar Participante',
                cssClass: 'registrar-datos-popover',
                idPopover: 2
            }
        })
        await popover.present();
        const { data } = await popover.onDidDismiss()
        console.log('data :>> ', data);
        // const datos = await this.uiService.alertaRegistraPersona('Usuario Participante')
        if (!data) {return}

        this.participantes[index].txt_documento_identidad = data.dni
        this.participantes[index].txt_apellido_paterno = data.apePat.toUpperCase()
        this.participantes[index].txt_apellido_materno = data.apeMat.toUpperCase()
        this.participantes[index].txt_nombres = data.nombres.toUpperCase()
        this.participantes[index].txt_cargo = data.cargo
        this.participantes[index].txt_institucion = data.institucion

        this.lista.closeSlidingItems()
    }

    // eliminar(index) {
    //     this.participantes.splice(index,1)
    //     this.participantes.forEach((item, index) => item.index = index)
    // }

    guardar() {
        if (this.respuestaUnica) {
            console.log('this.participanteSeleccionado :>> ', this.participanteSeleccionado)
            this.modalController.dismiss(this.participanteSeleccionado)
        } else {
            this.modalController.dismiss(this.participantes);
        }
    }

    salir() {
        this.modalController.dismiss();
    }
}
