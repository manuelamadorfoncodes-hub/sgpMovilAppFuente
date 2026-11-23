import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActividadEditPage } from './actividad-edit.page';
import { ComponentsModule } from '../../components/generales/components.module';
// import { PlanActividadParticipantePage } from '../plan-actividad-participante/plan-actividad-participante.page';
import { PlanActividadParticipantePageModule } from '../plan-actividad-participante/plan-actividad-participante.module';
import { PipesModule } from '../../pipes/pipes.module';

@NgModule({
    // entryComponents: [
    //     PlanActividadParticipantePage
    // ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        ReactiveFormsModule,
        PlanActividadParticipantePageModule,
        PipesModule
    ],
    declarations: [ActividadEditPage]
})
export class ActividadEditPageModule { }
