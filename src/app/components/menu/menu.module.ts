import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MenuComponent } from './menu.component';
import { FormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        MenuComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule
    ],
    exports: [
        MenuComponent
    ]
})
export class MenuModule { }
