import { Archivo, Tipo } from './generales'
import { EntregaInsumo, TecnologiaInsumo } from './proyectos'

export interface Usuario {
    id?: number
    orden?: number
    codigo_expediente?: string
    nid_personal_proyecto?: number
    tip_documento_identidad?: string
    txt_documento_identidad?: string
    txt_apellido_paterno?: string
    txt_apellido_materno?: string
    txt_nombres?: string
    tip_sexo?: string
    fec_nacimiento?: Date
    txt_domicilio?: string
    cod_ubigeo?: string
    txt_ubigeo?: string
    nid_comunidad_nativa?: number
    txt_comunidad_nativa?: string
    txt_telefono?: string
    fec_inicio?: Date
    fec_termino?: Date
    est_personal?: string
    txt_estado?: string
    nid_personal_yachachiq?: number
    fec_inicio_yachachiq?: Date
    txt_yachachiq?: string
    flg_cambio_yachachiq?: boolean
    nid_solicitud?: number
    nid_personal_reemplazo?: number
    flg_ejecucion?: boolean
    tecnologias?: Tecnologia[]
    tecnologiasColectivas?: Tecnologia[]
    tecnologiaNoOfertada?: Tecnologia[]
    solicitud?: Solicitud
    txt_tipo_cambio?: string
    txt_estado_solicitud?: string
    txt_incompleto?: string
    flg_incorporado?: boolean
    num_latitud?: number
    num_longitud?: number
    cambioTecnologia?: boolean
    registroAvanceTec?: boolean
    tipoAvance?: string
    fotos?: Archivo[]
    nidYachachiq?: number
    fecYachachiq?: Date
    txtYachachiq?: string
    fecFinYachachiq?: Date
    registroAvanceIncompleto?: boolean
    cambioTecnologiaIncompleto?: boolean
    solicitudCambioIncompleto?: boolean
    actividadesProductivas?: ActividadProductiva[]
    cambioActividadProd?: boolean
    actividadProdIncompleto?: boolean
    ficha?: FichaVivienda
    cambioFicha?: boolean
    fichaIncompleto?: boolean
    integrantes?: Integrante[]
    fichaCaracterizacion?: Caracterizacion
    estadoCaracterizacion?: string
    cambioCaracterizacion?: boolean
    fichaCaracterizIncompleto?: boolean
    flgDatos?: boolean
    miembros?: Miembro[]
    cambioMiembros?: boolean
    miembrosIncompleto?: boolean
    archivoHogarEmancipado?: Archivo[]
    cambioEntregaInsumos?: boolean
    entregaInsumosIncompleto?: boolean
    fichaMujer?: FichaMujer
    cambioFichaMujer?: boolean
    fichaMujerIncompleto?: boolean
    lineaBase?: LineaBase[]
    eliminaFichaLSalidaVivienda?: boolean
    observacionGeolocalizacion?: string
    asistenciaTecnicaMemList?: AsistenciaTecnicaMem[]
    cambioAsistTecMem?: boolean
    asistTecMemIncompleta?: boolean
    fichaSeleccionMem?: FichaSeleccionMem
    cambioSeleccionMem?: boolean
    seleccionMemIncompleta?: boolean
    seleccionMemNoSincroniza?: boolean
    lineaBaseMem?: LineaBaseMem
    cambioLineaBaseMem?: boolean
    lineaBaseMemIncompleta?: boolean
    lineaSalidaMem?: LineaBaseMem
    cambioLineaSalidaMem?: boolean
    lineaSalidaMemIncompleta?: boolean
}

export interface Integrante {
    codigo_expediente: string
    nid_personal_proyecto: number
    nid_integrante: number
    txt_documento_identidad: string
    txt_apellido_paterno: string
    txt_apellido_materno: string
    txt_nombres: string
    tip_sexo: string
    fec_nacimiento: Date
    txt_telefono: string
}
  
