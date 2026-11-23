import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Tecnologia, EtapaFase, Fase, Producto } from './../../model/usuarios';
import { Usuario, TecnologiaAvance, Variable, TecnologiaAvanceProd } from '../../model/usuarios';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { Archivo, Tipo } from '../../model/generales';
import { ActividadDetalle, PlanActividad } from '../../model/plan-actividad';
import { SamAccion } from '../../model/plan-actividad';
import { TecnologiaColectiva } from 'src/app/model/proyectos';

@Component({
    selector: 'app-tecnologia-avance',
    templateUrl: './tecnologia-avance.page.html',
    styleUrls: ['./tecnologia-avance.page.scss'],
})
export class TecnologiaAvancePage implements OnInit, OnDestroy {

    @Input() titulo: string
    @Input() usuario: Usuario
    @Input() tecnologia: Tecnologia
    @Input() index: number
    @Input() contraste: boolean
    @Input() productos: Producto[] = []
    @Input() etapas: EtapaFase[] = []
    @Input() fases: Fase[] = []
    @Input() consulta = false
    @Input() tipoObservacion: Tipo[] = []
    @Input() actividadAccion = 0 // 1-Actividad, 2-Accion, 3-Consuslta desde Actividad-Accion
    @Input() actividadAccionId: number
    @Input() planActividad: PlanActividad
    @Input() accion: SamAccion
    @Input() avanceTecColectiva = false
    @Input() tecnologiaColectiva: TecnologiaColectiva
    @Input() indexDetalle: number
    @Input() portafolio: number

    variables: Variable[] = []
    avance: TecnologiaAvance = {}
    avanceProdList: TecnologiaAvanceProd[] = []
    avanceProdBk: string[] = []
    // multiple = false
    avanceForm: FormGroup
    fotos: Archivo[] = []
    avanceParcial = 0
    avanceAcumulado = 0
    planActividadList: PlanActividad[] = []
    accionesList: SamAccion[] = []
    selectActividad = ''
    ocultarProduccion = false

