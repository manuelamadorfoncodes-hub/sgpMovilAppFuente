import { Proyecto } from './proyectos';

export interface Respuesta {
    status: number
    result: any
    message: string;
}

export interface Modulo {
    nidmodulo: number
    txtmodulo: string
    flgpublico: boolean
    numorden: number
    zonales: ZonalModulo[]
    perfiles: Perfil[]
    confidencialidad: boolean
}

export interface Perfil {
    nidperfil: number
    txtperfil: string
    funcion: Funcion
}

export interface Funcion {
    nid_funcion?: number
    txt_funcion?: string
}

export interface ZonalModulo {
    codzonal: string
    txtzonal: string
    txtperfiles: string
    perfil: Perfil
    opciones: Opcion[]
}

export interface Opcion {
    nidopcion: number
    txtopcion: string
    txtnombreobjeto: string
    txturl?: string
    flgvisible: boolean
    numorden: number
    flgconsulta: boolean
    txticono?: string
    opciones: Opcion[]
}

export interface User {
    nidUsuario?: number
    dni?: string
    apellidoPaterno?: string
    apellidoMaterno?: string
    nombres?: string
    email?: string
    nidPersonal?: number
    nidControlAccesoWeb?: number
    codZonal?: string
    zonal?: string
    urlFotoFile?: string
    urlFotoHttp?: string
    perfil?: Perfil
}

export interface Zonal {
    cod_zonal: string;
    txt_zonal: string;
    proyectos?: Proyecto[];
}

export interface ArchivosConfig {
    actividad: Archivo[]
    actividadProyecto: Archivo[]
    actividadEduFin: Archivo[]
    hogar: Archivo[]
    tecnologia: Archivo[]
    tecnologiaImpl: Archivo[]
    eriInforme: Archivo[]
    actProductiva: Archivo[]
    fichaVivienda: Archivo[]
    fichaEmprend: Archivo[]
    fichaCaract: Archivo[]
    hogarEmancipado: Archivo[]
    visita: Archivo[]
    visitaAvance: Archivo[]
    entregaInsumos: Archivo[]
    asistTecMemActivos: Archivo[]
    actividadMem: Archivo[]
}

export interface Archivo {
    cod_archivo: string
    txt_grupo: string
    txt_archivo: string
    flg_confidencial: boolean
    flg_foto: boolean
    num_cantidad_minimo: number
    num_cantidad_maximo: number
    flg_georeferencia: boolean
    txt_valor: string
    tip_carga: string
    nid_archivo?: number
    fec_archivo?: Date
    num_latitud?: number
    num_longitud?: number
    urlArchivoHttp?: string
    urlArchivoFile?: string
    flagCargando?: boolean
    nueva?: boolean
    enviada?: boolean
    descargada?: boolean
}

export interface Tipo {
    cod_tipo?: string
    txt_tipo?: string
    txt_dato1?: string
    txt_dato2?: string
    txt_dato3?: string
    txt_dato4?: string
    txt_dato5?: string
    num_dato1?: number
    num_dato2?: number
    subTipos?: Tipo[]
    seleccionado?: boolean
    numero?: number
    dato?: string
}

export interface Reporte {
    nid_tabla?: number
    cod_parametro?: string // codigo
    txt_parametro?: string // nombre
    txt_valor?: string // parametros p, t, y, c, f: proyecto, periodo, yachachiq, partida, archivo
    txt_valor2?: string
    txt_metadato?: string // url
    flg_activo?: number
}

export interface Portafolio {
    nid_portafolio: number
    txt_prefijo: string
}

