import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { LineaBaseMem, LineaBaseMemDetalle, Usuario } from '../../model/usuarios';
import { calcularEdad } from '../../functions/utilitario.function';
import { Tipo } from '../../model/generales';

@Component({
    selector: 'app-linea-base-mem',
    templateUrl: './linea-base-mem.page.html',
    styleUrls: ['./linea-base-mem.page.scss'],
})
export class LineaBaseMemPage implements OnInit {

    @Input() usuario: Usuario
    @Input() index: number
    @Input() consulta: boolean = false
    @Input() fichaTexto: string
    @Input() nidLinea: number
    ficha: LineaBaseMem = {}
    detalle: LineaBaseMemDetalle[] = []
    edad: number
    preguntas: Tipo[] = []
    tipoOrganizacionBase: Tipo[] = []
    lineaNegocio: Tipo[] = []
    validaParametro: Tipo[]
8
    constructor(private modalController: ModalController,
            private dataLocalService: DataLocalService,
            private uiService: UiServiceService) { }

    async ngOnInit() {
        this.edad = calcularEdad(this.usuario.fec_nacimiento)
        const parametros = await this.dataLocalService.leerUsuariosParametro()
        this.validaParametro = parametros.validaLBMem
        this.preguntas = parametros.lineaBaseMem
        this.tipoOrganizacionBase = parametros.organizacionBase.filter(item => item.txt_dato1 === '1')
        if (this.fichaTexto) {
            await this.cargarFicha()
        } else {
            await this.crearFicha()
        }
    }

    async crearFicha() {
        this.ficha.codigo_expediente = this.usuario.codigo_expediente
        this.ficha.nid_personal_proyecto = this.usuario.nid_personal_proyecto
        // if (!this.esSolicitudCambio && !this.ficha.nid_personal_proyecto) {this.ficha.nid_personal_proyecto = this.usuario.nid_personal_proyecto}
        this.ficha.fec_ficha = new Date()
        this.ficha.nid_linea = this.nidLinea
        for (let index = 0; index < this.preguntas.length; index++) {
            this.preguntas[index].txt_tipo = this.preguntas[index].txt_tipo
            const detalle: LineaBaseMemDetalle = {
                codigo_expediente: this.ficha.codigo_expediente,
                cod_pregunta: this.preguntas[index].cod_tipo,
                flg_eliminado: false,
                pregunta: this.preguntas[index]
            }
            if (detalle.cod_pregunta === '01') {detalle.cod_respuesta1 = '01'}
            this.detalle.push(detalle)            
        }
        console.log('this.detalle :>> ', this.detalle);
        console.log('FICHA CREADA...');
        console.log('this.ficha :>> ', this.ficha);
        console.log('this.detalle :>> ', this.detalle);
    }
    
