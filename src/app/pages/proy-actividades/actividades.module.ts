import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ActividadesPage } from './actividades.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { PipesModule } from '../../pipes/pipes.module';
// import { ActividadEditPage } from '../actividad-edit/actividad-edit.page';
import { ActividadEditPageModule } from '../proy-actividad-edit/actividad-edit.module';

const routes: Routes = [
    {
        path: '',
        component: ActividadesPage
    }
];

@NgModule({
    // entryComponents: [
    //     ActividadEditPage
    // ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        ComponentsModule,
        PipesModule,
        ActividadEditPageModule
    ],
    declarations: [ActividadesPage]
})
export class ActividadesPageModule { }
