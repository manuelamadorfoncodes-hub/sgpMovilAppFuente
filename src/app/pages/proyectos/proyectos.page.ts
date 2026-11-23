import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, IonModal, NavController } from '@ionic/angular';
import { SgpService } from '../../services/sgp.service';
import { Proyecto } from '../../model/proyectos';
import { DataLocalService } from '../../services/data-local.service';
import { ActivatedRoute } from '@angular/router';
import { Opcion, Zonal } from '../../model/generales';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-proyectos',
    templateUrl: './proyectos.page.html',
    styleUrls: ['./proyectos.page.scss'],
})
export class ProyectosPage implements OnInit {
    @ViewChild(IonModal) modalAcciones: IonModal;
    proyectos: Proyecto[] = []
    proyectos$: Observable<Proyecto[]>
    zonal: Zonal
    textoBuscar = ''
    titulo = 'SGP Móvil'
    defaultHref = ''
    verMenu = false
    opcion: Opcion
    opcionesMenu = []
    // isActionModalOpen = false

    constructor(private navCtrl: NavController,
        private sgpService: SgpService,
        public dataLocalService: DataLocalService,
        private actionSheetCtrl: ActionSheetController) {}

    async ngOnInit() {
        this.zonal = await this.dataLocalService.leerZonalSeleccionada()
        if (this.zonal) {
            this.titulo = 'U.T. ' + this.zonal.txt_zonal
        }
        this.sgpService.proyectosListener.subscribe(proyectos => this.proyectos = proyectos)

        this.proyectos = await this.dataLocalService.leerProyectos()
        this.proyectos$ = this.dataLocalService.leerProyectos$();
        this.proyectos$.subscribe(proyectos => this.proyectos = proyectos);

        const opcion = await this.dataLocalService.leerOpcion('inicio')
        // if (opcion.opciones[0].txtnombreobjeto === 'zonales') {
        //     this.defaultHref = `/zonales`
        // } else {
            this.defaultHref = ``
            this.verMenu = true
        // }

        this.opcion = await this.dataLocalService.leerOpcion('proyectos')

    }

    buscar(event) {
        this.textoBuscar = event.detail.value;
    }

    async abrirOpciones(proyecto: Proyecto) {
        console.log('PROYECTO :>> ', proyecto);
        const proyectoSeleccionado = await this.dataLocalService.leerProyecto(proyecto.codigo_expediente)
        if (proyectoSeleccionado) {
            await this.dataLocalService.guardarProyectoSeleccionado(proyectoSeleccionado)
        } else {
            await this.dataLocalService.guardarProyectoSeleccionado(proyecto)
        }
        const buttons = []
        const opciones = [
            {
                text: 'Visitas', icon: 'briefcase-outline', objeto: 'visitas',
                handler: () => {
                    console.log('this.isActionModalOpen 333:>> ');
                    // this.isActionModalOpen = false
                    this.navCtrl.navigateRoot(`/visitas`, { animated: true })
                    console.log('this.isActionModalOpen 444:>> ')
                }
            },
            // {
            //     text: 'Usuarios', icon: 'people-outline', objeto: 'usuarios', deshabilitado: false,
            //     handler: () => {
            //         console.log('this.isActionModalOpen 111:>> ');
            //         this.navCtrl.navigateRoot('/usuariosAnt', { animated: true }); 
            //         console.log('this.isActionModalOpen 222:>> ');
            //     }
            // },
            {
                text: 'Usuarios', icon: 'people-outline', objeto: 'usuarios', deshabilitado: false,
                handler: () => {
                    console.log('this.isActionModalOpen 111xx:>> ');
                    this.navCtrl.navigateRoot('/usuarios', { animated: true }); 
                    console.log('this.isActionModalOpen 222xx:>> ');
                }
            },
            {
                text: 'Tecnologías colectivas', icon: 'hammer-outline', objeto: 'tecnologiasColectivas',
                handler: () => { 
                    console.log('antes tec');
                    this.navCtrl.navigateRoot('/tecnologiasColectivas', { animated: true })
                    console.log('despues tec');
                }
            },
            {
                text: 'Actividades', icon: 'layers-outline', objeto: 'actividades',
                handler: () => { this.navCtrl.navigateRoot('/actividades', { animated: true }) }
            },
            {
                text: 'ERI', icon: 'ribbon-outline', objeto: 'eri',
                handler: () => { this.navCtrl.navigateRoot('/eri', { animated: true }) }
            },
            {
                text: 'Agentes', icon: 'happy-outline', objeto: 'agentes',
                handler: () => { this.navCtrl.navigateRoot('/agentes', { animated: true }) }
            },
            {
                text: 'Cancelar', icon: 'close', role: 'cancel-outline', objeto: 'cancelar',
                handler: () => { console.log('Cancel clicked') }
            }
        ]
        console.log('opciones :>> ', opciones);

        opciones.map(item => {
            console.log('item :>> ', item);
            if (item.objeto === 'visitas' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'usuarios' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'tecnologiasColectivas' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'actividades' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            if (item.objeto === 'eri' && (
                this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
            )) { return }
            
            if (item.objeto === 'usuarios') {
                if (proyecto.txt_incompleto) {item.deshabilitado = true}
            }
            // if (item.objeto === 'consultarActividad' && (
            //     !ofertada || !tecnologia.actividadesProductivas ||
            //     //parseInt(this.usuario.codigo_expediente.substring(2,6)) >= 2021 ||
            //     this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'consultarTecnologia') < 0
            // )) { return }
            buttons.push(item)
        })
        console.log('buttons :>> ', buttons);

        const actionSheet = await this.actionSheetCtrl.create({ buttons });
        await actionSheet.present();
        // this.opcionesMenu = buttons
        // this.isActionModalOpen = true
    }


    // setOpen(isOpen: boolean) {
    //     this.isActionModalOpen = isOpen
    //     console.log('this.isActionModalOpen :>> ', this.isActionModalOpen);
    //     this.modalAcciones.dismiss()
    // }
 }

