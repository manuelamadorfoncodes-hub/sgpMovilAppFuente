import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlanActividadEditPage } from './plan-actividad-edit.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { PlanActividadParticipantePageModule } from '../plan-actividad-participante/plan-actividad-participante.module';
import { RegistrarDatosModule } from '../../components/registrar-datos/registrar-datos.module';
// import { PlanActividadParticipantePage } from '../plan-actividad-participante/plan-actividad-participante.page';

@NgModule({
    // entryComponents: [
    //     PlanActividadParticipantePage
    // ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        ComponentsModule,
        PlanActividadParticipantePageModule,
        RegistrarDatosModule
    ],
    declarations: [PlanActividadEditPage]
})
export class PlanActividadEditPageModule { }
