import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonList, IonModal, ModalController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { SincronizaTecColectivaService } from '../../services/sincroniza/sincroniza-tec-colectiva.service';
import { Proyecto, TecnologiaColectivaDetalle, TecnologiaColectiva } from '../../model/proyectos';
import { Opcion } from '../../model/generales';
import { TecnologiaAvancePage } from '../tecnologia-avance/tecnologia-avance.page';
import { UsuarioParametro } from '../../model/usuarios';
import { TecnologiaInsumoPage } from '../tecnologia-insumo/tecnologia-insumo.page';

@Component({
    selector: 'app-tecnologia-colectiva',
    templateUrl: './tecnologia-colectiva.page.html',
    styleUrls: ['./tecnologia-colectiva.page.scss'],
})
export class TecnologiaColectivaPage implements OnInit {

    // @ViewChild(IonModal) modal: IonModal;
    @ViewChild('lista', { static: true}) lista: IonList
    proyecto: Proyecto
    tecnologias: TecnologiaColectiva[]
    tecnologiaSeleccionada: TecnologiaColectiva
    detalleAgregado: TecnologiaColectivaDetalle
    indexSeleccionado: number
    indexDetalle: number
    nuevoDetalle = false
    cantidad: number
    descripcion: string
    fecFinYachachiq: Date
    fecIniYachachiq: Date
    nidNuevoYachachiq: number
    opcion: Opcion
    parametros: UsuarioParametro
    isActionTecColecModalOpen = false
    isYachachiqModalOpen = false
    yachachiqs = []

    constructor(private dataLocalService: DataLocalService,
        private actionSheetCtrl: ActionSheetController,
        private modalController: ModalController,
        private uiService: UiServiceService,
        private sincronizaTecPartidaService: SincronizaTecColectivaService
    ) { }

    async ngOnInit() {
        console.log('TECNOLOGIA COLECTIVA');
        this.proyecto = await this.dataLocalService.leerProyectoSeleccionado()
        this.tecnologias = await this.dataLocalService.leerTecnologiaColectiva(this.proyecto.codigo_expediente)
        this.tecnologias?.forEach(item => {item.num_metrado_partida = Math.round(item.num_metrado_partida * 100)/100})
        console.log('this.tecnologias :>> ', this.tecnologias);
        this.opcion = await this.dataLocalService.leerOpcion('tecnologiasColectivas')
        console.log('this.opcion :>> ', this.opcion);
        this.parametros = await this.dataLocalService.leerUsuariosParametro()
    }

