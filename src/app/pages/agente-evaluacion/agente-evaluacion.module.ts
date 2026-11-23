import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from '../../components/generales/components.module';
import { AgenteEvaluacionPage } from './agente-evaluacion.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule
    ],
    declarations: [AgenteEvaluacionPage]
})
export class AgenteEvaluacionPageModule { }
