import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, Validators } from '@angular/forms'
import { IonList, ModalController, PopoverController } from '@ionic/angular'
import { UiServiceService } from './../../services/ui-service.service'
import { DataLocalService } from './../../services/data-local.service'
import { Usuario } from './../../model/usuarios'
import { NuecleoEjecutor, Proyecto } from './../../model/proyectos'
import { Archivo, Tipo } from './../../model/generales'
import { Eri } from './../../model/eri'
import { AccionActividad, ActividadDetalle, ActividadParametro, Plan, SamAccion, TipoActividad, TipoParticipante } from '../../model/plan-actividad'
import { PlanActividadParticipantePage } from '../plan-actividad-participante/plan-actividad-participante.page'
import { TecnologiaAvancePage } from '../tecnologia-avance/tecnologia-avance.page'
import { RegistrarDatosComponent } from 'src/app/components/registrar-datos/registrar-datos.component'
import { Agente } from '../../model/agentes'

@Component({
    selector: 'app-accion-actividad',
    templateUrl: './accion-actividad.page.html',
    styleUrls: ['./accion-actividad.page.scss'],
})
export class AccionActividadPage implements OnInit {
    @ViewChild('listaAvanceTec', { static: true}) listaAvanceTec: IonList
    @Input() titulo = ''
    @Input() index: number
    @Input() accion: SamAccion = {}
    @Input() nuevo = false
    avanceTecTexto: string
    actividadForm: FormGroup
    actividad: AccionActividad = {}
    planes: Plan[] = []
    tipoActividad: TipoActividad[] = []
    tipoActividadSelect: TipoActividad
    proyectos: Proyecto[] = []
    proyectosSelect: Proyecto[] = []
    proyectoCodigoList: string[] = []
    tipoParticipante: TipoParticipante[] = []
    tipoParticipanteSelect: TipoParticipante[] = []
    tipoParticipanteCodigoList: string[] = []
    participantesList: ActividadDetalle[] = []
    participantesListSelect: ActividadDetalle[] = []
    participacionFeria: ActividadDetalle[] = []
    participacionFeriaTexto: string
    eriList: Eri[] = []
    estadosEri: Tipo[] = []
    causalesEstadoEri: Tipo[] = []
    eriDetalleList: ActividadDetalle[] = []
    eriDetalleTexto: string
    // nombreEri: string
    fotos: Archivo[] = []
    cantidad = 0
    ejecutada = false
    fechaInicio: Date
    fechaTermino: Date
    fechaInicioPlan: any
    fechaFinPlan: any
    personal = []
    agenteEvaluadoList: ActividadDetalle[] = []
    agenteEvaluadoTexto: string
    agenteEvaluacion: Agente[] = []
    unidadMedida: Tipo[]
    tipoNormativa: Tipo[] = []
    tipoNormativaSelect: Tipo[] = []
    tipoNormativaList: string[] = []
    actividadParametro: ActividadParametro
    avanceTecnologia: ActividadDetalle[] = []
    avanceTecAgregar: ActividadDetalle = {}
    avanceTecEliminar: ActividadDetalle[] = []
    guardado = false
    editaFechas = true
    botonAceptarModal = true

    constructor(private formBuilder: FormBuilder,
        private modalController: ModalController,
        private popoverController: PopoverController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        console.log('ACTIVIDAD EDIT :>> ', this.accion)
        console.log('this.index :>> ', this.index);

        // if (this.nuevo) {
        //     // this.actividadEjecutada = {}
        // }
        if (this.accion.actividad) {
            this.actividad = this.accion.actividad
            // this.tipoActividadSelect = this.tipoActividad.find(item => item.tip_actividad === this.actividad.tip_actividad)
            if (this.actividad.participacionFeria) { this.participacionFeria = this.actividad.participacionFeria }
            if (this.actividad.participantes) { this.participantesList = this.actividad.participantes }
            if (this.actividad.avanceTecnologia) {
                this.avanceTecnologia = this.actividad.avanceTecnologia
                this.avanceTecTexto = JSON.stringify(this.actividad.avanceTecnologia)
            }
            if (this.actividad.eriDetalle) {
                this.eriDetalleList = this.actividad.eriDetalle
                this.eriDetalleTexto = JSON.stringify(this.actividad.eriDetalle)
            }
            if (this.actividad.participacionFeria) {
                this.participacionFeriaTexto = JSON.stringify(this.actividad.participacionFeria)
                this.participacionFeria = this.actividad.participacionFeria
            }
            if (this.actividad.agenteEvaluacion) {
                this.agenteEvaluadoTexto = JSON.stringify(this.actividad.agenteEvaluacion)
                this.agenteEvaluadoList = this.actividad.agenteEvaluacion
            }
            this.ejecutada = true
        } else {
            console.log('NO EXISTE ACTIVIDAD EJECUTADA SE ASIGNA LAS FECHAS PROGRAMADAS');
            // this.actividad.fec_inicio = this.accion.fec_inicio
            // this.actividad.fec_termino = this.accion.fec_termino
            // this.actividad.txt_proyectos = this.accion.txt_proyectos
        }
        this.inicializaDatos()
        const nidPerfil = (await this.dataLocalService.leerUser()).perfil.nidperfil
        this.actividadParametro = await this.dataLocalService.leerActividadParametro()
        this.tipoActividad = this.actividadParametro.tipoActividad.filter(actividad => actividad.txt_perfiles.split(',').findIndex(item => item == nidPerfil.toString()) > -1)
        this.tipoParticipante = this.actividadParametro.tipoParticipante
        this.unidadMedida = this.actividadParametro.unidadMedida.filter(unidad => unidad.txt_dato1)
        this.tipoNormativa = this.actividadParametro.tipoNormativa
        const eriParametro = await this.dataLocalService.leerEriParametro()
        if (eriParametro) {
            this.estadosEri = eriParametro.estadosEri
            this.causalesEstadoEri = eriParametro.causalesEstadoEri
        }
        if (this.actividad.tip_normativa) {
            this.tipoNormativaList = this.actividad.tip_normativa.split(',')
            this.tipoNormativaSelect = this.tipoNormativa.filter(item => this.tipoNormativaList.includes(item.cod_tipo))
            this.actividadForm.get('tip_normativa').setValue(this.tipoNormativaList)
        }
        if (this.accion.txt_proyectos) {
            this.proyectos = await this.dataLocalService.leerProyectos()
            this.proyectoCodigoList = this.accion.txt_proyectos.split(',')
            console.log('this.proyectoCodigoList :>> ', this.proyectoCodigoList);
            this.proyectosSelect = this.proyectos.filter(proyecto => this.proyectoCodigoList.includes(proyecto.codigo_expediente))
            console.log('this.proyectosSelect :>> ', this.proyectosSelect);
            this.proyectoCodigoList = this.proyectoCodigoList.filter(item => this.proyectosSelect.find(proyecto => proyecto.codigo_expediente === item))
            console.log('this.proyectoCodigoList :>> ', this.proyectoCodigoList);
            // this.actividadForm.get('txt_proyectos').setValue(this.proyectoCodigoList)
        }
        if (this.actividad.txt_participante) {
            this.tipoParticipanteCodigoList = this.actividad.txt_participante.split(',')
            this.tipoParticipanteSelect = this.tipoParticipante.filter(item => this.tipoParticipanteCodigoList.includes(item.tip_participante))
            this.actividadForm.get('txt_participante').setValue(this.tipoParticipanteCodigoList)
        }

        if (this.actividad.tip_actividad) { this.inicializaEjecucion(this.actividad.tip_actividad) }
        
    }

