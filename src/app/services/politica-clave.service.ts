import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders } from '@angular/common/http'
import { AlertController, NavController } from '@ionic/angular'
import { environment } from '../../environments/environment'
import { AVISO_CLAVE, CAMBIO_CLAVE_PENDIENTE, CONDICION_CLAVE, REGLA_CLAVE } from '../model/politica-clave.model'

const REGLA_POR_DEFECTO: REGLA_CLAVE = { num_longitud_minima: 8, num_longitud_maxima: 16, num_criterios_minimos: 3 }
const CLAVES_COMUNES = ['password', 'contraseña', 'contrasena', 'foncodes', 'qwerty', '123456', 'abc123', 'admin', 'peru', 'sgpmovil', 'bienvenido']

/**
 * Política de contraseñas en la App: cambio obligatorio (status 3), cambio voluntario y aviso de caducidad.
 * Las reglas se verifican aquí mientras el usuario escribe y el servicio /politicaClave las vuelve a validar.
 */
@Injectable({
    providedIn: 'root'
})
export class PoliticaClaveService {
    cambioPendiente: CAMBIO_CLAVE_PENDIENTE = null
    avisoPendiente: AVISO_CLAVE = null

    constructor(private http: HttpClient,
                private alertCtrl: AlertController,
                private navCtrl: NavController) { }

    iniciarCambioObligatorio(respuesta: any) {
        this.cambioPendiente = {
            tokenCambio: respuesta['tokenCambio'],
            expiraEn: Date.now() + (Number(respuesta['expiraEnSegundos']) || 600) * 1000,
            codigo: respuesta['codigo'],
            mensaje: respuesta['message'],
            regla: respuesta['regla'] || REGLA_POR_DEFECTO
        }
    }

    limpiarCambioObligatorio() {
        this.cambioPendiente = null
    }

    validarCambioVigente(): boolean {
        return !!this.cambioPendiente && Date.now() < this.cambioPendiente.expiraEn
    }

    registrarAviso(respuesta: any) {
        this.avisoPendiente = respuesta && respuesta['avisoClave'] ? respuesta['avisoClave'] : null
    }

    /** Muestra el aviso de caducidad guardado en el login (una sola vez). */
    async mostrarAvisoPendiente() {
        const aviso = this.avisoPendiente
        this.avisoPendiente = null
        if (!aviso) { return }
        const dias = Number(aviso.numDiasRestantes)
        const alerta = await this.alertCtrl.create({
            header: 'Contraseña por vencer',
            message: dias <= 1 ? 'Su contraseña vence mañana.' : `Su contraseña vence en ${dias} días.`,
            buttons: [
                { text: 'Después', role: 'cancel' },
                { text: 'Cambiar ahora', handler: () => { this.navCtrl.navigateForward('/cambio-clave') } }
            ]
        })
        await alerta.present()
    }

    obtenerReglaVigente(): REGLA_CLAVE {
        return this.cambioPendiente ? this.cambioPendiente.regla : REGLA_POR_DEFECTO
    }

    /** Condiciones para la lista de verificación de la pantalla. */
    evaluarCondiciones(clave: string, regla: REGLA_CLAVE, datosUsuario: string[]): CONDICION_CLAVE[] {
        const valor = `${clave || ''}`
        const normal = this.normalizarTexto(valor)
        const criterios = [/[a-zñ]/.test(valor), /[A-ZÑ]/.test(valor), /[0-9]/.test(valor), /[^A-Za-zÑñ0-9\s]/.test(valor)].filter(x => x).length
        const contieneDato = datosUsuario.map(d => this.normalizarTexto(d)).filter(d => d && d.length >= 4).some(d => normal.indexOf(d) >= 0)
        return [
            { texto: `Entre ${regla.num_longitud_minima} y ${regla.num_longitud_maxima} caracteres, sin espacios`,
              flgCumple: valor.length >= regla.num_longitud_minima && valor.length <= regla.num_longitud_maxima && !/\s/.test(valor) },
            { texto: `Al menos ${regla.num_criterios_minimos} de: minúscula, mayúscula, número, carácter especial`, flgCumple: criterios >= regla.num_criterios_minimos },
            { texto: 'Sin su usuario, DNI, nombres ni apellidos', flgCumple: !!valor && !contieneDato },
            { texto: 'Sin palabras comunes ni 4 caracteres iguales seguidos', flgCumple: !!valor && !CLAVES_COMUNES.some(c => normal.indexOf(c) >= 0) && !/(.)\1{3,}/.test(valor) }
        ]
    }

    /** Cambio obligatorio (con tokenCambio) o voluntario (token de acceso que agrega el interceptor). */
    cambiarClave(claveNueva: string, claveActual: string, referencia: string): Promise<any> {
        const cuerpo: any = { claveNueva, nidmodulo: environment.nidModulo, referencia }
        let opciones = {}
        if (this.validarCambioVigente()) {
            opciones = { headers: new HttpHeaders({ Authorization: `${environment.tokenWord} ${this.cambioPendiente.tokenCambio}` }) }
        } else {
            cuerpo.claveActual = claveActual
        }
        return new Promise(resolve => {
            this.http.post(`${environment.urlSeguridad}/politicaClave/clave/cambiar`, cuerpo, opciones)
                .subscribe({
                    next: respuesta => resolve(respuesta),
                    error: error => resolve(error && error.error && typeof error.error === 'object'
                        ? error.error
                        : { status: -1, message: 'No se pudo conectar con el servicio de seguridad.' })
                })
        })
    }

    private normalizarTexto(texto: string): string {
        return `${texto || ''}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    }
}