    constructor(private modalController: ModalController,
        private formBuilder: FormBuilder,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        console.log('this.titulo :>> ', this.titulo);
        console.log('this.fases :>> ', this.fases);
        if (!this.avanceTecColectiva) {
            if (!this.consulta && this.tecnologia.avance) {
                this.avance = this.tecnologia.avance
            } else {
                if (this.consulta && !this.contraste && this.tecnologia.ultimoAvance) {
                    this.avance = this.tecnologia.ultimoAvance
                }
                if (this.consulta && this.contraste && this.tecnologia.ultimoSeguimiento) {
                    this.avance = this.tecnologia.ultimoSeguimiento
                }
                this.avance.codigo_expediente = this.usuario.codigo_expediente
                this.avance.nid_personal_proyecto = this.usuario.nid_personal_proyecto
                this.avance.nid_tecnologia = this.tecnologia.nid_tecnologia
                this.avance.cod_tecnologia = this.tecnologia.cod_tecnologia
                if (!this.consulta) {
                    this.avance.fec_visita = new Date()
                    this.avance.flg_informacion_contraste = this.contraste
                }
            }
        } else {
            if (!this.consulta && this.tecnologiaColectiva.detalle[this.indexDetalle].avance) {
                this.avance = this.tecnologiaColectiva.detalle[this.indexDetalle].avance
            } else {
                if (this.consulta && !this.contraste && this.tecnologiaColectiva.detalle[this.indexDetalle].ultimoAvance) {
                    this.avance = this.tecnologiaColectiva.detalle[this.indexDetalle].ultimoAvance
                }
                if (this.consulta && this.contraste && this.tecnologiaColectiva.detalle[this.indexDetalle].ultimoSeguimiento) {
                    this.avance = this.tecnologiaColectiva.detalle[this.indexDetalle].ultimoSeguimiento
                }
                this.avance.codigo_expediente = this.tecnologiaColectiva.codigo_expediente
                this.avance.cod_tecnologia = this.tecnologiaColectiva.detalle[this.indexDetalle].cod_tecnologia
                if (!this.consulta) {
                    this.avance.fec_visita = new Date()
                    this.avance.flg_informacion_contraste = this.contraste
                }
            }
        }



        if (this.avance.avanceProd) {
            this.avanceProdList = this.avance.avanceProd
        }
        this.avance.flg_informacion_contraste = this.contraste

        this.inicializaForm()

        if (this.avanceForm.get('cod_etapa').value) {
            this.fases = this.etapas.find(etapa => etapa.cod_etapa === this.avanceForm.get('cod_etapa').value).fases
            if (this.avanceForm.get('nid_fase').value > -1) {
                const fase = this.fases.find(item => item.nid_fase === this.avanceForm.get('nid_fase').value)
                const variables = fase.variables
                // this.multiple = fase.flg_multiple
                this.avanceParcial = fase.por_avance_fase
                this.avanceAcumulado = fase.por_avance_acum
                if (variables) {
                    this.obtieneVariables(variables)
                } 
            }
        }
        console.log('this.variables OJO:>> ', this.variables);

        if (this.avance.fotos) {
            this.fotos = this.avance.fotos
        }
        if (this.fotos.length === 0) {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            this.fotos = archivos.tecnologiaImpl
        }

        this.avanceProdBk = this.avanceProdList.map(item => JSON.stringify(item))
        if (this.variables[3] && this.avanceProdList) {
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
        
        if (this.actividadAccion === 0 && !this.consulta) {
            this.accionesList = await this.dataLocalService.leerAcciones()
            if (this.accionesList && this.accionesList.length > 0) {
                this.selectActividad = 'E'
                this.actividadAccion = 2
            } else {
                this.planActividadList = await this.dataLocalService.leerPlanActividades()
                if (this.planActividadList && this.planActividadList.length > 0) {
                    let tipoActividad = await (await this.dataLocalService.leerActividadParametro()).tipoActividad.filter(item => item.txt_variables)
                    tipoActividad = tipoActividad.filter(item => item.txt_variables.includes('15'))
                    this.planActividadList = this.planActividadList.filter(actividad => tipoActividad.find(tipo => tipo.tip_actividad === actividad.tip_actividad))
                    console.log('this.planActividadList :>> ', this.planActividadList)
                    if (this.planActividadList.length > 0) {this.selectActividad = 'E'}
                    this.actividadAccion = 1
                }
            }
        }
            
        console.log('this.actividadAccionId :>> ', this.actividadAccionId);
        if (this.actividadAccionId || this.actividadAccionId === 0) {
            this.avance.plan_actividad_id = this.actividadAccionId
            this.selectActividad = 'V'
        }
        console.log('this.avance.plan_actividad_id :>> ', this.avance.plan_actividad_id);
        if (this.avance.plan_actividad_id || this.avance.plan_actividad_id === 0) {
            if (this.accionesList?.length > 0) {
                this.accion = this.accionesList.find(item => (item.id === this.avance.plan_actividad_id))
            } else {
                if (this.planActividadList?.length > 0) {this.planActividad = this.planActividadList.find(item => (item.id === this.avance.plan_actividad_id))}
            }
            this.selectActividad = 'V'
            // this.obtieneActividad(this.avance.plan_actividad_id)
        }
                
        console.log('actividadAccion :>> ', this.actividadAccion);
        console.log('selectActividad :>> ', this.selectActividad);
        console.log('this.planActividad :>> ', this.planActividad);
        console.log('this.accion :>> ', this.accion);
        if (this.portafolio === 116) {this.ocultarProduccion = true}
        console.log('this.ocultarProduccion :>> ', this.ocultarProduccion);
    }

    inicializaForm() {
        if (this.avance) {
            this.avanceForm = this.formBuilder.group({
                fec_visita: [this.avance.fec_visita, [Validators.required]],
                cod_etapa: [this.avance.cod_etapa, [Validators.required]],
                nid_fase: [this.avance.nid_fase, [Validators.required]],
                est_fase: [this.avance.est_fase, [Validators.required]],
                tip_observacion: [this.avance.tip_observacion],
                txt_observacion: [this.avance.txt_observacion, [Validators.maxLength(250)]],
                num_area_riego: [this.avance.num_area_riego],
                nid_unidad_area_riego: [this.avance.nid_unidad_area_riego],
                num_area_instalada: [this.avance.num_area_instalada],
                nid_unidad_area_instalada: [this.avance.nid_unidad_area_instalada],
                num_consumo_lenha: [this.avance.num_consumo_lenha],
                num_volumen_almacenamiento: [this.avance.num_volumen_almacenamiento],
                num_arboles_plantados: [this.avance.num_arboles_plantados],
                num_logitud_construido: [this.avance.num_logitud_construido],
                nid_unidad_logitud_construido: [this.avance.nid_unidad_logitud_construido],
                // plan_actividad_id: [this.avance.plan_actividad_id]
            })
            if (this.avance.cod_etapa) {this.avanceForm.get('cod_etapa').setValue(this.avance.cod_etapa)}
            if (this.avance.nid_fase) {this.avanceForm.get('nid_fase').setValue(this.avance.nid_fase)}
        }

        this.avanceForm.get('cod_etapa').valueChanges.subscribe(valor => {
            this.fases = this.etapas.find(etapa => etapa.cod_etapa === valor).fases
            this.avanceForm.get('nid_fase').setValue(null)
            this.limpiarValores()
        })

        this.avanceForm.get('nid_fase').valueChanges.subscribe(valor => {
            if (valor || valor === 0) {

                const fase = this.fases.find(item => item.nid_fase === valor)
                const variables = fase.variables
                // this.multiple = fase.flg_multiple
                this.avanceParcial = fase.por_avance_fase
                this.avanceAcumulado = fase.por_avance_acum
                if (variables) {
                    this.obtieneVariables(variables)
                }
                this.limpiarValores()
            }
            this.avanceForm.get('est_fase').setValue(null)
        })
        
        // this.avanceForm.get('plan_actividad_id').valueChanges.subscribe(valor => { this.obtieneActividad(valor) })
    }

    // obtieneActividad(valor) {
    //     console.log('valor :>> ', valor);
    //     this.planActividad = this.planActividadList.find(item => (item.id == valor))
    //     console.log('this.planActividad :>> ', this.planActividad);       
    // }

    limpiarValores() {
        this.avanceForm.get('num_area_riego').setValue(null)
        this.avanceForm.get('nid_unidad_area_riego').setValue(null)
        this.avanceForm.get('num_area_instalada').setValue(null)
        this.avanceForm.get('nid_unidad_area_instalada').setValue(null)
        this.avanceForm.get('num_consumo_lenha').setValue(null)
        this.avanceForm.get('num_volumen_almacenamiento').setValue(null)
        this.avanceForm.get('num_arboles_plantados').setValue(null)
        this.avanceForm.get('num_logitud_construido').setValue(null)
        this.avanceForm.get('nid_unidad_logitud_construido').setValue(null)
        this.avanceProdList = []
        let existeVariablesProd = false
        const variablesProd = [2,3,6,7,8,9,10,11,12,13,15]
        variablesProd.forEach(item => {if (this.variables[item]) {existeVariablesProd = true}});
        if (existeVariablesProd) {
            const avanceProd: TecnologiaAvanceProd = {}
            this.avanceProdList.push(avanceProd)
        }
    }

    obtieneVariables(variables: Variable[]) {
        const variablesList: Variable[] = []
        for (let index = 0; index < 21; index++) {
            const variable = variables.find(item => item.cod_variable.valueOf() === (('0' + (index + 1).toString()).slice(-2)))
            variablesList.push(variable)
        }
        this.variables = variablesList
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

        this.avance.cod_etapa = this.avanceForm.get('cod_etapa').value
        this.avance.fec_visita = this.avanceForm.get('fec_visita').value
        this.avance.nid_fase = this.avanceForm.get('nid_fase').value
        this.avance.est_fase = this.avanceForm.get('est_fase').value
        this.avance.tip_observacion = this.avanceForm.get('tip_observacion').value
        this.avance.txt_observacion = this.avanceForm.get('txt_observacion').value
        this.avance.num_area_riego = this.avanceForm.get('num_area_riego').value
        this.avance.nid_unidad_area_riego = this.avanceForm.get('nid_unidad_area_riego').value
        this.avance.num_area_instalada = this.avanceForm.get('num_area_instalada').value
        this.avance.nid_unidad_area_instalada = this.avanceForm.get('nid_unidad_area_instalada').value
        this.avance.num_consumo_lenha = this.avanceForm.get('num_consumo_lenha').value
        this.avance.num_volumen_almacenamiento = this.avanceForm.get('num_volumen_almacenamiento').value
        this.avance.num_arboles_plantados = this.avanceForm.get('num_arboles_plantados').value
        this.avance.num_logitud_construido = this.avanceForm.get('num_logitud_construido').value
        this.avance.nid_unidad_logitud_construido = this.avanceForm.get('nid_unidad_logitud_construido').value
        // this.avance.plan_actividad_id = this.avanceForm.get('plan_actividad_id').value
        if (this.planActividad) {this.avance.plan_actividad_id = this.planActividad.id}
        if (this.accion) {this.avance.plan_actividad_id = this.accion.id}
        this.avance.fotos = this.fotos
        if (this.avanceProdList && this.avanceProdList.length > 0 && this.variables.length > 0) {
            for (let index = 0; index < this.avanceProdList.length; index++) {
                if (this.avanceProdList[index].nid_producto != 0) {this.avanceProdList[index].txt_producto_otro = null}
            }
            this.avance.avanceProd = this.avanceProdList
        } else {
            this.avance.avanceProd = undefined
        }
        if (this.usuario) {
            if (!this.tecnologia.avance) {
                const user = await this.dataLocalService.leerUser()
                const funcion = await this.dataLocalService.leerFuncion()
                this.avance.nid_funcion = funcion.nid_funcion
                this.avance.nid_personal = user.nidPersonal
            }

            this.usuario.tecnologias[this.index].avance = this.avance
            this.usuario.registroAvanceTec = true
            this.usuario.tecnologias[this.index].avanceIncompleto = this.informacionIncompleta()
            this.usuario.registroAvanceIncompleto = this.evaluarUsuarioIncompleto()
            this.usuario.tipoAvance = this.contraste ? 'Seguimiento' : 'Avance'
            
            console.log('this.actividadAccion :>> ', this.actividadAccion);
            if (this.actividadAccion && this.selectActividad === 'V') {
                console.log('verdadero');
                const data = {
                    avance: this.avance,
                    usuario: this.usuario
                }
                console.log('data Devuelve la información:>> ', data);
                this.modalController.dismiss(data)
            } else {
                console.log('falso');
                await this.uiService.presentLoading('Guardando...')
                await this.dataLocalService.guardarUsuario(this.usuario, false)
                console.log('this.avance.plan_actividad_id :>> ', this.avance.plan_actividad_id);
                if(this.avance.plan_actividad_id || this.avance.plan_actividad_id === 0 ) {await this.guardarPlanActividad()}
                await this.uiService.dismissLoading()
                this.modalController.dismiss();
            }
        }
            
        if (this.tecnologiaColectiva) {
            if (!this.tecnologiaColectiva.detalle[this.indexDetalle].avance) {
                const user = await this.dataLocalService.leerUser()
                const funcion = await this.dataLocalService.leerFuncion()
                this.avance.nid_funcion = funcion.nid_funcion
                this.avance.nid_personal = user.nidPersonal
            }

            this.tecnologiaColectiva.detalle[this.indexDetalle].avance = this.avance
            this.tecnologiaColectiva.detalle[this.indexDetalle].avanceIncompleto = this.informacionIncompleta()
            this.tecnologiaColectiva.detalle[this.indexDetalle].cambioAvance = true
            await this.uiService.presentLoading('Guardando...')
            await this.dataLocalService.guardarTecnologiaColectiva(this.tecnologiaColectiva, this.index)
            await this.uiService.dismissLoading()
            this.modalController.dismiss();
        }
    }

    async guardarPlanActividad() {
        console.log('entra guardarPlanActividad');
        if(this.avance.plan_actividad_id || this.avance.plan_actividad_id === 0) {
            const actividadDetalle: ActividadDetalle = {
                codigo_expediente: this.usuario.codigo_expediente,
                nid_persona: this.usuario.nid_personal_proyecto,
                txt_documento_identidad: this.usuario.txt_documento_identidad,
                txt_apellido_paterno: this.usuario.txt_apellido_paterno,
                txt_apellido_materno: this.usuario.txt_apellido_materno,
                txt_nombres: this.usuario.txt_nombres,
                index: this.usuario.id,
                nid_tecnologia: this.tecnologia.nid_tecnologia,
                cod_tecnologia: this.tecnologia.cod_tecnologia,
                fec_detalle: this.avance.fec_visita,
                txt_tecnologia: this.tecnologia.txt_tecnologia,
                txt_partida: this.tecnologia.txt_partida,
                cod_variable: '15',
                est_detalle: 'R',
                avanceIncompleto: this.usuario.tecnologias[this.index].avanceIncompleto
            }
            if (this.planActividad) {
                const actividadList = await this.dataLocalService.leerPlanActividades()
                const indexAct = actividadList.findIndex(item => item.id === this.planActividad.id)
                console.log('this.planActividad guardarPlanActividad:>> ', this.planActividad);
                if (this.planActividad.actividadEjecutada?.avanceTecnologia && this.planActividad.actividadEjecutada.avanceTecnologia.length > 0) {
                    const index = this.planActividad.actividadEjecutada.avanceTecnologia.findIndex(item =>
                        item.codigo_expediente === actividadDetalle.codigo_expediente &&
                        item.nid_persona === actividadDetalle.nid_persona &&
                        item.nid_tecnologia === actividadDetalle.nid_tecnologia)
                    console.log('index :>> ', index);
                    if (index >= 0) {
                        this.planActividad.actividadEjecutada.avanceTecnologia[index] = actividadDetalle
                    } else {
                        this.planActividad.actividadEjecutada.avanceTecnologia.push(actividadDetalle)
                    }
                } else {
                    this.planActividad.actividadEjecutada.avanceTecnologia = [actividadDetalle]
                }
                this.planActividad.actividadEjecutadaCambio = true
                await this.dataLocalService.guardarPlanActividad(this.planActividad)
                console.log('actividadDetalle guardarPlanActividad:>> ', actividadDetalle);
            }
            
            if (this.accion) {
                const accionesList = await this.dataLocalService.leerAcciones()
                const indexAcc = accionesList.findIndex(item => item.id === this.accion.id)
                console.log('this.accion guardarPlanActividad:>> ', this.accion);
                if (this.accion.actividad.avanceTecnologia && this.accion.actividad.avanceTecnologia.length > 0) {
                    const index = this.accion.actividad.avanceTecnologia.findIndex(item =>
                        item.codigo_expediente === actividadDetalle.codigo_expediente &&
                        item.nid_persona === actividadDetalle.nid_persona &&
                        item.nid_tecnologia === actividadDetalle.nid_tecnologia)
                    console.log('index :>> ', index);
                    if (index >= 0) {
                        this.accion.actividad.avanceTecnologia[index] = actividadDetalle
                    } else {
                        this.accion.actividad.avanceTecnologia.push(actividadDetalle)
                    }
                } else {
                    this.accion.actividad.avanceTecnologia = [actividadDetalle]
                }
                this.accion.actividadCambio = true
                await this.dataLocalService.guardarAccionActividad(this.accion, indexAcc)
                console.log('actividadDetalle guardarPlanActividad:>> ', actividadDetalle);
            }
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
        if (this.variables[0] && (!this.avance.num_area_riego || !this.avance.nid_unidad_area_riego)) {return true}
        if (this.variables[1] && (!this.avance.num_area_instalada || !this.avance.nid_unidad_area_instalada)) {return true}
        if (this.variables[4] && !this.avance.num_consumo_lenha) {return true}
        if (this.variables[5] && !this.avance.num_volumen_almacenamiento) {return true}
        if (this.variables[19] && !this.avance.num_arboles_plantados) {return true}
        if (this.variables[20] && (!this.avance.num_logitud_construido || !this.avance.nid_unidad_logitud_construido)) {return true}
        if ((this.variables[2] || this.variables[3] || this.variables[15]) && (!this.avance.avanceProd || this.avance.avanceProd.length === 0)) {return true}
        if ((this.variables[2] || this.variables[3] || this.variables[15]) && this.avance.avanceProd && this.avance.avanceProd.length > 0) {
            for (let index = 0; index < this.avance.avanceProd.length; index++) {
                if (this.variables[2] && (!this.avance.avanceProd[index].num_unidades_produccion || !this.avance.avanceProd[index].nid_unidad_unidades_produccion)) {return true}
                if (this.variables[3] && !this.ocultarProduccion && (!this.avance.avanceProd[index].num_produccion || !this.avance.avanceProd[index].nid_unidad_produccion)) {return true}
                if (this.variables[15] && (!this.avance.avanceProd[index].nid_unidad_periodicidad)) {return true}
                if (this.variables[3] && !this.avance.avanceProd[index].nid_producto && this.avance.avanceProd[index].nid_producto !== 0) {return true}
                if (this.avance.avanceProd[index].nid_producto === 0 && !this.avance.avanceProd[index].txt_producto_otro) {return true}
            }
        }
        if (this.contraste && !this.avance.tip_observacion) {return true}
        if (!this.avance.fotos) {return true}
        if (this.avance.fotos) {
            for (let index = 0; index < this.avance.fotos.length; index++) {
                if (!this.avance.fotos[index].nueva && !this.avance.fotos[index].enviada) {return true}
            }
        }
        return false
    }

    evaluarUsuarioIncompleto() {
        for (let index = 0; index < this.usuario.tecnologias.length; index++) {
            if (this.usuario.tecnologias[index].avanceIncompleto) {return true}
        }
        return false
    }

    seleccionaActividad(actividad) {
        console.log('actividad seleccionada :>> ', actividad);
        // console.log('Current value:', JSON.stringify(ev.target.value));
        this.modalController.dismiss()
        if (this.actividadAccion === 1) {this.planActividad = actividad}
        if (this.actividadAccion === 2) {this.accion = actividad}
        // this.avanceForm.get('plan_actividad_id').setValue(actividad.id)
        // this.avance.plan_actividad_id = this.planActividad.id

    }

    async salir() {
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
                if (!this.contraste) {this.usuario.tecnologias[this.index].ultimoAvance.fotos = this.fotos}
                if (this.contraste) {this.usuario.tecnologias[this.index].ultimoSeguimiento.fotos = this.fotos}
                await this.uiService.presentLoading('Guardando...')
                const mensaje = await this.dataLocalService.guardarUsuario(this.usuario, false)
                await this.uiService.dismissLoading()
            }
        }
    }
}
