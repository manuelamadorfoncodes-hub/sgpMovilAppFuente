import { Component, OnInit, Input } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { DataLocalService } from 'src/app/services/data-local.service';
import { User } from '../../../model/generales';
import { UserComponent } from '../user/user.component';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {

    @Input() titulo: string
    @Input() defaultHref: string
    @Input() verMenu = false
    user: User = {}

    constructor(private modalController: ModalController,
        private menu: MenuController,
        private dataLocalService: DataLocalService) { }

    async ngOnInit() {
        this.user = await this.dataLocalService.leerUser()
    }

    async abrirUser() {
        const modal = await this.modalController.create({
            component: UserComponent,
        })
        await modal.present()
        const { data } = await modal.onDidDismiss()
        if (data) { this.user = data }
    }

    
    abrirMenu() {
        console.log('entra al menu');
        // this.menu.enable(true, 'principal');
        // this.menu.enable(true)
        this.menu.open('menuPrincipal');
    }
}
