/** Métodos de segundo factor disponibles para el usuario. */
export interface FACTOR_DISPONIBLE {
    perupass: boolean
    correo: boolean
}

/** Reto de segundo factor devuelto por /dobleFactor/autenticar (status 1). Solo vive en memoria. */
export interface RETO_DOBLE_FACTOR {
    preToken: string
    expiraEn: number          // epoch en milisegundos
    factores: FACTOR_DISPONIBLE
    correoEnmascarado: string
    diasEquipoConfianza: number
}