    fechaATexto (fecha: Date) {
        const nuevaFecha = new Date(fecha.toString())
        const fechaTexto = `${nuevaFecha.getFullYear()}-${('0' + (nuevaFecha.getMonth() + 1)).toString().slice(-2)}-${('0' + nuevaFecha.getDate().toString()).slice(-2)}T${('0' + nuevaFecha.getHours().toString()).slice(-2)}:${('0' + nuevaFecha.getMinutes().toString()).slice(-2)}:00-05:00`
        return fechaTexto
    }

    async inicializaDatos() {
        //El control de fecha solo acepta este formato "2023-05-01T08:31:00-05:00"
        let fechaInicioTexto
        let fechaTerminoTexto
        if (this.actividad.fec_inicio) {
            fechaInicioTexto = this.fechaATexto(this.actividad.fec_inicio)
            this.fechaInicio = new Date(this.fechaATexto(this.actividad.fec_inicio))
        }
        if (this.actividad.fec_termino) {
            fechaTerminoTexto = this.fechaATexto(this.actividad.fec_termino)
            this.fechaTermino = new Date(fechaTerminoTexto)
        }

        this.actividadForm = this.formBuilder.group({
            tip_actividad: [this.actividad.tip_actividad, [Validators.required]],
            txt_accion_actividad: [this.actividad.txt_accion_actividad],
            txt_unidad_medida: [this.actividad.txt_unidad_medida],
            num_meta: [this.actividad.num_meta],
            tip_normativa: [this.actividad.tip_normativa],
            // txt_proyectos: [this.proyectoCodigoList],
            txt_participante: [this.tipoParticipanteCodigoList],
            fec_inicio: [fechaInicioTexto, [Validators.required]],
            fec_termino: [fechaTerminoTexto],
            txt_nombre_taller: [this.actividad.txt_nombre_taller],
            txt_detalle_actividad: [this.actividad.txt_detalle_actividad],
            txt_resultado: [this.actividad.txt_resultado],
            txt_observacion: [this.actividad.txt_observacion],
            txt_estado_situacional: [this.actividad.txt_estado_situacional],
            tip_concurso: [this.actividad.tip_concurso],
            txt_codigo_concurso: [this.actividad.txt_codigo_concurso],
            num_particip_presen_concurso: [this.actividad.num_particip_presen_concurso],
            num_particip_selec_concurso: [this.actividad.num_particip_selec_concurso],
            // codigo_eri: [this.actividad.codigo_eri],
            tip_feria: [this.actividad.tip_feria],
            participacionFeriaList: this.formBuilder.array([]),
            agenteEvaluacionList: this.formBuilder.array([]),
            eriDetalleList: this.formBuilder.array([])
        });


        this.actividadForm.get('tip_actividad').valueChanges.subscribe(tipo => {
            console.log('tipo :>> ', tipo);
            this.unidadMedida = this.actividadParametro.unidadMedida.filter(unidad => unidad.txt_dato1).filter(unidad => unidad.txt_dato1.includes(tipo))
            this.fotos = []
            this.limpiarDatos()
            this.inicializaEjecucion(tipo)
        })

        this.actividadForm.get('tip_normativa').valueChanges.subscribe(tipo => {
            if (tipo) {
                this.tipoNormativaList = tipo
                this.tipoNormativaSelect = this.tipoNormativa.filter(item => tipo.includes(item.cod_tipo))
                // this.obtenerParticipantes()
            }    
        })

        // this.actividadForm.get('txt_proyectos').valueChanges.subscribe(proyectos => {
        //     if (proyectos) {
        //         this.proyectoCodigoList = proyectos
        //         this.proyectosSelect = this.proyectos.filter(item => proyectos.includes(item.codigo_expediente))
        //         this.obtenerEriList()
        //         this.obtenerParticipantes()
        //         this.obtieneAgenteEvaluado()
        //     }
        // })

        this.actividadForm.get('txt_participante').valueChanges.subscribe(tipo => {
            if (tipo) {
                this.tipoParticipanteCodigoList = tipo
                this.tipoParticipanteSelect = this.tipoParticipante.filter(item => tipo.includes(item.tip_participante))
                this.obtenerParticipantes()

            }
        })

        this.actividadForm.get('fec_inicio').valueChanges.subscribe(valor => { this.fechaInicio = valor })
        this.actividadForm.get('fec_termino').valueChanges.subscribe(valor => { this.fechaTermino = valor })
        
    }

    limpiarDatos() {
        // this.actividadForm.get('txt_proyectos').setValue(null)
        this.actividadForm.get('txt_participante').setValue(null)
        this.actividadForm.get('fec_inicio').setValue(null)
        this.actividadForm.get('fec_termino').setValue(null)
        this.actividadForm.get('txt_nombre_taller').setValue(null)
        this.actividadForm.get('txt_detalle_actividad').setValue(null)
        this.actividadForm.get('txt_resultado').setValue(null)
        this.actividadForm.get('txt_observacion').setValue(null)
        this.actividadForm.get('txt_estado_situacional').setValue(null)
        this.actividadForm.get('tip_concurso').setValue(null)
        this.actividadForm.get('txt_codigo_concurso').setValue(null)
        this.actividadForm.get('num_particip_presen_concurso').setValue(null)
        this.actividadForm.get('num_particip_selec_concurso').setValue(null)
        // this.actividadForm.get('codigo_eri').setValue(null)
        this.actividadForm.get('tip_feria').setValue(null)
        this.actividadForm.get('txt_unidad_medida').setValue(null)
        this.tipoNormativaSelect = []
        this.tipoNormativaList = []
        // this.proyectosSelect = []
        // this.proyectoCodigoList = []
        this.tipoParticipanteSelect = []
        this.tipoParticipanteCodigoList = []
        this.participantesList = [] // ojo no está en el original - planActividad

    }

    valida(campo: string) {
        if (!this.tipoActividadSelect) { return false }
        if (this.tipoActividadSelect.txt_variables) { return this.tipoActividadSelect.txt_variables.includes(campo) }
        return false
    }

