import { Component, OnDestroy } from '@angular/core'
import { NavController } from '@ionic/angular'
import { App } from '@capacitor/app'
import { AppLauncher } from '@capacitor/app-launcher'
import { PluginListenerHandle } from '@capacitor/core'

import { DobleFactorService } from '../../services/doble-factor.service'
import { RETO_DOBLE_FACTOR } from '../../model/doble-factor.model'
import { SeguridadService } from '../../services/seguridad.service'
import { UiServiceService } from '../../services/ui-service.service'
import { environment } from '../../../environments/environment'

type Paso = 'elegir' | 'perupass' | 'correo'

/**
 * Segundo factor de autenticación: Perú Pass (principal) o código por correo (contingencia).
 * Se llega aquí solo cuando /dobleFactor/autenticar respondió status 1.
 */
@Component({
    selector: 'app-verificacion-doble-factor',
    templateUrl: './verificacion-doble-factor.page.html',
    styleUrls: ['./verificacion-doble-factor.page.scss'],
})
export class VerificacionDobleFactorPage implements OnDestroy {

    paso: Paso = 'elegir'
    procesando = false
    version = environment.version

    // Perú Pass
    esperandoPerupass = false
    nidPerupass: number = null
    mensajePerupass = ''

    // Correo
    nidCorreo: number = null
    correoDestino = ''
    codigo = ''
    mensajeCorreo = ''
    minutosCodigo = 5
    reenviarEn = 0

    recordarEquipo = false
    restante = ''

    private reloj: any = null
    private escuchaApp: PluginListenerHandle = null
    private activo = false

    constructor(public dobleFactor: DobleFactorService,
                private seguridadService: SeguridadService,
                private uiService: UiServiceService,
                private navCtrl: NavController) { }

    async ionViewWillEnter() {
        if (!this.dobleFactor.validarRetoVigente()) {
            this.navCtrl.navigateRoot('/login')
            return
        }
        this.activo = true
        this.paso = 'elegir'
        this.actualizarTiempoRestante()
        this.reloj = setInterval(() => this.actualizarTiempoRestante(), 1000)
        // Al volver desde Perú Pass la consulta continúa; si se había cortado, se reanuda
        this.escuchaApp = await App.addListener('appStateChange', estado => {
            if (estado.isActive && this.paso === 'perupass' && !this.esperandoPerupass && this.nidPerupass) {
                this.consultarResultadoPerupass(this.nidPerupass)
            }
        })
    }

    ionViewWillLeave() {
        this.detenerVerificacion()
    }

    ngOnDestroy() {
        this.detenerVerificacion()
    }

    get reto(): RETO_DOBLE_FACTOR {
        return this.dobleFactor.reto
    }

    get diasEquipo(): number {
        return this.reto ? this.reto.diasEquipoConfianza : 0
    }

    private detenerVerificacion() {
        this.activo = false
        this.esperandoPerupass = false
        if (this.reloj) { clearInterval(this.reloj); this.reloj = null }
        if (this.escuchaApp) { this.escuchaApp.remove(); this.escuchaApp = null }
    }

    private actualizarTiempoRestante() {
        if (!this.reto) { return }
        const ms = this.reto.expiraEn - Date.now()
        if (ms <= 0) {
            this.detenerVerificacion()
            this.dobleFactor.limpiarReto()
            this.uiService.alertaInformativa('El tiempo para verificar su identidad terminó. Inicie sesión nuevamente.')
            this.navCtrl.navigateRoot('/login')
            return
        }
        const s = Math.floor(ms / 1000)
        this.restante = `${Math.floor(s / 60)}:${`${s % 60}`.padStart(2, '0')}`
        if (this.reenviarEn > 0) { this.reenviarEn-- }
    }

    // ------------------------------------------------------------------ Perú Pass
    async verificarPerupass() {
        if (this.procesando) { return }
        this.procesando = true
        this.mensajePerupass = ''
        const r = await this.dobleFactor.iniciarPerupass()
        this.procesando = false

        if (r.status !== 0) {
            const sugerencia = r.codigo === 'RENIEC_NO_DISPONIBLE' && this.reto.factores.correo ? ' Puede usar el código por correo.' : ''
            this.uiService.alertaInformativa(`${r.message || 'No se pudo iniciar la verificación.'}${sugerencia}`)
            return
        }

        this.nidPerupass = r.nidVerificacion
        this.paso = 'perupass'
        try {
            await AppLauncher.openUrl({ url: r.enlace })
        } catch (e) {
            this.mensajePerupass = 'No se pudo abrir Perú Pass. Verifique que la aplicación esté instalada y actualizada.'
            return
        }
        this.consultarResultadoPerupass(r.nidVerificacion)
    }

