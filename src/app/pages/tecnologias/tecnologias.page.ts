import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { IonList, ModalController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { DataLocalService } from './../../services/data-local.service';
import { UiServiceService } from 'src/app/services/ui-service.service';
import { UsuarioParametro, ActividadProductiva } from './../../model/usuarios';
import { Tecnologia, Usuario } from '../../model/usuarios';
import { TecnologiaEditPage } from '../tecnologia-edit/tecnologia-edit.page';
import { ArchivosConfig, Opcion } from './../../model/generales';
import { TecnologiaAvancePage } from '../tecnologia-avance/tecnologia-avance.page';
import { ActividadProdListPage } from '../actividad-prod-list/actividad-prod-list.page';
import { TecnologiaInsumoPage } from '../tecnologia-insumo/tecnologia-insumo.page';

@Component({
    selector: 'app-tecnologias',
    templateUrl: './tecnologias.page.html',
    styleUrls: ['./tecnologias.page.scss'],
})
export class TecnologiasPage implements OnInit {
    @ViewChild('listaTecOfer', { static: true}) listaTecOfer: IonList
    @ViewChild('listaTecNoOfer', { static: true}) listaTecNoOfer: IonList
    @Input() usuario: Usuario
    @Input() nuevoUsuario: false
    // @Input() solicitudUsuario: SolicitudUsuario
    @Input() tecnologiaNoOfertada: Tecnologia[] = []
    @Input() fechaInicio: Date
    @Input() modificado = false
    @Input() parametros: UsuarioParametro
    @Input() portafolio: number
    @Input() grupo = ''

    // flagCargando = false
    archivos: ArchivosConfig
    tecnologias: Tecnologia[] = []
    tecnologiasColectivas: Tecnologia[] = []
    opcion: Opcion
    etapaEjecucion = false

    constructor(private modalController: ModalController,
        private actionSheetCtrl: ActionSheetController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        if (this.fechaInicio) {this.etapaEjecucion = true}
        if (!this.nuevoUsuario) {
            this.tecnologias = this.usuario.tecnologias || []
            this.tecnologiaNoOfertada = this.usuario.tecnologiaNoOfertada || []
            this.tecnologiasColectivas = this.usuario.tecnologiasColectivas || []
        }
        if (this.tecnologiaNoOfertada.length < 1) {
            const tecnologiaPartida = await this.dataLocalService.leerTecnologiaPartidaProyecto(this.usuario.codigo_expediente)
            tecnologiaPartida.map(item => {
                if ( !this.tecnologias.find(val => item.cod_tecnologia + item.cod_partida === val.cod_tecnologia + val.cod_partida)) {
                    this.tecnologiaNoOfertada.push({
                        cod_tecnologia: item.cod_tecnologia,
                        txt_tecnologia: item.txt_tecnologia,
                        tip_beneficio: item.tip_beneficio,
                        flg_ofertada: false,
                        cod_partida: item.cod_partida,
                        txt_partida: item.txt_partida
                    })
                }
            })
        }
        this.opcion = await this.dataLocalService.leerOpcion('tecnologias')
    }

    async abrirOpciones(tecnologia: Tecnologia, index: number, ofertada: boolean, colectiva: boolean) {
        console.log('tecnologia SELECCIONADA :>> ', tecnologia);
        const buttons = []
        const opciones = [
            {
                text: 'Consultar Situación Inicial', icon: 'hammer-outline', objeto: 'consultarTecnologia', // cssClass: 'action-dark',
                handler: () => { this.abrirTecnologiaEdit(tecnologia, index, ofertada, colectiva, true, 'Situación Inicial') }
            },
            {
                text: 'Consultar Actividad Productiva', icon: 'hammer-outline', objeto: 'consultarActividad', // cssClass: 'action-dark',
                handler: () => { this.actividadesProd(tecnologia.actividadesProductivas) }
            },
            {
                text: 'Consultar Avance', icon: 'construct-outline', objeto: 'consultarAvance', // cssClass: 'action-dark',
                handler: () => { this.abrirTecnologiaAvance(tecnologia, index, false, true, 'Consultar Avance') }
            },
            {
                text: 'Consultar Seguimiento', icon: 'checkmark-done-outline', objeto: 'consultarSeguimiento', // cssClass: 'action-dark',
                handler: () => { this.abrirTecnologiaAvance(tecnologia, index, true, true, 'Consultar Seguimiento') }
            },
            {
                text: 'Cambiar Tecnología', icon: 'newspaper-outline', objeto: 'cambiarTecnologia', // cssClass: 'action-dark',
                handler: () => { this.abrirTecnologiaEdit(tecnologia, index, ofertada, colectiva, false, 'Cambiar Tecnologia') }
            },
            {
                text: 'Entrega de activos', icon: 'apps-outline', objeto: 'entregaActivos', // cssClass: 'action-dark',
                handler: () => { this.abrirTecnologiaInsumo(tecnologia, index, false) }
            },
            {
                text: 'Registrar Avance', icon: 'paper-plane-outline', objeto: 'avanceTecnologia', // cssClass: 'action-dark',
                handler: () => { this.abrirTecnologiaAvance(tecnologia, index, false, false, 'Avance Tecnología') }
            },
            {
                text: 'Registrar Seguimiento', icon: 'send-outline', objeto: 'seguimientoTecnologia', // cssClass: 'action-dark',
                handler: () => { this.abrirTecnologiaAvance(tecnologia, index, true, false, 'Seguimiento Tecnología') }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel-outline', objeto: 'cancelar',
                handler: () => { console.log('Cancel clicked') }
            }
        ]
        // let cambiarTecnologia = false
        // if (this.fechaInicio) {
        //     const hoy = new Date()
        //     const fecha = new Date(this.fechaInicio)
        //     const fechaInicio = new Date(fecha.getTime() + (this.parametros.diasSolicitudCambio * 24 * 60 * 60 * 1000))
        //     if (fechaInicio > hoy ) {
        //         cambiarTecnologia = true
        //     }
        // } else {
        //     cambiarTecnologia = true
        // }

        console.log('this.opcion :>> ', this.opcion);
        opciones.map(item => {
            if (item.objeto === 'consultarTecnologia' && (
                !ofertada || colectiva ||
                this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                !this.opcion.opciones ||
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'consultarActividad' && (
                !ofertada || colectiva ||
                !tecnologia.actividadesProductivas ||
                //parseInt(this.usuario.codigo_expediente.substring(2,6)) >= 2021 ||
                !this.opcion.opciones ||
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'consultarTecnologia') < 0
            )) { return }
            if (item.objeto === 'consultarAvance' && (
                !ofertada || colectiva ||
                !this.fechaInicio ||
                !this.opcion.opciones ||
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'consultarSeguimiento' && (
                !ofertada || colectiva ||
                !this.fechaInicio ||
                !this.opcion.opciones ||
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'cambiarTecnologia' && (
                // !cambiarTecnologia ||
                !this.opcion.opciones ||
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'entregaActivos' && (
                !ofertada || colectiva ||
                !this.opcion.opciones ||
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'avanceTecnologia' && (
                !ofertada || colectiva ||
                !this.opcion.opciones ||
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'seguimientoTecnologia' && (
                !ofertada || colectiva ||
                !this.opcion.opciones ||
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            buttons.push(item)
        })

        const actionSheet = await this.actionSheetCtrl.create({ buttons });
        await actionSheet.present();
    }

    async abrirTecnologiaEdit(tecnologia: Tecnologia, index: number, ofertada: boolean, colectiva: boolean, consulta: boolean, titulo: string) {
        const usuario = this.usuario
        if (!ofertada && !this.nuevoUsuario) {usuario.tecnologiaNoOfertada = this.tecnologiaNoOfertada}
        const modal = await this.modalController.create({
            component: TecnologiaEditPage,
            componentProps: {
                usuario,
                tecnologia,
                index,
                ofertada,
                colectiva,
                nuevoUsuario: this.nuevoUsuario,
                avanceProdListIni: tecnologia.situacionInicial ? (tecnologia.situacionInicial.avanceProd ? tecnologia.situacionInicial.avanceProd.map(item => JSON.stringify(item)) : null) : null,
                consulta,
                titulo,
                etapaEjecucion: this.etapaEjecucion
            }
        })
        await modal.present();
        if (this.nuevoUsuario) {
            const { data } = await modal.onDidDismiss()
            if (data) {
                this.tecnologiaNoOfertada[index].solicitudTecnologia = data
                this.tecnologiaNoOfertada[index].cambioIncompleto = this.informacionIncompleta(this.tecnologiaNoOfertada[index].solicitudTecnologia)
                //this.usuario.cambioTecnologia = true
                this.modificado = true
            }
        }
    }

    async actividadesProd(actividadesProductivas: ActividadProductiva[]) {
        const modal = await this.modalController.create({
            component: ActividadProdListPage,
            componentProps: {
                consulta: true,
                nuevoUsuario: true,
                actividadesProductivas
            }
        })
        await modal.present()
    }

    informacionIncompleta(solicitud) {
        if (!this.etapaEjecucion) {return false}
        if (!solicitud.flg_ofertada) {return false}
        if (!solicitud.fotos) {return true}
        if (solicitud.fotos) {
            for (let index = 0; index < solicitud.fotos.length; index++) {
                if (!solicitud.fotos[index].nueva && !solicitud.fotos[index].enviada && !solicitud.fotos[index].nid_archivo) {return true}
            }
        }
        return false
    }

    async abrirTecnologiaAvance(tecnologia: Tecnologia, index: number, contraste: boolean, consulta: boolean, titulo: string) {
        const tecnologiaFases = await this.dataLocalService.leerTecnologiaFase()
        const tecnologiaFase = tecnologiaFases.find(item => item.cod_tecnologia === tecnologia.cod_tecnologia)
        const productos = tecnologiaFase.productos || []
        let etapas = tecnologiaFase.etapas
        if (!consulta) {etapas = etapas.filter(etapa => etapa.cod_etapa !== '0')}
        // if (tecnologia.avance && tecnologia.avance.cod_etapa) {
        //     fases = etapas.find(etapa => etapa.cod_etapa === tecnologia.avance.cod_etapa).fases
        // }

        const modal = await this.modalController.create({
            component: TecnologiaAvancePage,
            componentProps: {
                titulo,
                usuario: this.usuario,
                tecnologia,
                contraste,
                index,
                productos,
                etapas,
                consulta,
                tipoObservacion: this.parametros.tipoObservacionSeguimeinto,
                portafolio: this.portafolio
            }
        })
        await modal.present();
    }

    async eliminarCambio(tecnologia: Tecnologia, index: number, ofertada: boolean) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar el cambio de la tecnología?`).then(async (resp) => {
            if (resp) {
                if (this.nuevoUsuario) {
                    this.tecnologiaNoOfertada[index].solicitudTecnologia = null
                    this.tecnologiaNoOfertada[index].cambioIncompleto = null
                    this.modificado = true
                } else {
                    tecnologia.solicitudTecnologia = null
                    tecnologia.cambioIncompleto = null
                    if (ofertada) {this.usuario.tecnologias[index] = tecnologia}
                    if (!ofertada) {this.usuario.tecnologiaNoOfertada[index] = tecnologia}
                    this.usuario.cambioTecnologia = this.evaluarExisteCambio()
                    this.usuario.cambioTecnologiaIncompleto = this.evaluarExisteCambioIncompleto()
                    if (!this.usuario.solicitud.tip_cambio && !this.usuario.cambioTecnologia && !this.usuario.cambioActividadProd) {
                        this.usuario.solicitud = null
                        this.usuario.txt_estado_solicitud = null
                    }
                    await this.dataLocalService.guardarUsuario(this.usuario, false)
                }
            }
        })
        if (ofertada) {this.listaTecOfer.closeSlidingItems()}
        if (!ofertada) {this.listaTecNoOfer.closeSlidingItems()}
    }

    async eliminarAvance(tecnologia: Tecnologia, index: number) {
        console.log('tecnologia :>> ', tecnologia);
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar el ${tecnologia.avance.flg_informacion_contraste ? 'seguimiento' : 'avance'}?`).then(async (resp) => {
            if (resp) {
                if(tecnologia.avance.plan_actividad_id) {await this.eliminarActividad(tecnologia, index)}
                this.usuario.tecnologias[index].avance = null
                this.usuario.tecnologias[index].avanceIncompleto = null
                this.usuario.registroAvanceTec = this.evaluarExisteAvance()
                if (!this.usuario.registroAvanceTec) {this.usuario.tipoAvance = null}
                this.usuario.registroAvanceIncompleto = this.evaluarExisteAvanceIncompleto()
                await this.dataLocalService.guardarUsuario(this.usuario, false)
            }
        })
        this.listaTecOfer.closeSlidingItems()
    }

    async eliminarActividad(tecnologia: Tecnologia, index: number) {
        const actividadList = await this.dataLocalService.leerPlanActividades()
        const actividadIndex = actividadList.findIndex(item => item.id === this.usuario.tecnologias[index].avance.plan_actividad_id)
        if (actividadIndex || actividadIndex == 0) {
            if (actividadList[actividadIndex].actividadEjecutada.avanceTecnologia && actividadList[actividadIndex].actividadEjecutada.avanceTecnologia.length > 0) {
                const idx = actividadList[actividadIndex].actividadEjecutada.avanceTecnologia.findIndex(item => item.codigo_expediente !== this.usuario.codigo_expediente && item.nid_persona !== this.usuario.nid_personal_proyecto && item.nid_tecnologia !== tecnologia.nid_tecnologia)
                actividadList[actividadIndex].actividadEjecutada.avanceTecnologia.splice(idx,1)
                await this.dataLocalService.guardarPlanActividad(actividadList[actividadIndex])
            }
        }
    }

    async eliminarEntrega(tecnologia: Tecnologia, index: number) {
        console.log('tecnologia Entrega:>> ', tecnologia);
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la entrega de activos?`).then(async (resp) => {
            if (resp) {
                this.usuario.tecnologias[index].entregaInsumos = null
                this.usuario.tecnologias[index].cambioEntregaInsumos = false
                this.usuario.cambioEntregaInsumos = this.evaluarExisteEntrega()
                await this.dataLocalService.guardarUsuario(this.usuario, false)
            }
        })
        this.listaTecOfer.closeSlidingItems()
    }

    evaluarExisteCambio() {
        if (this.usuario.tecnologias && this.usuario.tecnologias.length > 0) {
            for (let index = 0; index < this.usuario.tecnologias.length; index++) {
                if (this.usuario.tecnologias[index].solicitudTecnologia) {return true}
            }
        }
        if (this.usuario.tecnologiaNoOfertada && this.usuario.tecnologiaNoOfertada.length > 0) {
            for (let index = 0; index < this.usuario.tecnologiaNoOfertada.length; index++) {
                if (this.usuario.tecnologiaNoOfertada[index].solicitudTecnologia) {return true}
            }
        }
        return false
    }

    evaluarExisteCambioIncompleto() {
        if (!this.etapaEjecucion) {return false}
        if (this.usuario.tecnologias && this.usuario.tecnologias.length > 0) {
            for (let index = 0; index < this.usuario.tecnologias.length; index++) {
                if (this.usuario.tecnologias[index].cambioIncompleto) {return true}
            }
        }
        if (this.usuario.tecnologiaNoOfertada && this.usuario.tecnologiaNoOfertada.length > 0) {
            for (let index = 0; index < this.usuario.tecnologiaNoOfertada.length; index++) {
                if (this.usuario.tecnologiaNoOfertada[index].cambioIncompleto) {return true}
            }
        }
        return false
    }

    evaluarExisteAvance() {
        for (let index = 0; index < this.usuario.tecnologias.length; index++) {
            if (this.usuario.tecnologias[index].avance) {return true}
        }
        return false
    }

    evaluarExisteAvanceIncompleto() {
        for (let index = 0; index < this.usuario.tecnologias.length; index++) {
            if (this.usuario.tecnologias[index].avanceIncompleto) {return true}
        }
        return false
    }

    evaluarExisteEntrega() {
        for (let index = 0; index < this.usuario.tecnologias.length; index++) {
            if (this.usuario.tecnologias[index].cambioEntregaInsumos) {return true}
        }
        return false
    }

    async abrirTecnologiaInsumo(tecnologia: Tecnologia, index: number, consulta: boolean) {
        const tecnologiaTexto = JSON.stringify(tecnologia)
        const modal = await this.modalController.create({
            component: TecnologiaInsumoPage,
            componentProps: {
                tipoEntrega: 'U',
                tecnologiaColectiva: tecnologia,
                usuario: this.usuario,
                tecnologiaTexto,
                index,
                consulta
            }
        })
        await modal.present();
    }

    salir() {
        if (this.nuevoUsuario) {
            this.modalController.dismiss({tecNoOfer: this.tecnologiaNoOfertada, modificado: this.modificado})
        } else {
            this.modalController.dismiss();
        }
    }
}