    async inicializaEjecucion(tipoActividad) {
        if (!tipoActividad) { return }
        this.tipoActividadSelect = this.tipoActividad.find(item => item.tip_actividad === tipoActividad)
        console.log('this.tipoActividadSelect #####:>> ', this.tipoActividadSelect);
        if (!this.tipoActividadSelect.txt_variables) {
            await this.uiService.alertaInformativa('Tipo de actividad no válido.')
            return
        }

        if (this.actividad.fotos) {
            this.actividad.fotos.map(item => {
                if (this.tipoActividadSelect.txt_variables.includes(item.txt_valor)) { this.fotos.push(item) }
            })
        }
        if (this.eriDetalleList?.length > 0) {
            this.eriDetalleList.forEach(async item => {
                if (item.fotosDetalle?.length === 0) {
                    const archivos = await this.dataLocalService.leerArchivosConfig()
                    archivos.actividad.map(archivo => {
                        if (this.tipoActividadSelect.txt_variables.includes(archivo.txt_valor)) {item.fotosDetalle.push(archivo)}
                    })
                }
            })
        }
        console.log('this.actividad.fotos inicializaEjecucion:>> ', this.actividad.fotos);
        if (this.fotos.length === 0) {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            archivos.actividad.map(item => {
                if (this.tipoActividadSelect.txt_variables.includes(item.txt_valor)) { this.fotos.push(item) }
            })
        }
        if (this.proyectos.length === 0) {
            if (this.actividad.txt_proyectos || this.tipoActividadSelect.txt_variables.includes('51')) {
                this.proyectos = await this.dataLocalService.leerProyectos()
            }
        }
        if (this.tipoActividadSelect.txt_variables.includes('15') || this.tipoActividadSelect.txt_variables.includes('13')) {
            this.editaFechas = false
            this.calcularFechas()
        }
        this.obtenerEriList()
        this.obtenerParticipantes()
        await this.obtieneAgenteEvaluado()
        console.log('Fin inicializa Ejecución ///////');
    }

    async obtenerEriList() {
        if (!this.tipoActividadSelect) { return }
        if (this.tipoActividadSelect.txt_variables.includes('11') && this.tipoActividadSelect.txt_variables.includes('13')) { return }
        if (this.proyectoCodigoList.length === 0) { return }
        for (let index = 0; index < this.proyectoCodigoList.length; index++) {
            const eriList = await this.dataLocalService.leerEri(this.proyectoCodigoList[index])
            if (eriList) { this.eriList.push(...eriList) }
        }
    }

    // seleccionarEri(eri) {
    //     this.actividadForm.get('codigo_eri').setValue(eri)
    //     this.nombreEri = eri.txt_eri
    // }

    // get participacionFeriaFA() {
    //     return this.actividadForm.controls["participacionFeriaList"] as FormArray
    // }

    async agregarEri() {
        const lista = this.eriList.map(item => {
            return {
                label: item.txt_nri,
                type: 'radio',
                value: item
            }
        })
        const datos = await this.uiService.alertaSeleccion('Seleccionar ERI', lista)
        if (!datos) {return}
        const participacion: ActividadDetalle = {
            tip_participante_feria: 'E',
            codigo_eri: datos.codigo_nec + datos.cod_nri,
            txt_eri: datos.txt_nri,
            txt_tipo: 'FERIA',
            cod_variable: '11'
        }
        this.participacionFeria.push(participacion)
    }


    async agregarUsuario() {
        const popover = await this.popoverController.create({
            component: RegistrarDatosComponent,
            componentProps: {
                datos: {},
                titulo: 'Agregar Usuario',
                cssClass: 'registrar-datos-popover',
            }
        })
        await popover.present();
        const { data } = await popover.onDidDismiss()
        console.log('data :>> ', data);
        // const datos = await this.uiService.alertaRegistraPersona('Usuario Participante')
        if (!data) {return}
        const participacion: ActividadDetalle = {
            tip_participante_feria: 'U',
            txt_documento_identidad: data.dni,
            txt_apellido_paterno: data.apePat.toUpperCase(),
            txt_apellido_materno: data.apeMat.toUpperCase(),
            txt_nombres: data.nombres.toUpperCase(),
            txt_tipo: 'FERIA',
            cod_variable: '11'
        }
        this.participacionFeria.push(participacion)
    }

    eliminarParticipacion(index) {
        this.participacionFeria.splice(index, 1)
    }

    calcularVentaFeria() {
        let total = 0
        this.participacionFeria.forEach(item => total += item.imp_venta ? item.imp_venta : 0)
        return total
    }

