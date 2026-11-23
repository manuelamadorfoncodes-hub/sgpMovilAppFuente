import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonList, ModalController } from '@ionic/angular';
import { VisitaEditPage } from '../visita-edit/visita-edit.page';
import { DataLocalService } from './../../services/data-local.service';
import { UiServiceService } from './../../services/ui-service.service';
import { Visita, VisitaParametro } from './../../model/visitas';
import { Proyecto } from './../../model/proyectos';
import { VisitaAvancePage } from '../visita-avance/visita-avance.page';
import { SincronizaVisitaService } from '../../services/sincroniza/sincroniza-visita.service';
import { GrupoPartida, Presupuesto, SubPresupuesto } from '../../model/presupuesto';

@Component({
    selector: 'app-visitas',
    templateUrl: './visitas.page.html',
    styleUrls: ['./visitas.page.scss'],
})
export class VisitasPage implements OnInit {

    @ViewChild('listaVisitas', { static: true }) lista: IonList

    defaultHref = '/tabsPrincipal/tabsPrincipal/proyectos'
    proyecto: Proyecto
    visitas: Visita[]
    parametros: VisitaParametro
    existeAbierta: boolean
    porcentajeAvance = 0
    visitaSelec: Visita
    isSubpptoOpen = false
    subPptoList: SubPresupuesto [] = []
    subPptoSelec: SubPresupuesto
    isGruposOpen = false
    grupoList: GrupoPartida[] = []
    grupoSelec: GrupoPartida
    grupoSelecTexto: string
    esSupervisor = false
    avanceUltimaVisita: number
    // partidaRepresentativa: Partida

    constructor(private modalController: ModalController,
        private actionSheetCtrl: ActionSheetController,
        public dataLocalService: DataLocalService,
        private uiService: UiServiceService,
        private sincronizaVisitaService: SincronizaVisitaService) { }

    async ngOnInit() {
        console.log('this.proyecto :>> ', this.proyecto);
        this.proyecto = await this.dataLocalService.leerProyectoSeleccionado()
        this.visitas = await this.dataLocalService.leerVisitasProyecto(this.proyecto.codigo_expediente)
        console.log('this.visitas :>> ', this.visitas);
        this.dataLocalService.visitasListener.subscribe(visitas => this.visitas = visitas)
        // this.parametros = await this.dataLocalService.leerVisitaParametro()
        console.log('VISITAS :>> ', this.visitas);
        this.evaluaExisteAbierta()
        if (this.visitas && this.visitas.length > 0) {this.porcentajeAvance = this.visitas[0].por_avance}
        const user  = await this.dataLocalService.leerUser()
        if (user.perfil.nidperfil === 52) {this.esSupervisor = true}
        console.log('termina ngOnInit el de visita');
        if (this.visitas.length > 0) {
            this.visitas.forEach(visita => {
                if (visita.est_visita === '02') {this.avanceUltimaVisita = visita.por_avance}
            });
        }
    }

