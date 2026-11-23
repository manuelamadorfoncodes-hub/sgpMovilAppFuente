import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccionActividadPageRoutingModule } from './accion-actividad-routing.module';

import { AccionActividadPage } from './accion-actividad.page';  
import { ComponentsModule } from '../../components/generales/components.module';
import { PlanActividadParticipantePageModule } from '../plan-actividad-participante/plan-actividad-participante.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AccionActividadPageRoutingModule,
        ComponentsModule,
        ReactiveFormsModule,
        PlanActividadParticipantePageModule
    ],
    declarations: [AccionActividadPage]
})
export class AccionActividadPageModule { }