    async obtenerParticipantes() {
        console.log('this.tipoActividadSelect :>> ', this.tipoActividadSelect);
        console.log('this.proyectoCodigoList :>> ', this.proyectoCodigoList);
        console.log('this.tipoParticipanteCodigoList :>> ', this.tipoParticipanteCodigoList);
        if (!this.tipoActividadSelect || !this.tipoActividadSelect.txt_variables || !this.tipoActividadSelect.txt_variables.includes('14')) { return }
        if (!this.proyectoCodigoList || this.proyectoCodigoList.length === 0) { return }
        if (!this.tipoParticipanteCodigoList || this.tipoParticipanteCodigoList.length === 0) { return }
        console.log('obtiene participantes');
        const participantesList: ActividadDetalle[] = []
        let tipoParticipanteAgente = this.tipoParticipante.filter(item => item.flg_agente)
        tipoParticipanteAgente = tipoParticipanteAgente.filter(item => this.tipoParticipanteCodigoList.includes(item.tip_participante))
        if (tipoParticipanteAgente && tipoParticipanteAgente.length > 0) {
            let agentesList: Agente[] = []
            for (let index = 0; index < this.proyectoCodigoList.length; index++) {
                let agentes = await this.dataLocalService.leerAgentesProyecto(this.proyectoCodigoList[index])
                agentes = agentes.filter(agente => agente.est_agente_proyecto === 'A')
                if (agentes) { agentesList.push(...agentes) }
            }
            agentesList = agentesList.filter(agente => tipoParticipanteAgente.find(item => item.txt_funciones.includes(agente.nid_funcion.toString())))

            agentesList.forEach(agente => {
                participantesList.push({
                    codigo_expediente: agente.codigo_expediente,
                    txt_documento_identidad: agente.txt_dni,
                    txt_apellido_paterno: agente.txt_apellido_paterno,
                    txt_apellido_materno: agente.txt_apellido_materno,
                    txt_nombres: agente.txt_nombres,
                    nid_persona: agente.nid_personal,
                    nid_funcion: agente.nid_funcion,
                    txt_cargo: agente.txt_funcion,
                    txt_tipo: 'AGENTE',
                    cod_variable: '14'
                })
            })
        }

        if (this.tipoParticipanteCodigoList.includes('NE')) {
            let neList: NuecleoEjecutor[] = []
            for (let index = 0; index < this.proyectoCodigoList.length; index++) {
                const nucleo = await this.dataLocalService.leerNucleoEjecutorProyecto(this.proyectoCodigoList[index])
                if (nucleo) { neList.push(...nucleo) }
            }

            neList.forEach(item => {
                participantesList.push({
                    codigo_expediente: item.codigo_expediente,
                    txt_documento_identidad: item.txt_documento_identidad,
                    txt_apellido_paterno: item.txt_apellido_paterno,
                    txt_apellido_materno: item.txt_apellido_materno,
                    txt_nombres: item.txt_nombres,
                    nid_persona: item.nid_persona_ne,
                    tip_cargo_ne: item.tip_cargo_ne,
                    txt_cargo: item.txt_cargo_ne,
                    txt_tipo: 'NE',
                    cod_variable: '14'
                })
            })
        }

        if (this.tipoParticipanteCodigoList.includes('U') || this.tipoParticipanteCodigoList.includes('U ')) {
            let usuarioList: Usuario[] = []
            for (let index = 0; index < this.proyectoCodigoList.length; index++) {
                const usuarios = await this.dataLocalService.leerUsuariosProyecto(this.proyectoCodigoList[index])
                if (usuarios) { usuarioList.push(...usuarios) }
            }
            usuarioList.forEach(item => {
                participantesList.push({
                    codigo_expediente: item.codigo_expediente,
                    txt_documento_identidad: item.txt_documento_identidad,
                    txt_apellido_paterno: item.txt_apellido_paterno,
                    txt_apellido_materno: item.txt_apellido_materno,
                    txt_nombres: item.txt_nombres,
                    nid_persona: item.nid_personal_proyecto,
                    // txt_cargo: 'Usuario',
                    txt_tipo: 'USUARIO',
                    cod_variable: '14'
                })
            })
        }
        if (this.tipoParticipanteCodigoList.includes('GI')) {
            console.log('Obtiene usuarios participantes');
        }


        if (this.actividad.participantes && this.actividad.participantes.length > 0) {

        }
        if (this.actividad && this.actividad.participantes && this.actividad.participantes.length > 0) {
            this.actividad.participantes.forEach((a) => {
                if (a.seleccionado) {
                    const index = participantesList.findIndex(b => (b.txt_documento_identidad === a.txt_documento_identidad && 
                        b.codigo_expediente === a.codigo_expediente && b.txt_tipo === a.txt_tipo &&
                        (a.tip_cargo_ne ? (a.tip_cargo_ne === b.tip_cargo_ne) : true) &&
                        (a.nid_funcion ? (a.nid_funcion === b.nid_funcion) : true) && 
                        a.nid_persona === b.nid_persona
                        ))
                    if (index >= 0) {
                        participantesList[index].nid_accion_actividad_det = a.nid_accion_actividad_det
                        participantesList[index].seleccionado = true
                    } else {
                        if (a.txt_tipo === 'OTRO') {participantesList.push(a)}
                    }
                }
            })
        }
        this.participantesList = participantesList
        this.contarParticipantes()
    }

    async seleccionarParticipantes() {
        const participantesBackup = JSON.stringify(this.participantesList)
        const modal = await this.modalController.create({
            component: PlanActividadParticipantePage,
            componentProps: {
                participantes: this.participantesList,
                proyectos: this.proyectos
            }
        })
        await modal.present();
        const { data } = await modal.onDidDismiss();
        if (data) {
            this.participantesList = data
        } else {
            this.participantesList = JSON.parse(participantesBackup)
        }
        this.contarParticipantes()
    }

    contarParticipantes() {
        this.cantidad = 0
        this.participantesList.forEach(item => { if (item.seleccionado) { this.cantidad++ } })
    }

    // get agenteEvaluadoFA() {
    //     return this.actividadForm.controls["agenteEvaluacionList"] as FormArray
    // }

    async agregarEvaluacion() {
        const lista = this.agenteEvaluacion.map(item => {
            return {
                label: `${item.txt_apellido_paterno} ${item.txt_apellido_materno}, ${item.txt_nombres} - ${item.txt_funcion} - ${item.codigo_expediente}`,
                type: 'radio',
                value: item
            }
        })
        const datos = await this.uiService.alertaSeleccion('Seleccionar agente a evaluar', lista)
        if (!datos) { return }
        const evaluacion = {
            tip_evaluacion: 'A',
            codigo_expediente: datos.codigo_expediente,
            nid_funcion: datos.nid_funcion,
            txt_funcion: datos.txt_funcion,
            nid_personal: datos.nid_personal,
            txt_apellido_paterno: datos.txt_apellido_paterno,
            txt_apellido_materno: datos.txt_apellido_materno,
            txt_nombres: datos.txt_nombres,
            txt_resultado: 'Sin evaluación',
            cod_variable: '12'
        }
        this.agenteEvaluadoList.push(evaluacion)
    }

    async obtieneAgenteEvaluado() {
        if (!this.tipoActividadSelect || !this.tipoActividadSelect.txt_variables.includes('12')) { return }
        if (this.proyectoCodigoList && this.proyectoCodigoList.length > 0) {
            for (let index = 0; index < this.proyectoCodigoList.length; index++) {
                let agentes = await this.dataLocalService.leerAgentesProyecto(this.proyectoCodigoList[index])
                agentes = agentes.filter(item => item.flg_externo && item.est_agente_proyecto === "A")
                if (agentes) { this.agenteEvaluacion.push(...agentes) }
            }
        }
        console.log('this.agenteEvaluacion :>> ', this.agenteEvaluacion);
    }

    eliminarEvaluacion(index) {
        this.agenteEvaluadoList.splice(index, 1)
    }

    calcularResultado(index: number) {
        console.log('this.agenteEvaluadoList[index] :>> ', this.agenteEvaluadoList[index])
        if (this.agenteEvaluadoList[index].num_puntaje < 55) {this.agenteEvaluadoList[index].txt_resultado = 'Deficiente'}
        if (this.agenteEvaluadoList[index].num_puntaje >= 55 && this.agenteEvaluadoList[index].num_puntaje < 65) {this.agenteEvaluadoList[index].txt_resultado = 'Regular'}
        if (this.agenteEvaluadoList[index].num_puntaje >= 65 && this.agenteEvaluadoList[index].num_puntaje < 80) {this.agenteEvaluadoList[index].txt_resultado = 'Bueno'}
        if (this.agenteEvaluadoList[index].num_puntaje >= 80) {this.agenteEvaluadoList[index].txt_resultado = 'Excelente'}
    }

    handleChangeNormativa(event) {
        this.tipoNormativaList = event.target.value
    }

    handleChangeProyecto(event) {
        this.proyectoCodigoList = event.target.value
    }

    handleChangeParticipante(event) {
        this.tipoParticipanteCodigoList = event.target.value
    }

