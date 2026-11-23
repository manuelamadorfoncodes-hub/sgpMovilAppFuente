import { Component, Input, OnInit, ViewChild } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { ViewDidEnter } from '@ionic/angular'
import { ArchivoService } from './../../services/archivo.service'
import { ReportesService } from './../../services/reportes.service'
import { DataLocalService } from '../../services/data-local.service'
import { UiServiceService } from '../../services/ui-service.service'
import { Periodo, Proyecto } from '../../model/proyectos'
import { Tecnologia } from '../../model/usuarios'
import { Reporte, User } from '../../model/generales'
import { Agente } from '../../model/agentes'

@Component({
    selector: 'app-reportes',
    templateUrl: './reportes.page.html',
    styleUrls: ['./reportes.page.scss'],
})
export class ReportesPage implements OnInit, ViewDidEnter {
    @ViewChild('popover') popover
    @Input() opcion = 99
    defaultHref = ''
    isOpenPopover = false
    isModalOpenDatos = false
    isModalOpenPdf = false
    verMenu = true
    user: User
    urlReporte = '' 
    reportes: Reporte[] = []
    proyectos: Proyecto[]
    periodos: Periodo[]
    yachachiqList: Agente[]
    tecnologias: Tecnologia[]
    reporteSeleccionado: Reporte
    proyectoSeleccionado: Proyecto
    periodoSeleccionado: Periodo
    yachachiqSeleccionado: Agente
    partidaSeleccionada: Tecnologia
    data: any = {}
    cabecera: any = {}
    detalle: any[] = []
    isModalOpen = false
    deshabilitarBotones = true
    estilo = 'width: 56%;'
    estilo2 = 'width: 32%;'
    text = '56%'
    text2 = '32%'
    esYachachiq = false

    constructor(public activatedRoute : ActivatedRoute,
        private uiService: UiServiceService,
        private dataLocalService: DataLocalService,
        private archivoService: ArchivoService,
        private reportesService: ReportesService) { 

        this.activatedRoute.queryParams.subscribe((res)=>{
            console.log(res);
        });
    }

    async ngOnInit() {}

    async ionViewDidEnter() {
        console.log('entra reportes');
        this.reportes = await this.dataLocalService.leerReportes()
        console.log('this.reportes :>> ', this.reportes);
        this.proyectos = await this.dataLocalService.leerProyectos()
        console.log('this.proyectos :>> ', this.proyectos[0].nombre_ne);
        console.log('this.habilitarBotones :>> ', this.deshabilitarBotones);
        this.user = await this.dataLocalService.leerUser()
        if (this.user.perfil.nidperfil === 15) {this.esYachachiq = true}
        this.reporteSeleccionado = null
        this.proyectoSeleccionado = null
        this.limpiarFiltros()
        this.data = {}
        this.deshabilitarBotones = true
    }

    limpiarFiltros() {
        if (!this.proyectoSeleccionado) {
            this.yachachiqList = null
            this.periodos = null
            this.tecnologias = null
        }
        this.periodoSeleccionado = null
        this.yachachiqSeleccionado = null
        this.partidaSeleccionada = null
        console.log('temina limpiaFiltros :>> OOOOO');
        console.log('this.partidaSeleccionada :>> ', this.partidaSeleccionada);
    }

    presentPopover(e: Event) {
        this.popover.event = e
        this.isOpenPopover = true
    }
    
    seleccionarReporte(repote) {
        this.reporteSeleccionado = repote
        console.log('this.reporteSeleccionado :>> ', this.reporteSeleccionado)
        this.validarSeleccion()
    }

    seleccionarPartida(partida) {
        this.partidaSeleccionada = partida
    }

    async obtenerDatos() {
        console.log('this.proyectoSeleccionado :>> ', this.proyectoSeleccionado);
        const fecha = new Date()
        const periodoActual = `${fecha.getFullYear()}${('0' + (fecha.getMonth() + 1)).toString().slice(-2)}`
        const periodos = await this.dataLocalService.leerProyectoPeriodo(this.proyectoSeleccionado.codigo_expediente)
        this.periodos = periodos.filter(item => item.cod_periodo <= periodoActual)
        
        const agentes = await this.dataLocalService.leerAgentesProyecto(this.proyectoSeleccionado.codigo_expediente)
        this.yachachiqList = agentes.filter(item => item.est_agente_proyecto === 'A' && item.nid_funcion === 483)
        this.tecnologias = await this.dataLocalService.leerTecnologiaPartidaProyecto(this.proyectoSeleccionado.codigo_expediente)
        
        this.limpiarFiltros()
        this.validarSeleccion()
    }
    
