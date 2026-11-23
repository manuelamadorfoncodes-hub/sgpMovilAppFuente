import { Archivo, Tipo } from './generales';

export interface EriParametro {
    estadosEri: Tipo[]
    causalesEstadoEri: Tipo[]
}

export interface Eri {
    id?: number
    codigo_expediente?: string
    codigo_nec?: string
    cod_nri?: string
    txt_nri?: string
    cod_grupo_interes?: string
    txt_grupo_interes?: string
    est_nri?: string
    txt_estado_nri?: string
    fec_ini_at?: Date
    cambioInforme?: boolean
    informeIncompleto?: boolean
    ultimoInforme?: InformeEri
    informes?: InformeEri[]
}

export interface InformeEri {
    codigo_expediente?: string
    codigo_nec?: string
    cod_nri?: string
    nid_informe?: number
    est_informe?: string
    cod_periodo?: string
    fec_valorizacion?: Date
    txt_situacion_at?: string
    est_nri?: string
    txt_est_nri?: string
    tip_informacion?: string
    fec_ini_at?: Date
    fec_fin_at?: Date
    por_avance_insumo?: number
    por_avance_pago?: number
    num_evento_at_prog?: number
    num_evento_at_real?: number
    imp_prod_ini?: number
    imp_prod_mes?: number
    imp_ventas_ini?: number
    imp_ventas_actual?: number
    imp_vol_venta?: number
    num_trabajadores?: number
    por_avance_imp_nri?: number
    por_avance_resul_nri?: number
    txt_recomendaciones?: string
    txt_conclusiones?: string
    cod_causal?: string
    txt_otra_causal?: string
    nid_asistente_tecnico?: number
    txt_asistente_tecnico?: string
    nid_funcion?: number
    fec_envio?: Date
    fotos?: Archivo[]
    produccion?: boolean
    cambio?: boolean
    incompleto?: boolean
    existeProdInicial?: boolean
    existeComerInicial?: boolean
}