    async agregarEriDetalle() {
        const lista = this.eriList.map(item => {
            return {
                label: item.txt_nri,
                type: 'radio',
                value: item
            }
        })
        const datos = await this.uiService.alertaSeleccion('Seleccionar ERI', lista)
        if (!datos) {return}
        const archivos = await this.dataLocalService.leerArchivosConfig()
        const fotosDetalle = []        
        archivos.actividad.map(item => {if (this.tipoActividadSelect.txt_variables.includes(item.txt_valor)) {fotosDetalle.push(item)}})
        console.log('datos de agregar ERI:>> ', datos, this.fotos);
        const detalle: ActividadDetalle = {
            codigo_eri: datos.codigo_nec + datos.cod_nri,
            txt_eri: datos.txt_nri,
            cod_variable: '13',
            fec_detalle: new Date(),
            fotosDetalle
        }
        this.eriDetalleList.push(detalle)
        this.calcularFechas()
    }

    eliminarEriDetalle(index) {
        this.eriDetalleList.splice(index,1)
    }

    async agregarAvanceTec() {
        this.botonAceptarModal = true
        this.avanceTecAgregar = {seleccionado: true}
        console.log('this.avanceTecAgregar :>> ', this.avanceTecAgregar);
    }

    async cancelarAvanceTec() {
        this.botonAceptarModal = true
        this.avanceTecAgregar = {seleccionado: false}
        console.log('this.avanceTecAgregar :>> ', this.avanceTecAgregar);
    }

    async seleccionarProyectoAvTec() {
        if (!this.proyectoCodigoList || this.proyectoCodigoList.length === 0) {
            this.uiService.alertaInformativa('No hay proyectos para seleccionar.')
            return
        }
        const lista = this.proyectoCodigoList.map(item => {
            return {
                label: 'Proyecto: ' + item,
                type: 'radio',
                value: item
            }
        })
        const proyecto = await this.uiService.alertaSeleccion('Seleccione el proyecto:', lista)
        if (proyecto) {
            this.avanceTecAgregar.codigo_expediente = proyecto
            this.avanceTecAgregar.txt_documento_identidad = null
            this.avanceTecAgregar.txt_apellido_paterno = null
            this.avanceTecAgregar.txt_apellido_materno = null
            this.avanceTecAgregar.txt_nombres = null
            this.avanceTecAgregar.nid_persona = null
            this.avanceTecAgregar.nid_tecnologia = null
            this.avanceTecAgregar.cod_tecnologia = null
            this.avanceTecAgregar.txt_tecnologia = null
            this.avanceTecAgregar.txt_partida = null
            this.avanceTecAgregar.index = null
            console.log('this.avanceTecAgregar :>> ', this.avanceTecAgregar)
        }
    }

    async seleccionarUsuarioAvTec() {
        if (this.avanceTecAgregar.codigo_expediente) {
            const usuarios = await this.dataLocalService.leerUsuariosProyecto(this.avanceTecAgregar.codigo_expediente)
            const lista = []
            usuarios.forEach(item => {
                if (item.est_personal === 'A') {
                    lista.push({
                        codigo_expediente: item.codigo_expediente,
                        txt_documento_identidad: item.txt_documento_identidad,
                        txt_apellido_paterno: item.txt_apellido_paterno,
                        txt_apellido_materno: item.txt_apellido_materno,
                        txt_nombres: item.txt_nombres,
                        nid_persona: item.nid_personal_proyecto,
                        index: item.id
                    })
                }
            })

            const modal = await this.modalController.create({
                component: PlanActividadParticipantePage,
                componentProps: {
                    titulo: 'Seleccione un usuario',
                    participantes: lista,
                    respuestaUnica: true
                }
            })
            await modal.present();
            const { data } = await modal.onDidDismiss()
            console.log('data :>> ', data)
            if (data) {
                this.avanceTecAgregar.txt_documento_identidad = data.txt_documento_identidad
                this.avanceTecAgregar.txt_apellido_paterno = data.txt_apellido_paterno
                this.avanceTecAgregar.txt_apellido_materno = data.txt_apellido_materno
                this.avanceTecAgregar.txt_nombres = data.txt_nombres
                this.avanceTecAgregar.nid_persona = data.nid_persona
                this.avanceTecAgregar.index = data.index
                this.avanceTecAgregar.nid_tecnologia = null
                this.avanceTecAgregar.cod_tecnologia = null
                this.avanceTecAgregar.txt_tecnologia = null
                this.avanceTecAgregar.txt_partida = null
            }
        } else {
            this.uiService.alertaInformativa('Antes debe seleccionar el proyecto.')
        }
    }

    async seleccionarTecnologiaAvTec() {
        if (this.avanceTecAgregar.nid_persona) {
            const usuario = await this.dataLocalService.leerUsuario(this.avanceTecAgregar.codigo_expediente, this.avanceTecAgregar.index)
            console.log('usuario :>> ', usuario)
            if (usuario && usuario.tecnologias) {
                const lista = usuario.tecnologias.map(item => {
                    return {
                        label: item.txt_tecnologia + ' - ' +  item.txt_partida,
                        type: 'radio',
                        value: item
                    }
                })
                const tecnologia = await this.uiService.alertaSeleccion('Seleccione la tecnología:', lista)
                console.log('tecnologia SELECCCION:>> ', tecnologia);
                if (tecnologia) {
                    this.avanceTecAgregar.nid_tecnologia = tecnologia.nid_tecnologia
                    this.avanceTecAgregar.cod_tecnologia = tecnologia.cod_tecnologia
                    this.avanceTecAgregar.txt_tecnologia = tecnologia.txt_tecnologia
                    this.avanceTecAgregar.txt_partida = tecnologia.txt_partida
                    this.avanceTecAgregar.cod_variable = '15'
                    console.log('this.avanceTecAgregar :>> ', this.avanceTecAgregar)
                    this.botonAceptarModal = false
                }
            } else {
                this.uiService.alertaInformativa('No se encontró la información del usuario seleccionado.')
            }
        } else {
            this.uiService.alertaInformativa('Antes debe seleccionar el usuario.')
        }

    }
    confirmarAvanceTec() {
        this.avanceTecAgregar.est_detalle = 'S'
        this.avanceTecnologia.push(this.avanceTecAgregar)
        this.avanceTecAgregar = {seleccionado: false}
        this.botonAceptarModal = true
        console.log('this.botonAceptarModal :>> ', this.botonAceptarModal);
    }

