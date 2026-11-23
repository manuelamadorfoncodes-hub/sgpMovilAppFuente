import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EriPage } from './eri.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { PipesModule } from '../../pipes/pipes.module';
import { EriInformePageModule } from '../eri-informe/eri-informe.module';

const routes: Routes = [
    {
        path: '',
        component: EriPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        ComponentsModule,
        PipesModule,
        EriInformePageModule
    ],
    declarations: [EriPage]
})
export class EriPageModule { }
