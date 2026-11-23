import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { RETO_DOBLE_FACTOR } from '../model/doble-factor.model'

const CLAVE_EQUIPO = 'sgp.df.equipo'

/**
 * Llamadas al servicio nuevo /dobleFactor de Seguridad.
 * El token temporal (preToken) se envía en la cabecera de cada llamada y vive solo en memoria.
 */
@Injectable({
    providedIn: 'root'
})
export class DobleFactorService {
    reto: RETO_DOBLE_FACTOR = null

    constructor(private http: HttpClient) { }

    /** Guarda el reto recibido al validar usuario y contraseña. */
    iniciarReto(respuesta: any) {
        this.reto = {
            preToken: respuesta['preToken'],
            expiraEn: Date.now() + (Number(respuesta['expiraEnSegundos']) || 600) * 1000,
            factores: respuesta['factores'] || { perupass: true, correo: false },
            correoEnmascarado: respuesta['correoEnmascarado'],
            diasEquipoConfianza: Number(respuesta['diasEquipoConfianza']) || 0
        }
    }

    limpiarReto() {
        this.reto = null
    }

    validarRetoVigente(): boolean {
        return !!this.reto && Date.now() < this.reto.expiraEn
    }

    /** Identificador aleatorio de este celular (para "recordar este equipo"). No contiene datos del equipo. */
    obtenerIdentificadorEquipo(): string {
        let id = null
        try { id = localStorage.getItem(CLAVE_EQUIPO) } catch (e) { id = null }
        if (!id) {
            const bytes = new Uint8Array(32)
            crypto.getRandomValues(bytes)
            id = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
            try { localStorage.setItem(CLAVE_EQUIPO, id) } catch (e) { }
        }
        return id
    }

    private obtenerCabeceras(): HttpHeaders {
        return new HttpHeaders({ Authorization: `${environment.tokenWord} ${this.reto ? this.reto.preToken : ''}` })
    }

    private enviarPeticion(ruta: string, cuerpo: any = {}): Promise<any> {
        return new Promise(resolve => {
            this.http.post(`${environment.urlSeguridad}/dobleFactor/${ruta}`, cuerpo, { headers: this.obtenerCabeceras() })
                .subscribe({
                    next: resp => resolve(resp),
                    error: err => resolve(err && err.error && typeof err.error === 'object'
                        ? err.error
                        : { status: -1, codigo: 'RED', message: 'No se pudo conectar con el servicio de seguridad.' })
                })
        })
    }

    iniciarPerupass() {
        return this.enviarPeticion('perupass/iniciar')
    }

    consultarPerupass(nidVerificacion: number, recordarEquipo: boolean) {
        return this.enviarPeticion('perupass/consultar', { nidVerificacion, recordarEquipo, equipo: this.obtenerIdentificadorEquipo() })
    }

    enviarCodigoCorreo() {
        return this.enviarPeticion('correo/enviar')
    }

    validarCodigoCorreo(nidVerificacion: number, codigo: string, recordarEquipo: boolean) {
        return this.enviarPeticion('correo/validar', { nidVerificacion, codigo, recordarEquipo, equipo: this.obtenerIdentificadorEquipo() })
    }
}
