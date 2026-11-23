import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MiembroEditPage } from './miembro-edit.page';
import { ComponentsModule } from '../../components/generales/components.module'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReactiveFormsModule,
        ComponentsModule
    ],
    declarations: [MiembroEditPage]
})
export class MiembroEditPageModule { }
