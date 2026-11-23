import { Tipo } from "./generales"

export interface AgenteParametro {
    fichaEvaluacion: Tipo[]
    respuestaEvaluacion: Tipo[]
    resultadoEvaluacion: Tipo[]    
}

export interface Agente {
    codigo_expediente: string
    nid_funcion: number
    txt_funcion: string
    nid_personal: number
    nid_asignacion: number
    txt_dni: string
    txt_apellido_paterno: string
    txt_apellido_materno: string
    txt_nombres: string
    est_agente_proyecto: string
    txt_estado: string
    fec_asignacion: string
    fec_inicio: string
    fec_termino?: string
    tip_participante?: string
    flg_externo?: boolean
    txt_eri?: string
    nombre?: string
    ultimaEvaluacion?: Evaluacion
    evaluacion?: Evaluacion
    cambioEvaluacion?: boolean
    evaluacionIcompleto?: boolean
    id?: number
}

export interface Evaluacion {
    codigo_expediente?: string
    nid_funcion?: number
    txt_funcion?: string
    nid_personal?: number
    nid_asignacion?: number
    nid_evaluacion?: number
    nid_funcion_evaluador?: number
    nid_evaluado_por?: number
    fec_evaluacion?: Date
    num_nota_evaluacion?: number
    cod_resultado?: string
    flg_procede_continuidad?: boolean
    txt_observacion?: string
    cod_ficha?: string
    nid_usuario_registro?: number
    evaluacionDetalle?: EvaluacionDetalle[]
}

export interface EvaluacionDetalle {
    codigo_expediente: string
    nid_funcion: number
    nid_personal: number
    nid_asignacion: number
    nid_evaluacion?: number
    nid_detalle?: number
    cod_seccion?: string
    cod_pregunta?: string
    cod_respuesta?: string
    num_puntaje?: number
}