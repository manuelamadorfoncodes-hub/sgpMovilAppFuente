import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlanSamPage } from './plan-sam.page';

const routes: Routes = [
    {
        path: '',
        component: PlanSamPage
    }
];

@NgModule({
    imports: [RouterModule],
    exports: [RouterModule],
})
export class PlanSamPageRoutingModule {}
