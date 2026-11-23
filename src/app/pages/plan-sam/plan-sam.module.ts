import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlanSamPageRoutingModule } from './plan-sam-routing.module';

import { PlanSamPage } from './plan-sam.page';
import { ComponentsModule } from '../../components/generales/components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        PlanSamPageRoutingModule,
        ComponentsModule
    ],
    declarations: [PlanSamPage]
})
export class PlanSamPageModule {}