    async registrarAvance(indexAvanceTec) {
        if (!(this.avanceTecnologia[indexAvanceTec].est_detalle === 'R' || this.avanceTecnologia[indexAvanceTec].est_detalle === 'S')) {return}
        let contraste: boolean
        const opcion = await this.dataLocalService.leerOpcion('accionActividad')
        if (opcion.opciones.findIndex(op => op.txtnombreobjeto === 'accionSeguimTec') >= 0) {
            contraste = true
        } else {
            if (opcion.opciones.findIndex(op => op.txtnombreobjeto === 'accionAvanceTec') >= 0) {
                contraste = false
            } else {
                this.uiService.alertaInformativa('No tiene permiso para registrar seguimiento o avances de tecnologías.')
                return
            }
        }
        console.log('this.avanceTecnologia(index) :>> ', this.avanceTecnologia[indexAvanceTec])
        const tecnologiaFases = await this.dataLocalService.leerTecnologiaFase()
        const tecnologiaFase = tecnologiaFases.find(item => item.cod_tecnologia === this.avanceTecnologia[indexAvanceTec].cod_tecnologia)
        const productos = tecnologiaFase.productos || []
        let etapas = tecnologiaFase.etapas
        etapas = etapas.filter(etapa => etapa.cod_etapa !== '0')
        const usuarioParametro = await this.dataLocalService.leerUsuariosParametro()
        let titulo = ''
        if (contraste) {titulo = 'Seguimiento Tecnología'}
        if (!contraste) {titulo = 'Avance Tecnología'}
        const usuario = await this.dataLocalService.leerUsuario(this.avanceTecnologia[indexAvanceTec].codigo_expediente, this.avanceTecnologia[indexAvanceTec].index)
        console.log('usuario ANTES DE ABRIR AVANCE:>> ', usuario);
        const idxTecnologia = usuario.tecnologias.findIndex(item => item.nid_tecnologia === this.avanceTecnologia[indexAvanceTec].nid_tecnologia)
        if (this.avanceTecnologia[indexAvanceTec].avance) {usuario.tecnologias[idxTecnologia].avance = this.avanceTecnologia[indexAvanceTec].avance}
        // const usuario: Usuario = {
        //     codigo_expediente: this.avanceTecnologia[indexAvanceTec].codigo_expediente,
        //     nid_personal_proyecto: this.avanceTecnologia[indexAvanceTec].nid_persona
        // }
        console.log('this.actividad.id :>> ', this.accion.id);
        console.log('usuario.tecnologias[idxTecnologia] ANTES DE ABRIR AVANCE:>> ', usuario.tecnologias[idxTecnologia]);
        const modal = await this.modalController.create({
            component: TecnologiaAvancePage,
            componentProps: {
                titulo,
                usuario,
                tecnologia: usuario.tecnologias[idxTecnologia],
                contraste,
                index: idxTecnologia,
                productos,
                etapas,
                consulta: false,
                tipoObservacion: usuarioParametro.tipoObservacionSeguimeinto,
                actividadAccion: 2,
                actividadAccionId: this.accion.id,
                accion: this.accion
            }
        })
        await modal.present();
        const { data } = await modal.onDidDismiss()
        console.log('data :>> ', data);
        if (data) {
            this.avanceTecnologia[indexAvanceTec].avance = data.avance
            this.avanceTecnologia[indexAvanceTec].avanceIncompleto = data.incompleto
            this.avanceTecnologia[indexAvanceTec].est_detalle = 'R'
            this.avanceTecnologia[indexAvanceTec].fec_detalle = data.avance.fec_visita
            this.avanceTecnologia[indexAvanceTec].avanceIncompleto = data.usuario.tecnologias[idxTecnologia].avanceIncompleto
            this.calcularFechas()
        }
        console.log('this.avanceTecnologia[indexAvanceTec] :>> ', this.avanceTecnologia[indexAvanceTec]);
    }

    async eliminarAvanceTec(index) {
        console.log('index :>> ', index);
        if (this.avanceTecnologia[index].fec_detalle) {
            await this.uiService.alertaConfirmacion(`Se eliminará el avance/seguimiento registrado, incluidas las fotografías. ¿Está seguro que desea eliminar el registro?`).then(async (resp) => {
                if (resp) {
                    this.avanceTecEliminar.push(this.avanceTecnologia[index])
                    this.avanceTecnologia.splice(index,1)
                }
            })
        } else {
            this.avanceTecnologia.splice(index,1)
        }
        // this.listaAvanceTec.closeSlidingItems()
    }


    async guardar() {
        const ok = await this.validacionOk()
        console.log('ok :>> ', ok);
        if (!ok) { return }

        // if (this.ejecutada) {
        this.actividad.tip_actividad = this.actividadForm.get('tip_actividad').value
        this.actividad.txt_accion_actividad = this.actividadForm.get('txt_accion_actividad').value
        this.actividad.txt_unidad_medida = this.actividadForm.get('txt_unidad_medida').value
        this.actividad.num_meta = this.actividadForm.get('num_meta').value
        if (this.actividadForm.get('tip_normativa').value) {this.actividad.tip_normativa = this.actividadForm.get('tip_normativa').value.toString()}
        // if (this.actividadForm.get('txt_proyectos').value) { this.actividad.txt_proyectos = this.actividadForm.get('txt_proyectos').value.toString() }
        if (this.actividadForm.get('txt_participante').value) { this.actividad.txt_participante = this.actividadForm.get('txt_participante').value.toString() }
        if (this.editaFechas) {this.actividad.fec_inicio = this.actividadForm.get('fec_inicio').value}
        if (!this.editaFechas) {this.actividad.fec_inicio = this.fechaInicio}
        if (!this.valida('02')) {
            let fecha = this.actividad.fec_inicio.toString()
            this.actividad.fec_inicio = new Date(fecha.substring(0, 11)+'00:00'+fecha.substring(16))
        }
        if (this.editaFechas) {this.actividad.fec_termino = this.actividadForm.get('fec_termino').value}
        if (!this.editaFechas) {this.actividad.fec_termino = this.fechaTermino}
        if (!this.valida('04')) {
            let fecha = this.actividad.fec_termino.toString()
            this.actividad.fec_termino = new Date(fecha.substring(0, 11)+'00:00'+fecha.substring(16))
        }
        this.actividad.txt_nombre_taller = this.actividadForm.get('txt_nombre_taller').value
        this.actividad.txt_detalle_actividad = this.actividadForm.get('txt_detalle_actividad').value
        this.actividad.txt_resultado = this.actividadForm.get('txt_resultado').value
        this.actividad.txt_observacion = this.actividadForm.get('txt_observacion').value
        this.actividad.txt_estado_situacional = this.actividadForm.get('txt_estado_situacional').value
        // this.actividadEjecutada.flg_ejecutada = this.actividadForm.get('flg_ejecutada').value
        this.actividad.tip_concurso = this.actividadForm.get('tip_concurso').value
        this.actividad.txt_codigo_concurso = this.actividadForm.get('txt_codigo_concurso').value
        this.actividad.num_particip_presen_concurso = this.actividadForm.get('num_particip_presen_concurso').value
        this.actividad.num_particip_selec_concurso = this.actividadForm.get('num_particip_selec_concurso').value
        // this.actividad.codigo_eri = this.actividadForm.get('codigo_eri').value
        this.actividad.tip_feria = this.actividadForm.get('tip_feria').value
        this.actividad.txt_proyectos = this.proyectoCodigoList.toString()

        this.actividad.participacionFeria = this.actividadForm.get('participacionFeriaList').value
        this.actividad.agenteEvaluacion = this.actividadForm.get('agenteEvaluacionList').value
        this.actividad.participantes = this.participantesList.filter(item => item.seleccionado)
        this.actividad.avanceTecnologia = this.avanceTecnologia
        this.actividad.eriDetalle = this.eriDetalleList
        this.actividad.participacionFeria = this.participacionFeria
        this.actividad.agenteEvaluacion = this.agenteEvaluadoList

        this.actividad.fotos = this.fotos
        this.actividad.incompleto = this.evaluarIncompleto()
        console.log('this.actividad.incompleto :>> ', this.actividad.incompleto);
        this.accion.actividadCambio = true
        
        console.log('this.actividad AL GRABAR :>> ', this.accion);
        await this.uiService.presentLoading('Guardando...')
        await this.guardarAvanceTecnologia()
        this.accion.actividad = this.actividad
        await this.dataLocalService.guardarAccionActividad(this.accion, this.index)
        await this.uiService.dismissLoading()
        this.guardado = true
        this.salir()
    }

