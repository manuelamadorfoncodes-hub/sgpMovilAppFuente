import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TecnologiaEditPage } from './tecnologia-edit.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { TecnologiaAvanceProdModule } from '../../components/tecnologia-avance-prod/tecnologia-avance-prod.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ComponentsModule,
    TecnologiaAvanceProdModule
  ],
  declarations: [TecnologiaEditPage]
})
export class TecnologiaEditPageModule {}
