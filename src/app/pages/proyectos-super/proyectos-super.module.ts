import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProyectosSuperPage } from './proyectos-super.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { PipesModule } from '../../pipes/pipes.module';

const routes: Routes = [
    {
        path: '',
        component: ProyectosSuperPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        ComponentsModule,
        PipesModule
    ],
    declarations: [ProyectosSuperPage]
})
export class ProyectosSuperPageModule { }
