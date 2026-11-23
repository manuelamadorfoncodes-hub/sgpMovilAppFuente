import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { Tipo } from '../../model/generales';
import { FichaMujer, FichaMujerDetalle, Usuario } from '../../model/usuarios';

@Component({
    selector: 'app-usuario-ficha-mujer',
    templateUrl: './usuario-ficha-mujer.page.html',
    styleUrls: ['./usuario-ficha-mujer.page.scss'],
})
export class UsuarioFichaMujerPage implements OnInit {

    @Input() usuario: Usuario
    @Input() consulta = false
    @Input() esSolicitudCambio = false
    @Input() fichaText: string
    preguntas: Tipo[]
    ficha: FichaMujer = {}
    detalle: FichaMujerDetalle[] = []
    tieneEmprendimiento: false
    tipoOrganizacionBase = []

    constructor(private modalController: ModalController,
            private dataLocalService: DataLocalService,
            private uiService: UiServiceService) { }

    async ngOnInit() {
        const parametros = await this.dataLocalService.leerUsuariosParametro()
        this.preguntas = parametros.fichaMujer
        this.tipoOrganizacionBase = parametros.organizacionBase
        if ((!this.esSolicitudCambio && this.usuario.fichaMujer) || (this.esSolicitudCambio && this.fichaText)) {
            await this.cargarFicha()
        } else {
            await this.crearFicha()
        }
    }

    async crearFicha() {
        const user = await this.dataLocalService.leerUser()
        const funcion = await this.dataLocalService.leerFuncion()
        this.ficha.codigo_expediente = this.usuario.codigo_expediente
        if (!this.esSolicitudCambio && !this.ficha.nid_personal_proyecto) {this.ficha.nid_personal_proyecto = this.usuario.nid_personal_proyecto}
        this.ficha.fec_visita = new Date()
        this.ficha.nid_entrevistador = user.nidPersonal
        this.ficha.txt_entrevistador = `${user.apellidoPaterno} ${user.apellidoMaterno}, ${user.nombres}`
        this.ficha.nid_funcion_entrevistador = funcion.nid_funcion
        for (let index = 0; index < this.preguntas.length; index++) {
            this.preguntas[index].txt_tipo = `${this.preguntas[index].num_dato1} - ${this.preguntas[index].txt_tipo}`  
            const detalle: FichaMujerDetalle = {
                codigo_expediente: this.ficha.codigo_expediente,
                cod_pregunta: this.preguntas[index].cod_tipo,
                flg_eliminado: this.preguntas[index].txt_dato4 ? (this.preguntas[index].txt_dato4 === '00' ? false : true) : false,
                pregunta: this.preguntas[index]
            }
            this.detalle.push(detalle)            
        }
    }

    async cargarFicha() {
        if (this.esSolicitudCambio) {
            if (this.fichaText) {this.ficha = JSON.parse(this.fichaText)}
        } else {
            this.ficha = this.usuario.fichaMujer

        }
        const user = await this.dataLocalService.leerUser()
        const funcion = await this.dataLocalService.leerFuncion()
        this.ficha.nid_entrevistador = user.nidPersonal
        this.ficha.txt_entrevistador = `${user.apellidoPaterno} ${user.apellidoMaterno}, ${user.nombres}`
        this.ficha.nid_funcion_entrevistador = funcion.nid_funcion
        for (let index = 0; index < this.preguntas.length; index++) {
            this.preguntas[index].txt_tipo = `${this.preguntas[index].num_dato1} - ${this.preguntas[index].txt_tipo}`
            let detalle = this.ficha.detalle?.find(item => item.cod_pregunta === this.preguntas[index].cod_tipo)
            console.log('detalle :>> ', detalle);
            if (detalle) {
                detalle.pregunta = this.preguntas[index]
                detalle = this.validarRespuestaOtros(detalle)
            } else {
                detalle = {
                    codigo_expediente: this.ficha.codigo_expediente,
                    nid_ficha: this.ficha.nid_ficha,
                    cod_pregunta: this.preguntas[index].cod_tipo,
                    flg_eliminado: this.preguntas[index].txt_dato4 ? (this.preguntas[index].txt_dato4 === '00' ? false : true) : false,
                    pregunta: this.preguntas[index] 
                }
            }
            this.detalle.push(detalle)            
        }
        this.ficha.detalle?.forEach(item => {
            if (!this.detalle.find(det => det.cod_pregunta === item.cod_pregunta)) {
                item.flg_eliminado = true
                this.detalle.push(item)
            }
        })
    }

