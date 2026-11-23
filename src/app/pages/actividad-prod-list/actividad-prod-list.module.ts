import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from './../../components/generales/components.module';
import { ActividadProdListPage } from './actividad-prod-list.page';
// import { ActividadProdEditPage } from '../actividad-prod-edit/actividad-prod-edit.page';
import { ActividadProdEditPageModule } from '../actividad-prod-edit/actividad-prod-edit.module';

@NgModule({
    // entryComponents: [
    //     ActividadProdEditPage
    // ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        ActividadProdEditPageModule
    ],
    declarations: [ActividadProdListPage]
})
export class ActividadProdListPageModule { }
