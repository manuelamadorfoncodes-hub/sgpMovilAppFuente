import { Injectable } from '@angular/core';
import { AlertController, ToastController, LoadingController, AlertInput } from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class UiServiceService {
    loading: any

    constructor(private alertController: AlertController,
        private toastController: ToastController,
        private loadingCtrl: LoadingController) { }

    async alertaInformativa(message: string) {
        const alert = await this.alertController.create({
            message,
            mode: 'ios',
            buttons: ['Aceptar']
        });

        await alert.present();
    }

    async alertaConfirmacion(message: string) {
        let respuesta: boolean
        const alert = await this.alertController.create({
            message,
            mode: 'ios',
            buttons: [
                {
                    text: 'Sí',
                    handler: () => { respuesta = true }
                },
                {
                    text: 'No', role: 'cancel', // cssClass: 'secondary',
                    handler: () => { respuesta = false }
                }
            ]
        });

        await alert.present()
        const result = await alert.onDidDismiss().then(() => {
            return respuesta
        });

        return result
    }

    async alertaRegistraTexto(etiqueta: string, placeholder: string, buttonTexCancelar?: string, buttonTextAceptar?: string, valor?: string) {
        let dato
        buttonTexCancelar = buttonTexCancelar ? buttonTexCancelar : 'Cancelar'
        buttonTextAceptar = buttonTextAceptar ? buttonTextAceptar : 'Aceptar'
        const alert = await this.alertController.create({
            // cssClass: 'descar',
            mode: 'ios',
            // header: etiqueta,
            subHeader: etiqueta,
            // message: etiqueta,
            inputs: [
                {name: 'texto', type: 'textarea', placeholder, max: '250', value: valor}
            ],
            buttons: [
                {text: buttonTexCancelar, role: 'cancel', cssClass: 'secondary', handler: () => {console.log('Confirm Cancel')}},
                {text: buttonTextAceptar, handler: (data) => dato = data.texto}
            ]
        });

        await alert.present();
        await alert.onDidDismiss()
        return dato
    }

    async alertaAcuerdo(acepta: boolean) {
        // let acepta = false
        console.log('acepta :>> ', acepta);
        const message = 'Texto del acuerdo.</br> They were dropping, losing altitude in a canyon of rainbow foliage, a lurid communal mural that completely covered the hull of the Sprawl’s towers and ragged Fuller domes, dim figures moving toward him in the dark. Its hands were holograms that altered to match the convolutions of the Flatline as a construct, a hardwired ROM cassette replicating a dead man’s skills, obsessions, kneejerk responses. Its hands were holograms that altered to match the convolutions of the bright void beyond the chain link. The Sprawl was a square of faint light. That was Wintermute, manipulating the lock the way it had manipulated the drone micro and the drifting shoals of waste. Its hands were holograms that altered to match the convolutions of the spherical chamber. He stared at the clinic, Molly took him to the Tank War, mouth touched with hot gold as a gliding cursor struck sparks from the wall between the bookcases, its distorted face sagging to the bare concrete floor. None of that prepared him for the arena, the crowd, the tense hush, the towering puppets of light from a service hatch at the clinic, Molly took him to the Tank War, mouth touched with hot gold as a gliding cursor struck sparks from the wall of a skyscraper canyon.'
        if (acepta) {
            const alert = await this.alertController.create({
                cssClass: 'acuerdo-alert',
                mode: 'ios',
                header: 'Acuerdo de confidencialidad de la información',
                message,
                buttons: [
                    { text: 'Cerrar', role: 'cancel', cssClass: 'secondary', handler: () => {console.log('Confirm Cancel') } }
                ]
            })
            await alert.present()
            await alert.onDidDismiss()
            return false
        } else {
            const alert = await this.alertController.create({
                cssClass: 'acuerdo-alert',
                mode: 'ios',
                header: 'Acuerdo de confidencialidad de la información',
                message,
                inputs: [{ name: 'checkbox1', type: 'checkbox', label: 'Sí, acepto', value: false,
                            handler: (data) => {data.value = data.checked}, checked: false}],
                buttons: [
                    { text: 'Cancelar', role: 'cancel', cssClass: 'secondary', handler: () => {console.log('Confirm Cancel') } },
                    { text: 'Aceptar', handler: (data) => {acepta = data[0] } }
                ]
            });
            await alert.present()
            await alert.onDidDismiss()
            return acepta
        }
    }

    async alertaNidFuncion() {
        let dato
        const alert = await this.alertController.create({
            // cssClass: 'descar',
            mode: 'ios',
            header: 'Seleccione la función',
            inputs: [
                {
                    name: 'radio1', type: 'radio', label: 'Proyectista', value: '359',
                    handler: () => {console.log('Radio 1 selected')},
                    checked: true
                },
                {
                    name: 'radio2', type: 'radio', label: 'Coordinador Técnico', value: '432',
                    handler: () => {console.log('Radio 2 selected')}
                },
                {
                    name: 'radio3', type: 'radio', label: 'Yachachiq Productivo', value: '483',
                    handler: () => {console.log('Radio 3 selected')}
                },
            ],
            buttons: [
                {text: 'Cancel', role: 'cancel', cssClass: 'secondary', handler: () => {console.log('Confirm Cancel')}},
                {text: 'Ok', handler: (data) => {
                    console.log('data :>> ', data);
                    dato = data
                }}
            ]
        });

        await alert.present();
        await alert.onDidDismiss()
        return dato
    }

    async alertaNidPersonal() {
        let dato
        const alert = await this.alertController.create({
            // cssClass: 'descar',
            mode: 'ios',
            header: 'Ingrese el id del agente',
            inputs: [
                {name: 'nidPersonal', type: 'text', placeholder: 'nid_personal'}
            ],
            buttons: [
                {text: 'Cancel', role: 'cancel', cssClass: 'secondary', handler: () => {console.log('Confirm Cancel')}},
                {text: 'Ok', handler: (data) => dato = data.nidPersonal}
            ]
        });

        await alert.present();
        await alert.onDidDismiss()
        return dato
    }

    async mostrarCalificacion(totalTec: number, totalViv: number, totalCom: number, totalAut: number, totalPuntaje: number, resultado: string, seccionAut: boolean ) {
        const mensaje1 = `
        <table>
          <tr class="fila">
            <th class="col-texto">Sección</th>
            <th class="col-numero">Puntaje</th>
          </tr>
          <tr class="fila">
            <td class="col-texto">Fortalecimiento y consolidación de los sistemas de producción familiar</td>
            <td class="col-numero">${(totalTec).toFixed(2) }</td>
          </tr>
          <tr class="fila">
            <td class="col-texto">Mejora de la vivienda saludable</td>
            <td class="col-numero">${totalViv.toFixed(2)}</td>
          </tr>
          <tr class="fila">
            <td class="col-texto">Comercialización y asociatividad</td>
            <td class="col-numero">${totalCom.toFixed(2)}</td>
          </tr>`
        const mensaje2 = `
          <tr class="fila">
            <td class="col-texto">Autoevaluación de usuario (capacitación y asistencia técnica)</td>
            <td class="col-numero">${totalAut.toFixed(2)}</td>
          </tr>`
        const mensaje3 = `
          <tr class="fila">
            <th class="col-texto">Puntaje total</th>
            <th class="col-numero">${totalPuntaje.toFixed(2)}</th>
          </tr>
          <tr class="fila">
            <th class="col-texto">Resultado</th>
            <th class="col-numero">${resultado}</th>
          </tr>
        </table>`
        
        const alert = await this.alertController.create({
            cssClass: 'calificacion-alert',
            mode: 'ios',
            header: 'CALIFICACION OBTENIDA',
            message: mensaje1 + (seccionAut ? mensaje2 : '') + mensaje3, 
            buttons: [
                { text: 'Cerrar', role: 'cancel', cssClass: 'secondary', handler: () => {console.log('Confirm Cancel') } },
            ]
        });

        await alert.present()
        await alert.onDidDismiss()
    }

    async alertaSeleccion(etiqueta: string, lista: any) {
        let datos
        // const inputs: AlertInput[] = [
        //     {name: 'dni', type: 'text', placeholder: 'Número de DNI', max: '8', min: '8', attributes: {maxlength: 8}},
        //     {name: 'apePat', type: 'text', placeholder: 'Apellido Paterno', attributes: {maxlength: 40}},
        //     {name: 'apeMat', type: 'text', placeholder: 'Apellido Materno', attributes: {maxlength: 40}},
        //     {name: 'nombres', type: 'text', placeholder: 'Nombres', attributes: {maxlength: 80}}
        // ]
        const inputs: AlertInput[] = lista
        const alert = await this.alertController.create({
            cssClass: 'select-alert',
            mode: 'ios',
            // header: etiqueta,
            subHeader: etiqueta,
            // message: etiqueta,
            // inputs: [
            //     {name: 'dni', type: 'text', placeholder: 'Número de DNI', max: '8', min: '8', attributes: {maxlength: 8}},
            //     {name: 'apePat', type: 'text', placeholder: 'Apellido Paterno', attributes: {maxlength: 40}},
            //     {name: 'apeMat', type: 'text', placeholder: 'Apellido Materno', attributes: {maxlength: 40}},
            //     {name: 'nombres', type: 'text', placeholder: 'Nombres', attributes: {maxlength: 80}}
            // ],
            inputs,
            buttons: [
                {text: 'Cancelar', role: 'cancel', cssClass: 'secondary', handler: () => {console.log('Confirm Cancel')}},
                {text: 'Aceptar', handler: (data) => datos = data}
            ]
        });
        await alert.present();
        await alert.onDidDismiss()
        return datos
    }

    async alertaRegistraPersona(etiqueta: string, esParticipante?: boolean, datos?: any) {
        // let datos
        const inputs: AlertInput[] = [
            {name: 'dni', type: 'number', value: (datos ? datos.dni : null), placeholder: 'Número de DNI', max: 99999999, min: 10000000, attributes: {maxlength: 8, size: 8}},
            {name: 'apePat', type: 'text', value: (datos ? datos.apePat : null), placeholder: 'Apellido Paterno', attributes: {maxlength: 40}},
            {name: 'apeMat', type: 'text', value: (datos ? datos.apeMat : null), placeholder: 'Apellido Materno', attributes: {maxlength: 40}},
            {name: 'nombres', type: 'text', value: (datos ? datos.nombres : null), placeholder: 'Nombres', attributes: {maxlength: 80}}
        ]
        if (esParticipante) {
            inputs.push({name: 'cargo', type: 'text', value: (datos ? datos.cargo : null), placeholder: 'Cargo', attributes: {maxlength: 100}})
            inputs.push({name: 'institucion', type: 'textarea', value: (datos ? datos.institucion : null), placeholder: 'Institución', attributes: {maxlength: 200}})
        }
        const alert = await this.alertController.create({
            // cssClass: 'descar',
            mode: 'ios',
            // header: etiqueta,
            subHeader: etiqueta,
            // message: etiqueta,
            inputs,
            buttons: [
                {text: 'Cancelar', role: 'cancel', cssClass: 'secondary', handler: () => {console.log('Confirm Cancel')}},
                {text: 'Aceptar', handler: (data) => datos = data}
            ]
        });
        await alert.present();
        await alert.onDidDismiss()
        return datos
    }


    async presentToast(message: string) {
        const toast = await this.toastController.create({
            message,
            position: 'top',
            duration: 3000,
            color: 'secondary',
            cssClass: 'toast'
        });
        toast.present();
    }

    async presentLoading(message: string) {
        this.loading = await this.loadingCtrl.create({
            message
            // duration: 2000
        });
        return await this.loading.present();
    }

    async dismissLoading() {
        if (this.loading) {
            return await this.loading.dismiss();
        }
    }

}
