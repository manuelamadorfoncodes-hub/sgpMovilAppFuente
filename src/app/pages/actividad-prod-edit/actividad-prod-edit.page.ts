import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { UiServiceService } from 'src/app/services/ui-service.service';
import { DataLocalService } from 'src/app/services/data-local.service';
import { Usuario, ActividadProductiva, Solicitud, ActividadProdDetalle, Variable, Producto, LineaBase } from './../../model/usuarios';
import { Archivo, Tipo } from './../../model/generales';

@Component({
    selector: 'app-actividad-prod-edit',
    templateUrl: './actividad-prod-edit.page.html',
    styleUrls: ['./actividad-prod-edit.page.scss'],
})
export class ActividadProdEditPage implements OnInit {

    @Input() usuario: Usuario
    @Input() actividadProd: ActividadProductiva = {}
    @Input() actividad: ActividadProdDetalle = {}
    @Input() idxList: number
    @Input() index: number
    @Input() nuevo = false
    @Input() detalle = false
    @Input() consulta = false
    @Input() nuevoUsuario = false
    @Input() actividadList: ActividadProductiva[] = []
    @Input() linea = 0
    @Input() indexLinea: number
    actividadProductivaForm: FormGroup
    actividadProdNuevas: ActividadProductiva[] = []
    variables: Variable[] = []
    productos: Producto[] = []
    fines: Tipo[] = []
    usos: Tipo[] = []
    fotos: Archivo[] = []
    otra = false
    otroProducto = false
    // consulta = false

    constructor(private formBuilder: FormBuilder,
        private modalController: ModalController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        console.log('this.indexLinea :>> ', this.indexLinea);
        console.log('this.usuario :>> ', this.usuario);
        console.log('this.actividadList :>> ', this.actividadList);
        this.inicializaForm()
        console.log('this.nuevo :>> ', this.nuevo);
        if (this.nuevo) {
            this.actividad.fec_visita = new Date()
            this.actividad.nid_linea = this.linea
            // if (this.linea) {this.actividad.nid_linea = this.linea}
            console.log('this.detalle :>> ', this.detalle);
            if (!this.detalle) {
                const actividadProdNuevas = await this.dataLocalService.leerActividadProductiva()
                console.log('this.nuevoUsuario :>> ', this.nuevoUsuario);
                if (!this.nuevoUsuario) {
                    console.log('this.linea :>> ', this.linea);
                    if (this.linea === 1) {
                        // console.log('this.usuario.lineaBase[this.indexLinea]?.actividadesProductivas :>> ', this.usuario.lineaBase[this.indexLinea]?.actividadesProductivas);
                        // this.actividadList = this.usuario.lineaBase[this.indexLinea]?.actividadesProductivas
                    } else {
                        this.actividadList = this.usuario.actividadesProductivas
                    }
                }
                actividadProdNuevas.map(item => {
                    if ((!this.actividadList.find(actividad => actividad.nid_actividad === item.nid_actividad) || item.nid_actividad === 0)) {this.actividadProdNuevas.push(item)}
                })
            } else {
                this.actividad.nid_actividad = this.actividadProd.nid_actividad
                this.actividad.txt_actividad = this.actividadProd.txt_actividad
            }
        } else {

        }
        if (this.detalle) {
            if (!this.actividadProd.variables) {
                const actividadesProdConfig = await this.dataLocalService.leerActividadProductiva()
                const activProd = actividadesProdConfig.find(item => this.actividadProd.nid_actividad === item.nid_actividad)
                this.actividadProd.variables = activProd.variables
                this.actividadProd.productos = activProd.productos
                this.actividadProd.fines = activProd.fines
            }
            this.obtieneVariables(this.actividadProd.variables)
            const productos = this.actividadProd.productos
            if (productos) {
                // console.log('productos :>> ', productos);
                productos.map(item => {
                    if (item.nid_producto == 0) {
                        // console.log('item 1:>> ', item);
                        this.productos.push(item)
                    } else {
                        if (this.actividad && this.actividad.nid_producto && this.actividad.nid_producto === item.nid_producto) {
                            // console.log('item 2:>> ', item);
                            this.productos.push(item)
                        }
                        if (!this.actividadProd.actividadDetalle.find(actividad => actividad.nid_producto === item.nid_producto )) {
                            // console.log('item 3:>> ', item);
                            this.productos.push(item)
                        }
                    }
                })
                if (this.actividad && this.actividad.nid_producto === 0) {this.otroProducto = true}
            }

            if (this.productos && this.productos.length > 0) {this.actividadProductivaForm.get('nid_producto').setValidators([Validators.required])}
            
            if (this.actividad.nid_actividad === 0) {this.otra = true}

            if (this.actividadProd.fines) {
                this.fines = this.actividadProd.fines
                if (this.actividad.cod_fines) {this.usos = this.fines.find(item => item.cod_tipo === this.actividad.cod_fines).subTipos}
            }
        }

        if (this.actividadProd.fotos) {this.fotos = this.actividadProd.fotos}
        if (this.fotos.length === 0) {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            this.fotos = archivos.actProductiva
        }
        // if (this.linea > 0 && !(this.indexLinea>=0) && this.actividadList.length > 0) {
        //     this.indexLinea = this.usuario.lineaBase.findIndex(item => item.nidLinea === this.linea)
        //     if (this.indexLinea < 0) {this.indexLinea = 0}
        // }
    }

