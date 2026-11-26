import { Injectable } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { NavController, AlertController } from '@ionic/angular'
import { Browser } from '@capacitor/browser'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

import { environment } from '../../environments/environment'
import { SeguridadService } from './seguridad.service'

/**
 * Control de versiones del App. Al iniciar, consulta /versionApp/verificar
 * enviando el versionCode instalado. Si hay una versión obligatoria, bloquea con la
 * pantalla de actualización
 */
@Injectable({ providedIn: 'root' })
export class ActualizacionService {

    info: any = null

    constructor(private http: HttpClient,
                private seguridadService: SeguridadService,
                private alertCtrl: AlertController,
                private navCtrl: NavController) { }

    /** Revisa si hay actualización. Devuelve true si debe bloquearse (versión obligatoria). */
    async revisar(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) { return false }   // en navegador no aplica

        const versionCode = await this.obtenerVersionCode()
        const r = await this.verificar(versionCode)
        if (!r || r.status !== 0) { return false }
        this.info = r

        if (r.estado === 'OBLIGATORIA') {
            this.navCtrl.navigateRoot('/actualizacion', { animated: true })
            return true
        }
        if (r.estado === 'OPCIONAL') {
            this.avisarOpcional(r)
        }
        return false
    }

    async descargar(nidVersionApp: number) {
        const token = this.seguridadService.token || ''
        const url = `${environment.urlSeguridad}/versionApp/descargar/${nidVersionApp}?token=${encodeURIComponent(token)}`
        await Browser.open({ url })
    }

    private async obtenerVersionCode(): Promise<number> {
        try {
            const info = await App.getInfo()     // en Android, build = versionCode
            return +info.build || 0
        } catch (e) {
            return 0
        }
    }

    private verificar(versionCode: number): Promise<any> {
        return new Promise(resolve => {
            this.http.post(`${environment.urlSeguridad}/versionApp/verificar`, { nidmodulo: environment.nidModulo, versionCode })
                .subscribe({ next: r => resolve(r), error: () => resolve(null) })
        })
    }

    private async avisarOpcional(r: any) {
        const alerta = await this.alertCtrl.create({
            header: 'Nueva versión disponible',
            message: `Hay una versión más reciente${r.version ? ' (' + r.version + ')' : ''}. ¿Desea actualizar ahora?`,
            buttons: [
                { text: 'Después', role: 'cancel' },
                { text: 'Actualizar', handler: () => { this.descargar(r.nidVersionApp) } }
            ]
        })
        await alerta.present()
    }
}