export interface Miembro {
    nid_identificador?: string
    codigo_expediente?: string
    nid_personal_proyecto?: number
    nid_solicitud_cambio?: number
    nid_miembro?: number
    fec_actualizacion?: Date
    txt_apellido_paterno?: string
    txt_apellido_materno?: string
    txt_nombres?: string
    tip_nacionalidad?: string
    txt_nacionalidad?: string
    tip_documento_identidad?: string
    txt_documento_identidad?: string
    textoTipoDocumento?: string
    fec_nacimiento?: Date
    tip_sexo?: string
    tip_parentesco?: string
    txt_parentesco?: string
    textoParentesco?: string
    tip_ausente_hogar?: string
    txt_mes_inicio?: string
    txt_mes_fin?: string
    tip_txt_discapacidad?: string[]
    txt_discapacidad?: string
    tip_txt_lista_ps?: string[]
    txt_programa_social?: string
    tip_idioma_materna?: string
    txt_idioma?: string
    tip_otra_lengua?: string
    tip_grado_instruccion?: string
    tip_grado_estudio?: string
    tip_estado_civil?: string
    tip_etnia_identidad?: string
    txt_etnia_identidad?: string
    tip_otra_etnia?: string
    tip_ocupacion?: string
    txt_ocupacion?: string
    tip_txt_lista_ingreso?: string[]
    txt_ingreso?: string
    txt_imp_ingreso?: string
    flg_titular?: boolean
    flg_ficha_completa?: boolean
    flg_cotejo?: boolean
    fec_cotejo?: Date
    tip_observacion_cotejo?: string
    txt_observacion_cotejo?: string
    txt_observacion?: string
    txt_celular?: string
    cambioMiembro?: boolean
    incompleto?: boolean
}

export interface Solicitud {
    codigo_expediente?: string
    nid_solicitud?: number
    cod_zonal_solicitud?: string
    fec_solicitud?: Date
    tip_solicitud?: string
    est_solicitud?: string
    txt_estado_solicitud?: string
    nid_personal_proyecto?: number
    tip_cambio?: string
    txt_tipo_cambio?: string
    nid_funcion_solicita?: number
    nid_personal_solicita?: number
    nid_usuario_act_prod?: number
    nid_ficha?: number
    txt_observacion?: string
    usuario1?: SolicitudUsuario
    usuario2?: SolicitudUsuario
}

export interface SolicitudUsuario {
    tip_documento_identidad?: string
    txt_documento_identidad?: string
    txt_apellido_paterno?: string
    txt_apellido_materno?: string
    txt_nombres?: string
    tip_sexo?: string
    fec_nacimiento?: Date
    txt_domicilio?: string
    cod_ubigeo?: string
    txt_ubigeo?: string
    nid_comunidad_nativa?: number
    txt_comunidad_nativa?: string
    txt_telefono?: string
    fec_inicio?: Date
    est_personal?: string
    txt_estado?: string
    fec_cambio?: Date
    cod_causal?: string
    txt_comentario_causal?: string
    nid_integrante?: number
    txt_traslado?: string
    tecnologias?: Tecnologia[]
    tecnologiaNoOfertada?: Tecnologia[]
    fotos?: Archivo[]
    informacionIncompleta?: boolean
    archivoHogarEmancipado?: Archivo[]
    actividadesProductivas?: ActividadProductiva[]
    ficha?: FichaVivienda
    miembros?: Miembro[]
    fichaMujer?: FichaMujer
}

export interface Tecnologia {
    nid_tecnologia?: number
    cod_tecnologia?: string
    txt_tecnologia?: string
    tip_beneficio?: string
    flg_ofertada?: boolean
    cod_partida?: string
    txt_partida?: string
    txt_tipo_cocina?: string
    txt_observacion?: string
    fec_actualizacion?: Date
    solicitudTecnologia?: SolicitudTecnologia
    situacionInicial?: TecnologiaAvance
    avance?: TecnologiaAvance
    ultimoAvance?: TecnologiaAvance
    ultimoSeguimiento?: TecnologiaAvance
    avanceIncompleto?: boolean
    cambioIncompleto?: boolean
    actividadesProductivas?: ActividadProductiva[]
    entregaInsumos?: EntregaInsumo[]
    cambioEntregaInsumos?: boolean
    entregaInsumosIncompleto?: boolean
}

export interface SolicitudTecnologia {
    fec_cambio?: Date
    flg_ofertada?: boolean
    txt_observacion?: string
    fotos?: Archivo[]
    flg_situacion_inicial?: boolean
    flg_con_avance?: boolean
    flg_observado?: boolean
    situacionInicial?: TecnologiaAvance
}

