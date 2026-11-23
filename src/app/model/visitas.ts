import { Archivo, Tipo } from "./generales"
import { Presupuesto, SubPresupuesto } from "./presupuesto"

export interface VisitaParametro {
    etapa: Tipo[]
}

export interface Visita {
    codigo_expediente?: string
    nid_visita?: number
    nid_funcion?: number
    nid_personal?: number
    fec_visita?: Date
    tip_etapa?: string
    txt_observacion?: string
    txt_ambiente?: string
    fec_termino?: Date
    est_visita?: string
    txt_estado_visita?: string
    por_avance?: number
    tip_visita?: string
    num_visita?: number
    fotos?: Archivo[]
    presupuesto?: Presupuesto
    porcentajeAvance?: number
    incompleto?: boolean
    cambio?: boolean
    index?: number
}