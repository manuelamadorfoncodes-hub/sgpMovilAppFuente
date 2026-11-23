import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioCaracterizacionPage } from './usuario-caracterizacion.page';
import { ComponentsModule } from 'src/app/components/generales/components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule
    ],
    declarations: [UsuarioCaracterizacionPage]
})
export class UsuarioCaracterizacionPageModule { }
