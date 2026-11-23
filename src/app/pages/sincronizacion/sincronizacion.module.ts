import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'
// import { SwiperModule } from 'swiper/angular'

import { SincronizacionPage } from './sincronizacion.page'
import { ComponentsModule } from '../../components/generales/components.module'

const routes: Routes = [
    {
        path: '',
        component: SincronizacionPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        // SwiperModule,
        RouterModule.forChild(routes),
        ComponentsModule
    ],
    declarations: [SincronizacionPage]
})
export class SincronizacionPageModule { }
