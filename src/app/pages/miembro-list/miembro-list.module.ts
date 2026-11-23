import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { IonicModule } from '@ionic/angular'

import { MiembroListPage } from './miembro-list.page'
import { ComponentsModule } from '../../components/generales/components.module'
import { MiembroEditPageModule } from '../miembro-edit/miembro-edit.module'

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ComponentsModule,
        MiembroEditPageModule
    ],
    declarations: [MiembroListPage]
})
export class MiembroListPageModule { }