    async abrirOpcionesTecnologia(tecnologia, index) {
        console.log('tecnologia :>> ', tecnologia);
        
        if (this.calcularMetradoDisponible(tecnologia) > 0 && !(this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColAgregarDet') < 0)) {
            const buttons = [
                {
                    text: 'Agregar Detalle', icon: 'construct-outline', objeto: 'tecColAgregarDet',
                    handler: () => { this.agregarDetalle(tecnologia, index) }
                },
                {
                    text: 'Cancelar', icon: 'close', role: 'cancel-outline', objeto: 'cancelar',
                    handler: () => { console.log('Cancel clicked') }
                }
            ]
            const actionSheet = await this.actionSheetCtrl.create({ buttons });
            await actionSheet.present();
        }
    }

    async abrirOpcionesDetalle(tecnologia, index, detalle, idx) {
        console.log('detalle :>> ', detalle);
        const buttons = []
        const opciones = [
            {
                text: 'Editar', icon: 'create-outline', objeto: 'tecColEditarDetEd',
                handler: () => { this.editarDetalle(tecnologia, index, detalle, idx) }
            },
            {
                text: 'Editar descripción', icon: 'create-outline', objeto: 'tecColEditarDetDes',
                handler: () => { this.editarDetalle(tecnologia, index, detalle, idx) }
            },
            {
                text: 'Asignación del Yachachiq', icon: 'shirt-outline', objeto: 'tecColAsignaYachachiq',
                handler: () => { this.asignarYachaqui(tecnologia, index, detalle, idx) }
            },
            {
                text: 'Entrega de activos', icon: 'apps-outline', objeto: 'tecColEntregaActivos',
                handler: () => { this.abrirTecnologiaInsumo(tecnologia, index, false) }
            },
            {
                text: 'Consultar Avance', icon: 'construct-outline', objeto: 'tecColConsultarAvan', 
                handler: () => { this.abrirTecnologiaAvance(tecnologia, index, idx, false, true, 'Consultar Avance') }
            },
            {
                text: 'Consultar Seguimiento', icon: 'checkmark-done-outline', objeto: 'tecColConsultarSegui',
                handler: () => { this.abrirTecnologiaAvance(tecnologia, index, idx, true, true, 'Consultar Seguimiento') }
            },
            {
                text: 'Registrar Avance', icon: 'paper-plane-outline', objeto: 'tecColRegistrarAvan',
                handler: () => { this.abrirTecnologiaAvance(tecnologia, index, idx, false, false, 'Registrar Avance') }
            },
            {
                text: 'Registrar Seguimiento', icon: 'send-outline', objeto: 'tecColRegistrarSegui',
                handler: () => { this.abrirTecnologiaAvance(tecnologia, index, idx, true, false, 'Registrar Seguimiento') }
            },
            {
                text: 'Sincronizar', icon: 'sync-outline',
                handler: () => { this.sincronizarDetalle(index, detalle, idx) }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel-outline', objeto: 'cancelar',
                handler: () => { console.log('Cancel clicked') }
            }
        ]

        opciones.map(item => {
            if (item.objeto === 'tecColEditarDetEd' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                // detalle.nid_detalle
                (detalle.nid_detalle && (detalle.ultimoSeguimiento || detalle.ultimoAvance))
            )) { return }
            if (item.objeto === 'tecColEditarDetDes' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                !detalle.nid_detalle || (detalle.nid_detalle && (!detalle.ultimoAvance && !detalle.ultimoSeguimiento))
            )) { return }
            if (item.objeto === 'tecColAsignaYachachiq' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'tecColConsultarAvan' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'tecColConsultarSegui' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'tecColRegistrarAvan' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'tecColRegistrarSegui' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }

            // if (item.objeto === 'consultarActividad' && (
            //     !ofertada || !tecnologia.actividadesProductivas ||
            //     //parseInt(this.usuario.codigo_expediente.substring(2,6)) >= 2021 ||
            //     this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'consultarTecnologia') < 0
            // )) { return }
            buttons.push(item)
        })

