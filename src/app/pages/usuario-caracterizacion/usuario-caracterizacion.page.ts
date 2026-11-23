import { Component, Input, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'
import { DataLocalService } from '../../services/data-local.service'
import { UiServiceService } from '../../services/ui-service.service'
import { Usuario, UsuarioParametro, Caracterizacion, CaractDetalle } from '../../model/usuarios'
import { Archivo } from 'src/app/model/generales'

@Component({
    selector: 'app-usuario-caracterizacion',
    templateUrl: './usuario-caracterizacion.page.html',
    styleUrls: ['./usuario-caracterizacion.page.scss'],
})
export class UsuarioCaracterizacionPage implements OnInit {

    @Input() usuario: Usuario
    ficha: Caracterizacion = {}
    parametros: UsuarioParametro
    seccionTec: CaractDetalle[] = []
    seccionViv: CaractDetalle[] = []
    seccionCom: CaractDetalle[] = []
    seccionAut: CaractDetalle[] = []
    totalTec = 0
    totalViv = 0
    totalCom = 0
    totalAut = 0
    totalPuntaje = 0
    resultado = ''
    fotos: Archivo[] = []
    mostarResumen = false
    
    constructor(private modalController: ModalController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        this.parametros = await this.dataLocalService.leerUsuariosParametro()

        if (this.usuario.fichaCaracterizacion) {
            this.cargarFicha()
        } else {
            await this.crearFicha()
        }

        if (this.ficha.fotos) {
            this.fotos = this.ficha.fotos
        }

        
        if (this.fotos.length === 0) {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            this.fotos = archivos.fichaCaract
        }
    }

    async crearFicha() {
        const usuario = await this.dataLocalService.leerUser()
        this.ficha.codigo_expediente = this.usuario.codigo_expediente
        this.ficha.nid_personal_proyecto = this.usuario.nid_personal_proyecto
        this.ficha.nid_ficha = 1
        this.ficha.fec_visita = new Date()
        this.ficha.est_ficha = 'R'
        this.ficha.nid_entrevistador = usuario.nidPersonal
        this.ficha.txt_entrevistador = `${usuario.apellidoPaterno} ${usuario.apellidoMaterno}, ${usuario.nombres}`
        this.usuario.tecnologias.map(item => {
            if (item.cod_tecnologia.startsWith('01')) {
                this.seccionTec.push({
                    cod_seccion: 'TEC',
                    cod_pregunta: item.cod_tecnologia + item.cod_partida,
                    txt_pregunta: `${item.txt_tecnologia} - ${item.txt_partida}`
                })
            }
        })
        this.parametros.fichaPreguntaViv.map(pregunta => {
            if (this.usuario.tecnologias.find(item => pregunta.txt_dato1 === item.cod_tecnologia)) {
                this.seccionViv.push({
                    cod_seccion: 'VIV',
                    cod_pregunta: pregunta.cod_tipo,
                    txt_pregunta: pregunta.txt_tipo,
                })
            }
        })
        this.parametros.fichaPreguntaCom.map(item => {
            this.seccionCom.push({
                cod_seccion: 'COM',
                cod_pregunta: item.cod_tipo,
                txt_pregunta: item.txt_tipo,
            })
        })
        this.filtrarRespuestasVivienda()
    }

    cargarFicha() {
        this.ficha = this.usuario.fichaCaracterizacion
        if (this.ficha.seccionTec) {this.seccionTec = this.ficha.seccionTec}
        if (this.ficha.seccionViv) {this.seccionViv = this.ficha.seccionViv}
        if (this.ficha.seccionCom) {this.seccionCom = this.ficha.seccionCom}
        if (this.ficha.seccionAut) {this.seccionAut = this.ficha.seccionAut}
        this.totalTec = this.ficha.num_puntos_tec
        this.totalViv = this.ficha.num_puntos_viv
        this.totalCom = this.ficha.num_puntos_com
        this.totalAut = this.ficha.num_puntos_aut
        this.totalPuntaje = this.totalTec + this.totalViv + this.totalCom + this.totalAut
        this.resultado = this.parametros.fichaResultado.find(item => item.cod_tipo === this.ficha.tip_resultado).txt_tipo

        if (this.ficha.est_ficha === 'R') {
            this.usuario.tecnologias.map(item => {
                if (item.cod_tecnologia.startsWith('01')) {
                    if (!this.seccionTec.find(pregunta => pregunta.cod_pregunta === item.cod_tecnologia + item.cod_partida)) {
                        this.seccionTec.push({
                            cod_seccion: 'TEC',
                            cod_pregunta: item.cod_tecnologia + item.cod_partida,
                            txt_pregunta: `${item.txt_tecnologia} - ${item.txt_partida}`
                        })
                    }
                }
            })
            this.seccionTec = this.seccionTec.filter(item => this.usuario.tecnologias.find(tec => tec.cod_tecnologia + tec.cod_partida === item.cod_pregunta))
            this.totalTec = this.calcularPuntajeSeccion(this.seccionTec, this.parametros.fichaRespuestaTec, 'TEC')
            
            this.parametros.fichaPreguntaViv.map(pregunta => {
                if (!this.seccionViv.find(pregViv => pregunta.cod_tipo === pregViv.cod_pregunta)) {
                    if (this.usuario.tecnologias.find(item => pregunta.txt_dato1 === item.cod_tecnologia)) {
                        this.seccionViv.push({
                            cod_seccion: 'VIV',
                            cod_pregunta: pregunta.cod_tipo,
                            txt_pregunta: pregunta.txt_tipo,
                        })
                    }
                }
            })
            this.filtrarRespuestasVivienda()
            this.seccionViv.forEach(pregunta => {if (pregunta.cod_respuesta) {pregunta.num_puntaje = parseFloat(pregunta.respuestas.find(item => item.cod_tipo === pregunta.cod_respuesta).txt_dato1)}});
            this.totalViv = this.calcularPuntajeSeccion(this.seccionViv, this.seccionViv[0].respuestas, 'VIV')

            this.evaluarResultado()

        } else {
            this.filtrarRespuestasVivienda()
        }
    }

    filtrarRespuestasVivienda() {
        let grupoRespuesta = 'A'
        if (!this.seccionViv.find(item => item.cod_pregunta === 'VIV1')) { grupoRespuesta = 'B'}
        this.seccionViv.forEach(pregunta => {
            let filtro = pregunta.cod_pregunta
            if (pregunta.cod_pregunta !== 'VIV1') {filtro = pregunta.cod_pregunta + grupoRespuesta}
            pregunta.respuestas = this.parametros.fichaRespuestaViv.filter(item => item.txt_dato2.includes(filtro))
        })
    }

    calificar(seccion, index) {
        if (this.ficha.est_ficha === 'E') {return}

        if (seccion === 'TEC') {
            this.seccionTec[index].num_puntaje = parseFloat(this.parametros.fichaRespuestaTec.find(item => item.cod_tipo === this.seccionTec[index].cod_respuesta).txt_dato1)
            this.totalTec = this.calcularPuntajeSeccion(this.seccionTec, this.parametros.fichaRespuestaTec, seccion)
        }
        if (seccion === 'VIV') {
            this.seccionViv[index].num_puntaje = parseFloat(this.seccionViv[index].respuestas.find(item => item.cod_tipo === this.seccionViv[index].cod_respuesta).txt_dato1)
            this.totalViv = this.calcularPuntajeSeccion(this.seccionViv, this.seccionViv[index].respuestas, seccion)
        }
        if (seccion === 'COM') {
            this.seccionCom[index].num_puntaje = parseFloat(this.parametros.fichaRespuestaCom.find(item => item.cod_tipo === this.seccionCom[index].cod_respuesta).txt_dato1)
            this.totalCom = this.calcularPuntajeSeccion(this.seccionCom, this.parametros.fichaRespuestaCom, seccion)
        }
        if (seccion === 'AUT') {
            this.seccionAut[index].num_puntaje = parseFloat(this.parametros.fichaRespuestaAut.find(item => item.cod_tipo === this.seccionAut[index].cod_respuesta).txt_dato1)
            this.totalAut = this.calcularPuntajeSeccion(this.seccionAut, this.parametros.fichaRespuestaAut, seccion)
        }
        this.evaluarResultado()
    }

    calcularPuntajeSeccion(preguntasSeccion: CaractDetalle[], respuestas, seccion: string) {
        if (!preguntasSeccion || preguntasSeccion.length === 0) {return 0}
        let totalPuntos = 0
        let totalMaximo = 0
        const pesoSeccion = parseFloat(this.parametros.fichaSeccion.find(item => item.cod_tipo === seccion).txt_dato1)
        const maxIndex = parseInt(this.parametros.fichaSeccion.find(item => item.cod_tipo === seccion).txt_dato2) - 1

        preguntasSeccion.forEach(pregunta => {
            totalPuntos += pregunta.num_puntaje ? pregunta.num_puntaje : 0
            if (seccion === 'VIV') {
                totalMaximo += parseFloat(pregunta.respuestas[maxIndex].txt_dato1)
            } else {
                totalMaximo += parseFloat(respuestas[maxIndex].txt_dato1)
            }
        })
        return Math.round(totalPuntos / totalMaximo * pesoSeccion * 100)/100
        
    }

    evaluarResultado() {
        const totalParcial = this.totalTec + this.totalViv + this.totalCom
        if (totalParcial < parseFloat(this.parametros.fichaResultado[0].txt_dato1)) {
            this.resultado = this.parametros.fichaResultado[0].txt_tipo
            this.ficha.tip_resultado = this.parametros.fichaResultado[0].cod_tipo
            this.deshabilitarAutoevaluacion()
        }
        if (totalParcial >= parseFloat(this.parametros.fichaResultado[1].txt_dato1) && totalParcial <= parseFloat(this.parametros.fichaResultado[1].txt_dato2)) {
            this.resultado = this.parametros.fichaResultado[1].txt_tipo
            this.ficha.tip_resultado = this.parametros.fichaResultado[1].cod_tipo
            this.habilitarAutoevaluacion()
        }
        if (totalParcial + this.totalAut > parseFloat(this.parametros.fichaResultado[2].txt_dato1)) {
            this.resultado = this.parametros.fichaResultado[2].txt_tipo
            this.ficha.tip_resultado = this.parametros.fichaResultado[2].cod_tipo
            this.habilitarAutoevaluacion()
        }
        this.totalPuntaje = this.totalTec + this.totalViv + this.totalCom + this.totalAut
        console.log('this.ficha.tip_resultado :>> ', this.ficha.tip_resultado);
    }

    deshabilitarAutoevaluacion() {
        if (this.seccionAut.length > 0) {this.seccionAut = []}
        this.totalAut = 0
    }

    habilitarAutoevaluacion() {
        if (this.seccionAut.length === 0 ) {
            this.seccionAut = []
            this.parametros.fichaPreguntaAut.map(item => {
                this.seccionAut.push({
                    cod_seccion: 'AUT',
                    cod_pregunta: item.cod_tipo,
                    txt_pregunta: item.txt_tipo,
                })
            })
        }
    }

    async guardar() {
        this.ficha.num_puntos_tec = this.totalTec
        this.ficha.num_puntos_viv = this.totalViv
        this.ficha.num_puntos_com = this.totalCom
        this.ficha.num_puntos_aut = this.totalAut
        this.ficha.num_puntaje_total = this.totalPuntaje
        this.ficha.seccionTec = this.seccionTec
        this.ficha.seccionViv = this.seccionViv
        this.ficha.seccionCom = this.seccionCom
        if (this.ficha.tip_resultado === 'C' || this.ficha.tip_resultado === 'E') {
            this.ficha.seccionAut = this.seccionAut
        } else {
            this.ficha.seccionAut = null
        }
        if (this.fotos) {this.ficha.fotos = this.fotos}
        this.usuario.fichaCaracterizacion = this.ficha
        this.usuario.cambioCaracterizacion = true
        this.usuario.estadoCaracterizacion = 'R'
        this.usuario.fichaCaracterizIncompleto = this.validaFichaIncompleta()

        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarUsuario(this.usuario, false)
        await this.uiService.dismissLoading()
        this.mostarResumen = true
        // await this.uiService.mostrarCalificacion(this.totalTec, this.totalViv, this.totalCom, this.totalAut, this.totalPuntaje, this.resultado, (this.ficha.tip_resultado === 'C' || this.ficha.tip_resultado === 'E') ? true : false)
        // this.modalController.dismiss();
    }

    validaFichaIncompleta() {
        for (let index = 0; index < this.seccionTec.length; index++) {if (!this.seccionTec[index].cod_respuesta) {return true}}
        for (let index = 0; index < this.seccionViv.length; index++) {if (!this.seccionViv[index].cod_respuesta) {return true}}
        for (let index = 0; index < this.seccionCom.length; index++) {if (!this.seccionCom[index].cod_respuesta) {return true}}
        if (this.ficha.tip_resultado === 'C' || this.ficha.tip_resultado === 'E') {
            for (let index = 0; index < this.seccionAut.length; index++) {if (!this.seccionAut[index].cod_respuesta) {return true}}
        }
        if (!this.ficha.fotos) {return true}
        for (let index = 0; index < this.ficha.fotos.length; index++) {
            if (!this.ficha.fotos[index].nueva && !this.ficha.fotos[index].enviada && !this.ficha.fotos[index].nid_archivo) {return true}
        }
        return false
    }

    async cerrarResumen() {
        this.mostarResumen = false
        await this.modalController.dismiss({id: "resumenModal"})
        await this.modalController.dismiss({id: 'caracterizacionModal'})        
    }

    salir() {
        this.modalController.dismiss({id: 'caracterizacionModal'})
    }
}
