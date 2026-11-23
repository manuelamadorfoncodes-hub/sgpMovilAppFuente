import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UsuarioFichaMujerPage } from './usuario-ficha-mujer.page';
import { ComponentsModule } from '../../components/generales/components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule
    ],
    declarations: [UsuarioFichaMujerPage]
})
export class UsuarioFichaMujerPageModule {}
