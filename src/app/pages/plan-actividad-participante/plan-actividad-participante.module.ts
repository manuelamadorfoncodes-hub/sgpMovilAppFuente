import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlanActividadParticipantePage } from './plan-actividad-participante.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        PipesModule
    ],
    declarations: [PlanActividadParticipantePage]
})
export class PlanActividadParticipantePageModule { }