    validarSeleccion() {
        console.log('this.reporteSeleccionado :>> ', this.reporteSeleccionado);
        if (this.esYachachiq) {
            if (this.reporteSeleccionado.txt_parametro && this.proyectoSeleccionado && this.periodoSeleccionado) {this.deshabilitarBotones = false}
        } else {
            if (this.reporteSeleccionado.txt_parametro && this.proyectoSeleccionado && this.periodoSeleccionado && this.yachachiqSeleccionado) {this.deshabilitarBotones = false}
        }
        console.log('this.deshabilitarBotones :>> ', this.deshabilitarBotones);
    }

    async setOpenModalDatos(isOpen: boolean) {
        this.isModalOpenDatos = isOpen
        if (isOpen) {
            console.log('entra a previsualiarDatos');
            const parametros = {
                cod_reporte: this.reporteSeleccionado.cod_parametro,
                cod_zonal: this.proyectoSeleccionado.codigo_expediente.substring(0,2),
                cod_anho: this.proyectoSeleccionado.codigo_expediente.substring(2,6),
                cod_proyecto: this.proyectoSeleccionado.codigo_expediente.substring(6,10),   
                nid_agente: this.user.nidPersonal,
                cod_periodo: this.periodoSeleccionado.cod_periodo
            }
            console.log('parametros :>> ', parametros);
            this.data = await this.reportesService.obtenerDataReportes(parametros)
            console.log('data :>> ', this.data);
            if (this.data) {
                this.cabecera = this.data.cabecera[0]
                this.detalle = this.data.detalle
                if (this.reporteSeleccionado.cod_parametro == '42' && this.detalle && this.detalle.length > 0) {
                    for (let index = 0; index < this.detalle.length; index++) {
                        this.detalle[index].implementado = (this.detalle[index].num_hog_w_avance > 0 ? this.detalle[index].num_1_culminado * 100 / this.detalle[index].num_hog_w_avance : 0).toFixed(0)
                        this.detalle[index].apropiado = (this.detalle[index].num_1_culminado > 0 ? this.detalle[index].num_apropiado * 100 / this.detalle[index].num_1_culminado : 0).toFixed(0)
                    }
                }
            }
        } else {
            this.data = {}
            console.log('cierra modal');
        }
    }

    async generarReporte41() {

    }

    async generarReporte42() {}
    async generarReporte43() {}

    async setOpenModalPdf(isOpen: boolean) {
        this.isModalOpenPdf = isOpen;
        if (isOpen) {
            console.log('entra a descargar');
            const reporte = await this.archivoService.descargarReporte(false, this.reporteSeleccionado, this.proyectoSeleccionado.codigo_expediente, this.esYachachiq ? this.user.nidPersonal : this.yachachiqSeleccionado.nid_personal, this.periodoSeleccionado.cod_periodo, this.partidaSeleccionada?.cod_partida)
            console.log('reporte :>> ', reporte);
            // await Browser.open({ url: reporte })
            this.urlReporte = reporte
        } else {
            this.urlReporte = ''
        }

    }

    async descargarPdf() {
        const reporte = await this.archivoService.descargarReporte(true, this.reporteSeleccionado, this.proyectoSeleccionado.codigo_expediente, this.esYachachiq ? this.user.nidPersonal : this.yachachiqSeleccionado.nid_personal, this.periodoSeleccionado.cod_periodo, this.partidaSeleccionada?.cod_partida)
        console.log('reporte :>> ', reporte);
        // await Browser.open({ url: reporte })
        this.urlReporte = reporte
        this.uiService.presentToast('Reporte descargado.')
    }

    async enviarCorreo() {
        await this.uiService.alertaConfirmacion('Se enviará un correo al Coordinador Técnico del proyecto con los cuatro reportes de seguimiento de avance de las tecnologías del periodo ' + this.periodoSeleccionado.txt_periodo + '. ¿Desea continuar?.').then(async (resp) => {
            if (resp) {
                const comentario = await this.uiService.alertaRegistraTexto('Registre sus comentarios u observaciones para enviar en el correo electrónico.', 'Ingresar texto...', 'Enviar sin comentarios', 'Enviar')
        
                const parametros = {
                    reportes: this.reportes,
                    comentario,
                    cod_reporte: this.reporteSeleccionado.cod_parametro,
                    cod_zonal: this.proyectoSeleccionado.codigo_expediente.substring(0,2),
                    cod_anho: this.proyectoSeleccionado.codigo_expediente.substring(2,6),
                    cod_proyecto: this.proyectoSeleccionado.codigo_expediente.substring(6,10),   
                    nid_agente: this.user.nidPersonal,
                    cod_periodo: this.periodoSeleccionado.cod_periodo
                }
                console.log('parametros :>> ', parametros);
                const resp = await this.reportesService.enviarReporte(parametros)
                console.log('resp :>> ', resp);
                if (resp.result == 0) {this.uiService.presentToast('Correo enviado.')}
                if (resp.result == -1) {this.uiService.alertaInformativa(resp.message)}

            }
        })
    }
}