    /** Consulta el resultado hasta que Perú Pass responda; el servidor espera hasta ~20 s por consulta. */
    private async consultarResultadoPerupass(nid: number) {
        if (this.esperandoPerupass) { return }
        this.esperandoPerupass = true
        this.mensajePerupass = ''

        while (this.activo && this.esperandoPerupass && this.nidPerupass === nid) {
            const inicio = Date.now()
            const r = await this.dobleFactor.consultarPerupass(nid, this.recordarEquipo)
            if (!this.activo || !this.esperandoPerupass || this.nidPerupass !== nid) { return }

            if (r.status === 2 || r.codigo === 'RED') {
                await this.esperarMilisegundos(Math.max(0, 2000 - (Date.now() - inicio)))
                continue
            }

            this.esperandoPerupass = false
            if (r.status === 0) {
                await this.ingresarSistema(r)
            } else if (r.status === -2) {
                this.mensajePerupass = r.message || 'La verificación venció.'
                this.nidPerupass = null
            } else {
                this.nidPerupass = null
                this.paso = 'elegir'
                this.uiService.alertaInformativa(r.message || 'La verificación con Perú Pass fue rechazada.')
            }
            return
        }
    }

    async reintentarPerupass() {
        this.paso = 'elegir'
        this.nidPerupass = null
        await this.verificarPerupass()
    }

    // ------------------------------------------------------------------ Correo
    async enviarCodigoCorreo() {
        if (this.procesando) { return }
        this.esperandoPerupass = false
        this.nidPerupass = null
        this.procesando = true
        this.mensajeCorreo = ''
        const r = await this.dobleFactor.enviarCodigoCorreo()
        this.procesando = false

        if (r.status !== 0) {
            this.uiService.alertaInformativa(r.message || 'No se pudo enviar el código.')
            return
        }
        this.nidCorreo = r.nidVerificacion
        this.correoDestino = r.correoEnmascarado
        const vence = r.fecExpiracion ? new Date(r.fecExpiracion).getTime() : 0
        this.minutosCodigo = vence > Date.now() ? Math.max(1, Math.round((vence - Date.now()) / 60000)) : 5
        this.codigo = ''
        this.reenviarEn = 60
        this.paso = 'correo'
    }

    async validarCodigoCorreo() {
        const codigo = `${this.codigo || ''}`.replace(/\D/g, '')
        if (codigo.length !== 6) {
            this.mensajeCorreo = 'Ingrese los 6 dígitos del código.'
            return
        }
        if (this.procesando) { return }
        this.procesando = true
        const r = await this.dobleFactor.validarCodigoCorreo(this.nidCorreo, codigo, this.recordarEquipo)
        this.procesando = false

        if (r.status === 0) {
            await this.ingresarSistema(r)
            return
        }
        this.codigo = ''
        this.mensajeCorreo = r.message || 'Código no válido.'
        if (r.status === -2) { this.reenviarEn = 0 }
    }

    // ------------------------------------------------------------------ Común
    private async ingresarSistema(respuesta: any) {
        this.detenerVerificacion()
        await this.uiService.presentLoading('Ingresando…')
        try {
            await this.seguridadService.guardarToken(respuesta)
        } finally {
            await this.uiService.dismissLoading()
        }
        this.dobleFactor.limpiarReto()
        this.navCtrl.navigateRoot('/inicio', { animated: true })
    }

    volverSeleccionMetodo() {
        this.esperandoPerupass = false
        this.nidPerupass = null
        this.paso = 'elegir'
    }

    cancelarVerificacion() {
        this.detenerVerificacion()
        this.dobleFactor.limpiarReto()
        this.navCtrl.navigateRoot('/login')
    }

    private esperarMilisegundos(milisegundos: number) {
        return new Promise(resolve => setTimeout(resolve, milisegundos))
    }
}
