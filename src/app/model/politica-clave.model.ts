/** Reglas de la contraseña (SSA.PARAMETRO_SEGURIDAD). Atributos con el nombre que envía el servicio. */
export interface REGLA_CLAVE {
    num_longitud_minima: number
    num_longitud_maxima: number
    num_criterios_minimos: number
}

/** Aviso de caducidad devuelto en el login (status 0). */
export interface AVISO_CLAVE {
    numDiasRestantes: number
    fecVencimiento: string
}

/** Cambio obligatorio pendiente (status 3 del login). Solo vive en memoria. */
export interface CAMBIO_CLAVE_PENDIENTE {
    tokenCambio: string
    expiraEn: number            // epoch en milisegundos
    codigo: string              // VENCIDA | CAMBIO_OBLIGATORIO
    mensaje: string
    regla: REGLA_CLAVE
}

/** Resultado de una regla para la lista de verificación en pantalla. */
export interface CONDICION_CLAVE {
    texto: string
    flgCumple: boolean
}
