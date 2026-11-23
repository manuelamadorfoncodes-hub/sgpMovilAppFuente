import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { UsuarioPageRoutingModule } from './usuario-routing.module';

import { UsuarioPage } from './usuario.page';
import { ComponentsModule } from '../../components/generales/components.module';
import { PipesModule } from '../../pipes/pipes.module';
import { TecnologiasPageModule } from '../tecnologias/tecnologias.module';
import { UsuarioSolicitudPageModule } from '../usuario-solicitud/usuario-solicitud.module';
import { UsuarioEditPageModule } from '../usuario-edit/usuario-edit.module';
import { UsuarioResumenModule } from '../../components/usuario-resumen/usuario-resumen.module';
import { ActividadProdListPageModule } from '../actividad-prod-list/actividad-prod-list.module';
import { UsuarioFichaPageModule } from '../usuario-ficha/usuario-ficha.module';
import { UsuarioCaracterizacionPageModule } from '../usuario-caracterizacion/usuario-caracterizacion.module';
import { MiembroListPageModule } from '../miembro-list/miembro-list.module';
import { UsuarioFichaMujerPageModule } from '../usuario-ficha-mujer/usuario-ficha-mujer.module';
import { AsistenciaTecnicaMemPageModule } from '../asistencia-tecnica-mem/asistencia-tecnica-mem.module';
import { SeleccionMemPageModule } from '../seleccion-mem/seleccion-mem.module';
import { LineaBaseMemPageModule } from '../linea-base-mem/linea-base-mem.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UsuarioPageRoutingModule,
    ComponentsModule,
    ScrollingModule,
    PipesModule,
    TecnologiasPageModule,
    UsuarioSolicitudPageModule,
    UsuarioEditPageModule,
    UsuarioResumenModule,
    ActividadProdListPageModule,
    UsuarioFichaPageModule,
    UsuarioCaracterizacionPageModule,
    MiembroListPageModule,
    UsuarioFichaMujerPageModule,
    AsistenciaTecnicaMemPageModule,
    SeleccionMemPageModule,
    LineaBaseMemPageModule
  ],
  declarations: [UsuarioPage]
})
export class UsuarioPageModule {}
