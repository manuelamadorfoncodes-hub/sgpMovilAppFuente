import { NgModule } from '@angular/core'
import { PreloadAllModules, RouterModule, Routes } from '@angular/router'
import { UsuarioGuard } from './guards/usuario.guard'

const routes: Routes = [
    { path: 'login', loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule) },
    { path: 'verificacion-doble-factor', loadChildren: () => import('./pages/verificacion-doble-factor/verificacion-doble-factor.module').then(m => m.VerificacionDobleFactorPageModule) },
    { path: 'zonales', loadChildren: () => import('./pages/zonales/zonales.module').then(m => m.ZonalesPageModule), canLoad: [UsuarioGuard] },
    { path: 'proyectos', loadChildren: () => import('./pages/proyectos/proyectos.module').then(m => m.ProyectosPageModule), canLoad: [UsuarioGuard] },
    { path: 'inicio', loadChildren: () => import('./pages/inicio/inicio.module').then(m => m.InicioPageModule), canLoad: [UsuarioGuard] },
    { path: 'tabsPrincipal', loadChildren: () => import('./pages/tabs-principal/tabs-principal.module').then(m => m.TabsPrincipalPageModule), canLoad: [UsuarioGuard] },
    { path: 'visitas', loadChildren: () => import('./pages/visitas/visitas.module').then(m => m.VisitasPageModule), canLoad: [UsuarioGuard] },
    { path: 'usuarios',loadChildren: () => import('./pages/usuario/usuario.module').then( m => m.UsuarioPageModule), canLoad: [UsuarioGuard]},
    { path: 'tecnologiasColectivas', loadChildren: () => import('./pages/tecnologia-colectiva/tecnologia-colectiva.module').then(m => m.TecnologiaColectivaPageModule), canLoad: [UsuarioGuard] },
    // { path: 'tecnologiasColectivas', loadChildren: () => import('./pages/usuarios/usuarios.module').then(m => m.UsuariosPageModule), canLoad: [UsuarioGuard] },
    { path: 'actividades', loadChildren: () => import('./pages/proy-actividades/actividades.module').then(m => m.ActividadesPageModule), canLoad: [UsuarioGuard] },
    { path: 'eri', loadChildren: () => import('./pages/eri/eri.module').then(m => m.EriPageModule), canLoad: [UsuarioGuard] },
    { path: 'agentes', loadChildren: () => import('./pages/agentes/agentes.module').then(m => m.AgentesPageModule), canLoad: [UsuarioGuard] },
    { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    { path: '**', pathMatch: 'full', redirectTo: 'inicio' },


]

@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