        const actionSheet = await this.actionSheetCtrl.create({ buttons });
        await actionSheet.present();
    }

    async agregarDetalle(tecnologia, index) {
        console.log('tecnologia :>> ', tecnologia);
        this.tecnologiaSeleccionada = tecnologia
        this.tecnologiaSeleccionada.metradoDisponible = this.calcularMetradoDisponible(tecnologia)
        console.log('this.tecnologiaSeleccionada.metradoDisponible :>> ', this.tecnologiaSeleccionada.metradoDisponible);
        this.indexSeleccionado = index
        this.detalleAgregado = {
            codigo_expediente: tecnologia.codigo_expediente,
            cod_partida: tecnologia.cod_partida,
            cod_tecnologia: tecnologia.cod_tecnologia,
            txt_unidad_partida: tecnologia.txt_unidad_partida,
            fec_registro: new Date()
        }
        if (tecnologia.detalle) {
            this.descripcion = `${tecnologia.txt_partida} - Detalle ${tecnologia.detalle.length + 1}`
        } else {
            this.descripcion = `${tecnologia.txt_partida} - Detalle 1`
        }
        this.cantidad = 1
        // this.descripcion = tecnologia.txt_partida
        this.nuevoDetalle = true
        this.isActionTecColecModalOpen = true
    }

    async editarDetalle(tecnologia, index, detalle, idx) {
        this.cantidad = detalle.num_metrado_detalle
        this.descripcion = detalle.txt_detalle
        this.tecnologiaSeleccionada = tecnologia
        this.tecnologiaSeleccionada.metradoDisponible = this.calcularMetradoDisponible(tecnologia)
        this.indexSeleccionado = index
        this.detalleAgregado = detalle
        this.nuevoDetalle = false
        this.isActionTecColecModalOpen = true
        this.indexSeleccionado = index
        this.indexDetalle = idx
    }

    calcularMetradoDisponible(tecnologia: TecnologiaColectiva) {
        let suma = 0
        if (tecnologia.detalle && tecnologia.detalle.length > 0) {
            for (let index = 0; index < tecnologia.detalle.length; index++) {
                suma = suma + tecnologia.detalle[index].num_metrado_detalle
            }
        }
        return Math.round((tecnologia.num_metrado_partida*1000) - (suma*1000))/1000
    }

    cancel() {
        this.isActionTecColecModalOpen = false
    }

    async confirm() {
        if (!this.cantidad || this.cantidad <= 0) {
            await this.uiService.alertaInformativa('Falta registrar el metrado.')
            return
        }
        if (this.cantidad > (this.tecnologiaSeleccionada.metradoDisponible + (this.detalleAgregado?.num_metrado_detalle ? this.detalleAgregado?.num_metrado_detalle : 0) )) {
            await this.uiService.alertaInformativa('El metrado del detalle no puede superar el metrado disponible en la partida.')
            return
        }

        this.detalleAgregado.num_metrado_detalle = this.cantidad
        this.detalleAgregado.txt_detalle = this.descripcion
        this.detalleAgregado.cambio = true

        if (!this.tecnologiaSeleccionada.detalle) {this.tecnologiaSeleccionada.detalle = []}
        if (this.nuevoDetalle) {
            this.tecnologiaSeleccionada.detalle.push(this.detalleAgregado)
        } else {
            this.detalleAgregado.txt_detalle = this.descripcion
            this.tecnologiaSeleccionada.detalle[this.indexDetalle] = this.detalleAgregado
        }
        this.tecnologias[this.indexSeleccionado] = this.tecnologiaSeleccionada
        await this.dataLocalService.guardarTecnologiaColectivaList(this.tecnologias)
        
        this.isActionTecColecModalOpen = false
    }
    
    onWillDismiss(event: Event) {
        this.isActionTecColecModalOpen = false
        this.isYachachiqModalOpen = false
    }

    async eliminarDetalle(tecnologia, index, detalle, idx) {
        tecnologia.detalle.splice(idx,1)
        this.tecnologias[index] = tecnologia
        await this.dataLocalService.guardarTecnologiaColectivaList(this.tecnologias)
    }

    async eliminarAvance(tecnologia, index, detalle, idx) {
        this.tecnologias[index].detalle[idx].avance = null
        await this.dataLocalService.guardarTecnologiaColectivaList(this.tecnologias)
        this.lista.closeSlidingItems()
    }
 
    async abrirTecnologiaAvance(tecnologiaColectiva: TecnologiaColectiva, index: number, indexDetalle: number, contraste: boolean, consulta: boolean, titulo: string) {
        const tecnologiaFases = await this.dataLocalService.leerTecnologiaFase()
        const tecnologiaFase = tecnologiaFases.find(item => item.cod_tecnologia === tecnologiaColectiva.cod_tecnologia)
        const productos = tecnologiaFase.productos || []
        let etapas = tecnologiaFase.etapas
        if (!consulta) {etapas = etapas.filter(etapa => etapa.cod_etapa !== '0')}

        const modal = await this.modalController.create({
            component: TecnologiaAvancePage,
            componentProps: {
                titulo,
                contraste,
                index,
                productos,
                etapas,
                consulta,
                tipoObservacion: this.parametros.tipoObservacionSeguimeinto,
                avanceTecColectiva: true,
                tecnologiaColectiva,
                indexDetalle
            }
        })
        await modal.present();
    }

    async abrirTecnologiaInsumo(tecnologia: TecnologiaColectiva, index: number, consulta: boolean) {
        console.log('tecnologia :>> ', tecnologia);
        const tecnologiaTexto = JSON.stringify(tecnologia)
        const modal = await this.modalController.create({
            component: TecnologiaInsumoPage,
            componentProps: {
                tipoEntrega: 'C',
                tecnologiaColectiva: tecnologia,
                tecnologiaTexto,
                index,
                consulta
            }
        })
        await modal.present();
    }

    async asignarYachaqui(tecnologia, index, detalle, idx) {
        this.yachachiqs = []
        let agentes = await this.dataLocalService.leerAgentesProyecto(tecnologia.codigo_expediente)
        agentes = agentes.filter(item => item.nid_funcion === 483)
        this.yachachiqs.push({
            nidPersonal: 0,
            nombre: 'NINGUNO'
        })
        agentes.map(item => {
            if (!this.yachachiqs.find(val => val.nidPersonal === item.nid_personal)) {
                this.yachachiqs.push({
                    nidPersonal: item.nid_personal,
                    nombre: item.txt_apellido_paterno + ' ' + item.txt_apellido_materno + ', ' + item.txt_nombres
                })
            }
        })

        this.tecnologiaSeleccionada = tecnologia
        this.detalleAgregado = detalle
        this.indexSeleccionado = index
        this.indexDetalle = idx
        this.fecFinYachachiq = detalle.fecFinYachachiq
        this.fecIniYachachiq = detalle.fecYachachiq
        this.nidNuevoYachachiq = detalle.nidYachachiq

        this.isYachachiqModalOpen = true
    }

    cambioYachachiq(ev) {
        if (ev.detail.value == 0) {
            this.fecIniYachachiq = null
        }
    }

    cancelaAsignacion() {
        this.isYachachiqModalOpen = false
    }

    async confirmaAsignacion() {
        if (this.detalleAgregado.txt_yachachiq && !this.fecFinYachachiq) {
            await this.uiService.alertaInformativa('Falta registrar la fecha de término del Yachachiq anterior.')
            return
        }
        if (this.nidNuevoYachachiq === undefined || this.nidNuevoYachachiq === null || (this.nidNuevoYachachiq === 0 && !this.detalleAgregado.nid_personal_yachachiq)) {
            await this.uiService.alertaInformativa('Falta seleccionar al Yachachiq.')
            return
        }
        if (!this.fecIniYachachiq && this.nidNuevoYachachiq > 0) {
            await this.uiService.alertaInformativa('Falta registrar la fecha de asignación.')
            return
        }

        this.detalleAgregado.fecFinYachachiq = this.fecFinYachachiq
        this.detalleAgregado.fecYachachiq = this.fecIniYachachiq
        this.detalleAgregado.nidYachachiq = this.nidNuevoYachachiq
        this.detalleAgregado.flg_cambio_yachachiq = true

        const yachachiq = this.yachachiqs.find(item => item.nidPersonal === this.detalleAgregado.nidYachachiq)
        this.detalleAgregado.txtYachachiq = yachachiq.nombre
        this.tecnologiaSeleccionada.detalle[this.indexDetalle] = this.detalleAgregado
        this.tecnologias[this.indexSeleccionado] = this.tecnologiaSeleccionada

        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarTecnologiaColectivaList(this.tecnologias)
        await this.uiService.dismissLoading()
        
        this.isYachachiqModalOpen = false
    }

    async eliminarAsignacion(tecnologia, index, detalle, idx) {
        this.tecnologias[index].detalle[idx].fecFinYachachiq = null
        this.tecnologias[index].detalle[idx].fecYachachiq = null
        this.tecnologias[index].detalle[idx].nidYachachiq = null
        this.tecnologias[index].detalle[idx].flg_cambio_yachachiq = null
        
        await this.dataLocalService.guardarTecnologiaColectivaList(this.tecnologias)
        this.lista.closeSlidingItems()
    }

    async sincronizarDetalle(indexTec: number, detalle: TecnologiaColectivaDetalle, indexDetalle) {
        const respDetalle = await this.sincronizaTecPartidaService.detalle(indexTec, detalle, indexDetalle, true)
        if (!respDetalle) {
            this.uiService.alertaInformativa('No se sincronizó la información.')
            return
        }
        this.tecnologias[indexTec].detalle[indexDetalle] = respDetalle
    }
}
