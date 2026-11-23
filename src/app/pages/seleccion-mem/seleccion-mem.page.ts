import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FichaSeleccionMemDet, FichaSeleccionMem, Usuario } from '../../model/usuarios';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';

@Component({
    selector: 'app-seleccion-mem',
    templateUrl: './seleccion-mem.page.html',
    styleUrls: ['./seleccion-mem.page.scss'],
})
export class SeleccionMemPage implements OnInit {

    @Input() usuario: Usuario
    @Input() index: number
    @Input() consulta: boolean = false
    @Input() fichaTexto: string
    ficha: FichaSeleccionMem = {}
    fichaDetalle: FichaSeleccionMemDet[] = []
    resultado = ''
    // lineaNegocio = []
    
    constructor(private modalController: ModalController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService 
    ) { }

    async ngOnInit() {
        if (this.fichaTexto) {
            this.ficha = JSON.parse(this.fichaTexto)
            this.evaluarResultado()
        } else {
            const user = await this.dataLocalService.leerUser()
            const funcion = await this.dataLocalService.leerFuncion()
            this.ficha.codigo_expediente = this.usuario.codigo_expediente
            this.ficha.nid_funcion = funcion.nid_funcion
            this.ficha.nid_personal = user.nidPersonal
            this.ficha.nid_personal_proyecto = this.usuario.nid_personal_proyecto
            this.ficha.fec_registro = new Date()
            this.ficha.cod_linea_negocio = this.usuario.tecnologias[0].cod_tecnologia.substring(2,4)
            this.ficha.txt_linea_negocio = this.usuario.tecnologias[0].txt_tecnologia
        }

        const parametros = await this.dataLocalService.leerUsuariosParametro()
        // this.lineaNegocio = parametros.lineaNegocioMem
        parametros.seleccionMem.forEach(pregunta => {
            const detalle: FichaSeleccionMemDet = {
                codigo_expediente: this.ficha.codigo_expediente,
                cod_pregunta: pregunta.cod_tipo,
                pregunta: pregunta.txt_tipo,
                codigoSeccion: pregunta.txt_dato2,
                subSeccion: pregunta.txt_dato4,
                respuestas: pregunta.subTipos
            }
            if (this.ficha.detalle) {
                const fichaDetalle = this.ficha.detalle.find(item => item.cod_pregunta === pregunta.cod_tipo)
                if (fichaDetalle) {
                    detalle.cod_respuesta = fichaDetalle.cod_respuesta
                    detalle.num_puntos = fichaDetalle.num_puntos
                }
            }
            this.fichaDetalle.push(detalle)
        })

    }
    
    calificar(event, index) {
        this.fichaDetalle[index].cod_respuesta = event.detail.value
        console.log('event :>> ', event.detail.value);
        let puntaje1 = 0
        let puntaje2 = 0
        let puntaje3 = 0
        console.log('this.fichaDetalle 111111:>> ', this.fichaDetalle);
        this.fichaDetalle.forEach(detalle => {
            // console.log('detalle :>> ', detalle);
            // console.log('detalle.cod_respuesta :>> ', detalle.cod_respuesta);
            detalle.num_puntos = detalle.cod_respuesta ? detalle.respuestas.find(item => item.cod_tipo === detalle.cod_respuesta).num_dato1 : null
            if (detalle.codigoSeccion === '01') {puntaje1 = puntaje1 + detalle.num_puntos}
            if (detalle.codigoSeccion === '02') {puntaje2 = puntaje2 + detalle.num_puntos}
            if (detalle.codigoSeccion === '03') {puntaje3 = puntaje3 + detalle.num_puntos}
        });
        this.ficha.num_puntaje_seccion_1 = puntaje1
        this.ficha.num_puntaje_seccion_2 = this.ficha.num_puntaje_seccion_1 >= 12 ? puntaje2 : null
        this.ficha.num_puntaje_seccion_3 = this.ficha.num_puntaje_seccion_2 >= 16 ? puntaje3 : null
        console.log('this.ficha 222222:>> ', this.ficha);
        this.evaluarResultado()
    }

    evaluarResultado() {
        if (this.ficha.num_puntaje_seccion_2 && this.ficha.num_puntaje_seccion_2 >= 16) {
            this.resultado = 'SELECCIONADA'
        } else {
            this.resultado = 'NO SELECCIONADA'
        }
    }

    async guardar() {
        this.borrarDatos()
        this.ficha.flg_completa = this.validarFichaCompleta()
        this.ficha.detalle = this.fichaDetalle
        this.ficha.fichaGuardada = true
        this.usuario.fichaSeleccionMem = this.ficha
        this.usuario.cambioSeleccionMem = true
        this.usuario.seleccionMemIncompleta = !this.ficha.flg_completa
        this.usuario.seleccionMemNoSincroniza = this.validaSincroniza()
        await this.uiService.presentLoading('Guardando...')
        this.evaluarResultado()
        await this.uiService.alertaInformativa('La usuaria está ' + this.resultado)
        await this.dataLocalService.guardarUsuario(this.usuario, false)
        await this.uiService.dismissLoading()
        this.modalController.dismiss();
    }

    borrarDatos() {
        if (!this.ficha.num_puntaje_seccion_2) {
            this.fichaDetalle.map(item => {
                if (item.codigoSeccion === '02') {
                    item.cod_respuesta = null
                    item.num_puntos = null
                }
            })
        }
        if (!this.ficha.num_puntaje_seccion_3) {
            this.fichaDetalle.map(item => {
                if (item.codigoSeccion === '03') {
                    item.cod_respuesta = null
                    item.num_puntos = null
                }
            })
        }
    }

    validarFichaCompleta() {
        if (!this.fichaDetalle || this.fichaDetalle.length === 0) {return false}
        for (let index = 0; index < this.fichaDetalle.length; index++) {
            if (this.fichaDetalle[index].codigoSeccion === '01') {
                if (!this.fichaDetalle[index].cod_respuesta) {return false}
            } 
            if (this.fichaDetalle[index].codigoSeccion === '02' && this.ficha.num_puntaje_seccion_1 >= 12) {
                if (!this.fichaDetalle[index].cod_respuesta) {return false}
            }
            if (this.fichaDetalle[index].codigoSeccion === '03' && this.ficha.num_puntaje_seccion_2 >= 16) {
                if (!this.fichaDetalle[index].cod_respuesta) {return false}
            }
        }
        return true
    }

    validaSincroniza() {
        if (this.ficha.flg_completa) {return false}
        let incompleto = false
        for (let index = 0; index < this.fichaDetalle.length; index++) {
            if (this.fichaDetalle[index].codigoSeccion === '01') {
                if (!this.fichaDetalle[index].cod_respuesta) {incompleto = true}
            } 
            if (this.fichaDetalle[index].codigoSeccion === '02' && this.ficha.num_puntaje_seccion_1 >= 12) {

                if (!this.fichaDetalle[index].cod_respuesta) {incompleto = true}
            }
        }
        console.log('incompleto :>> ', incompleto);
        if (incompleto) {return true}
        return false
    }

    async salir() {
        this.modalController.dismiss();
    }
}
