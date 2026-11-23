import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EriInformePage } from './eri-informe.page';
import { ComponentsModule } from '../../components/generales/components.module';

@NgModule({
    // entryComponents: [
    //     EriInformePage
    // ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        ReactiveFormsModule
    ],
    declarations: [EriInformePage]
})
export class EriInformePageModule { }
