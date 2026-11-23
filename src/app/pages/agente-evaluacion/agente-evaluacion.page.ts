import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { Tipo } from '../../model/generales';
import { Agente, Evaluacion, EvaluacionDetalle } from '../../model/agentes';

@Component({
    selector: 'app-agente-evaluacion',
    templateUrl: './agente-evaluacion.page.html',
    styleUrls: ['./agente-evaluacion.page.scss'],
})
export class AgenteEvaluacionPage implements OnInit {

    @Input() agente: Agente
    @Input() consulta = false
    ficha: Tipo = {}
    respuestas: Tipo[] = []
    respuestasNvo: Tipo[] = []
    resultados: Tipo[] = []
    evaluacion: Evaluacion = {}
    resultadoTexto = ''
    mostarResumen = false

    constructor(private modalController: ModalController,
        public dataLocalService: DataLocalService,
        private uiService: UiServiceService
    ) { }

    async ngOnInit() {
        console.log('this.agente :>> ', this.agente);
        const parametros = await this.dataLocalService.leerAgenteParametro()
        this.respuestasNvo = parametros.respuestaEvaluacion
        this.respuestas = parametros.respuestaEvaluacion.filter(item => item.cod_tipo !== '99')
        console.log('this.respuestas :>> ', this.respuestas);
        console.log('this.respuestasNvo :>> ', this.respuestasNvo);
        this.resultados = parametros.resultadoEvaluacion
        console.log('parametros :>> ', parametros);
        if (this.consulta) {
            this.evaluacion = this.agente.ultimaEvaluacion
            if (this.agente.ultimaEvaluacion.cod_ficha) {
                this.ficha = parametros.fichaEvaluacion.find(item => item.cod_tipo === this.agente.ultimaEvaluacion.cod_ficha)
                this.cargarFicha()
                this.ficha.txt_dato4 = this.agente.ultimaEvaluacion.txt_observacion
                this.resultadoTexto = this.resultados.find(item => item.cod_tipo === this.agente.ultimaEvaluacion.cod_resultado).txt_dato3
            }
        } else {
            this.ficha = parametros.fichaEvaluacion.find(item => item.txt_dato1.includes(this.agente.nid_funcion.toString()) && item.num_dato1 === 1)
            console.log('this.ficha 11111111:>> ', this.ficha);
            if (this.agente.evaluacion) {
                this.evaluacion = this.agente.evaluacion
                this.cargarFicha()
                this.ficha.txt_dato4 = this.agente.evaluacion.txt_observacion
            } else {
                await this.crearEvaluacion()
            }
        }
        console.log('this.ficha 22222222:>> ', this.ficha);


        if (!this.agente.evaluacion) {

        }
        console.log('this.evaluacion :>> ', this.evaluacion);
    }

    async crearEvaluacion() {
        console.log('entra aqui');
        const user = await this.dataLocalService.leerUser()
        const funcion = await this.dataLocalService.leerFuncion()
        this.evaluacion.codigo_expediente = this.agente.codigo_expediente
        this.evaluacion.nid_funcion = this.agente.nid_funcion
        this.evaluacion.nid_personal = this.agente.nid_personal
        this.evaluacion.nid_asignacion = this.agente.nid_asignacion
        this.evaluacion.nid_funcion_evaluador = funcion.nid_funcion
        this.evaluacion.nid_evaluado_por = user.nidPersonal
        this.evaluacion.cod_ficha = this.ficha.cod_tipo
        this.evaluacion.fec_evaluacion = new Date()
        this.evaluacion.nid_usuario_registro = user.nidUsuario
        this.evaluacion.evaluacionDetalle = []
        for (let index = 0; index < this.ficha.subTipos.length; index++) {
            for (let idx = 0; idx < this.ficha.subTipos[index].subTipos.length; idx++) {
                const detalle: EvaluacionDetalle = {
                    codigo_expediente: this.agente.codigo_expediente,
                    nid_funcion: this.agente.nid_funcion,
                    nid_personal: this.agente.nid_personal,
                    nid_asignacion: this.agente.nid_asignacion,
                    cod_seccion: this.ficha.subTipos[index].cod_tipo,
                    cod_pregunta: this.ficha.subTipos[index].subTipos[idx].cod_tipo
                }
                this.evaluacion.evaluacionDetalle.push(detalle)
                
            }
        }
    }

    cargarFicha() {
        console.log('this.evaluacion :>> ', this.evaluacion);
        for (let index = 0; index < this.ficha.subTipos.length; index++) {
            for (let idx = 0; idx < this.ficha.subTipos[index].subTipos.length; idx++) {
                if (this.evaluacion.evaluacionDetalle[this.ficha.subTipos[index].subTipos[idx].num_dato1-1].cod_respuesta) {
                    this.ficha.subTipos[index].subTipos[idx].dato = this.evaluacion.evaluacionDetalle[this.ficha.subTipos[index].subTipos[idx].num_dato1-1].cod_respuesta
                    this.ficha.subTipos[index].subTipos[idx].numero = this.evaluacion.evaluacionDetalle[this.ficha.subTipos[index].subTipos[idx].num_dato1-1].num_puntaje
                }
            }
        }
    }

