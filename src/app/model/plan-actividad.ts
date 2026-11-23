import { ProyectoSelec } from './proyectos';
import { Archivo, Tipo } from './generales';
import { TecnologiaAvance } from './usuarios';

export interface TiposActividadesSuper {
    tipoActividad: TipoActividad[];
    tipoParticipante: TipoParticipante[];
    moduloCapacitacion: ModuloCapacitacion[];
}

export interface TipoParticipante {
    tip_participante: string
    txt_participante: string
    seleccionado?: boolean
    txt_tipo_modulo?: string
}

export interface ModuloCapacitacion {
    cod_modulo: string
    txt_modulo: string
    txt_tipo_participante: string
}


// lo nuevo
export interface TipoParticipante {
    tip_participante: string
    txt_participante: string
    txt_funciones: string
    flg_agente: string
}

export interface TipoActividad {
    tip_actividad: string
    txt_tipo_actividad: string
    txt_variables: string
    txt_perfiles: string
}

export interface ActividadParametro {
    tipoActividad: TipoActividad[]
    tipoParticipante: TipoParticipante[]
    unidadMedida: Tipo[]
    tipoNormativa: Tipo[]
}

export interface Plan {
    nid_plan?: number
    cod_plan?: string
    txt_plan?: string
    nid_funcion?: number
    nid_personal?: number
    zonales?: PlanZonal[]
    fec_ini_plan?: Date
    fec_fin_plan?: Date
}

export interface PlanZonal {
    cod_zonal: string
    txt_zonal: string
    personalZonal: PlanPersonalZonal[]
}

export interface PlanPersonalZonal {
    nid_personal: number
    txt_personal: string
}

export interface PlanActividad {
    id?: number
    nid_plan?: number
    nid_actividad?: number
    nid_detalle?: number
    cod_plan?: string
    txt_plan?: string
    txt_actividad?: string
    nid_funcion?: number
    nid_personal?: number
    fec_inicio?: Date
    fec_termino?: Date
    tip_actividad?: string
    txt_tip_actividad?: string
    est_actividad?: string
    txt_est_actividad?: string
    flg_no_programada?: boolean
    txt_participante?: string
    nid_portafolio?: number
    txt_portafolio?: string
    txt_proyectos?: string
    txt_unidad_medida?: string
    num_meta?: number
    tip_normativa?: string
    txt_observacion_actividad?: string
    fec_ini_plan?: Date
    fec_fin_plan?: Date
    cod_zonal_ambito?: string
    txt_zonal_ambito?: string
    origen?: string
    destino?: string
    noEjecutada?: boolean
    actividadEjecutada?: ActividadEjecutada
    actividadEjecutadaCambio?: boolean
    sam?: Sam
    samCambio?: boolean
    samIncompleta?: boolean
}

export interface ActividadEjecutada {
    nid_plan?: number
    nid_actividad?: number
    nid_detalle?: number
    fec_inicio?: Date
    fec_termino?: Date
    flg_ejecutada?: boolean
    txt_nombre_taller?: string
    txt_detalle_actividad?: string
    txt_resultado?: string
    txt_observacion?: string
    txt_estado_situacional?: string

    tip_concurso?: string
    txt_codigo_concurso?: number
    num_particip_presen_concurso?: number
    num_particip_selec_concurso?: number

    codigo_eri?: string
    tip_feria?: string
    origen?: string
    destino?: string
    participacionFeria?: ActividadDetalle[]

    participantes?: ActividadDetalle[]
    fotos?: Archivo[]
    avanceTecnologia?: ActividadDetalle[]
    agenteEvaluacion?: ActividadDetalle[]
    eriDetalle?: ActividadDetalle[]
    incompleto?: boolean
}

export interface ActividadDetalle {
    nid_plan?: number
    nid_actividad?: number
    nid_detalle?: number
    nid_act_ejecutada_det?: number
    nid_accion?: number,
    nid_accion_actividad_det?: number,

    fec_detalle?: Date
    codigo_expediente?: string
    txt_documento_identidad?: string
    txt_apellido_paterno?: string
    txt_apellido_materno?: string
    txt_nombres?: string
    tip_participante?: string
    nid_persona?: number
    nid_funcion?: number
    tip_cargo_ne?: string
    txt_cargo?: string
    txt_institucion?: string

    tip_participante_feria?: string
    codigo_eri?: string
    txt_eri?: string
    imp_venta?: number

    tip_evaluacion?: string
    num_puntaje?: number
    txt_resultado?: string
    txt_funcion?: string

    nid_tecnologia?: number
    nid_avance?: number
    cod_tecnologia?: string
    txt_tecnologia?: string
    txt_partida?: string
    avance?: TecnologiaAvance
    avanceIncompleto?: boolean
    est_detalle?: string
    
    est_eri?: string
    tip_causal_eri?: string
    num_miembros_activos_eri?: number
    txt_producto_eri?: string
    imp_producto_eri?: number
    imp_total_ventas_eri?: number
    imp_total_producto_eri?: number
    txt_observacion?: string
    txt_estado_situacional?: string

    txt_tipo?: string
    cod_variable?: string
    seleccionado?: boolean
    index?: number
    fotosDetalle?: Archivo[]
}

export interface Sam {
    nid_plan?: number
    nid_actividad?: number
    nid_detalle?: number
    nid_sam?: number
    nid_detecta?: number
    txt_detecta?: string
    txt_correo_detecta?: string
    cod_zonal_detecta?: string
    txt_zonal_detecta?: string
    fec_deteccion?: Date
    tip_origen?: string
    txt_origen_otro?: string
    tip_solicitud?: string
    txt_descripcion?: string
    txt_documento?: string
    txt_causa?: string
    nid_investiga?: number
    txt_investiga?: string
    txt_correo_investiga?: string
    acciones?: SamAccion[]
}

export interface SamAccion {
    nid_plan?: number
    nid_actividad?: number
    nid_detalle?: number
    nid_accion?: number
    txt_accion?: string
    txt_proyectos?: string
    nid_funcion?: number
    nid_responsable?: number
    txt_responsable?: string
    txt_correo_responsable?: string
    fec_implementacion?: Date
    fec_reprogramada?: Date
    fec_verificacion?: Date
    est_accion?: string
    txt_est_accion?: string
    flg_correo_enviado?: boolean
    id?: number
    orden?: number
    controlFecha?: string
    actividad?: AccionActividad
    actividadCambio?: boolean
}

export interface AccionActividad {
    nid_plan?: number
    nid_actividad?: number
    nid_detalle?: number
    nid_accion?: number
    
    txt_accion_actividad?: string
    tip_actividad?: string
    txt_unidad_medida?: string
    num_meta?: number
    tip_normativa?: string
    txt_proyectos?: string
    txt_participante?: string
    fec_inicio?: Date
    fec_termino?: Date
    flg_ejecutada?: boolean
    txt_nombre_taller?: string
    txt_detalle_actividad?: string
    txt_resultado?: string
    txt_observacion?: string
    txt_estado_situacional?: string
    flg_correo_enviado?: boolean

    tip_concurso?: string
    txt_codigo_concurso?: number
    num_particip_presen_concurso?: number
    num_particip_selec_concurso?: number

    codigo_eri?: string
    tip_feria?: string
    participacionFeria?: ActividadDetalle[]

    participantes?: ActividadDetalle[]
    fotos?: Archivo[]
    avanceTecnologia?: ActividadDetalle[]
    agenteEvaluacion?: ActividadDetalle[]
    eriDetalle?: ActividadDetalle[]
    incompleto?: boolean
}