    async abrirOpciones(visita, index) {
        console.log('Entra a abrirOpciones');
        if (!visita) {console.log('no visita :>> ');}
        console.log('VISITA :>> ',index);
        console.log('VISITA :>> ', visita);
        const buttons = []
        const opciones = [
            {
                text: 'Editar visita', icon: 'create-outline', objeto: 'editarVisita',
                handler: () => { this.abrirVisita(visita, index, 'Editar', false) }
            },
            {
                text: 'Consultar visita', icon:'reader-outline', objeto: 'consultarVisita',
                handler: () => { this.abrirVisita(visita, index, 'Consultar', true) }
            },
            {
                text: 'Ver subpresupuestos', icon: 'layers-outline', objeto: 'verSubpresupuestos',
                handler: () => { this.abriSubpptos(visita, index) }
            },
            {
                text: 'Concluir visita', icon: 'checkmark-circle-outline', objeto: 'concluirVisita',
                handler: () => { this.concluirVisita(visita, index) }
            },
            {
                text: 'Reabrir visita', icon: 'lock-open-outline', objeto: 'reabrirVisita',
                handler: () => { this.reabrirVisita(visita, index) }
            },
            {
                text: 'Extraer reporte de visita', icon: 'reader-outline', objeto: 'extraerReporte',
                handler: () => { this.extraerReporte(visita, index) }
            },
            {
                text: 'Enviar reporte de visita a UT', icon: 'mail-open-outline', objeto: 'enviarReporte',
                handler: () => { this.enviarReporte(visita, index) }
            },
            {
                text: 'Sincronizar visita', icon: 'sync-outline', objeto: 'sincronizarVista',
                handler: () => { this.sincronizarVisita(visita, index) }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel', handler: () => { console.log('Cancel clicked') }
            }
        ]

        opciones.map(item => {
            if (item.objeto === 'editarVisita' && (
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                visita.est_visita !== '01'
            )) { return }
            if (item.objeto === 'consultarVisita' && (
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                visita.est_visita !== '02'
            )) { return }
            if (item.objeto === 'concluirVisita' && (
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                visita.est_visita !== '01'
            )) { return }            
            if (item.objeto === 'reabrirVisita' && (
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                index !== 0 ||
                visita.est_visita !== '02'
            )) { return }  
            if (item.objeto === 'extraerReporte' && (
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                visita.est_visita !== 'X' // no se muestra por ahora
            )) { return }  
            if (item.objeto === 'enviarReporte' && (
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                visita.est_visita !== 'X' // no se muestra por ahora
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

    async abrirVisita(visita?: Visita, index?: number, titulo?: string, consulta?: boolean) {
        if (!visita) {
            const presupuesto: Presupuesto = await this.dataLocalService.leerPresupuestoProyecto(this.proyecto.codigo_expediente)
            if (presupuesto && presupuesto.lstHuerfano && presupuesto.lstHuerfano.length > 0) {
                for (let index = 0; index < presupuesto.lstHuerfano.length; index++) {
                    if (presupuesto.lstHuerfano[index].detalles.length > 0) {
                        await this.uiService.alertaInformativa('No es posible crear un nueva visita porque existen partidas que no están asociadas a grupos.')
                        return
                    }
                }
            }
        }

        if (visita) {visita.index = index}
        const modal = await this.modalController.create({
            component: VisitaEditPage,
            componentProps: {
                proyecto: this.proyecto,
                visitaTexto: visita ? JSON.stringify(visita) : null,
                // etapas: this.parametros.etapa,
                titulo,
                consulta
            }
        })
        await modal.present();
        const { data } = await modal.onDidDismiss()
        console.log('data :>> ', data);
        this.evaluaExisteAbierta()
    }

    evaluaExisteAbierta() {
        console.log('this.visitas :>> ', this.visitas);
        if (this.visitas && this.visitas.length > 0 && (this.visitas.find(visita => visita.est_visita === '01') || this.visitas.find(visita => visita.cambio))) {
            this.existeAbierta = true
        } else {
            this.existeAbierta = false
        }
        if (this.visitas && this.visitas.length > 0) {this.porcentajeAvance = this.visitas[0].por_avance}
        console.log('this.existeAbierta :>> ', this.existeAbierta);
        // if (this.visitas.find(visita => visita.est_visita === '01')) {this.existeAbierta = true}
    }

    async concluirVisita(visita: Visita, index: number) {
        if (visita.incompleto) {
            await this.uiService.alertaInformativa('La visita está incompleta. No es posible cambiar el estado a "Concluída".')
            return
        }
        let existeObsPendiente = false
        for (let index = 0; index < visita.presupuesto.ablEstructura.length; index++) {
            const subPpto = visita.presupuesto.ablEstructura[index];
            for (let idxGrupo = 0; idxGrupo < subPpto.grupoPartida.length; idxGrupo++) {
                const grupo = subPpto.grupoPartida[idxGrupo];
                if (grupo.observacionFoto && grupo.observacionFoto.length > 0 && grupo.observacionFoto.find(item => (!item.flg_levantada && !item.flg_reiterada))) {
                    existeObsPendiente = true
                    console.log('existeObsPendiente :>> ', existeObsPendiente);
                }
            }
        }
        if (existeObsPendiente) {
            await this.uiService.alertaInformativa('No es posible concluir la vista porque existen observaciones que no han sido reiteradas o levantadas.')
            return
        }


        const resp = await this.uiService.alertaConfirmacion('¿Está seguro de cambiar el estado de la visita a concluída?')
        if (resp) {
            visita.est_visita = '02'
            visita.txt_estado_visita = 'Concluída'
            await this.guardar(visita, index)
        }
        this.evaluaExisteAbierta()
    }

    async reabrirVisita(visita, index) {
        const resp = await this.uiService.alertaConfirmacion('¿Está seguro de reabrir la vista?')
        if (resp) {
            console.log('aquí :>> ');
            visita.est_visita = '01'
            visita.txt_estado_visita = 'Abierta'
            await this.guardar(visita, index)
        }
        this.evaluaExisteAbierta()      
    }

    extraerReporte(visita, index) {
    }

    enviarReporte(visita, index) {
    }
    
    async sincronizarVisita(vista: Visita, index: number) {
        if (vista.incompleto) {
            const resp = await this.uiService.alertaConfirmacion('La visita tiene datos incompletos. ¿Desea continuar con la sincronización?')
            if (!resp) {return}
        }
        const respUsuario = await this.sincronizaVisitaService.visita(vista, index, true)
        if (!respUsuario) { this.uiService.alertaInformativa('No se sincronizó la información.') }
        this.evaluaExisteAbierta()
    }

    async eliminarVisita(index) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la visita?`).then(async (resp) => {
            if (resp) { 
                await this.dataLocalService.eliminarVisita(this.proyecto.codigo_expediente, index) 
                this.evaluaExisteAbierta()
            }
        })
        this.lista.closeSlidingItems()
    }

    abriSubpptos(visita: Visita, index: number) {
        console.log('index :>> ', index);
        this.visitaSelec = visita
        this.visitaSelec.index = index
        this.subPptoList = this.visitaSelec.presupuesto.ablEstructura
        this.isSubpptoOpen = true

    }

    cerrarSubppto() {
        this.isSubpptoOpen = false
    }

    
    abriGrupos(subPpto: SubPresupuesto, idxSubPpto) {
        subPpto.index = idxSubPpto
        this.subPptoSelec = subPpto
        console.log('this.subPptoSelec :>> ', this.subPptoSelec);
        this.grupoList = subPpto.grupoPartida
        this.isGruposOpen = true
    }

    cerrarGrupos() {
        this.isGruposOpen = false
        // this.subPptoSelec = null
        this.grupoList = []
    }

    async registrarComentSubppto() {
        this.visitaSelec.presupuesto.ablEstructura[this.subPptoSelec.index].txt_comentario = this.subPptoSelec.txt_comentario
        this.visitaSelec.presupuesto.ablEstructura[this.subPptoSelec.index].cambio = true
        this.visitaSelec.presupuesto.ablEstructura[this.subPptoSelec.index].fec_ult_modificacion = new Date()
        await this.guardar(this.visitaSelec, this.visitaSelec.index)
    }

    async guardar(visita, index) {
        console.log('Guardar...');
        visita.cambio = true
        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarVisita(visita, index)
        await this.uiService.dismissLoading()
    }

    async abrirOpcionesGrupo(grupo, index) {
        console.log('GRUPO :>> ', grupo, index);
        console.log('this.esSupervisor :>> ', this.esSupervisor);
        grupo.index = index
        this.grupoSelec = grupo
        const buttons = []
        const opciones = [
            {
                text: 'Registrar avance', icon:'paper-plane-outline', objeto: 'avanceGrupo',
                handler: () => { this.avanceVisitaGrupo(grupo, index, 'avanceGrupo') }
            },
            {
                text: 'Ver partidas', icon: 'flag-outline', objeto: 'avancePartida',
                handler: () => { this.avanceVisitaGrupo(grupo, index, 'avancePartida') }
            },
            {
                text: 'Observaciones anteriores', icon: 'glasses-outline', objeto: 'gestionObservaciones',
                handler: () => { this.avanceVisitaGrupo(grupo, index, 'gestionObservacion') }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel', handler: () => { console.log('Cancel clicked') }
            }
        ]

        opciones.map(item => {
            // if (item.objeto === 'avanceGrupo' && (
            //     // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
            //     // visita.est_visita !== '01'
            // )) { return }
            if (item.objeto === 'avancePartida' && (
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                this.visitaSelec.presupuesto.ablEstructura[0].esPartidaRepresentativa ||
                !this.esSupervisor
            )) { return }
            if (item.objeto === 'gestionObservaciones' && (
                // this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'tecColEditarDet') < 0 ||
                !(this.grupoSelec.observacionFoto && this.grupoSelec.observacionFoto.length > 0)
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
        
    async avanceVisitaGrupo(grupo, index, accion) {
        console.log('this.visitas :>> ', this.visitas);
        console.log('ksfjsdfk  ksdfljsd :>> ', );
        console.log('length :>> ', this.visitas.length);
        console.log('accion :>> ', accion);
        console.log('entra aqui!!!!!!');
        console.log('this.visitas :>> ', this.visitas);
        console.log('this.visitaSelec :>> ', this.visitaSelec);
        console.log('this.visitas[this.visitaSelec.index + 1] :>> ', this.visitas[this.visitaSelec.index + 1]);
        console.log('GRUPO :>> ', grupo);
        grupo.index = index
        const modal = await this.modalController.create({
            component: VisitaAvancePage,
            componentProps: {
                proyecto: this.proyecto,
                visita: this.visitaSelec,
                subPptoSelec: this.subPptoSelec,
                grupoTexto: grupo ? JSON.stringify(grupo) : null,
                consulta: this.visitaSelec.est_visita === '01' ? false : true,
                accion,
                ultimaVisita: this.visitas[this.visitaSelec.index + 1]
                // visitaTexto: visita ? JSON.stringify(visita) : null,
            }
        })
        await modal.present();
        const { data } = await modal.onDidDismiss()
        console.log('data :>> ', data);
        this.porcentajeAvance = this.visitas[0].por_avance
    }

}
