import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { VisitasPage } from './visitas.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { VisitaEditPageModule } from '../visita-edit/visita-edit.module';
import { VisitaAvancePageModule } from '../visita-avance/visita-avance.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([{ path: '', component: VisitasPage }]),
        ComponentsModule,
        VisitaEditPageModule,
        VisitaAvancePageModule
    ],
    declarations: [VisitasPage]
})
export class VisitasPageModule { }
