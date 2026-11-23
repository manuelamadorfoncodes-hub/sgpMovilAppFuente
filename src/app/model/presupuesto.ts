import { Archivo } from "./generales";

export interface Presupuesto {
	ablEstructura?: SubPresupuesto [],
    lstHuerfano?: Huerfanos[],
	esPartidaRepresentativa?: boolean
}

export interface SubPresupuesto {
	cod_zonal?: string
	cod_anho?: string
	cod_proyecto?: string
	cod_rubro?: string
	cod_presupuesto?: string
	nid_visita?: number
	nid_version?: number
	txt_subpresupuesto?: string
	imp_presupuestado?: number
	imp_programado?: number
	imp_ejecutado?: number
	imp_ejecutado_actual?: number
	txt_comentario?: string
	flg_concluida?: number
	fec_valorizacion?: Date
	fec_ult_reporte?: Date
	fec_ult_modificacion?: Date
	porAvanceActual?: number
	porAvanceProgramado?: number
	porAvanceEjecutado?: number
	esPartidaRepresentativa?: boolean
	grupoPartida?: GrupoPartida[]
	index?: number
	icono?: number
	cambio?: boolean
}

export interface GrupoPartida {
	cod_zonal?: string
	cod_anho?: string
	cod_proyecto?: string
	cod_rubro?: string
	cod_presupuesto?: string
	nid_grupo?: number
	nid_visita?: number
	nid_version?: number
	txt_grupo?: string
	imp_presupuestado?: number
	imp_programado?: number
	imp_ejecutado?: number
	imp_ejecutado_actual?: number
	flg_concluida?: number
	txt_comentario?: string
	est_avance?: string
	tip_riesgo?: string
	txt_riesgo?: string
	fec_valorizacion?: Date
	fec_ult_reporte?: Date
	fec_ult_modificacion?: Date
	porAvanceActual?: number
	porAvanceProgramado?: number
	porAvanceEjecutado?: number
	numMetrado?: number
	porAvanceEdit?: number
	// porAvancePartida?: number
	partida?: Partida[]
	visitaFoto?: GrupoPartidaFoto[]
	observacionFoto?: GrupoPartidaFoto[]
	index?: number
	icono?: number
	cambio?: boolean
}

export interface Partida{
	cod_zonal?: string
	cod_anho?: string
	cod_proyecto?: string
	cod_rubro?: string
	cod_presupuesto?: string
	cod_orden?: string
	nid_grupo?: number
	nid_visita?: number
	nid_version?: number
	txt_partida?: string
	num_presupuestado?: number
	num_programado?: number
	num_ejecutado?: number
	num_ejecutado_actual?: number
	imp_costo_partida?: number
	flg_representativa?: number
	flg_concluida?: number
	txt_subpresupuesto?: string
	txt_grupo?: string
	txt_orden?: string
	txt_unidad_partida?: string
	tip_situacion?: string
	fec_valorizacion?: Date
	fec_ult_reporte?: Date
	fec_ult_modificacion?: Date
}

export interface GrupoPartidaFoto {
	cod_zonal?: string
	cod_anho?: string
	cod_proyecto?: string
	cod_rubro?: string
	cod_presupuesto?: string
	nid_grupo?: number
	nid_visita?: number
	nid_fotografia?: number
	txt_nombre?: string
	txt_descripcion?: string
	tip_fotografia?: string
	nid_archivo?: number
	nid_visita_padre?: number
	nid_fotografia_padre?: number
	flg_reiterada?: number
	flg_levantada?: number
	flg_activo?: number
	fec_fotografia?: Date
	fotos?: Archivo[]
	historialFoto?: GrupoPartidaFoto[]
	cambio?: boolean
	eliminada?: boolean
}

export interface Huerfanos {
	tip_situacion: string
	txt_tip_situacion: string
	detalles: PartidaHuerfana[]
}

export interface PartidaHuerfana {
	cod_zonal: string
	cod_anho: string
	cod_proyecto: string
	cod_rubro: string
	cod_presupuesto: string
	cod_orden: string
	tip_situacion: string
}