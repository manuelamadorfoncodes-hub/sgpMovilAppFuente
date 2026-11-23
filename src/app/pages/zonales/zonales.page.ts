import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { Zonal } from '../../model/generales';

@Component({
    selector: 'app-zonales',
    templateUrl: './zonales.page.html',
    styleUrls: ['./zonales.page.scss'],
})
export class ZonalesPage implements OnInit {
    zonales: Zonal[] = []
    textoBuscar = ''
    // defaultHref = ''
    nidPersonal: number

    constructor(private navCtrl: NavController,
        public datalocalService: DataLocalService) { }

    async ngOnInit() {
        this.zonales = await this.datalocalService.leerZonales()
        // this.nidPersonal = parseFloat(this.activeRoute.snapshot.paramMap.get('nidPersonal'))
    }

    buscar(event) {
        this.textoBuscar = event.detail.value;
    }

    async abrirDetalle(zonal: Zonal) {
        await this.datalocalService.guardarZonalSeleccionada(zonal)
        this.navCtrl.navigateForward([`/tabsPrincipal/tabsPrincipal/actiSuper`], { animated: true })
    }

}
