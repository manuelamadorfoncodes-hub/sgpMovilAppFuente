import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Network } from '@capacitor/network';

import { SeguridadService } from './seguridad.service';
import { UiServiceService } from './ui-service.service';
import { Modulo, User } from '../model/generales';

@Injectable({
    providedIn: 'root'
})
export class UtilService {

    constructor(private platform: Platform,
        private seguridadService: SeguridadService,
        private uiService: UiServiceService) { }

    async evaluarRed() {
        // const conexion = this.network.type
        // if (conexion) {
        //     return true
        // }
        return false
    }

    async evaluarConexion(omitirAlertas?: boolean, omitirPermisos?: boolean) {
        const evaluarConexion = await this.platform.ready().then((valor) => {
            console.log('Evalúa conexión :>> ', valor);
            if (valor === 'dom') {return false}
            return true

            // if (this.platform.is('android')) {
            //     console.log("running on Android device!");
            //     return true
            // }
            // if (this.platform.is('ios')) {
            //     console.log("running on iOS device!");
            //     return true
            // }
            // if (this.platform.is('mobileweb')) {
            //     console.log("running in a browser on mobile!");
            //     return true
            // }
        })

        const conexion = (await Network.getStatus()).connected
        if (evaluarConexion && (!conexion)) {
            if (!omitirAlertas) {this.uiService.alertaInformativa('No se ha encontrado conexión a internet.')}
            return false
        }

        const status = await Network.getStatus()
        if (!status || !status.connected) {
            if (!omitirAlertas) {this.uiService.alertaInformativa('No se ha encontrado conexión a internet.')}
            return false
        }

        const tokenOk = await this.seguridadService.evaluarToken()
        if (!tokenOk) {
            if (!omitirAlertas) {this.uiService.alertaInformativa('No tiene permiso para sincronizar información.')}
            return false
        }

        const acceso = await this.seguridadService.validaAcceso()
        if (!acceso) {
            if (!omitirAlertas) {this.uiService.alertaInformativa('Debe confirmar su contraseña.')}
            return false
        }

        if (!omitirPermisos) {
            const permiso = await this.seguridadService.evaluaPermisos()
            if (!permiso) {
                if (!omitirAlertas) {this.uiService.alertaInformativa('Sus permisos han sido revocados. No puede sincronizar información.')}
                return false
            }
        }

        // OJO pendiente de pasar a producción (11/08/2021)
        // const acepta = await this.seguridadService.validaAcuerdo()
        // if (!acepta) {
        //     if (!omitirAlertas) {this.uiService.alertaInformativa('Debe aceptar el acuerdo de confidencialidad de la información.')}
        //     return false
        // }
        
        return true
    }

    async renuevaPermisos(user: User, modulo: Modulo) {
        await this.seguridadService.renuevaToken()
    }
}
