import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
    selector: 'app-datos-boton-modal',
    templateUrl: './datos-boton-modal.component.html',
    styleUrls: ['./datos-boton-modal.component.scss'],
})
export class DatosBotonModalComponent  implements OnInit {

    @Input() titulo = ''
    @Input() etiquetaData = ''
    @Input() etiquetaBoton = ''
    @Input() valor = ''
    @Input() idSelect = ''
    @Output() valorChange = new EventEmitter<any>();

    isBotonModalOpen = false

    constructor() { }

    ngOnInit() {}

    abrirModal() {
        this.isBotonModalOpen = true
    }

    aceptarModal() {
        this.valorChange.emit(this.valor)
        this.isBotonModalOpen = false
    }

    cancelarModal() {
        this.isBotonModalOpen = false
    }
}
