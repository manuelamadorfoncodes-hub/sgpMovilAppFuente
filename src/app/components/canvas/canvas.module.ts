import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CanvasComponent } from './canvas.component';

@NgModule({
    declarations: [
        CanvasComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule,
    ],
    exports: [
        CanvasComponent
    ]
})
export class CanvasModule { }
