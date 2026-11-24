import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { Routes, RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { CambioClavePage } from './cambio-clave.page'

const routes: Routes = [
    {
        path: '',
        component: CambioClavePage
    }
]

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes)
    ],
    declarations: [CambioClavePage],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CambioClavePageModule { }
