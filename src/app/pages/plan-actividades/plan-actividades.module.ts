import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PlanActividadesPage } from './plan-actividades.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { PlanActividadEditPageModule } from '../plan-actividad-edit/plan-actividad-edit.module';
// import { PlanActividadEditPage } from '../plan-actividad-edit/plan-actividad-edit.page';
import { PlanSamPageModule } from '../plan-sam/plan-sam.module';
import { PipesModule } from '../../pipes/pipes.module';

const routes: Routes = [
    {
        path: '',
        component: PlanActividadesPage
    }
];

@NgModule({
    // entryComponents: [
    //     PlanActividadEditPage
    // ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        ComponentsModule,
        PlanActividadEditPageModule,
        PlanSamPageModule,
        PipesModule
    ],
    declarations: [PlanActividadesPage]
})
export class PlanActividadesPageModule { }
