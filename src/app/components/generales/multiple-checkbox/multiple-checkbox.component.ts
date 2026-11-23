import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-multiple-checkbox',
  templateUrl: './multiple-checkbox.component.html',
  styleUrls: ['./multiple-checkbox.component.scss'],
})
export class MultipleCheckboxComponent  implements OnInit  {

    @ViewChild('popover') popover
    @Input() etiqueta = ''
    @Input() items: any[] = []
    @Input() valorTexto = 'txt_tipo'
    @Input() valorId = 'cod_tipo'
    @Input() valor = ''
    @Input() idSelect = ''
    @Input() customPlaceholder = 'Seleccione'
    @Input() multiple = false
    @Input() dobleColumna = false
    @Output() valorChange = new EventEmitter<any>()

    isOpenPopover = false
    lista: any = []
    
    constructor() {}

    ngOnInit() {
        this.items.forEach(item => {
            item.seleccionado = false
            if (this.valor && this.valor.includes(item[this.valorId])) {item.seleccionado = true}
        })
        
        if (this.dobleColumna) {
            let index = 0
            while (index < this.items.length) {
                this.lista.push({
                    izquierda: this.items[index],
                    derecha: (index + 1 < this.items.length) ? this.items[index + 1] : null
                })
                index = index + 2
            }
        }
    }
    
    actualizaValor() {
        if (this.dobleColumna) {
            let idx = 0
            for (let index = 0; index < this.lista.length; index++) {
                this.items[idx].seleccionado = this.lista[index].izquierda.seleccionado
                if (this.lista[index].derecha) {this.items[idx + 1].seleccionado = this.lista[index].derecha.seleccionado}
                idx = idx + 2
            }
        }

        this.valor = this.items.filter(item => item.seleccionado).map(val => val[this.valorId]).toString()
        console.log('MultipleCheckboxComponent actualizaValor this.valor :>> ', this.valor);
        this.valorChange.emit(this.valor);
    }
}
