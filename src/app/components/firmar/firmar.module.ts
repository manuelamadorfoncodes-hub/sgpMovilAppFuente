import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { FirmarComponent } from './firmar.component';
import { CanvasModule } from '../canvas/canvas.module';

@NgModule({
    declarations: [
        FirmarComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
        CanvasModule
    ],
    exports: [
        FirmarComponent
    ]
})
export class FirmarModule { }