export interface TecnologiaAvance {
    codigo_expediente?: string
    nid_personal_proyecto?: number
    nid_tecnologia?: number
    nid_detalle?: number
    nid_avance?: number
    cod_tecnologia?: string
    nid_funcion?: number
    nid_personal?: number
    fec_visita?: Date
    flg_informacion_contraste?: boolean
    cod_etapa?: string
    nid_fase?: number
    est_fase?: string
    num_area_riego?: number
    nid_unidad_area_riego?: number
    num_area_instalada?: number
    nid_unidad_area_instalada?: number
    num_consumo_lenha?: number
    num_volumen_almacenamiento?: number
    tip_observacion?: string
    txt_observacion?: string
    por_avance_parcial?: number
    por_avance_acumulado?: number
    num_arboles_plantados?: number
    num_logitud_construido?: number
    nid_unidad_logitud_construido?: number
    fotos?: Archivo[]
    avanceProd?: TecnologiaAvanceProd[]
    plan_actividad_id?: number
}

export interface TecnologiaAvanceProd {
    codigo_expediente?: string
    nid_personal_proyecto?: number
    nid_tecnologia?: number
    nid_detalle?: number
    nid_avance?: number
    nid_avance_prod?: number
    nid_unidad_periodicidad?: number
    num_unidades_produccion?: number
    nid_unidad_unidades_produccion?: number
    num_produccion?: number
    nid_unidad_produccion?: number
    num_autoconsumo?: number
    num_semilla?: number
    num_incubacion?: number
    num_perdida?: number
    num_cantidad_intermediarios?: number
    imp_precio_intermediarios?: number
    num_cantidad_mercado?: number
    imp_precio_mercado?: number
    nid_producto?: number
    txt_producto_otro?: string
    unidadesUnidProdList?: Unidad[]
    unidadesProdList?: Unidad[]
    unidadProd?: string
    totalProduccion?: number
}

export interface TecnologiaFase {
    cod_tecnologia: string
    etapas: EtapaFase[]
    productos: Producto[]
}

export interface EtapaFase {
    cod_etapa: string
    txt_etapa: string
    fases: Fase[]
}

export interface Fase {
    nid_fase: number
    txt_fase: string
    flg_multiple: boolean
    variables: Variable[]
    por_avance_fase: number
    por_avance_acum: number
}

export interface Variable {
    cod_variable: string
    txt_variable: string
    unidades: Unidad[]
}

export interface Unidad {
    nid_unidad: number
    txt_unidad: string
    unidadesProd: Unidad[]
}

export interface UsuarioParametro {
    diasRetiroUsuario: number
    diasSolicitudCambio: number
    mesLineaSalida: string
    diasCompatibilidad: number
    mesLineaSalidaMem: string
    diasCompatibilidadMem: number,
    causalRetiroUsuario: Tipo[]
    tipoObservacionSeguimeinto: Tipo[]
    materialParedes?: Tipo[]
    materialTecho?: Tipo[]
    iluminacion?: Tipo[]
    ambienteCocinar?: Tipo[]
    tipoCocina?: Tipo[]
    combustibleCocina?: Tipo[]
    comoRecicla?: Tipo[]
    residuosSolidos?: Tipo[]
    tratamientoAgua?: Tipo[]
    lineaNegocio?: Tipo[]
    tiempoAgrupacion?: Tipo[]
    recursoNatural?: Tipo[]
    tenenciaParcela?: Tipo[]
    unidadAreaParcela?: Tipo[]
    usoParcela?: Tipo[]
    fuenteParcela?: Tipo[]
    fichaRespuestaTec?: Tipo[]
    fichaRespuestaViv?: Tipo[]
    fichaRespuestaCom?: Tipo[]
    fichaRespuestaAut?: Tipo[]
    fichaPreguntaViv?: Tipo[]
    fichaPreguntaCom?: Tipo[]
    fichaPreguntaAut?: Tipo[]
    fichaSeccion?: Tipo[]
    fichaResultado?: Tipo[]
    parentesco?: Tipo[]
    meses?: Tipo[]
    discapacidad?: Tipo[]
    programaSocial?: Tipo[]
    lengua?: Tipo[]
    otraLengua?: Tipo[]
    gradoInstruccion?: Tipo[]
    inicial?: Tipo[]
    primaria?: Tipo[]
    secundaria?: Tipo[]
    estadoCivil?: Tipo[]
    etnia?: Tipo[]
    etniaAndina?: Tipo[]
    etniaAmazonica?: Tipo[]
    ocupacion?: Tipo[]
    ingresos?: Tipo[]
    fichaMujer?: Tipo[]
    organizacionBase?: Tipo[]
    tipoMejora?: Tipo[]
    estadoMejoras?: Tipo[]
    frecuenciaOrganiza?: Tipo[]
    redesSociales?: Tipo[]
    regimenRuc?: Tipo[]
    eslabonCadenaProd?: Tipo[]
    evidenciaEslabon?: Tipo[]
    entidadApoyo?: Tipo[]
    participaMiembro?: Tipo[]
    beneficios?: Tipo[]
    herramientasContacto?: Tipo[]
    respuestas?: Tipo[]
    estadoActivo?: Tipo[]
    seleccionMem?: Tipo[]
    lineaBaseMem?: Tipo[]
    validaLBMem?: Tipo[]
    // lineaNegocioMem?: Tipo[]
}

