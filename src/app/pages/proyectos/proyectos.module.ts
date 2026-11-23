import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProyectosPage } from './proyectos.page';
import { PipesModule } from '../../pipes/pipes.module';
import { ComponentsModule } from '../../components/generales/components.module';

const routes: Routes = [
    {
        path: '',
        component: ProyectosPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        PipesModule,
        ComponentsModule,
        // ProyectosPageRoutingModule
    ],
    declarations: [ProyectosPage]
})
export class ProyectosPageModule { }
