import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { PdfViewerModule } from 'ng2-pdf-viewer';
// import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { ReportesPageRoutingModule } from './reportes-routing.module';

import { ReportesPage } from './reportes.page';
import { ComponentsModule } from '../../components/generales/components.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReportesPageRoutingModule,
        ComponentsModule,
        PdfViewerModule
    ],
    declarations: [ReportesPage],
    // schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportesPageModule {}
