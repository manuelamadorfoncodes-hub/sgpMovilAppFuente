import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AccionesPageRoutingModule } from './acciones-routing.module';

import { AccionesPage } from './acciones.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { AccionActividadPageModule } from '../accion-actividad/accion-actividad.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        AccionesPageRoutingModule,
        ComponentsModule,
        ReactiveFormsModule,
        AccionActividadPageModule
    ],
    declarations: [AccionesPage]
})
export class AccionesPageModule { }
