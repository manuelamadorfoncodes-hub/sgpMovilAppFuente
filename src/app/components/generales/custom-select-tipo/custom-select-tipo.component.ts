import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-custom-select-tipo',
  templateUrl: './custom-select-tipo.component.html',
  styleUrls: ['./custom-select-tipo.component.scss'],
})
export class CustomSelectTipoComponent  implements OnInit  {

    @ViewChild('popover') popover
    @Input() etiqueta = ''
    @Input() items: any[] = []
    @Input() valorTexto = 'txt_tipo'
    @Input() valorId = 'cod_tipo'
    @Input() valor: any
    @Input() idSelect = ''
    @Input() customPlaceholder = 'Seleccione'
    @Input() multiple = false
    @Output() valorChange = new EventEmitter<any>();

    isOpenPopover = false
    isModalOpen = false
    valorList = []
    
    constructor() {}

    ngOnInit() {
        if (this.multiple) {this.cargarValorList()}
    }

    presentPopover(e: Event) {
        this.popover.event = e
        this.isOpenPopover = true
    }

    presentModal() {
        this.isModalOpen = true
    }

    cargarValorList() {
        this.valorList = []
        this.items.forEach(item => {
            if (this.valor?.includes(item[this.valorId])) {
                item.seleccionado = true
                this.valorList.push(item[this.valorTexto])
            }
        })
    }

    textoSeleccionado() {
        const item = this.items.find(item => item[this.valorId] === this.valor)
        return item[this.valorTexto]
    }

    actualizaValorUnico() {
        console.log('this.valor :>> ', this.valor);
        this.valorChange.emit(this.valor);
    }

    actualizaValorMultiple() {
        this.valor = this.items.filter(item => item.seleccionado).map(val => val[this.valorId]).toString()
        this.valorList = this.items.filter(item => item.seleccionado).map(val => val[this.valorTexto])
        this.valorChange.emit(this.valor);
    }

    onWillDismiss(event: Event) {
        this.isModalOpen = false
    }

    cancelar() {
        this.isModalOpen = false
    }
}
