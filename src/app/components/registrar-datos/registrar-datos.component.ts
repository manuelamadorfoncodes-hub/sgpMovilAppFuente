import { Component, Input, OnInit } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-registrar-datos',
    templateUrl: './registrar-datos.component.html',
    styleUrls: ['./registrar-datos.component.scss'],
})
export class RegistrarDatosComponent  implements OnInit {

    @Input() datos: any
    @Input() titulo: 'Registrar datos'
    @Input() idPopover = 1
    
    constructor(private popoverController: PopoverController) { }

//     {name: 'dni', type: 'number', value: (datos ? datos.dni : null), placeholder: 'Número de DNI', max: 99999999, min: 10000000, attributes: {maxlength: 8, size: 8}},
//     {name: 'apePat', type: 'text', value: (datos ? datos.apePat : null), placeholder: 'Apellido Paterno', attributes: {maxlength: 40}},
//     {name: 'apeMat', type: 'text', value: (datos ? datos.apeMat : null), placeholder: 'Apellido Materno', attributes: {maxlength: 40}},
//     {name: 'nombres', type: 'text', value: (datos ? datos.nombres : null), placeholder: 'Nombres', attributes: {maxlength: 80}}
// ]
// if (esParticipante) {
//     inputs.push({name: 'cargo', type: 'text', value: (datos ? datos.cargo : null), placeholder: 'Cargo', attributes: {maxlength: 100}})
//     inputs.push({name: 'institucion', type: 'textarea', value: (datos ? datos.institucion : null), placeholder: 'Institución', attributes: {maxlength: 200}})
// }

    ngOnInit() {
        console.log('this.datos :>> ', this.datos);
    }

    validaData() {
        if (!this.datos.dni) {return false}
        if (this.datos.dni.length !== 8) {return false}
        if (!this.datos.nombres) {return false}
        return true
    }

    aceptar() {
        this.popoverController.dismiss(this.datos)
    }

    cancelar() {
        this.popoverController.dismiss();
    }

}
