import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataLocalService } from './../../services/data-local.service';
import { UiServiceService } from './../../services/ui-service.service';
import { Eri, EriParametro, InformeEri } from '../../model/eri';
import { Archivo, Tipo, User } from '../../model/generales';


@Component({
    selector: 'app-eri-informe',
    templateUrl: './eri-informe.page.html',
    styleUrls: ['./eri-informe.page.scss'],
})
export class EriInformePage implements OnInit {

    @Input() eri: Eri
    @Input() informeTexto: string
    @Input() consulta: boolean
    @Input() index: number
    @Input() eriParametro: EriParametro
    estadosEri: Tipo[] = []
    causalesEstadoEri: Tipo[] = []
    // eri: Eri //= {}
    informe: InformeEri = {}
    fotos: Archivo[] = []
    user: User
    tipoInformacion = []

    constructor(private modalController: ModalController,
        private uiService: UiServiceService,
        private dataLocalService: DataLocalService) {}

    async ngOnInit() {
        if (this.eriParametro) {
            this.estadosEri = this.eriParametro.estadosEri.filter(estado => estado.txt_dato1)
            this.causalesEstadoEri = this.eriParametro.causalesEstadoEri
        }
        
        if (this.index || this.index === 0) {
            this.informe = JSON.parse(this.informeTexto)
            console.log('INFORME :>> ', this.informe);
            this.fotos = this.informe.fotos
            if (this.informe.imp_prod_ini || this.informe.imp_prod_mes) {this.informe.produccion = true}
            if (this.informe.imp_prod_ini && this.eri.informes.find(item => item.imp_prod_ini > 0 && item.cod_periodo < this.informe.cod_periodo)) {this.informe.existeProdInicial = true}
            if (this.informe.imp_ventas_ini && this.eri.informes.find(item => item.imp_ventas_ini > 0 && item.cod_periodo < this.informe.cod_periodo)) {this.informe.existeComerInicial = true}
            this.informe.por_avance_imp_nri = Math.round(this.informe.por_avance_imp_nri * 10000) / 10000
            this.informe.por_avance_insumo = Math.round(this.informe.por_avance_insumo * 10000) / 10000
            this.informe.por_avance_pago = Math.round(this.informe.por_avance_pago * 10000) / 10000
            this.informe.por_avance_resul_nri = Math.round(this.informe.por_avance_resul_nri * 10000) / 10000
        } else {
            this.informe = {
                codigo_expediente: this.eri.codigo_expediente,
                codigo_nec: this.eri.codigo_nec,
                cod_nri: this.eri.cod_nri,
                fec_ini_at: this.eri.fec_ini_at,
                est_informe: 'R',
                fec_valorizacion: new Date(),
                cod_periodo: `${new Date().getFullYear()}${('0' + (new Date().getMonth() + 1)).toString().slice(-2)}`
            }
            const actividadList = await this.dataLocalService.leerActividades(this.eri.codigo_expediente)
            this.informe.num_evento_at_real = actividadList.filter(item => item.tip_actividad === '3' && item.tip_participante === 'GI'
                && item.est_actividad === 'E' && item.cod_grupo_usuario.includes(this.eri.cod_grupo_interes) 
                && `${item.fec_ini_real.toString().substring(0,4)}${item.fec_ini_real.toString().substring(5,7)}` === this.informe.cod_periodo).length
            
            const producInicial = this.eri.informes?.find(item => item.imp_prod_ini > 0 && item.cod_periodo < this.informe.cod_periodo)
            if (producInicial) {
                this.informe.imp_prod_ini = producInicial.imp_prod_ini
                this.informe.existeProdInicial = true
            }
            const comercInicial = this.eri.informes?.find(item => item.imp_ventas_ini > 0 && item.cod_periodo < this.informe.cod_periodo)
            if (comercInicial) {
                this.informe.imp_ventas_ini = comercInicial.imp_ventas_ini
                this.informe.existeComerInicial = true
            }
            if (!this.user) {this.user = await this.dataLocalService.leerUser()}
            const anho = this.eri.codigo_expediente.substring(2,6)
            if (anho && anho === '2024') {this.informe.tip_informacion = 'ATP'}
            if (anho && anho > '2024') {this.informe.tip_informacion = 'ATE'}


        }
        
        if (!this.consulta) {
            const funcion = await this.dataLocalService.leerFuncion()
            this.estadosEri = this.estadosEri.filter(estado => estado.txt_dato1?.includes(funcion.nid_funcion.toString()))
            if (!this.informe.fec_fin_at) {this.informe.fec_ini_at = this.eri.fec_ini_at}
            if (!this.informe.nid_asistente_tecnico || !this.informe.nid_funcion) {
                if (!this.user) {this.user = await this.dataLocalService.leerUser()}
                this.informe.nid_funcion = funcion.nid_funcion
                this.informe.nid_asistente_tecnico = this.user.nidPersonal
            }
        }

        if (this.fotos.length === 0) {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            this.fotos = archivos.eriInforme
        }

        if (!this.user) {this.user = await this.dataLocalService.leerUser()}

        if (this.user.perfil.nidperfil !== 34) {
            const anho = this.eri.codigo_expediente.substring(2,6)
            if (anho && anho < '2024') {this.tipoInformacion = ['ATP', 'ATEC', 'ATR']}
            if (anho && anho === '2024') {this.tipoInformacion = ['ATP']}
            if (anho && anho > '2024') {this.tipoInformacion = ['ATE']}
        }

        
    }