    async guardarAvanceTecnologia() {
        console.log('entra guardarAvanceTecnologia :>>>>>>>>>>>>>>>>>' );
        if (this.actividad.avanceTecnologia && this.actividad.avanceTecnologia.length > 0) {
            console.log('entra al if, para recorrer la lista');
            for (let index = 0; index < this.actividad.avanceTecnologia.length; index++) {
                if (this.actividad.avanceTecnologia[index].est_detalle === 'R' && this.actividad.avanceTecnologia[index].avance) {
                    console.log('est_detalle :>> ', this.actividad.avanceTecnologia[index].est_detalle);
                    const usuario = await this.dataLocalService.leerUsuario(this.actividad.avanceTecnologia[index].codigo_expediente, this.actividad.avanceTecnologia[index].index)
                    const idxTec = usuario.tecnologias.findIndex(item => item.nid_tecnologia === this.actividad.avanceTecnologia[index].nid_tecnologia)
                    usuario.tecnologias[idxTec].avance = this.actividad.avanceTecnologia[index].avance
                    usuario.tecnologias[idxTec].avanceIncompleto = this.actividad.avanceTecnologia[index].avanceIncompleto
                    usuario.registroAvanceIncompleto = this.evaluarUsuarioIncompleto(usuario.tecnologias)
                    usuario.registroAvanceTec = true
                    usuario.tipoAvance = this.actividad.avanceTecnologia[index].avance.flg_informacion_contraste ? 'Seguimiento' : 'Avance'
                    console.log('usuario :>> ', usuario);
                    await this.dataLocalService.guardarUsuario(usuario, false)
                    this.actividad.avanceTecnologia[index].avance = null
                }
            }
        }
        if (this.avanceTecEliminar?.length > 0) {
            this.avanceTecEliminar.forEach(async avance => {
                const usuario = await this.dataLocalService.leerUsuario(avance.codigo_expediente, avance.index)
                const idxTec = usuario.tecnologias.findIndex(item => item.nid_tecnologia === avance.nid_tecnologia)
                usuario.tecnologias[idxTec].avance = null
                usuario.tecnologias[idxTec].avanceIncompleto = null
                usuario.registroAvanceTec = this.evaluarExisteAvance(usuario)
                if (!usuario.registroAvanceTec) {usuario.tipoAvance = null}
                usuario.registroAvanceIncompleto = this.evaluarExisteAvanceIncompleto(usuario)
                await this.dataLocalService.guardarUsuario(usuario, false)
                    
                // this.listaAvanceTec.closeSlidingItems()
            });
            this.avanceTecEliminar = []
        }
    }

    evaluarExisteAvance(usuario) {
        for (let index = 0; index < usuario.tecnologias.length; index++) {
            if (usuario.tecnologias[index].avance) {return true}
        }
        return false
    }

    evaluarExisteAvanceIncompleto(usuario) {
        for (let index = 0; index < usuario.tecnologias.length; index++) {
            if (usuario.tecnologias[index].avanceIncompleto) {return true}
        }
        return false
    }

    contarRegistrosAvTec() {
        return this.avanceTecnologia?.filter(item => item.fec_detalle).length || 0
    }

    contarVisitasAvTec() {
        let lista
        if (this.tipoActividadSelect.txt_variables.includes('15')) {
            if (this.avanceTecnologia?.length > 0) {
                lista =  this.avanceTecnologia.filter((avance, index) => this.avanceTecnologia.findIndex(item => item.nid_persona === avance.nid_persona && avance.fec_detalle) === index)
            } 
        }
        if (this.tipoActividadSelect.txt_variables.includes('13')) {
            if (this.eriDetalleList?.length > 0) {
                lista =  this.eriDetalleList
            } 
        }
        return lista?.length || 0
    }

    calcularFechas() {
        let fechaIni
        let fechaFin
        let detalleList
        if (this.tipoActividadSelect.txt_variables.includes('15')) {detalleList = this.avanceTecnologia}
        if (this.tipoActividadSelect.txt_variables.includes('13')) {detalleList = this.eriDetalleList}
        if (detalleList?.length > 0) {
            detalleList.forEach(item => {
                if (item.fec_detalle) {
                    const fecha = new Date(item.fec_detalle)
                    if (!fechaIni || fechaIni > fecha) {fechaIni = fecha}
                    if (!fechaFin || fechaFin < fecha) {fechaFin = fecha}
                }
            });
            if (fechaIni) {this.fechaInicio = fechaIni}
            if (fechaFin) {this.fechaTermino = fechaFin}
        }
    }

    evaluarUsuarioIncompleto(tecnologias) {
        for (let index = 0; index < tecnologias.length; index++) {
            if (tecnologias[index].avanceIncompleto) {return true}
        }
        return false
    }

