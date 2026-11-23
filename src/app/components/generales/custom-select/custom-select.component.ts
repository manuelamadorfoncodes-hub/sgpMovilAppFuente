import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
})
export class CustomSelectComponent  implements OnInit {

    @ViewChild('popover') popover
    @Input() etiqueta = ''
    @Input() items: any[] = []
    @Input() campo = ''
    @Input() campoValor = ''
    @Input() valor: any
    @Input() itemSeleccionado: any = {}
    @Input() idSelect = ''
    @Input() customPlaceholder = ''
    @Output() seleccionarEvent = new EventEmitter<any>();

    isOpenPopover = false
    
    constructor() { 
        console.log('this.items Constructor :>> ', this.items);
    }

    ngOnInit() {
        console.log('this.campo :>> ', this.campo);
        console.log('this.items :>> ', this.items);
        console.log('this.campoValor :>> ', this.campoValor);
        if (this.valor) {
            console.log('this.valor :>> ', this.valor);
            this.itemSeleccionado = this.items.find(item => item[this.campoValor] === this.valor)
            console.log('this.itemSeleccionado :>> ', this.itemSeleccionado);
        }
    }

    presentPopover(e: Event) {
        this.popover.event = e
        this.isOpenPopover = true
    }

    seleccionarItem(item) {
        this.itemSeleccionado = item
        // this.valor = item[this.campoValor]
        // console.log('this.itemSeleccionado :>> ', this.itemSeleccionado, this.valor)
        this.seleccionarEvent.emit(item)
        console.log('this.items :>> ', this.items);
    }

}
