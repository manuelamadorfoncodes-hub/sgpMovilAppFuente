import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonList, ModalController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { SincronizaService } from '../../services/sincroniza/sincroniza.service';
import { UiServiceService } from '../../services/ui-service.service';
import { Funcion, Opcion, User } from '../../model/generales';
import { Proyecto } from '../../model/proyectos';
import { Agente, AgenteParametro } from '../../model/agentes';
import { AgenteEvaluacionPage } from '../agente-evaluacion/agente-evaluacion.page';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-agentes',
    templateUrl: './agentes.page.html',
    styleUrls: ['./agentes.page.scss'],
})
export class AgentesPage implements OnInit {
    @ViewChild('lista', { static: true}) lista: IonList
    proyecto: Proyecto
    codigoProyecto = ''
    defaultHref = '/tabsPrincipal/tabsPrincipal/proyectos'
    user: User
    textoBuscar = ''
    agentes: Agente[] = []
    opcion: Opcion
    funcionesEvaluacion = []
    funcion: Funcion
    parametros: AgenteParametro
    // agentes$: Observable<Agente[]>

    constructor(public dataLocalService: DataLocalService,
        private actionSheetCtrl: ActionSheetController,
        private modalController: ModalController,
        private sincronizaService: SincronizaService,
        private uiService: UiServiceService
    ) { }

    async ngOnInit() {
        this.funcion = await this.dataLocalService.leerFuncion()
        console.log('this.funcion.nid_funcion :>> ', this.funcion.nid_funcion);
        this.proyecto = await this.dataLocalService.leerProyectoSeleccionado()
        this.agentes = await this.dataLocalService.leerAgentesProyecto(this.proyecto.codigo_expediente)
        this.dataLocalService.agentesListener.subscribe(agentes => this.agentes = agentes)
        // this.agentes$ = this.dataLocalService.leerAgentes$()
        // this.agentes$.subscribe(agentes => this.agentes = agentes)
        this.codigoProyecto = this.proyecto.codigo_expediente
        // this.agentes = this.agentes.map(item => {
        //     item.nombre = item.txt_apellido_paterno + ' ' + item.txt_apellido_materno + ', ' + item.txt_nombres
        //     return item
        // })
        this.user = await this.dataLocalService.leerUser()
        // const opcion = await this.dataLocalService.leerOpcion('inicio')
        this.opcion = await this.dataLocalService.leerOpcion('agentes')
        this.parametros = await this.dataLocalService.leerAgenteParametro()
        if (this.parametros && this.parametros.fichaEvaluacion) {
            const fichasActivas = this.parametros.fichaEvaluacion.filter(item => item.num_dato1 == 1)
            fichasActivas.map(item => this.funcionesEvaluacion.push(...item.txt_dato1.split(',')))
        }
        console.log('this.funcionesEvaluacion :>> ', this.funcionesEvaluacion);
    }

    buscar(event) {
        this.textoBuscar = event.detail.value;
    }

    async abrirOpciones(agente, index: number) {
        console.log('this.parametros - index:>> ', this.parametros, index);
        console.log('this.agentes :>> ', this.agentes);
        if (this.parametros && this.parametros.fichaEvaluacion) {

            const funcionEvaluador = this.parametros.fichaEvaluacion.find(item => item.txt_dato1.includes(agente.nid_funcion.toString()))?.txt_dato2
            console.log('funcionEvaluador :>> ', funcionEvaluador);
    
            console.log('agente :>> ', agente);
            const buttons = []
            const opciones = [
                {
                    text: 'Registrar evaluación', icon: 'create-outline', objeto: 'registrarEvaluacion',
                    handler: () => { this.abrirEvaluacion(agente, index, false) }
                },
                {
                    text: 'Consultar última evaluación', icon: 'document-outline', objeto: 'consultarEvaluacion',
                    handler: () => { this.abrirEvaluacion(agente, index, true) }
                },
                // {
                //     text: 'Registrar seguimiento', icon: 'checkbox-outline', objeto: 'informeSeguimientoEri',
                //     handler: () => { this.abrirSeguimiento(eri, index) }
                // },
                {
                    text: 'Sincronizar', icon: 'sync-outline', objeto: 'sincronizarActividad',
                    handler: () => { this.sincronizar(agente, index) }
                },
                {
                    text: 'Cancelar', icon: 'close', role: 'cancel-outline', objeto: 'cancelar',
                    handler: () => { console.log('Cancel clicked') }
                }
            ]
    
            opciones.map(item => {
                if (item.objeto === 'registrarEvaluacion' && (
                    this.funcionesEvaluacion.findIndex(nidFuncion => nidFuncion == agente.nid_funcion) < 0 ||
                    !funcionEvaluador?.includes(this.funcion.nid_funcion.toString()) ||
                    !this.opcion.opciones || this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                if (item.objeto === 'consultarEvaluacion' && (
                    !funcionEvaluador?.includes(this.funcion.nid_funcion.toString()) ||
                    !agente.ultimaEvaluacion ||
                    // this.funcionesEvaluacion.findIndex(nidFuncion => nidFuncion == agente.nid_funcion) < 0
                    // !eri.nid_actividad ||
                    // !ofertada ||
                    // this.usuario.codigo_expediente.substring(2,6) !== '2020' ||
                    !this.opcion.opciones || this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                buttons.push(item)
            })
    
            const actionSheet = await this.actionSheetCtrl.create({ buttons });
            await actionSheet.present();
        }
    }


    async abrirEvaluacion(agente, index, consulta) {
        const modal = await this.modalController.create({
            component: AgenteEvaluacionPage,
            componentProps: {
                agente,
                consulta,
                index
            }
        })
        await modal.present();
    }

    async sincronizar(agente, index) {
        const respAgente = await this.sincronizaService.agente(agente, true)
        console.log('Sincronizar-respAgente :>> ', respAgente);
        if (!respAgente) {
            this.uiService.alertaInformativa('No se sincronizó la información.')
        } else {
            // this.agentes[index] = respAgente
        }

    }

    async eliminarEvaluacion(agente: Agente, index: number) {
        agente.evaluacion = null
        agente.cambioEvaluacion = false
        agente.evaluacionIcompleto = null
        await this.dataLocalService.guardarAgente(agente)
        this.lista.closeSlidingItems()
    }
}