    async validacionOk() {
        console.log('Entra a validar para guardar');
        if (!this.actividadForm.get('tip_actividad').value) {
            await this.uiService.alertaInformativa('Falta registrar el tipo de actividad.')
            return false
        }
        if (!this.actividadForm.get('txt_accion_actividad').value) {
            await this.uiService.alertaInformativa('Falta registrar el nombre de la actividad.')
            return false
        }
        if (this.valida('53') && !this.actividadForm.get('txt_unidad_medida').value) {
            await this.uiService.alertaInformativa('Falta registrar la unidad de medida.')
            return false
        }
        if (this.valida('53') && !this.actividadForm.get('num_meta').value) {
            await this.uiService.alertaInformativa('Falta registrar la meta.')
            return false
        }
        if (this.valida('54')) {
            const lista = this.actividadForm.get('tip_normativa').value
            if (!lista || lista.length === 0) {
                await this.uiService.alertaInformativa('Falta registrar el tipo de normativa.')
                return false
            }
        }
        if (this.valida('56')) {
            if (!this.actividadForm.get('nid_portafolio').value) {
                await this.uiService.alertaInformativa('Falta seleccionar el portafolio.')
                return false
            }
        }
        if (this.valida('51-1')) {
            if (this.proyectosSelect.length == 0) {
                await this.uiService.alertaInformativa('Falta seleccionar los proyectos')
                return false
            }
        }
        if (this.editaFechas) {
            if (!this.actividadForm.get('fec_inicio').value) {
                await this.uiService.alertaInformativa('Falta registrar la fecha de inicio de la actividad.')
                return false
            }
            if (!this.actividadForm.get('fec_termino').value) {
                await this.uiService.alertaInformativa('Falta registrar la fecha de término de la actividad.')
                return false
            }
            if (this.actividadForm.get('fec_inicio').value > this.actividadForm.get('fec_termino').value) {
                await this.uiService.alertaInformativa('Error, la fecha de inicio no puede ser mayor que la fecha de término.')
                return false
            }
        } 
        if (this.valida('11')) {
            console.log('this.participacionFeria :>> ', this.participacionFeria);
            for (let index = 0; index < this.participacionFeria.length; index++) {
                if (!this.participacionFeria[index].imp_venta || this.participacionFeria[index].imp_venta == 0) {
                    await this.uiService.alertaInformativa('Falta registrar los montos de venta.')
                    return false
                }
            }
        }
        if (this.valida('12')) {
            for (let index = 0; index < this.agenteEvaluadoList.length; index++) {
                if (!this.agenteEvaluadoList[index].num_puntaje || this.agenteEvaluadoList[index].num_puntaje === 0) {
                    await this.uiService.alertaInformativa('Falta registrar el puntaje de la evaluación.')
                    return false
                }
                if (this.agenteEvaluadoList[index].num_puntaje > 100) {
                    await this.uiService.alertaInformativa('Los puntajes no deben superar los 100 puntos.')
                    return false
                }
            }
        }
        if (this.valida('13')) {
            if (!this.eriDetalleList || this.eriDetalleList.length === 0) {
                await this.uiService.alertaInformativa('No se ha registrado el seguimiento a los emprendimientos.')
                return false
            }
        }

        return true
    }

    evaluarIncompleto() {
        if (!this.actividadForm.get('tip_actividad').value) {return true}
        if (!this.actividadForm.get('txt_actividad').value) {return true}
        if (!this.valida('53')) {
            if (!this.actividadForm.get('txt_unidad_medida').value) {return true}
            if (!this.actividadForm.get('num_meta').value) {return true}
        }
        if (this.valida('54')) {
            const lista = this.actividadForm.get('tip_normativa').value
            if (!lista || lista.length === 0) {return true}
        }

        // if (this.valida('56')) {
        //     if (!this.actividadForm.get('nid_portafolio').value) {return false}
        // }

        if (this.valida('51-2')) {
            if (this.proyectosSelect.length == 0) {return false}
        }

        if (this.valida('52')) {
            const lista = this.actividadForm.get('txt_participante').value
            if (!lista || lista.length <= 0) {return true}
        }



        if (!this.actividadForm.get('fec_inicio').value) {return true}
        if (!this.actividadForm.get('fec_termino').value) {return true}
        if (this.actividadForm.get('fec_inicio').value > this.actividadForm.get('fec_termino').value) {return true}
        if (this.valida('05')) {
            if (!this.actividadForm.get('txt_nombre_taller').value?.trim()) {return true}
        }
        if (this.valida('06')) {
            if (!this.actividadForm.get('txt_detalle_actividad').value?.trim()) {return true}
        }
        if (this.valida('07')) {
            if (!this.actividadForm.get('txt_resultado').value?.trim()) {return true}
        }
        if (this.valida('10')) {
            if (!this.actividadForm.get('tip_concurso').value) {return true}
            if (!this.actividadForm.get('txt_codigo_concurso').value) {return true}
            if (!this.actividadForm.get('num_particip_presen_concurso').value) {return true}
            if (!this.actividadForm.get('num_particip_selec_concurso').value) {return true}
        }

        if (this.valida('12')) {
            if (this.agenteEvaluadoList.length == 0) {return true}
            for (let index = 0; index < this.agenteEvaluadoList.length; index++) {
                if (!this.agenteEvaluadoList[index].num_puntaje || this.agenteEvaluadoList[index].num_puntaje === 0) {return true}
            }
        }

        if (this.valida('13')) {
            if (!this.eriDetalleList || this.eriDetalleList.length === 0) {return true}
            for (let index = 0; index < this.eriDetalleList.length; index++) {
                if (this.validarEriCampos(index, 'causal') && !this.eriDetalleList[index].tip_causal_eri) {return true}
                if (this.validarEriCampos(index, 'otro') && !this.eriDetalleList[index].txt_producto_eri?.trim()) {return true}
                if (this.validarEriCampos(index, 'otro') && !this.eriDetalleList[index].imp_producto_eri) {return true}
                if (this.validarEriCampos(index, 'otro') && !this.eriDetalleList[index].imp_total_ventas_eri) {return true}
                if (this.validarEriCampos(index, 'otro') && !this.eriDetalleList[index].imp_total_producto_eri) {return true}
                
            }
        }

        if (this.valida('15')) {
            if (this.actividad.avanceTecnologia && this.actividad.avanceTecnologia.length > 0) {
                for (let index = 0; index < this.actividad.avanceTecnologia.length; index++) {
                    if (this.actividad.avanceTecnologia[index].avanceIncompleto) {return true}
                }
            }
        }

        return false
    }

    validarEriCampos(index: number, campo: string) {
        if (campo === 'causal') {
            if (!['6','7','8','X'].includes(this.eriDetalleList[index].est_eri)) {
                this.eriDetalleList[index].tip_causal_eri = null
                return false
            }
        }
        if (campo === 'otro') {
            if (!['3','4','9'].includes(this.eriDetalleList[index].est_eri)) {
                this.eriDetalleList[index].num_miembros_activos_eri = null
                this.eriDetalleList[index].txt_producto_eri = null
                this.eriDetalleList[index].imp_producto_eri = null
                this.eriDetalleList[index].imp_total_ventas_eri = null
                this.eriDetalleList[index].imp_total_producto_eri = null
                return false
            }
        }
        return true

    }

    salir() {
        this.modalController.dismiss();
    }

    ngOnDestroy() {
        if (this.guardado) {return}
        if (this.avanceTecTexto) {this.accion.actividad.avanceTecnologia = JSON.parse(this.avanceTecTexto)}
        if (this.eriDetalleTexto) {this.accion.actividad.eriDetalle = JSON.parse(this.eriDetalleTexto)}
    }
}