    async cargarFicha() {
        if (this.fichaTexto) {this.ficha = JSON.parse(this.fichaTexto)}
        for (let index = 0; index < this.preguntas.length; index++) {
            this.preguntas[index].txt_tipo = this.preguntas[index].txt_tipo
            let detalle = this.ficha.detalle?.find(item => item.cod_pregunta === this.preguntas[index].cod_tipo)
            console.log('detalle :>> ', detalle);
            if (detalle) {
                detalle.pregunta = this.preguntas[index]
                // detalle = this.validarRespuestaOtros(detalle)
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
        console.log('FICHA CARGADA...');
        console.log('this.ficha :>> ', this.ficha);
        console.log('this.detalle :>> ', this.detalle);
    }

    validarRespuesta(index: number) {
        for (let idx = index; idx < this.detalle.length; idx++) {
            if (this.detalle[idx].cod_respuesta1 || this.detalle[idx].txt_list_data) {
                let valida = this.validaParametro.find(item => item.cod_tipo === this.detalle[idx].cod_pregunta)
                if (valida) {
                    if (valida.txt_dato1) {
                        if ((this.detalle[idx].cod_respuesta1 && valida.txt_dato1.includes(this.detalle[idx].cod_respuesta1)) || ((this.detalle[idx].txt_list_data) && !this.detalle[idx].txt_list_data?.includes(valida.txt_dato1))) {
                            if (valida.txt_dato5) {
                                const preguntaEval = this.detalle.find(item => item.cod_pregunta === valida.txt_dato5)
                                if (preguntaEval.cod_respuesta1 || preguntaEval.txt_list_data) {
                                    if ((preguntaEval.cod_respuesta1 && valida.txt_dato2.includes(preguntaEval.cod_respuesta1)) || (preguntaEval.txt_list_data && !preguntaEval.txt_list_data?.includes(valida.txt_dato2))) {
                                        this.deshabilitaPreguntas(valida.txt_dato4, true)
                                    } else {
                                        this.deshabilitaPreguntas(valida.txt_dato4, false)
                                        if (valida.txt_dato3) {this.deshabilitaPreguntas(valida.txt_dato3, true)}
                                    }
                                } else {
                                    this.deshabilitaPreguntas(valida.txt_dato4, false)
                                    if (valida.txt_dato3) {this.deshabilitaPreguntas(valida.txt_dato3, false)}
                                }
                            } else {
                                this.deshabilitaPreguntas(valida.txt_dato4, true)
                            }
                        } else {
                            this.deshabilitaPreguntas(valida.txt_dato4, false)
                            if (valida.txt_dato3) {this.deshabilitaPreguntas(valida.txt_dato3, false)}
                        }
                    }
                }
            }
        }
        if (this.detalle[index].pregunta.txt_dato2 === 'SUN,SUN') {this.detalle[index].cod_respuesta2 = null}
    }

    deshabilitaPreguntas(preguntas, eliminado: boolean) {
        const preguntasList = preguntas.split(',')
        preguntasList.forEach(pregunta => {
            const index = this.detalle.findIndex(item => item.cod_pregunta === pregunta)
            this.detalle[index].flg_eliminado = eliminado
            if (eliminado) {this.limpiaDatos(index)}
        });
    }

    limpiaDatos(index) {
        this.detalle[index].cod_respuesta1 = null
        this.detalle[index].txt_list_codigo = null
        this.detalle[index].txt_list_data = null
        this.detalle[index].txt_otro = null
        this.detalle[index].txt_dato = null
        this.detalle[index].fec_dato1 = null
        this.detalle[index].fec_dato2 = null
        this.detalle[index].num_dato = null
    }

    validarRespuestaOtros(preguntaEvaluada: LineaBaseMemDetalle) {
        if (preguntaEvaluada?.cod_respuesta1?.includes('99')) {
            const respuesta99 = preguntaEvaluada.pregunta.subTipos.find(item => item.cod_tipo === '99')
            console.log(' la respuesta incluye 99 ---- respuesta99 :>> ', respuesta99);
            if (respuesta99.txt_dato1) {
                preguntaEvaluada.categoriaTexto = respuesta99.txt_dato2
                preguntaEvaluada.categoriaOpciones = respuesta99.subTipos
            }
        }
        return preguntaEvaluada
    }

    obtenerEtiqueta(codItem) {
        let texto = '...............'
        const preguntaDetalle = this.detalle.find(item => item.cod_pregunta === codItem)
        const respuestaDetalle = this.detalle.find(item => item.cod_pregunta === preguntaDetalle.pregunta.txt_dato3)
        if (respuestaDetalle?.cod_respuesta1) {
            const itemResp = respuestaDetalle.pregunta.subTipos.find(item => item.cod_tipo === respuestaDetalle.cod_respuesta1)
            texto = itemResp.txt_dato4
        } 
        return preguntaDetalle.pregunta.txt_tipo + (preguntaDetalle.pregunta.txt_dato4 ? (' ' + texto + ' ' + preguntaDetalle.pregunta.txt_dato4) : '')
    }

    actualizaValor(data, index) {
        console.log('entra actualizaValor');
        console.log('object actualizaValor:>> ', data, index);
        this.detalle[index].txt_list_codigo = data.codigos
        this.detalle[index].txt_list_data = data.valores
        this.detalle[index].datoIncompleto = data.incompleto
        console.log('this.detalle[index].txt_list_data :>> ', this.detalle[index].txt_list_data);
        this.validarRespuesta(index)
        this.validaDatosResp(index)
    }

    obtenerSubTipos(tipo: Tipo[], codRespuesta: string, index: number) {
        const tiposList = tipo.find(item => item.cod_tipo === codRespuesta).subTipos
    
        if (tiposList && tiposList.length > 0) {
            console.log('tiposList :>> ', tiposList);
            return tiposList
        } else {
            this.detalle[index].txt_dato = null
            return null
        }
    }

    validarTecla(event: KeyboardEvent) {
        const patron = /[0-9]/;
        if (!patron.test(event.key)) {
          event.preventDefault();
        }
    }

    validaDatosResp(index: number) {
        if (this.detalle[index].cod_pregunta === '17' || this.detalle[index].cod_pregunta === '18') {
            const respuestas = this.detalle[index].txt_list_data.split(',')
            console.log('respuestas :>> ', respuestas);
            if (this.detalle[index].cod_pregunta === '17') {
                this.detalle[index].textoError = ''
                for (let idx = 0; idx < respuestas.length; idx++) {
                    const horas = parseInt(respuestas[idx])
                    if (horas) {
                        console.log('horas :>> ', horas);
                        if (isNaN(horas)) {this.detalle[index].textoError = 'Las horas deben ser números entre 1 y 24.'}
                        if (horas < 1 || horas > 24) {this.detalle[index].textoError = 'Las horas deben ser números entre 1 y 24.'}
                    }
                }
            }
            if (this.detalle[index].cod_pregunta === '18') {
                this.detalle[index].textoError = ''
                const anhos = parseInt(respuestas[0])
                if (anhos) {
                    if (isNaN(anhos)) {this.detalle[index].textoError = 'La cantidad de años de debe ser menor a la edad de la usuraria.'}
                    if (anhos < 1 || anhos >= this.edad) {this.detalle[index].textoError = 'La cantidad de años de debe ser menor a la edad de la usuraria.'}
                }
                const meses = parseInt(respuestas[1])
                if (meses) {
                    if (isNaN(meses)) {this.detalle[index].textoError = 'Los meses deben ser números entres 1 y 12.'}
                    if (meses < 1 || meses > 24) {this.detalle[index].textoError = 'Los meses deben ser números entre 1 y 12.'}
                }
            }
        }
    }

    async guardar() {
        console.log('this.ficha :>> ', this.ficha);
        this.ficha.detalle = this.detalle
        this.ficha.flg_completo = this.evaluarDatosCompletos()
        if (this.nidLinea === 0) {
            this.usuario.lineaBaseMem = this.ficha
            this.usuario.cambioLineaBaseMem = true
            this.usuario.lineaBaseMemIncompleta = !this.ficha.flg_completo
        }
        if (this.nidLinea === 1) {
            this.usuario.lineaSalidaMem = this.ficha
            this.usuario.cambioLineaSalidaMem = true
            this.usuario.lineaSalidaMemIncompleta = !this.ficha.flg_completo
        }
        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarUsuario(this.usuario, false)
        await this.uiService.dismissLoading() 
        this.modalController.dismiss();
    }

    evaluarDatosCompletos() {
        if (!this.ficha.tip_organizacion_base) {return false}
        if (!this.ficha.txt_organizacion_base) {return false}
        for (let index = 0; index < this.detalle.length; index++) {
            if (!this.detalle[index].flg_eliminado) {
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'SUN' && !this.detalle[index].cod_respuesta1) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'SUN' && this.detalle[index].cod_respuesta1 === '99' && !this.detalle[index].txt_otro) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'SYN' && !this.detalle[index].cod_respuesta1) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'TXT' && !this.detalle[index].txt_dato) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'FDA' && (!this.detalle[index].fec_dato1 || !this.detalle[index].fec_dato2)) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'MYN' && (!this.detalle[index].txt_list_data || this.detalle[index].datoIncompleto)) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'INC' && !this.detalle[index].num_dato) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'INS' && !this.detalle[index].num_dato) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'MCX' && (!this.detalle[index].txt_list_data || this.detalle[index].datoIncompleto)) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'MCT' && (!this.detalle[index].txt_list_data || this.detalle[index].datoIncompleto)) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'MST' && (!this.detalle[index].txt_list_data || this.detalle[index].datoIncompleto)) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'MCB' && !this.detalle[index].txt_list_data) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(0,3) === 'MCB' && '99'.includes(this.detalle[index].txt_list_data) && !this.detalle[index].txt_otro) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(4,7) === 'SUN' && this.detalle[index].cod_respuesta1 && this.obtenerSubTipos(this.detalle[index].pregunta.subTipos, this.detalle[index].cod_respuesta1, index) && !this.detalle[index].cod_respuesta2) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(4,7) === 'SYN' && !this.detalle[index].cod_respuesta1) {return false}
                if (this.detalle[index].pregunta.txt_dato2.substring(4,7) === 'INS' && !this.detalle[index].num_dato) {return false}
                if (this.detalle[index].textoError) {return false}
            }
        }
        return true
    }

    async salir() {
        this.modalController.dismiss();
    }
}
