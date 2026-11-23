import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RegistrarDatosComponent } from './registrar-datos.component';



@NgModule({
    declarations: [
        RegistrarDatosComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule
    ],
    exports: [
        RegistrarDatosComponent
    ]
})
export class RegistrarDatosModule { }
