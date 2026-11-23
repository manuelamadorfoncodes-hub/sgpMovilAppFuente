import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AccionActividadPage } from './accion-actividad.page';

const routes: Routes = [
  {
    path: '',
    component: AccionActividadPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccionActividadPageRoutingModule {}
