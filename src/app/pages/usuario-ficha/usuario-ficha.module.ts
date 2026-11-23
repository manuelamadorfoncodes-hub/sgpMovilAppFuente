import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioFichaPage } from './usuario-ficha.page';
import { ComponentsModule } from './../../components/generales/components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule
    ],
    declarations: [UsuarioFichaPage]
})
export class UsuarioFichaPageModule { }
