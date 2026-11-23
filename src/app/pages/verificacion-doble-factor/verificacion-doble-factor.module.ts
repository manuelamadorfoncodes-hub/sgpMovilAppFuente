import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { VerificacionDobleFactorPage } from './verificacion-doble-factor.page'

const routes: Routes = [
    {
        path: '',
        component: VerificacionDobleFactorPage
    }
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    declarations: [VerificacionDobleFactorPage],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VerificacionDobleFactorPageModule { }
