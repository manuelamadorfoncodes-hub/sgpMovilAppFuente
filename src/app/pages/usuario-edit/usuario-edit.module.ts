import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioEditPage } from './usuario-edit.page';
import { ComponentsModule } from '../../components/generales/components.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ComponentsModule
  ],
  declarations: [UsuarioEditPage]
})
export class UsuarioEditPageModule {}
