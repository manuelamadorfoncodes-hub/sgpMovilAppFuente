import { Component, OnDestroy, OnInit } from '@angular/core'
import { App } from '@capacitor/app'
import { PluginListenerHandle } from '@capacitor/core'

import { ActualizacionService } from '../../services/actualizacion.service'
import { environment } from '../../../environments/environment'

/**
 * Pantalla de actualización obligatoria. Bloquea el uso del App hasta
 * que el usuario descargue e instale la nueva versión. Se llega aquí cuando
 * /versionApp/verificar respondió OBLIGATORIA.
 */
@Component({
    selector: 'app-actualizacion',
    templateUrl: './actualizacion.page.html',
    styleUrls: ['./actualizacion.page.scss'],
})
export class ActualizacionPage implements OnInit, OnDestroy {

    version = environment.version
    descargando = false
    private bloqueoAtras: PluginListenerHandle = null

    constructor(public actualizacion: ActualizacionService) { }

    async ngOnInit() {
        // Evita que el botón "atrás" de Android salga de esta pantalla.
        this.bloqueoAtras = await App.addListener('backButton', () => { /* bloqueado a propósito */ })
    }

    ngOnDestroy() {
        if (this.bloqueoAtras) { this.bloqueoAtras.remove(); this.bloqueoAtras = null }
    }

    get info(): any {
        return this.actualizacion.info
    }

    async descargar() {
        if (!this.info || !this.info.nidVersionApp) { return }
        this.descargando = true
        try {
            await this.actualizacion.descargar(this.info.nidVersionApp)
        } finally {
            this.descargando = false
        }
    }
}