    calificar() {
        console.log('============ calificar ============');
        let total = 0
        for (let index = 0; index < this.ficha.subTipos.length; index++) {
            for (let idx = 0; idx < this.ficha.subTipos[index].subTipos.length; idx++) {
                const respuesta: Tipo = this.ficha.subTipos[index].subTipos[idx]
                console.log('respuesta :>> ', respuesta);
                if (respuesta.dato) {
                    this.evaluacion.evaluacionDetalle[respuesta.num_dato1-1].cod_respuesta = respuesta.dato
                    if (respuesta.dato !== '99') {
                        const puntos = this.respuestas.find(item => item.cod_tipo === respuesta.dato).txt_dato1
                        console.log('puntos * respuesta.txt_dato1 :>> ', puntos, respuesta.txt_dato1);
                        let ponderado = parseFloat(respuesta.txt_dato1)
                        if (respuesta.num_dato2) {
                            const resp = this.encuentraPregunta(respuesta.txt_dato5)
                            if (resp && resp.dato === '99') {ponderado = respuesta.num_dato2}
                        }
                        this.evaluacion.evaluacionDetalle[respuesta.num_dato1-1].num_puntaje = parseFloat(puntos) * ponderado
                        total = total + this.evaluacion.evaluacionDetalle[respuesta.num_dato1-1].num_puntaje
                        console.log('num_puntaje, total :>> ', this.evaluacion.evaluacionDetalle[respuesta.num_dato1-1].num_puntaje, total);
                    }

                }
            }
        }
        // for (let index = 0; index < this.evaluacion.evaluacionDetalle.length; index++) {
        //     if (this.evaluacion.evaluacionDetalle[index].num_puntaje >= 0) {
        //         total = total + this.evaluacion.evaluacionDetalle[index].num_puntaje
        //     }
        // }
        console.log('total :>> ', total);
        this.evaluacion.num_nota_evaluacion = Math.round(total * 100)/100
        // this.evaluacion.num_nota_evaluacion = Math.round(total)

        if (total < parseFloat(this.resultados[0].txt_dato1)) {
            this.evaluacion.cod_resultado = this.resultados[0].cod_tipo
            this.resultadoTexto = this.resultados[0].txt_dato3
            this.evaluacion.flg_procede_continuidad = this.resultados[0].num_dato1 === 1 ? true : false
        }
        if (total >= parseFloat(this.resultados[1].txt_dato1) && total <= parseFloat(this.resultados[1].txt_dato2)) {
            this.evaluacion.cod_resultado = this.resultados[1].cod_tipo
            this.resultadoTexto = this.resultados[1].txt_dato3
            this.evaluacion.flg_procede_continuidad = this.resultados[1].num_dato1 === 1 ? true : false
        }
        if (total > parseFloat(this.resultados[2].txt_dato1) && total < parseFloat(this.resultados[2].txt_dato2)) {
            this.evaluacion.cod_resultado = this.resultados[2].cod_tipo
            this.resultadoTexto = this.resultados[2].txt_dato3
            this.evaluacion.flg_procede_continuidad = this.resultados[2].num_dato1 === 1 ? true : false
        }
        if (total >= parseFloat(this.resultados[3].txt_dato1)) {
            this.evaluacion.cod_resultado = this.resultados[3].cod_tipo
            this.resultadoTexto = this.resultados[3].txt_dato3
            this.evaluacion.flg_procede_continuidad = this.resultados[3].num_dato1 === 1 ? true : false
        }
    }

    encuentraPregunta(codigoPregunta) {
        for (let index = 0; index < this.ficha.subTipos.length; index++) {
            for (let idx = 0; idx < this.ficha.subTipos[index].subTipos.length; idx++) {
                const respuesta: Tipo = this.ficha.subTipos[index].subTipos[idx]
                console.log('respuesta :>> ', respuesta);
                if (respuesta.cod_tipo === codigoPregunta) {
                    return respuesta

                }
            }
        }
    }
    
    async guardar() {
        this.calificar()
        this.evaluacion.txt_observacion = this.ficha.txt_dato4
        this.agente.evaluacion = this.evaluacion
        this.agente.cambioEvaluacion = true
        this.agente.evaluacionIcompleto = this.evaluarIncompleto()
        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarAgente(this.agente)
        await this.uiService.dismissLoading()
        this.mostarResumen = true
    }

    evaluarIncompleto() {
        if (!this.evaluacion.evaluacionDetalle || this.evaluacion.evaluacionDetalle.length === 0) {return true}
        for (let index = 0; index < this.evaluacion.evaluacionDetalle.length; index++) {
            if (!this.evaluacion.evaluacionDetalle[index].cod_respuesta) {return true}
        }
        return false
    }

    salir() {
        this.modalController.dismiss();
    }

    async cerrarResumen(ev) {
        this.mostarResumen = false
        await this.modalController.dismiss({id: "resumenModal"})
        await this.modalController.dismiss()        
    }

}