    validarRespuesta(preguntaEvaluada: FichaMujerDetalle, index: number) {
        console.log('event, preguntaEvaluada :>> ', preguntaEvaluada.cod_respuesta, preguntaEvaluada);
        if (preguntaEvaluada.cod_respuesta && preguntaEvaluada.pregunta.txt_dato4 === '00') {
            this.detalle.forEach(item => {
                if (item.pregunta.txt_dato4 && item.pregunta.txt_dato4 !== '00') {
                    if (item.pregunta.txt_dato4 === preguntaEvaluada.cod_respuesta) {
                        item.flg_eliminado = false
                    } else {
                        item.flg_eliminado = true
                        item.cod_respuesta = null
                        item.cod_tipo_otro = null
                        item.txt_otro = null
                    }
                }
            })
        }
        this.detalle[index] = this.validarRespuestaOtros(preguntaEvaluada)
    }

    validarRespuestaOtros(preguntaEvaluada: FichaMujerDetalle) {
        if (preguntaEvaluada?.cod_respuesta?.includes('99')) {
            const respuesta99 = preguntaEvaluada.pregunta.subTipos.find(item => item.cod_tipo === '99')
            console.log(' la respuesta incluye 99 ---- respuesta99 :>> ', respuesta99);
            if (respuesta99.txt_dato1) {
                preguntaEvaluada.categoriaTexto = respuesta99.txt_dato2
                preguntaEvaluada.categoriaOpciones = respuesta99.subTipos
            }
        }
        return preguntaEvaluada
    }

    async guardar() {
        this.limiparRespuestas()
        this.detalle = this.detalle.filter(item => !item.flg_eliminado || item.nid_detalle)
        this.ficha.detalle = this.detalle
        if (this.esSolicitudCambio) {
            this.modalController.dismiss(this.ficha)
        } else {
            this.usuario.fichaMujer = this.ficha
            this.usuario.cambioFichaMujer = true
            this.usuario.fichaMujerIncompleto = this.validaFichaIncompleta()
            await this.uiService.presentLoading('Guardando...')
            await this.dataLocalService.guardarUsuario(this.usuario, false)
            await this.uiService.dismissLoading()
            this.modalController.dismiss();
        }
    }

    limiparRespuestas() {
        if (!['01','02'].includes(this.ficha.tip_organizacion_base)) {this.ficha.txt_organizacion_base = null}
    }

    validaFichaIncompleta() {
        console.log('this.ficha valida:>> ', this.ficha);
        if (!this.ficha.tip_organizacion_base) {return true}
        if (!this.ficha.txt_organizacion_base && ['01','02'].includes(this.ficha.tip_organizacion_base)) {return true}
        for (let index = 0; index < this.detalle.length; index++) {
            if (!this.detalle[index].flg_eliminado) {
                if (this.detalle[index].cod_pregunta === '19') {
                    if (!this.detalle[index].num_dato1) {return true}
                    if (!(this.detalle[index].num_dato2 || this.detalle[index].num_dato2 === 0)) {return true}
                } else {
                    if (!this.detalle[index].cod_respuesta) {return true}
                    if (this.detalle[index].cod_respuesta.includes('99')) {
                        if (!this.detalle[index].txt_otro?.trim()) {return true}
                        const respuesta99 = this.detalle[index].pregunta.subTipos.find(item => item.cod_tipo === '99')
                        if (respuesta99.txt_dato1 && !this.detalle[index].cod_tipo_otro) {return true}
                    }
                }
            } 
        }
        return false
    }

    async salir() {
        this.modalController.dismiss();
    }

}
