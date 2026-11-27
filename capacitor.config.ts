import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
    appId: 'pe.gob.foncodes.sgp',
    appName: 'SGP',
    webDir: 'www',
    server: {
        androidScheme: 'https',
        // DEV: permite llamar al backend por HTTP (10.0.2.2/localhost). En produccion (HTTPS) no aplica.
        cleartext: true
    },
    android: {
        // DEV: permite contenido mixto (pagina HTTPS -> peticion HTTP) para pruebas locales.
        allowMixedContent: true
    }
}

export default config;
