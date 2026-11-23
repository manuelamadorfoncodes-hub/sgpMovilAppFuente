import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPrincipalPage } from './tabs-principal.page';

const routes: Routes = [
    {
        path: 'tabsPrincipal', component: TabsPrincipalPage,
        children: [
            { path: 'notificaciones', loadChildren: () => import('../notificaciones/notificaciones.module').then(m => m.NotificacionesPageModule) },
            { path: 'planActividades', loadChildren: () => import('../plan-actividades/plan-actividades.module').then(m => m.PlanActividadesPageModule) },
            { path: 'acciones', loadChildren: () => import('../acciones/acciones.module').then(m => m.AccionesPageModule) },
            { path: 'proyectos', loadChildren: () => import('../proyectos/proyectos.module').then(m => m.ProyectosPageModule) },
            { path: 'sincroniza', loadChildren: () => import('../sincronizacion/sincronizacion.module').then(m => m.SincronizacionPageModule) },
            { path: 'reportes', loadChildren: () => import('../reportes/reportes.module').then( m => m.ReportesPageModule)},

            { path: '', redirectTo: '/tabsPrincipal/proyectos', pathMatch: 'full' },
            
        ]
    },
    { path: '', redirectTo: '/tabsPrincipal', pathMatch: 'full' }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule]
})
export class TabsPrincipalPageRoutingModule { }
