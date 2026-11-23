import { UiServiceService } from './../../../services/ui-service.service';
import { Opcion } from './../../../model/generales';
import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-multiple-select',
    templateUrl: './multiple-select.component.html',
    styleUrls: ['./multiple-select.component.scss'],
})
export class MultipleSelectComponent implements OnInit {

    @Input() parametros: any

    constructor(public popoverController: PopoverController,
        public uiService: UiServiceService) { }

    ngOnInit() {
        // pregunta, -- titulo
        // opciones, -- tipo[]
        // respuestas, -- array de respuestas (cod_tipo)
        // lista, -- lista de la descripcion de las respuestas
        // flagOtro -- si selecciona Otro(especifique)
        // otro -- especifica otro
        // columnas -- número de columnas a mostrar (soporta 1-texto o 2-para registrar número)
        // datos -- array de datos (numero)
        this.parametros.opciones.forEach(opcion => {
            // if (this.parametros.respuestas && this.parametros.respuestas.includes(opcion.cod_tipo)) {
                // opcion.seleccionado = true
            // } else {
                opcion.seleccionado = false
                opcion.numero = null
            // }
        });

        if (this.parametros.respuestas) {
            for (let index = 0; index < this.parametros.respuestas.length; index++) {
                const fila = this.parametros.opciones.findIndex(item => item.cod_tipo === this.parametros.respuestas[index])
                if (fila >= 0) {
                    this.parametros.opciones[fila].seleccionado = true
                    this.parametros.opciones[fila].numero = this.parametros.datos ? (this.parametros.datos[index] ? this.parametros.datos[index] : null) : null
                }
            }
        }
    }

    validarCheck(opcion) {
        if (opcion.seleccionado) {
            this.parametros.opciones.forEach(item => {
                if (opcion.cod_tipo === '00') {
                    if (item.cod_tipo !== '00') {
                        item.seleccionado = false
                        if (item.cod_tipo === '99')  {
                            this.parametros.flagOtro = false
                            this.parametros.otro = null
                        }
                    }
                } else {
                    if (item.cod_tipo === '00') {item.seleccionado = false}
                }
            });
        } else {
            if (this.parametros.columnas === 2) {opcion.numero = null}
        }
        if (opcion.cod_tipo === '99') {
            if (opcion.seleccionado) {
                this.parametros.flagOtro = true
            } else {
                this.parametros.flagOtro = false
                this.parametros.otro = null
            }
        } 
    }

    // cambio toda la funcion
    async aceptar() {
        if (this.parametros.flagOtro && !this.parametros.otro) {
            await this.uiService.alertaInformativa('Falta llenar el campo "Especifique".')
            return
        }
        // if (this.parametros.columnas == 2 && this.parametros.datos && this.parametros.datos.length > 0) {
        if (this.parametros.columnas == 2) {
            let resp = false
            for (let index = 0; index < this.parametros.opciones.length; index++) {
                if (this.parametros.opciones[index].seleccionado && this.parametros.opciones[index].cod_tipo !== '00' && (!this.parametros.opciones[index].numero || this.parametros.opciones[index].numero <= 0)) {
                    resp = true
                }
            }
            if (resp) {
                await this.uiService.alertaInformativa('Falta llenar el importe.')
                return
            }
        }
        this.parametros.respuestas = this.parametros.opciones.filter(opcion => opcion.seleccionado).map(item => item.cod_tipo)
        this.parametros.datos = this.parametros.opciones.filter(opcion => opcion.seleccionado).map(item => item.numero)
        if (this.parametros.datos && this.parametros.datos.length > 0) {
            this.parametros.total = 0
            this.parametros.datos.forEach(item => {this.parametros.total = this.parametros.total + (item ? item : 0)})
        }
        if (this.parametros.datos && this.parametros.datos.length === 0) {this.parametros.total = null}
        this.parametros.lista = this.parametros.opciones.filter(opcion => opcion.seleccionado).map(item => {
            return {
                dato1: item.txt_tipo,
                dato2: item.numero
            }
        })

        if (this.parametros.otro) {this.parametros.lista.push({
            dato1: this.parametros.otro,
            dato2: null
        })}
        this.popoverController.dismiss(this.parametros)
    }

    cancelar() {
        this.popoverController.dismiss()
    }
}
