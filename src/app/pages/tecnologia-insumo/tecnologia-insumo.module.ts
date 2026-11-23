import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TecnologiaInsumoPage } from './tecnologia-insumo.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { FirmarModule } from '../../components/firmar/firmar.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        FirmarModule
    ],
    declarations: [TecnologiaInsumoPage]
})
export class TecnologiaInsumoPageModule { }
