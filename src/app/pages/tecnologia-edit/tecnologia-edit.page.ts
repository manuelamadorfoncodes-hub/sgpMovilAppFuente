import { Component, OnInit, Input, OnDestroy, AfterContentInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Tecnologia, SolicitudTecnologia, Producto } from './../../model/usuarios';
import { Usuario, Solicitud, TecnologiaFase, TecnologiaAvance, Variable, TecnologiaAvanceProd } from '../../model/usuarios';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { Archivo } from '../../model/generales';

@Component({
    selector: 'app-tecnologia-edit',
    templateUrl: './tecnologia-edit.page.html',
    styleUrls: ['./tecnologia-edit.page.scss'],
})
export class TecnologiaEditPage implements OnInit, OnDestroy, AfterContentInit {

    @Input() titulo = 'Cambiar Tecnología'
    @Input() usuario: Usuario
    @Input() tecnologia: Tecnologia
    @Input() index: number
    @Input() ofertada: boolean
    @Input() colectiva: boolean
    @Input() nuevoUsuario: false
    @Input() consulta: false
    @Input() avanceProdListIni: string[] = []
    @Input() etapaEjecucion: boolean
    solicitud: SolicitudTecnologia = {}
    tecnologiaForm: FormGroup
    fotos: Archivo[] = []
    flgOfertada = false
    productos: Producto[] = []
    variables: Variable[] = []
    avance: TecnologiaAvance = {
        flg_informacion_contraste: false
    }
    avanceProdList: TecnologiaAvanceProd[] = []
    avanceProdBk: string[] = []
    multiple = false
    flgConAvance = false
    fechaCambio: Date
    fechaActual: any
    fechaInicio: any

    constructor(private modalController: ModalController,
        private formBuilder: FormBuilder,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        this.fechaActual = new Date().toISOString()
        if (this.usuario.fec_inicio) {
            this.fechaInicio = new Date(this.usuario.fec_inicio).toISOString()
        } else {
            this.fechaInicio = new Date((new Date(this.fechaActual)).getTime() - 24*60*60*1000).toISOString()
        }
        console.log('this.fechaActual, this.fechaInicio :>> ', this.fechaActual, this.fechaInicio);
        if (this.consulta || !this.tecnologia.solicitudTecnologia) {
            this.solicitud = {
                flg_ofertada: this.tecnologia.flg_ofertada,
                flg_situacion_inicial: false
            }
            if (this.avanceProdListIni && this.avanceProdListIni.length > 0) {
                this.avanceProdList = this.avanceProdListIni.map(item => JSON.parse(item))
            } else {
                const avanceProd: TecnologiaAvanceProd = {}
                this.avanceProdList.push(avanceProd)
            }
        } else {
            this.solicitud = this.tecnologia.solicitudTecnologia
            if (this.solicitud.situacionInicial) {
                this.avance = this.solicitud.situacionInicial
                if (this.solicitud.situacionInicial.avanceProd) {
                    this.avanceProdList = this.solicitud.situacionInicial.avanceProd
                }
            }
            if (this.solicitud.flg_con_avance) {this.flgConAvance = true}

        }
        this.flgOfertada = this.solicitud.flg_ofertada

        this.inicializaForm()

        if (this.solicitud.fotos) {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            this.fotos = this.solicitud.fotos
            this.fotos.forEach(item => {
                const foto = archivos.hogar.find(archivo => archivo.cod_archivo === item.cod_archivo)
                if (foto) {
                    item.flg_georeferencia = foto.flg_georeferencia
                    item.tip_carga = foto.tip_carga
                    item.txt_valor = foto.txt_valor
                    item.flagCargando = false
                }
            })
        } else {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            this.fotos = archivos.tecnologia
            if (this.tecnologia.situacionInicial && this.tecnologia.situacionInicial.fotos) {
                this.fotos.forEach(item => {
                    const foto = this.tecnologia.situacionInicial.fotos.find(archivo => archivo.cod_archivo === item.cod_archivo)
                    if (foto) {
                        item.nid_archivo = foto.nid_archivo
                        item.fec_archivo = foto.fec_archivo
                        item.num_latitud = foto.num_latitud
                        item.num_longitud = foto.num_longitud
                    }
                })
            }
        }
        const tecnologiaFases: TecnologiaFase[] = await this.dataLocalService.leerTecnologiaFase()
        const tecnologiaFase = tecnologiaFases.find(item => item.cod_tecnologia === this.tecnologia.cod_tecnologia)
        this.productos = tecnologiaFase.productos || []
        if (tecnologiaFase) {
            const etapas = tecnologiaFase.etapas
            if (etapas && etapas[0].fases[0].nid_fase === 0) {
                this.multiple = etapas[0].fases[0].flg_multiple
                const variables = etapas[0].fases[0].variables
                const variablesList: Variable[] = []
                if (variables) {
                    for (let index = 0; index < 16; index++) {
                        const variable = variables.find(item => item.cod_variable.valueOf() === (('0' + (index + 1).toString()).slice(-2)))
                        variablesList.push(variable)
                    }
                    this.variables = variablesList
                }
            }
        }
        this.avanceProdBk = this.avanceProdList.map(item => JSON.stringify(item))
        if (this.multiple && this.avanceProdList) {
            for (let index = 0; index < this.avanceProdList.length; index++) {
                if (this.avanceProdList[index].nid_unidad_unidades_produccion) {
                    this.avanceProdList[index].unidadesUnidProdList = this.variables[2].unidades
                    this.avanceProdList[index].unidadesProdList = this.variables[2].unidades.find(unidad => unidad.nid_unidad === this.avanceProdList[index].nid_unidad_unidades_produccion).unidadesProd
                }
                if (this.avanceProdList[index].nid_unidad_produccion) {
                    this.avanceProdList[index].unidadProd = this.avanceProdList[index].unidadesProdList.find(unidad => unidad.nid_unidad === this.avanceProdList[index].nid_unidad_produccion).txt_unidad
                }
            }
        }
    }

