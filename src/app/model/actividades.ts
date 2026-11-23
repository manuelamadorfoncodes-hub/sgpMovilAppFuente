import { Archivo, Tipo } from "./generales"

export interface ProyActividad {
    codigo_expediente?: string
    nid_funcion?: number
    nid_facilitador?: number
    nid_actividad?: number
    txt_actividad?: string
    fec_ini_prog?: Date
    fec_fin_prog?: Date
    tip_actividad?: string
    txt_tipo_actividad?: string
    cod_modulo?: string
    nid_modulo?: number
    txt_modulo?: string
    tip_participante?: string
    cod_grupo_usuario?: string
    txt_organizacion?: string
    txt_linea_negocio?: string
    txt_grupo_interes?: string
    num_meta_participante?: number
    est_actividad?: string
    flg_act_realizada?: boolean
    fec_ini_real?: Date
    fec_fin_real?: Date
    num_asistentes?: number
    num_integrantes?: number
    txt_comentarios?: string
    txt_observaciones?: string
    tip_objetivo?: string
    tip_metodologia?: string
    txt_otra_metodologia?: string
    flg_completo?: boolean
    actividadCambio?: boolean
    detalle?: ProyActividadDet[]
    fotos?: Archivo[]
    id?: number
    orden?: number
    backupRegistro?: string

    tip_modo_actividad?: string
    nid_miembro_apoyo?: number
    nid_miembro_capacitacion?: number
    txt_destino?: string
    txt_localidad?: string
    txt_lugar_evento?: string
    cod_periodo_seguimiento?: string
    txt_colaboradores?: string
    txt_facilitador?: string
    txt_dni_facilitador?: string
    txt_otro_modulo?: string
    cod_nri?: string
    fec_envio?: Date
    txt_grupo_usuario?: string
    tip_modalidad?: string
    nombreActividad?: string
    
    // participantes?: ActividadDetalle[]

}

export interface ProyActividadDet {
    codigo_expediente?: string
    nid_funcion?: number
    nid_facilitador?: number
    nid_actividad?: number
    cod_grupo_usuario?: string
    nid_miembro?: number
    nid_seguimiento?: number
    cod_dni?: string
    txt_apellido_paterno?: string
    txt_apellido_materno?: string
    txt_nombres?: string
    txt_cargo?: string
    flg_asistio?: boolean
    txt_flag_material_entregado?: boolean[]
    txt_material_entregado?: string
    num_puntaje_eval_ent?: string
    num_puntaje_eval_sal?: string
    num_visita?: number
    num_cta_nueva_aper?: number
    num_operaciones?: number
    num_operaciones_otros?: number
    flg_cambios?: boolean
    txt_comentarios_cambios?: number
    seEvaluo?: boolean
    preguntas?: string[]
    fotosDetalle?: Archivo[]
    guardado?: boolean
}

export interface ParametroProyAct {
    objetivo: Tipo[]
    metodologia: Tipo[]
}