    inicializaForm() {
        if (this.actividad) {
            this.actividadProductivaForm = this.formBuilder.group({
                fec_visita: [this.actividad.fec_visita],
                nid_actividad: [this.actividad.nid_actividad],
                txt_actividad_otra: [this.actividad.txt_actividad_otra],
                nid_producto: [this.actividad.nid_producto],
                txt_producto_otro: [this.actividad.txt_producto_otro],
                txt_observacion: [this.actividad.txt_observacion, [Validators.maxLength(250)]],

                num_area_riego: [this.actividad.num_area_riego],
                nid_unidad_area_riego: [this.actividad.nid_unidad_area_riego],
                num_area_instalada: [this.actividad.num_area_instalada],
                nid_unidad_area_instalada: [this.actividad.nid_unidad_area_instalada],
                num_consumo_lenha: [this.actividad.num_consumo_lenha],
                num_volumen_almacenamiento: [this.actividad.num_volumen_almacenamiento],
                nid_unidad_periodicidad: [this.actividad.nid_unidad_periodicidad],
                num_unidades_produccion: [this.actividad.num_unidades_produccion],
                nid_unidad_unidades_produccion: [this.actividad.nid_unidad_unidades_produccion],
                num_produccion: [this.actividad.num_produccion],
                nid_unidad_produccion: [this.actividad.nid_unidad_produccion],
                num_autoconsumo: [this.actividad.num_autoconsumo],
                num_semilla: [this.actividad.num_semilla],
                num_incubacion: [this.actividad.num_incubacion],
                num_perdida: [this.actividad.num_perdida],
                num_cantidad_intermediarios: [this.actividad.num_cantidad_intermediarios],
                imp_precio_intermediarios: [this.actividad.imp_precio_intermediarios],
                num_cantidad_mercado: [this.actividad.num_cantidad_mercado],
                imp_precio_mercado: [this.actividad.imp_precio_mercado],

                num_cortes_anho: [this.actividad.num_cortes_anho, [Validators.max(99)]],
                cod_fines: [this.actividad.cod_fines],
                cod_usos: [this.actividad.cod_usos]
            })
        }

        if (this.nuevo && !this.detalle) {
            this.actividadProductivaForm.get('nid_actividad').setValidators([Validators.required]);
        }

        this.actividadProductivaForm.get('nid_actividad').valueChanges.subscribe(valor => {
            // this.fases.find(item => item.nid_fase === this.actividadForm.get('nid_fase').value)
            this.actividadProd = this.actividadProdNuevas.find(item => item.nid_actividad === valor)
            this.actividad.txt_actividad = this.actividadProd.txt_actividad
            this.productos = this.actividadProd.productos

            // this.productos.push({nid_producto: 0, txt_producto: 'Otro'})

            this.obtieneVariables(this.actividadProd.variables)
            if (valor === 0) {
                this.otra = true
            } else {
                this.otra = false
                // this.actividadProductivaForm.get('txt_atividad_otra').setValue(null)
            }
            this.fines = this.actividadProd.fines
            if (this.productos && this.productos.length > 0) {
                this.actividadProductivaForm.get('nid_producto').setValidators([Validators.required]);
            }
            console.log('this.actividadProd :>> ', this.actividadProd);
        })

        this.actividadProductivaForm.get('cod_fines').valueChanges.subscribe(valor => {
            this.usos = this.fines.find(item => item.cod_tipo === valor).subTipos
            this.actividadProductivaForm.get('cod_usos').setValue(null)
        })


        this.actividadProductivaForm.get('nid_unidad_unidades_produccion').valueChanges.subscribe(valor => {
            this.cambiarUnidadUnidProd()
        })

        this.actividadProductivaForm.get('nid_unidad_produccion').valueChanges.subscribe(valor => {
            this.cambiarUnidadProd()
        })

        this.actividadProductivaForm.get('nid_producto').valueChanges.subscribe(valor => {
            if (valor === 0) {
                this.otroProducto = true
            } else {
                this.otroProducto = false
                this.actividadProductivaForm.get('txt_producto_otro').setValue(null)
            }
        })
    }

