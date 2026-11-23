export interface Notificacion {
    nid_notificacion: number
    fec_notificacion: Date
    txt_asunto: string
    txt_mensaje: string
    txt_mensaje_html: string
    flg_leido: boolean
    fec_lectura: Date
    flg_eliminado: boolean
    fec_eliminacion: Date
    txt_nombre: string
    txt_icono: string
}