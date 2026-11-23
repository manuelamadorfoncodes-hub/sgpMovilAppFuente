import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-multiple-data',
  templateUrl: './multiple-data.component.html',
  styleUrls: ['./multiple-data.component.scss'],
})
export class MultipleDataComponent implements OnInit  {

    @ViewChild('popover') popover
    @Input() etiqueta = ''
    @Input() items: any[] = []
    @Input() nombreTexto = 'txt_tipo'
    @Input() nombreCodigo = 'cod_tipo'
    @Input() nombreValor = ''
    @Input() valores = ''
    @Input() codigos = ''
    // @Input() valor: any
    // @Input() data: any // {codigos, valores} (datos separados por comas)
    @Input() idSelect = ''
    @Input() customPlaceholder = ''
    @Input() tipo = 'yesNoRadio'
    @Input() tituloColunma = ''
    @Output() valorChange = new EventEmitter<any>()

    isOpenPopover = false
    lista: any = []
    
    constructor() {}

    ngOnInit() {
        if (!this.nombreValor) {
            if (this.tipo === 'yesNoRadio') {this.nombreValor = 'dato'}
            if (this.tipo === 'numberInputTot' || this.tipo === 'numberInput') {this.nombreValor = 'numero'}
        }

        if (!this.customPlaceholder) {
            if (this.tipo === 'numberInputTot' || this.tipo === 'numberInput') {this.customPlaceholder = 'Cantidad'}
        }
        
        const codigos = this.codigos?.split(',')
        const valores = this.valores?.split(',')
        if (codigos && valores) {
            this.items.forEach(item => {
                const index = codigos.findIndex(codigo => codigo === item.cod_tipo)
                item[this.nombreValor] = valores[index]
            });
        }
    }
    
    actualizaValor() {
        console.log('this.nombreValor :>> ', this.nombreValor);

        const codigos = this.items.map(val => val[this.nombreCodigo]).toString()
        const valores = this.items.map(val => val[this.nombreValor]).toString()
        let incompleto = false
        for (let index = 0; index < this.items.length; index++) {
            if (!this.items[index][this.nombreValor] && this.items[index][this.nombreValor] !== 0) {incompleto = true}
        }

        const data = {codigos, valores, incompleto}
        console.log('MultipleDataComponent actualizaValor codigos, valores :>> ', codigos, valores, incompleto);
        this.valorChange.emit(data);
    }

    calculaTotal(){
        if (this.items && this.items.length > 0) {
            let total = 0
            this.items.forEach(item => {
                total = total + (item[this.nombreValor] ? parseInt(item[this.nombreValor]) : 0)
            })
            return total

        }
    }

    validarTecla(event: KeyboardEvent) {
        const patron = /[0-9]/;
        if (!patron.test(event.key)) {
          event.preventDefault();
        }
    }

}
