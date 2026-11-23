import { OnInit, Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { DataLocalService } from './../../services/data-local.service';

@Component({
    selector: 'app-tabs-principal',
    templateUrl: './tabs-principal.page.html',
    styleUrls: ['./tabs-principal.page.scss'],
})

export class TabsPrincipalPage implements OnInit {
    actividadVisible = false
    accionVisible = false
    cantidadNotificacion = 0

    constructor(private dataLocalService: DataLocalService,
        private menu: MenuController) { }

    async ngOnInit() {
        console.log('Entra a tabs-principal');
        const opcionActividad = await this.dataLocalService.leerOpcion('actividadSuper')
        if (opcionActividad) { this.actividadVisible = true }
        console.log('opcionActividad, this.actividadVisible :>> ', opcionActividad, this.actividadVisible);

        const opcionAccion = await this.dataLocalService.leerOpcion('acciones')
        if (opcionAccion) { this.accionVisible = true }
        this.menu.enable(true)

        this.dataLocalService.leerNotificaciones()

        this.dataLocalService.notificacionesSinLeerListener.subscribe(cantidad => {
            console.log('cantidad-tabs  :>> ', cantidad)
            this.cantidadNotificacion = cantidad
        })
    }

}
