import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';
import { SgpService } from '../../services/sgp.service';
import { DataLocalService } from '../../services/data-local.service';
import { Proyecto } from '../../model/proyectos';

@Component({
    selector: 'app-proyectos-super',
    templateUrl: './proyectos-super.page.html',
    styleUrls: ['./proyectos-super.page.scss'],
})
export class ProyectosSuperPage implements OnInit {
    proyectos: Proyecto[] = []
    zonal = ''
    textoBuscar = ''
    defaultHref = '/zonales'

    constructor(private navCtrl: NavController,
                private activeRoute: ActivatedRoute,
                private sgpService: SgpService,
                public datalocalService: DataLocalService) { }

    async ngOnInit() {
    }


    buscar(event) {
        this.textoBuscar = event.detail.value;
    }

    async abrirDetalle(proyecto: Proyecto) {
        await this.datalocalService.guardarProyectoSeleccionado(proyecto)
        this.navCtrl.navigateForward('/tabsProyecto/tabs/usuarios', { animated: true, animationDirection: 'forward' })
    }
}
