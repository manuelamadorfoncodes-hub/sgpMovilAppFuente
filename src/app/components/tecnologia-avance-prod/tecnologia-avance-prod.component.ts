import { Component, OnInit, Input } from '@angular/core';
import { Variable, TecnologiaAvanceProd, Producto, Unidad } from '../../model/usuarios';

@Component({
    selector: 'app-tecnologia-avance-prod',
    templateUrl: './tecnologia-avance-prod.component.html',
    styleUrls: ['./tecnologia-avance-prod.component.scss'],
})
export class TecnologiaAvanceProdComponent implements OnInit {

    @Input() productos: Producto[] = []
    @Input() variables: Variable[] = []
    @Input() avanceProd: TecnologiaAvanceProd = {}
    @Input() multiple = false
    @Input() index
    @Input() ocultarProduccion = false
    total: number
    unidadesPorProducto = false
    unidadesUnidProdInicial: Unidad[]
    unidadesProdInicial: Unidad[]

    constructor() { }

    ngOnInit() { 
        this.unidadesUnidProdInicial = this.avanceProd.unidadesUnidProdList
        this.unidadesProdInicial = this.avanceProd.unidadesProdList
        if (this.avanceProd.nid_producto) {
            const producto = this.productos.find(prod => prod.nid_producto === this.avanceProd.nid_producto)
            if (producto.unidadesUnidProd) {
                this.unidadesPorProducto = true
                this.avanceProd.unidadesUnidProdList = producto.unidadesUnidProd
                if (producto.unidadesProd) {this.avanceProd.unidadesProdList = producto.unidadesProd}
            } 
        }
        console.log('this.variables :>> ', this.variables);
    }

    cambiarUnidades() {
        const producto = this.productos.find(prod => prod.nid_producto === this.avanceProd.nid_producto)
        
        if (producto.unidadesUnidProd) {
            this.unidadesPorProducto = true
            this.avanceProd.unidadesUnidProdList = producto.unidadesUnidProd
            this.avanceProd.nid_unidad_unidades_produccion = null
            this.avanceProd.unidadProd = ''
            if (producto.unidadesProd) {
                this.avanceProd.unidadesProdList = producto.unidadesProd
                this.avanceProd.nid_unidad_produccion = null
                this.avanceProd.unidadProd = ''
            }

        } else {
            this.unidadesPorProducto = false
            this.avanceProd.unidadesUnidProdList = this.unidadesUnidProdInicial
            this.avanceProd.unidadesProdList = this.unidadesProdInicial
        }
    }

    cambiarUnidadUnidProd() {
        if (this.multiple && !this.unidadesPorProducto) {
            this.avanceProd.unidadesProdList = this.variables[2].unidades.find(unidad => unidad.nid_unidad === this.avanceProd.nid_unidad_unidades_produccion).unidadesProd
            this.avanceProd.nid_unidad_produccion = null
            this.avanceProd.unidadProd = ''
        }
    }

    cambiarUnidadProd() {
        if (!this.unidadesPorProducto) {
            if (!this.avanceProd.unidadesProdList) { this.avanceProd.unidadesProdList = this.variables[3].unidades}
            if (this.avanceProd.nid_unidad_produccion) {
                this.avanceProd.unidadProd = this.avanceProd.unidadesProdList.find(unidad => unidad.nid_unidad === this.avanceProd.nid_unidad_produccion).txt_unidad
            }
        }
    }

    totalProduccion() {
        return (this.avanceProd.num_autoconsumo ? this.avanceProd.num_autoconsumo : 0) + (this.avanceProd.num_semilla ? this.avanceProd.num_semilla : 0) + (this.avanceProd.num_incubacion ? this.avanceProd.num_incubacion : 0) + (this.avanceProd.num_perdida ? this.avanceProd.num_perdida : 0) + (this.avanceProd.num_cantidad_intermediarios ? this.avanceProd.num_cantidad_intermediarios : 0) + (this.avanceProd.num_cantidad_mercado ? this.avanceProd.num_cantidad_mercado : 0)
    }

    alertaProduccion() {
        if (this.totalProduccion() !== (this.avanceProd.num_produccion ? this.avanceProd.num_produccion : 0)) {
            return true
        } else {
            return false
        }
    }
}
