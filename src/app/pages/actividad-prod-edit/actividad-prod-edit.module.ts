import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from './../../components/generales/components.module';
import { TecnologiaAvanceProdModule } from './../../components/tecnologia-avance-prod/tecnologia-avance-prod.module';
import { ActividadProdEditPage } from './actividad-prod-edit.page';
// import { TecnologiaAvanceProdComponent } from './../../components/tecnologia-avance-prod/tecnologia-avance-prod.component';

@NgModule({
    // entryComponents: [
    //     TecnologiaAvanceProdComponent
    // ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        ComponentsModule,
        TecnologiaAvanceProdModule
    ],
    declarations: [ActividadProdEditPage]
})
export class ActividadProdEditPageModule { }
