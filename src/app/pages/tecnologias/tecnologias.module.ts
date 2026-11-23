import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TecnologiasPage } from './tecnologias.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { TecnologiaEditPageModule } from '../tecnologia-edit/tecnologia-edit.module';
import { TecnologiaAvancePageModule } from '../tecnologia-avance/tecnologia-avance.module';
import { TecnologiaInsumoPageModule } from '../tecnologia-insumo/tecnologia-insumo.module';
import { TecnologiaColectivaPageModule } from '../tecnologia-colectiva/tecnologia-colectiva.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        TecnologiaEditPageModule,
        TecnologiaAvancePageModule,
        TecnologiaColectivaPageModule,
        TecnologiaInsumoPageModule
    ],
    declarations: [TecnologiasPage]
})
export class TecnologiasPageModule { }
