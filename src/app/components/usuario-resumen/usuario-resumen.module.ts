import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { UsuarioResumenComponent } from './usuario-resumen.component';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        UsuarioResumenComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule
    ],
    exports: [
        UsuarioResumenComponent
    ]
})
export class UsuarioResumenModule { }