    async guardar() {
        if (this.informe.por_avance_imp_nri && (this.informe.por_avance_imp_nri > 1 || this.informe.por_avance_imp_nri < 0)
            || this.informe.por_avance_insumo && (this.informe.por_avance_insumo > 1 || this.informe.por_avance_insumo < 0)
            || this.informe.por_avance_pago && (this.informe.por_avance_pago > 1 || this.informe.por_avance_pago < 0)
            || this.informe.por_avance_resul_nri && (this.informe.por_avance_resul_nri > 1 || this.informe.por_avance_resul_nri < 0) ) {
                await this.uiService.alertaInformativa('Los porcentajes deben tener un valor entre 0 y 1')
                return
        }
        console.log('this.informe :>> ', this.informe);
        this.informe.fotos = this.fotos
        this.informe.cambio = true
        this.informe.incompleto = this.evaluarIncompleto()
        if (this.index || this.index === 0) {
            this.eri.informes[this.index] = this.informe
        } else {
            if (!this.eri.informes) {this.eri.informes = []}
            this.eri.informes.push(this.informe)
        }
        this.eri.cambioInforme = true
        this.eri.informeIncompleto = this.evaluarEriIncompleto()
        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarEri(this.eri)
        await this.uiService.dismissLoading()
        this.salir()
    }
    
    seleccionarEstado(event) {
        console.log('event :>> ', event);
        this.informe.est_nri = event.cod_tipo
        this.informe.txt_est_nri = this.eriParametro.estadosEri.find(item => item.cod_tipo === event.cod_tipo).txt_tipo
    }

    seleccionarCausal(event) {
        console.log('event :>> ', event);
        this.informe.cod_causal = event.cod_tipo
    }

    evaluarIncompleto() {
        if (!this.informe.est_nri) {return true}
        if (this.informe.est_nri === '8' || this.informe.est_nri === '6' || this.informe.est_nri === 'X') {
            if (!this.informe.cod_causal) {return true}
            if (this.informe.cod_causal === '99' && !this.informe.txt_otra_causal) {return true}
        }
        if (this.user.perfil.nidperfil !== 34 && !this.informe.tip_informacion) {return true}


        if (this.informe.est_nri && this.informe.est_nri !== '2' && this.informe.est_nri !== '9' && this.informe.est_nri !== 'X') {
            if (!(this.informe.por_avance_pago >= 0)) {return true}
            if (!(this.informe.por_avance_imp_nri >= 0)) {return true}
            if (!(this.informe.por_avance_resul_nri >= 0)) {return true}
            if (!(this.informe.num_evento_at_prog >= 0)) {return true}
            if (!(this.informe.num_evento_at_real >= 0)) {return true}
            if (!(this.informe.num_trabajadores >= 0)) {return true}
            if (!(this.informe.por_avance_insumo >= 0)) {return true}
            if (this.informe.produccion) {
                if (!(this.informe.imp_prod_ini >= 0)) {return true}
                if (!(this.informe.imp_prod_mes >= 0)) {return true}
                if (!(this.informe.imp_vol_venta >= 0)) {return true}
                if (!(this.informe.imp_ventas_ini >= 0)) {return true}
                if (!(this.informe.imp_ventas_actual >= 0)) {return true}
            }
        }
        if (this.informe.est_nri !== '2') {
            if (!this.informe.txt_conclusiones) {return true}
        }
        if (this.informe.est_nri && this.informe.est_nri !== '2') {
            if (!this.informe.fotos) {return true}
            for (let index = 0; index < this.informe.fotos.length; index++) {
                if (!this.informe.fotos[index].nueva && !this.informe.fotos[index].enviada) {return true}
            }
        }
        if (this.informe.est_nri === '4' && !this.informe.fec_fin_at) {return true}
    } 

    evaluarEriIncompleto() {
        if (this.eri.informes && this.eri.informes.length > 0) {
            for (let index = 0; index < this.eri.informes.length; index++) {
                console.log('this.eri.informes[index].incompleto :>> ', this.eri.informes[index].incompleto);
                if (this.eri.informes[index].incompleto) {return true}
            }
        }
        return false
    }

    salir() {
        this.modalController.dismiss();
    }
}