export interface ActividadProductiva {
    nid_usuario_actividad?: number
    nid_act_productiva?: number
    nid_actividad?: number
    txt_actividad?: string
    variables?: Variable[]
    productos?: Producto[]
    fines?: Tipo[]
    actividadDetalle?: ActividadProdDetalle[]
    fotos?: Archivo[]
    cambioFoto?: boolean
    incompleto?: boolean
}

export interface Producto {
    nid_producto: number
    txt_producto: string
    unidadesUnidProd: Unidad[]
    unidadesProd: Unidad[]
}

export interface ActividadProdDetalle {
    codigo_expediente?: string
    nid_proyecto_act_prod?: number
    nid_usuario_actividad?: number
    nid_act_productiva?: number
    nid_actividad?: number
    txt_actividad?: string
    txt_actividad_otra?: string
    nid_producto?: number
    txt_producto?: string
    txt_producto_otro?: string
    nid_personal_proyecto?: number
    fec_visita?: Date
    txt_observacion?: string
    num_area_riego?: number
    nid_unidad_area_riego?: number
    num_area_instalada?: number
    nid_unidad_area_instalada?: number
    num_consumo_lenha?: number
    num_volumen_almacenamiento?: number
    nid_unidad_periodicidad?: number
    num_unidades_produccion?: number
    nid_unidad_unidades_produccion?: number
    num_produccion?: number
    nid_unidad_produccion?: number
    num_autoconsumo?: number
    num_semilla?: number
    num_incubacion?: number
    num_perdida?: number
    num_cantidad_intermediarios?: number
    imp_precio_intermediarios?: number
    num_cantidad_mercado?: number
    imp_precio_mercado?: number
    num_cortes_anho?: number
    cod_fines?: string
    cod_usos?: string
    nid_linea?: number
    unidadesUnidProdList?: Unidad[]
    unidadProd?: string
    totalProduccion?: number
    cambio?: boolean
    incompleto?: boolean
}

export interface FichaVivienda {
    codigo_expediente?: string
    nid_ficha?: number
    nid_personal_proyecto?: number
    fec_visita?: Date
    cod_material_pared? :string
    txt_otro_material_pared? :string
    cod_material_techo? :string
    txt_otro_material_techo? :string
    cod_iluminacion? :string
    txt_otro_iluminacion?: string
    num_habitaciones? :number
    cod_ambiente_cocinar? :string
    cod_tipo_cocina? :string
    txt_otro_tipo_cocina? :string
    txt_tip_combustible? : string
    txt_otro_combustible? : string
    num_lenha? :number
    num_bosta? :number
    flg_residuos? :string
    cod_recicla? :string
    txt_otro_recicla? :string
    cod_residuos? :string
    txt_otro_residuos? :string
    cod_tratamiento_agua? :string
    flg_pertenece_org? :string
    nid_version_ficha?: number
    nid_linea?: number
    txt_tip_tenencia_parcela?: string
    txt_otro_tenencia_parcela?: string
    txt_num_area_parcela?: string
    nid_unidad_medida_area?: string
    txt_tip_uso_parcela?: string
    txt_otro_uso_parcela?: string
    txt_tip_fuente_parcela?: string
    txt_otro_fuente_parcela?: string
    emprendimientos?: FichaEmprendimiento[]
    fotos?: Archivo[]
}

export interface FichaEmprendimiento {
    codigo_expediente?: string
    nid_ficha?: number
    nid_ficha_emprendimiento?: number
    cod_tipo? :string
    txt_otro_tipo? :string
    num_integrantes? :number
    cod_tiempo? :string
    imp_ingresos? :number
    cod_recurso_natural?: string
    txt_otro_recurso?: string
    flg_proyectos?: string
    txt_desc_proyectos?: string
    fotos?: Archivo[]
}