    obtieneVariables(variables: Variable[]) {
        console.log('variables :>> ', variables);
        const variablesList: Variable[] = []
        for (let index = 0; index < 19; index++) {
            const variable = variables.find(item => item.cod_variable.valueOf() === (('0' + (index + 1).toString()).slice(-2)))
            variablesList.push(variable)
        }
        this.variables = variablesList
        console.log('this.variables :>> ', this.variables);
    }

    async guardar() {
        if (this.variables[3] && this.diferenciaProduccion()) {
            await this.uiService.alertaInformativa('La producción no es igual al total del destino de la producción. No se guardó el registro.')
            return
        }
        if (this.variables[3] && this.diferenciaPrecio()) {
            await this.uiService.alertaInformativa('Falta registrar el precio de venta. No se guardó el registro.')
            return
        }

        this.actividad.cambio = true

        this.actividad.txt_actividad_otra = this.actividadProductivaForm.get('txt_actividad_otra').value
        this.actividad.nid_producto = this.actividadProductivaForm.get('nid_producto').value
        this.actividad.txt_producto_otro = this.actividadProductivaForm.get('txt_producto_otro').value
        if (this.actividad.nid_producto) {this.actividad.txt_producto = this.productos.find(tipo => tipo.nid_producto === this.actividad.nid_producto).txt_producto}
        this.actividad.txt_observacion = this.actividadProductivaForm.get('txt_observacion').value

        this.actividad.num_area_riego = this.actividadProductivaForm.get('num_area_riego').value
        this.actividad.nid_unidad_area_riego = this.actividadProductivaForm.get('nid_unidad_area_riego').value
        this.actividad.num_area_instalada = this.actividadProductivaForm.get('num_area_instalada').value
        this.actividad.nid_unidad_area_instalada = this.actividadProductivaForm.get('nid_unidad_area_instalada').value
        this.actividad.num_consumo_lenha = this.actividadProductivaForm.get('num_consumo_lenha').value
        this.actividad.num_volumen_almacenamiento = this.actividadProductivaForm.get('num_volumen_almacenamiento').value
        this.actividad.nid_unidad_periodicidad = this.actividadProductivaForm.get('nid_unidad_periodicidad').value
        this.actividad.num_unidades_produccion = this.actividadProductivaForm.get('num_unidades_produccion').value
        this.actividad.nid_unidad_unidades_produccion = this.actividadProductivaForm.get('nid_unidad_unidades_produccion').value
        this.actividad.num_produccion = this.actividadProductivaForm.get('num_produccion').value
        this.actividad.nid_unidad_produccion = this.actividadProductivaForm.get('nid_unidad_produccion').value
        this.actividad.num_autoconsumo = this.actividadProductivaForm.get('num_autoconsumo').value
        this.actividad.num_semilla = this.actividadProductivaForm.get('num_semilla').value
        this.actividad.num_incubacion = this.actividadProductivaForm.get('num_incubacion').value
        this.actividad.num_perdida = this.actividadProductivaForm.get('num_perdida').value
        this.actividad.num_cantidad_intermediarios = this.actividadProductivaForm.get('num_cantidad_intermediarios').value
        this.actividad.imp_precio_intermediarios = this.actividadProductivaForm.get('imp_precio_intermediarios').value
        this.actividad.num_cantidad_mercado = this.actividadProductivaForm.get('num_cantidad_mercado').value
        this.actividad.imp_precio_mercado = this.actividadProductivaForm.get('imp_precio_mercado').value
        this.actividad.num_cortes_anho = this.actividadProductivaForm.get('num_cortes_anho').value
        this.actividad.cod_fines = this.actividadProductivaForm.get('cod_fines').value
        this.actividad.cod_usos = this.actividadProductivaForm.get('cod_usos').value
        if (this.actividad.nid_producto === 0) {this.actividad.txt_producto = null}
        if (this.fotos) {
            this.actividadProd.fotos = this.fotos
            for (let index = 0; index < this.fotos.length; index++) {
                if (this.fotos[index].nueva) {this.actividadProd.cambioFoto = true}
            }
        }
        if (!this.detalle) {this.actividadProd.incompleto = this.informacionIncompleta()}
        if (this.nuevo || this.detalle) {this.actividad.incompleto = this.informacionIncompletaDet()}
        if (this.nuevo) {
            this.actividad.codigo_expediente = this.usuario.codigo_expediente
            if (!this.nuevoUsuario) {this.actividad.nid_personal_proyecto = this.usuario.nid_personal_proyecto}
            if (!this.actividadProd.actividadDetalle) {this.actividadProd.actividadDetalle = []}
            this.actividadProd.actividadDetalle.push(this.actividad)
            if (this.detalle) {
                this.actividadList[this.idxList] = this.actividadProd
            } else {
                this.actividad.nid_actividad = this.actividadProductivaForm.get('nid_actividad').value
                this.actividadList.push(this.actividadProd)
            }
        } else {
            this.actividadList[this.idxList].actividadDetalle[this.index] = this.actividad
        }

        if (this.nuevoUsuario) {
            this.modalController.dismiss(this.actividadList)
        } else {
            if (this.linea > 0) {
                // console.log('this.usuario.lineaBase :>> ', this.usuario.lineaBase);
                if (!this.usuario.lineaBase ) {
                    this.usuario.lineaBase = []
                    const lineaSalida: LineaBase = {nidLinea: this.linea}
                    this.indexLinea = this.usuario.lineaBase.push(lineaSalida) - 1
                    console.log('this.usuario.lineaBase :>> ', this.usuario.lineaBase);
                    console.log('this.indexLinea :>> ', this.indexLinea);
                } 
                // this.usuario.lineaBase[this.indexLinea].actividadesProductivas = this.actividadList
                this.usuario.lineaBase[this.indexLinea].actividadesProductivas = this.actividadList
                this.usuario.lineaBase[this.indexLinea].cambioActividadProd = true
                this.usuario.lineaBase[this.indexLinea].actividadProdIncompleto = this.evaluarUsuarioIncompleto()
            } else {
                this.usuario.cambioActividadProd = true
                this.usuario.actividadProdIncompleto = this.evaluarUsuarioIncompleto()
            }
    
            await this.uiService.presentLoading('Guardando...')
            await this.dataLocalService.guardarUsuario(this.usuario, false)
            await this.uiService.dismissLoading()
            this.modalController.dismiss()
        }
    }