    inicializaForm() {
        if (this.solicitud) {
            this.fechaCambio = this.solicitud.fec_cambio
            this.tecnologiaForm = this.formBuilder.group({
                fec_cambio: [this.solicitud.fec_cambio, [Validators.required]],
                flg_ofertada: [this.solicitud.flg_ofertada, [Validators.required]],
                txt_observacion: [this.solicitud.txt_observacion],
                num_area_riego: [(this.tecnologia.solicitudTecnologia && !this.consulta) ? this.avance.num_area_riego : (this.tecnologia.situacionInicial ? this.tecnologia.situacionInicial.num_area_riego : null)],
                nid_unidad_area_riego: [(this.tecnologia.solicitudTecnologia && !this.consulta) ? this.avance.nid_unidad_area_riego : (this.tecnologia.situacionInicial ? this.tecnologia.situacionInicial.nid_unidad_area_riego : null)],
                num_area_instalada: [(this.tecnologia.solicitudTecnologia && !this.consulta) ? this.avance.num_area_instalada : (this.tecnologia.situacionInicial ? this.tecnologia.situacionInicial.num_area_instalada : null)],
                nid_unidad_area_instalada: [(this.tecnologia.solicitudTecnologia && !this.consulta) ? this.avance.nid_unidad_area_instalada : (this.tecnologia.situacionInicial ? this.tecnologia.situacionInicial.nid_unidad_area_instalada : null)],
                num_consumo_lenha: [(this.tecnologia.solicitudTecnologia && !this.consulta) ? this.avance.num_consumo_lenha : (this.tecnologia.situacionInicial ? this.tecnologia.situacionInicial.num_consumo_lenha : null)],
                num_volumen_almacenamiento: [(this.tecnologia.solicitudTecnologia && !this.consulta) ? this.avance.num_volumen_almacenamiento : (this.tecnologia.situacionInicial ? this.tecnologia.situacionInicial.num_volumen_almacenamiento : null)],
            })
        }

        this.tecnologiaForm.get('flg_ofertada').valueChanges.subscribe(async valor => {
            this.flgOfertada = valor
            if (!valor && this.tecnologia.ultimoAvance) {
                const resp = await this.uiService.alertaConfirmacion('Va a desasignar una tecnología que ya registra avance. ¿Desea continuar?')
                console.log('resp :>> ', resp);
                if (resp) {
                    this.flgConAvance = true
                } else {
                    this.tecnologiaForm.get('flg_ofertada').setValue(true)
                    this.flgConAvance = false
                    this.flgOfertada = true
                }
            } else {
                this.flgConAvance = false
            }
        })
        this.tecnologiaForm.get('fec_cambio').valueChanges.subscribe(async valor => {this.fechaCambio = valor})
    }

