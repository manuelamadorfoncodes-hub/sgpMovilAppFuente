import { Component } from '@angular/core'
import { NavController } from '@ionic/angular'
import { JwtHelperService } from '@auth0/angular-jwt'

import { PoliticaClaveService } from '../../services/politica-clave.service'
import { SeguridadService } from '../../services/seguridad.service'
import { UiServiceService } from '../../services/ui-service.service'
import { CONDICION_CLAVE, REGLA_CLAVE } from '../../model/politica-clave.model'
import { environment } from '../../../environments/environment'

const helper = new JwtHelperService()

/**
 * Cambio de contraseña.
 *  - Obligatorio: clave vencida o cambio exigido (status 3 del login). No pide la clave actual.
 *  - Voluntario: desde el menú o el aviso de caducidad. Pide la clave actual.
 */
@Component({
    selector: 'app-cambio-clave',
    templateUrl: './cambio-clave.page.html',
    styleUrls: ['./cambio-clave.page.scss'],
})
export class CambioClavePage {

    flgObligatorio = false
    mensaje = ''
    claveActual = ''
    claveNueva = ''
    claveConfirmacion = ''
    flgMostrarClave = false
    procesando = false
    errores: string[] = []
    regla: REGLA_CLAVE = null
    condiciones: CONDICION_CLAVE[] = []
    version = environment.version

    private datosUsuario: string[] = []

    constructor(private politicaClave: PoliticaClaveService,
                private seguridadService: SeguridadService,
                private uiService: UiServiceService,
                private navCtrl: NavController) { }

    ionViewWillEnter() {
        this.flgObligatorio = this.politicaClave.validarCambioVigente()
        if (!this.flgObligatorio && !this.seguridadService.token) {
            this.navCtrl.navigateRoot('/login')
            return
        }
        this.mensaje = this.flgObligatorio ? this.politicaClave.cambioPendiente.mensaje : 'Escriba su contraseña actual y la nueva.'
        this.regla = this.politicaClave.obtenerReglaVigente()
        this.datosUsuario = this.obtenerDatosUsuario()
        this.limpiarFormulario()
    }

    get flgCoincide(): boolean {
        return !!this.claveNueva && this.claveNueva === this.claveConfirmacion
    }

    get flgValida(): boolean {
        return this.condiciones.every(c => c.flgCumple) && this.flgCoincide && (this.flgObligatorio || !!this.claveActual)
    }

    actualizarCondiciones() {
        this.condiciones = this.politicaClave.evaluarCondiciones(this.claveNueva, this.regla, this.datosUsuario)
        this.errores = []
    }

    async cambiarClave() {
        if (!this.flgValida || this.procesando) { return }
        if (this.flgObligatorio && !this.politicaClave.validarCambioVigente()) {
            await this.uiService.alertaInformativa('El tiempo para cambiar la contraseña terminó. Inicie sesión nuevamente.')
            this.cancelarCambio()
            return
        }
        this.procesando = true
        await this.uiService.presentLoading('Cambiando contraseña…')
        const respuesta = await this.politicaClave.cambiarClave(this.claveNueva, this.claveActual, await this.seguridadService.obtenerReferencia())
        if (respuesta.status === 0) {
            try {
                await this.seguridadService.guardarToken(respuesta)
            } finally {
                await this.uiService.dismissLoading()
                this.procesando = false
            }
            const eraObligatorio = this.flgObligatorio
            this.politicaClave.limpiarCambioObligatorio()
            this.limpiarFormulario()
            this.uiService.presentToast('Su contraseña se cambió correctamente.')
            eraObligatorio ? this.navCtrl.navigateRoot('/inicio', { animated: true }) : this.navCtrl.back()
            return
        }
        await this.uiService.dismissLoading()
        this.procesando = false
        if (respuesta.status === -3) {
            await this.uiService.alertaInformativa(respuesta.message || 'Inicie sesión nuevamente.')
            this.cancelarCambio()
            return
        }
        if (respuesta.regla) { this.regla = respuesta.regla; this.actualizarCondiciones() }
        this.errores = Array.isArray(respuesta.errores) && respuesta.errores.length ? respuesta.errores : [respuesta.message || 'No se pudo cambiar la contraseña.']
    }

    cancelarCambio() {
        const eraObligatorio = this.flgObligatorio || !!this.politicaClave.cambioPendiente
        this.politicaClave.limpiarCambioObligatorio()
        this.limpiarFormulario()
        eraObligatorio || !this.seguridadService.token ? this.navCtrl.navigateRoot('/login') : this.navCtrl.back()
    }

    private limpiarFormulario() {
        this.claveActual = ''
        this.claveNueva = ''
        this.claveConfirmacion = ''
        this.errores = []
        this.actualizarCondiciones()
    }

    /** Datos que no pueden formar parte de la clave (del token de acceso, si existe). */
    private obtenerDatosUsuario(): string[] {
        try {
            const token = this.seguridadService.token
            if (!token) { return [] }
            const d = helper.decodeToken(token)
            return [d.codusr, d.dni, d.nombres, d.apepat, d.apemat, d.email ? `${d.email}`.split('@')[0] : '']
                .join(' ').split(/\s+/).filter(x => !!x)
        } catch (e) {
            return []
        }
    }
}