    cambiarUnidadUnidProd() {
        if (this.variables[2].unidades) {
            const unidades = this.variables[2].unidades.find(unidad => unidad.nid_unidad ===  this.actividadProductivaForm.get('nid_unidad_unidades_produccion').value).unidadesProd
            if (unidades) {this.actividad.unidadesUnidProdList = unidades}
            // this.actividad.unidadesUnidProdList = this.variables[2].unidades.find(unidad => unidad.nid_unidad ===  this.actividadProductivaForm.get('nid_unidad_unidades_produccion').value).unidadesProd

            this.actividadProductivaForm.get('nid_unidad_produccion').setValue(null)// = undefined
            this.actividad.unidadProd = ''
        }
    }

    cambiarUnidadProd() {
        if (!this.actividad.unidadesUnidProdList) { this.actividad.unidadesUnidProdList = this.variables[3].unidades}
        if (this.actividadProductivaForm.get('nid_unidad_produccion').value) {
            this.actividad.unidadProd = this.actividad.unidadesUnidProdList.find(unidad => unidad.nid_unidad === this.actividadProductivaForm.get('nid_unidad_produccion').value).txt_unidad
        }
    }

    totalProduccion() {
        return (this.actividadProductivaForm.get('num_autoconsumo').value ? this.actividadProductivaForm.get('num_autoconsumo').value : 0) +
            (this.actividadProductivaForm.get('num_semilla').value ? this.actividadProductivaForm.get('num_semilla').value : 0) +
            (this.actividadProductivaForm.get('num_incubacion').value ? this.actividadProductivaForm.get('num_incubacion').value : 0) +
            (this.actividadProductivaForm.get('num_perdida').value ? this.actividadProductivaForm.get('num_perdida').value : 0) +
            (this.actividadProductivaForm.get('num_cantidad_intermediarios').value ? this.actividadProductivaForm.get('num_cantidad_intermediarios').value : 0) +
            (this.actividadProductivaForm.get('num_cantidad_mercado').value ? this.actividadProductivaForm.get('num_cantidad_mercado').value : 0)
    }