    agregarUnidadProduccion() {
        const avanceProd: TecnologiaAvanceProd = {}
        this.avanceProdList.push(avanceProd)
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

        this.solicitud.fec_cambio = this.tecnologiaForm.get('fec_cambio').value
        this.solicitud.flg_ofertada = this.tecnologiaForm.get('flg_ofertada').value
        this.solicitud.flg_con_avance = this.flgConAvance
        this.solicitud.flg_observado = false
        this.solicitud.txt_observacion = this.tecnologiaForm.get('txt_observacion').value
        this.solicitud.fotos = this.fotos
        this.avance.num_area_riego = this.tecnologiaForm.get('num_area_riego').value
        this.avance.nid_unidad_area_riego = this.tecnologiaForm.get('nid_unidad_area_riego').value
        this.avance.num_area_instalada = this.tecnologiaForm.get('num_area_instalada').value
        this.avance.nid_unidad_area_instalada = this.tecnologiaForm.get('nid_unidad_area_instalada').value
        this.avance.num_consumo_lenha = this.tecnologiaForm.get('num_consumo_lenha').value
        this.avance.num_volumen_almacenamiento = this.tecnologiaForm.get('num_volumen_almacenamiento').value
        this.solicitud.flg_situacion_inicial = false
        if (this.variables.length > 0 && this.solicitud.flg_ofertada) {
            this.solicitud.flg_situacion_inicial = true
            if (this.avanceProdList.length > 0) {
                for (let index = 0; index < this.avanceProdList.length; index++) {
                    if (this.avanceProdList[index].nid_producto != 0) {this.avanceProdList[index].txt_producto_otro = null}
                }
            }
            this.avance.avanceProd = this.avanceProdList
            this.solicitud.situacionInicial = this.avance
        }

        if (this.nuevoUsuario) {
            this.modalController.dismiss(this.solicitud);
        } else {
            if (this.ofertada) {
                if (this.colectiva) {
                    this.usuario.tecnologiasColectivas[this.index].solicitudTecnologia = this.solicitud
                    this.usuario.tecnologiasColectivas[this.index].cambioIncompleto = this.informacionIncompleta()
                } else {
                    this.usuario.tecnologias[this.index].solicitudTecnologia = this.solicitud
                    this.usuario.tecnologias[this.index].cambioIncompleto = this.informacionIncompleta()
                }
            } else {
                this.usuario.tecnologiaNoOfertada[this.index].solicitudTecnologia = this.solicitud
                this.usuario.tecnologiaNoOfertada[this.index].cambioIncompleto = this.informacionIncompleta()
            }
            this.usuario.cambioTecnologia = true
            this.usuario.cambioTecnologiaIncompleto = this.evaluarUsuarioIncompleto()
            if (!this.usuario.solicitud) {
                let solicitud: Solicitud
                const user = await this.dataLocalService.leerUser()
                const funcion = await this.dataLocalService.leerFuncion()
                solicitud = {
                    codigo_expediente: this.usuario.codigo_expediente,
                    cod_zonal_solicitud: user.codZonal,
                    nid_personal_proyecto: this.usuario.nid_personal_proyecto,
                    est_solicitud: 'R',
                    txt_estado_solicitud: 'Sin enviar',
                    txt_tipo_cambio: null,
                    nid_funcion_solicita: funcion.nid_funcion,
                    nid_personal_solicita: user.nidPersonal,
                    fec_solicitud: new Date()
                }
                this.usuario.solicitud = solicitud
            }
            this.usuario.solicitud.est_solicitud = 'R'
            this.usuario.solicitud.txt_estado_solicitud = 'Sin enviar'
            await this.uiService.presentLoading('Guardando...')
            await this.dataLocalService.guardarUsuario(this.usuario, false)
            await this.uiService.dismissLoading()
            this.modalController.dismiss();
        }
    }

