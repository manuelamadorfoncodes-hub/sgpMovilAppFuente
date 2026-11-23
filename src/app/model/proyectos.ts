import { TecnologiaAvance, Usuario } from './usuarios'
import { Eri } from './eri'
import { ProyActividad } from './actividades'
import { Archivo } from './generales'
import { Agente } from './agentes'
import { Presupuesto } from './presupuesto'

export interface Proyecto {
    codigo_expediente: string
    nombre_ne: string
    nombre_nec: string
    fec_inicio: Date
    flg_ejecucion: boolean
    nid_tipo_proyecto: number
    nid_sub_tipo_proyecto: number
    cod_zonal_ubicacion: string
    proyectos_nec: string
    periodo_24: string
    txt_incompleto?: string
    tip_grupo?: string
    ambito?: Ambito[]
    tecnologiaPartida?: TecnologiaPartida[]
    usuariosList?: Usuario[]
    usuarios?: Usuario[]
    actividades?: ProyActividad[]
    agentes?: Agente[]
    nucleoEjecutor?: NuecleoEjecutor[]
    eri?: Eri[],
    periodos?: Periodo[]
    seleccionado?: boolean
    flgDatos?: boolean
    cantidadUsuarios?: number
    presupuesto?: Presupuesto[]
}

export interface ProyectoSelec {
    codigo_expediente: string
    nombre_ne: string
    agentes: Agente[]
    seleccionado?: boolean
}

export interface TecnologiaPartida {
    cod_partida: string
    txt_partida: string
    cod_tecnologia: string
    txt_tecnologia: string
    tip_beneficio: string
    insumos: TecnologiaInsumo[]
}

export interface TecnologiaInsumo {
    codigo_expediente: string
    nid_entrega: number
    nid_insumo: number
    codigo_insumo: string
    txt_insumo: string
    txt_unidad_insumo: string
    num_cantidad: number
    flg_entregado: boolean
    txt_observacion: string
    flg_observacion: boolean
    flg_eliminado: boolean
    nid_ficha: number
    nid_activo: number
    txt_especificacion: string
    flg_uso_emprendimiento?: string
    est_activo?: string
}

export interface EntregaInsumo {
    codigo_expediente?: string
    nid_entrega?: number
    tip_entrega?: string
    fec_entrega?: Date
    est_entrega?: string
    nid_personal_proyecto?: number
    nid_tecnologia?: number
    cod_tecnologia?: string
    cod_partida?: string
    nid_detalle?: number
    nid_usuario_firma?: number
    txt_dni_usuario?: string
    txt_usuario?: string
    insumos?: TecnologiaInsumo[]
    firmas?: Archivo[]
    incompleto?: boolean
}

export interface Ambito {
    codigo_ubigeo: string
    nombre_ubigeo: string
    comunidadNativa: ComunidadNativa[]
}

export interface ComunidadNativa {
    nid_comunidad_nativa: number
    txt_comunidad_nativa: string
}

export interface NuecleoEjecutor {
    codigo_expediente: string
    tip_cargo_ne: string
    nid_persona_ne: number
    txt_cargo_ne: string
    txt_documento_identidad: string
    txt_apellido_paterno: string
    txt_apellido_materno: string
    txt_nombres: string
}

export interface Periodo {
    codigo_expediente: string
    cod_mes: string
    cod_periodo: string
    txt_periodo: string
}

export interface TecnologiaColectiva {
    codigo_expediente: string
    cod_partida: string
    txt_partida: string
    cod_tecnologia: string
    txt_tecnologia: string
    tip_tecnologia_avance: string
    num_metrado_partida: number
    txt_unidad_partida: string
    detalle: TecnologiaColectivaDetalle[]
    metradoDisponible: number
}

export interface TecnologiaColectivaDetalle {
    codigo_expediente?: string
    nid_detalle?: number
    txt_detalle?: string
    cod_partida?: string
    cod_tecnologia?: string
    num_metrado_detalle?: number
    txt_unidad_partida?: string
    fec_registro?: Date
    nid_personal_yachachiq?: number
    fec_inicio_yachachiq?: Date
    txt_yachachiq?: string
    flg_cambio_yachachiq?: boolean
    nidYachachiq?: number
    fecYachachiq?: Date
    txtYachachiq?: string
    fecFinYachachiq?: Date
    avance?: TecnologiaAvance
    ultimoAvance?: TecnologiaAvance
    ultimoSeguimiento?: TecnologiaAvance
    avanceIncompleto?: boolean
    cambio?: boolean
    cambioAvance?: boolean
    entregaInsumos?: EntregaInsumo[]
    cambioEntregaInsumos?: boolean
    entregaInsumosIncompleto?: boolean
}
