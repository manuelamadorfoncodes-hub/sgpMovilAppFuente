import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsistenciaTecnicaMemPage } from './asistencia-tecnica-mem.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { AsistenciaTecnicaMemEditPageModule } from '../asistencia-tecnica-mem-edit/asistencia-tecnica-mem-edit.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        AsistenciaTecnicaMemEditPageModule
    ],
    declarations: [AsistenciaTecnicaMemPage]
})
export class AsistenciaTecnicaMemPageModule { }