    diferenciaProduccion() {
        for (let index = 0; index < this.avanceProdList.length; index++) {
            const produccion =  (this.avanceProdList[index].num_autoconsumo ? this.avanceProdList[index].num_autoconsumo : 0) +
                (this.avanceProdList[index].num_semilla ? this.avanceProdList[index].num_semilla : 0) +
                (this.avanceProdList[index].num_incubacion ? this.avanceProdList[index].num_incubacion : 0) +
                (this.avanceProdList[index].num_perdida ? this.avanceProdList[index].num_perdida : 0) +
                (this.avanceProdList[index].num_cantidad_intermediarios ? this.avanceProdList[index].num_cantidad_intermediarios : 0) +
                (this.avanceProdList[index].num_cantidad_mercado ? this.avanceProdList[index].num_cantidad_mercado : 0)
            if (produccion !== (this.avanceProdList[index].num_produccion ? this.avanceProdList[index].num_produccion : 0)) {
                return true
            }
        }
        return false
    }

    diferenciaPrecio() {
        for (let index = 0; index < this.avanceProdList.length; index++) {
            if (this.avanceProdList[index].num_cantidad_intermediarios && !this.avanceProdList[index].imp_precio_intermediarios) {
                return true
            }
            if (this.avanceProdList[index].num_cantidad_mercado && !this.avanceProdList[index].imp_precio_mercado) {
                return true
            }
        }
        return false
    }

    informacionIncompleta() {
        if (!this.etapaEjecucion) {return false}
        if (!this.solicitud.flg_ofertada) {return false}
        if (this.tecnologia.tip_beneficio != 'C') {
            if (!this.solicitud.fotos) {return true}
            if (this.solicitud.fotos) {
                for (let index = 0; index < this.solicitud.fotos.length; index++) {
                    if (!this.solicitud.fotos[index].nueva && !this.solicitud.fotos[index].enviada && !this.solicitud.fotos[index].nid_archivo) {return true}
                }
            }
        }
        return false
    }

    evaluarUsuarioIncompleto() {
        if (!this.etapaEjecucion) {return false}
        if (this.usuario.tecnologias && this.usuario.tecnologias.length > 0) {
            for (let index = 0; index < this.usuario.tecnologias.length; index++) {
                if (this.usuario.tecnologias[index].cambioIncompleto) {return true}
            }
        }
        if (this.usuario.tecnologiasColectivas && this.usuario.tecnologiasColectivas.length > 0) {
            for (let index = 0; index < this.usuario.tecnologiasColectivas.length; index++) {
                if (this.usuario.tecnologiasColectivas[index].cambioIncompleto) {return true}
            }
        }
        if (this.usuario.tecnologiaNoOfertada && this.usuario.tecnologiaNoOfertada.length > 0) {
            for (let index = 0; index < this.usuario.tecnologiaNoOfertada.length; index++) {
                if (this.usuario.tecnologiaNoOfertada[index].cambioIncompleto) {return true}
            }
            return false
        }
    }
    
    salir() {
        if (this.avance) {this.avance.avanceProd = this.avanceProdBk.map(item => JSON.parse(item))}
        this.modalController.dismiss();
    }

    async ngOnDestroy() {
        if (this.consulta && this.fotos && this.fotos.length > 0) {
            let guardar = false
            for (let index = 0; index < this.fotos.length; index++) {
                if (this.fotos[index].descargada) {
                    guardar = true
                    this.fotos[index].descargada = false
                }
            }
            if (guardar) {
                this.usuario.tecnologias[this.index].situacionInicial.fotos = this.fotos
                await this.uiService.presentLoading('Guardando...')
                const mensaje = await this.dataLocalService.guardarUsuario(this.usuario, false)
                await this.uiService.dismissLoading()
            }
        }
    }

    async ngAfterContentInit() {
        //Called after ngOnInit when the component's or directive's content has been initialized.
        //Add 'implements AfterContentInit' to the class.
        if (this.solicitud.flg_observado && !this.solicitud.flg_ofertada && this.tecnologia.ultimoAvance && !this.solicitud.flg_con_avance) {
            const resp = await this.uiService.alertaConfirmacion('Va a desasignar una tecnología que ya registra avance. ¿Desea continuar?')
            console.log('resp :>> ', resp);
            if (resp) {
                this.flgConAvance = true
            } else {
                this.tecnologiaForm.get('flg_ofertada').setValue(true)
                this.flgConAvance = false
                this.flgOfertada = true
                console.log('this.variables :>> ', this.variables);
            }
        // } else {
        //     this.flgConAvance = false
        }
    }
}
