import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TecnologiaColectivaPage } from './tecnologia-colectiva.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { TecnologiaInsumoPageModule } from '../tecnologia-insumo/tecnologia-insumo.module';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        component: TecnologiaColectivaPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        ComponentsModule,
        TecnologiaInsumoPageModule,
    ],
    declarations: [TecnologiaColectivaPage]
})
export class TecnologiaColectivaPageModule { }
