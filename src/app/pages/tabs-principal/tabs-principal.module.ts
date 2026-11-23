import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TabsPrincipalPage } from './tabs-principal.page';
import { TabsPrincipalPageRoutingModule } from './tabs-principal.router.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TabsPrincipalPageRoutingModule
    ],
    declarations: [TabsPrincipalPage]
})
export class TabsPrincipalPageModule { }
