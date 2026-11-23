import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { PipesModule } from './../../pipes/pipes.module';
import { AgentesPage } from './agentes.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { AgenteEvaluacionPageModule } from '../agente-evaluacion/agente-evaluacion.module';

const routes: Routes = [
    {
        path: '',
        component: AgentesPage
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
        AgenteEvaluacionPageModule
    ],
    declarations: [AgentesPage]
})
export class AgentesPageModule { }
