import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioSolicitudPage } from './usuario-solicitud.page';
import { ComponentsModule } from '../../components/generales/components.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        ReactiveFormsModule
    ],
    declarations: [UsuarioSolicitudPage]
})
export class UsuarioSolicitudPageModule { }