export interface Caracterizacion {
    codigo_expediente?: string
    nid_personal_proyecto?: number
    nid_ficha?: number
    fec_visita?: Date
    est_ficha?: string
    nid_entrevistador?: number
    txt_entrevistador?: string
    num_puntos_tec?: number
    num_puntos_viv?: number
    num_puntos_com?: number
    num_puntos_aut?: number
    num_puntaje_total?: number
    tip_resultado?: string
    seccionTec?: CaractDetalle[]
    seccionViv?: CaractDetalle[]
    seccionCom?: CaractDetalle[]
    seccionAut?: CaractDetalle[]
    fotos?: Archivo[]
}

export interface CaractDetalle {
    codigo_expediente?: string
    nid_personal_proyecto?: number
    nid_ficha?: number
    cod_seccion?: string
    cod_pregunta?: string
    txt_pregunta?: string
    cod_respuesta?: string
    num_puntaje?: number
    respuestas?: Tipo[]
}

export interface FichaMujer {
    codigo_expediente?: string
    nid_ficha?: number
    fec_visita?: Date
    nid_solicitud_cambio?: number
    nid_personal_proyecto?: number
    nid_entrevistador?: number
    nid_funcion_entrevistador?: number
    txt_entrevistador?: string
    tip_organizacion_base?: string
    txt_organizacion_base?: string
    detalle?: FichaMujerDetalle[]
}

export interface FichaMujerDetalle {
    codigo_expediente?: string
    nid_ficha?: number
    nid_detalle?: number
    cod_pregunta?: string
    cod_respuesta?: string
    cod_tipo_otro?: string
    txt_otro?: string
    num_dato1?: number
    num_dato2?: number
    flg_eliminado?: boolean
    pregunta?: Tipo
    respuesta?: Tipo
    categoriaTexto?: string
    categoriaOpciones?: Tipo[]
}

export interface LineaBase {
    nidLinea: number
    actividadesProductivas?: ActividadProductiva[]
    cambioActividadProd?: boolean
    actividadProdIncompleto?: boolean
    fichaVivienda?: FichaVivienda
    cambioFichaVivienda?: boolean
    fichaViviendaIncompleto?: boolean
}

export interface AsistenciaTecnicaMem {
    codigoFicha: string,
    tituloFicha: string,
    ultimaFicha?: FichaAsistTecMem,
    nuevaFicha?: FichaAsistTecMem,
    cambioFicha?: boolean
}