    totalSoles() {
        return ((this.actividadProductivaForm.get('num_cantidad_intermediarios').value ? this.actividadProductivaForm.get('num_cantidad_intermediarios').value : 0) *
            (this.actividadProductivaForm.get('imp_precio_intermediarios').value ? this.actividadProductivaForm.get('imp_precio_intermediarios').value : 0)) +
            ((this.actividadProductivaForm.get('num_cantidad_mercado').value ? this.actividadProductivaForm.get('num_cantidad_mercado').value : 0) *
            (this.actividadProductivaForm.get('imp_precio_mercado').value ? this.actividadProductivaForm.get('imp_precio_mercado').value : 0))
    }

    alertaProduccion() {
        if (this.totalProduccion() !== (this.actividadProductivaForm.get('num_produccion').value ? this.actividadProductivaForm.get('num_produccion').value : 0)) {
            return true
        } else {
            return false
        }
    }

    diferenciaProduccion() {
        const produccion = this.actividadProductivaForm.get('num_produccion').value
        if (produccion) {
            if (produccion !== this.totalProduccion()) {return true}
        }
        return false
    }

    diferenciaPrecio() {
            if (this.actividadProductivaForm.get('num_cantidad_intermediarios').value && !this.actividadProductivaForm.get('imp_precio_intermediarios').value) {
                return true
            }
            if (this.actividadProductivaForm.get('num_cantidad_mercado').value && !this.actividadProductivaForm.get('imp_precio_mercado').value) {
                return true
            }
        return false
    }
    
    informacionIncompleta() {
        if (!this.actividadProd.fotos) {return true}
        for (let index = 0; index < this.actividadProd.fotos.length; index++) {
            if (!this.actividadProd.fotos[index].nueva && !this.actividadProd.fotos[index].enviada) {return true}
        }
        return false
    }

    informacionIncompletaDet() {
        if (this.variables[0] && (!this.actividad.num_area_riego || !this.actividad.nid_unidad_area_riego)) {return true}
        if (this.variables[1] && (!this.actividad.num_area_instalada || !this.actividad.nid_unidad_area_instalada)) {return true}
        if (this.variables[4] && !this.actividad.num_consumo_lenha) {return true}
        if (this.variables[5] && !this.actividad.num_volumen_almacenamiento) {return true}
        if (this.variables[2] && (!this.actividad.num_unidades_produccion || !this.actividad.nid_unidad_unidades_produccion)) {return true}
        if (this.variables[3] && (!this.actividad.num_produccion || !this.actividad.nid_unidad_produccion)) {return true}
        if (this.variables[15] && (!this.actividad.nid_unidad_periodicidad)) {return true}
        if (this.variables[18] && (!this.actividad.num_cortes_anho)) {return true}
        if (this.variables[16] && (!this.actividad.cod_fines)) {return true}
        if (this.variables[17] && (!this.actividad.cod_usos)) {return true}
        return false
    }

    evaluarUsuarioIncompleto() {
        if (this.actividadList) {
            for (let index = 0; index < this.actividadList.length; index++) {
                if (this.actividadList[index].incompleto) {return true}
                const detalleList = this.actividadList[index].actividadDetalle
                for (let index = 0; index < detalleList.length; index++) {
                    if (detalleList[index].incompleto) {return true}
                }
            }
        }
        return false
    }

    salir() {
        this.modalController.dismiss();
    }
}