export interface FichaAsistTecMem {
    codigo_expediente?: string
    nid_ficha?: number
    cod_ficha?: string
    fec_visita?: Date
    nid_personal_proyecto?: number
    nid_funcion?: number
    nid_personal?: number
    cod_linea_negocio?: string
    txt_linea_negocio?: string
    flg_completa?: boolean
    txt_recomendacion?: string
    // Ficha 02
    flg_gestion_ingresos?: string
    flg_gestion_formato?: string
    flg_gestion_tareas?: string
    tip_gestion_frecuencia?: string
    txt_gestion_observacion?: string
    flg_edu_fin_dinero?: string
    flg_edu_fin_institucion?: string
    flg_edu_fin_documentos?: string
    txt_edu_fin_observacion?: string
    flg_marketing_redes?: string
    txt_tip_marketing_redes?: string
    flg_facebook?: boolean
    txt_link_facebook?: string
    flg_whatsapp?: boolean
    txt_link_whatsapp?: string
    flg_instagram?: boolean
    txt_link_instagram?: string
    flg_tiktok?: boolean
    txt_link_tiktok?: string
    flg_otra_red_social?: boolean
    txt_otra_red_social?: string
    flg_marketing_tecnicas?: string
    txt_marketing_observ?: string
    flg_formal_ruc?: string
    txt_ruc?: string
    tip_formal_regimen?: string
    txt_otro_regimen?: string
    flg_formal_tramite?: string
    txt_formal_observacion?: string
    // Ficha 03
    flg_conoce_preparativos?: string
    flg_sabe_organizar?: string
    flg_demuestra_habilidades?: string
    txt_ferias_observacion?: string
    flg_identifica_eslabon?: string
    tip_eslabon?: string
    txt_otro_eslabon?: string
    txt_tip_evidencia_eslabon?: string
    txt_otra_evidencia?: string
    flg_ventajas_integrar?: string
    txt_cadena_observacion?: string
    flg_identifica_entidad?: string
    flg_camara_comercio?: boolean
    flg_ong?: boolean
    txt_ong?: string
    flg_municipalidad?: boolean
    txt_municipalidad?: string
    flg_otra_entidad?: boolean
    txt_otra_entidad?: string
    tip_miembro_activo?: string
    txt_tip_beneficio?: string
    txt_otro_beneficio?: string
    txt_tip_contacto?: string
    txt_otro_contacto?: string
    txt_entidad_observacion?: string
    // Ficha 04
    tip_electricidad_instalado?: string
    flg_electricidad_correcto?: string
    txt_electricidad_observ?: string
    tip_mejora_instalado?: string
    flg_mejora_correcto?: string
    txt_mejora_observ?: string
    tip_mobiliario_instalado?: string
    flg_mobiliario_correcto?: string
    txt_mobiliario_observ?: string
    tip_division_instalado?: string
    flg_division_correcto?: string
    txt_division_observ?: string
    tip_orden_instalado?: string
    flg_orden_correcto?: string
    txt_orden_observ?: string
    tip_materiales_instalado?: string
    flg_materiales_correcto?: string
    txt_materiales_observ?: string
    tip_adecuacion_instalado?: string
    flg_adecuacion_correcto?: string
    txt_adecuacion_observ?: string
    txt_otra_adecuac_nombre?: string
    tip_otra_adecuac_instalado?: string
    flg_otra_adecuac_correcto?: string
    txt_otra_adecuac_observ?: string
    flg_cumple?: string
    txt_recomienda?: string
    // Ficha 05
    txt_activo_observ?: string
    flg_activo_utilizado?: string
    flg_activo_seguro?: string
    flg_activo_mantenimiento?: string
    txt_condicion_observ?: string
    activos?: TecnologiaInsumo[]
    fotos?: Archivo[]
    mejoras?: MejoraAsisTecMem[]
}

export interface MejoraAsisTecMem {
    codigo_expediente?: string
    nid_ficha?: number
    nid_detalle?: number
    nid_mejora?: number
    tip_mejora?: string
    txt_tipo_mejora?: string
    txt_mejora?: string
    est_mejora?: string
    txt_observacion?: string
}

export interface FichaSeleccionMem {
    codigo_expediente?: string
    nid_ficha?: number
    nid_personal_proyecto?: number
    nid_funcion?: number
    nid_personal?: number
    cod_linea_negocio?: string
    txt_linea_negocio?: string
    fec_registro?: Date
    flg_completa?: boolean
    num_puntaje_seccion_1?: number
    num_puntaje_seccion_2?: number
    num_puntaje_seccion_3?: number
    num_puntaje_total?: number
    detalle?: FichaSeleccionMemDet[]
    fichaGuardada?: boolean
}

export interface FichaSeleccionMemDet {
    codigo_expediente?: string
    nid_ficha?: number
    cod_pregunta?: string
    cod_respuesta?: string
    num_puntos?: number
    pregunta?: string
    codigoSeccion?: string
    subSeccion?: string
    respuestas?: Tipo[]
    
}

export interface LineaBaseMem {
    codigo_expediente?: string
    nid_ficha?: number
    nid_linea?: number
    nid_personal_proyecto?: number
    nid_funcion?: number
    nid_personal?: number
    fec_ficha?: Date
    flg_completo?: boolean
    tip_organizacion_base?: string
    txt_organizacion_base?: string
    detalle?: LineaBaseMemDetalle[]
}

export interface LineaBaseMemDetalle {
    codigo_expediente?: string
    nid_ficha?: number
    nid_detalle?: number
    cod_pregunta?: string
    cod_respuesta1?: string
    cod_respuesta2?: string
    txt_list_codigo?: string
    txt_list_data?: string
    txt_otro?: string
    txt_dato?: string
    fec_dato1?: Date
    fec_dato2?: Date
    num_dato?: number
    flg_eliminado?: boolean
    datoIncompleto?: boolean
    data?: any
    pregunta?: Tipo
    respuesta?: Tipo
    categoriaTexto?: string
    categoriaOpciones?: Tipo[]

    cod_tipo_otro?: string
    textoError?: string
}