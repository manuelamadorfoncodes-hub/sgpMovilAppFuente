import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'
import { HeaderComponent } from './header/header.component';
import { HeaderModalComponent } from './header-modal/header-modal.component';
import { FotosComponent } from './fotos/fotos.component';
import { UserComponent } from './user/user.component';
import { GeolocalizacionComponent } from './geolocalizacion/geolocalizacion.component';
import { PopoverListComponent } from './popover-list/popover-list.component';
import { MultipleSelectComponent } from './multiple-select/multiple-select.component';
import { CustomSelectComponent } from './custom-select/custom-select.component';
import { CustomSelectTipoComponent } from './custom-select-tipo/custom-select-tipo.component';
import { MultipleCheckboxComponent } from './multiple-checkbox/multiple-checkbox.component';
import { DatosBotonModalComponent } from './datos-boton-modal/datos-boton-modal.component';
import { MultipleDataComponent } from './multiple-data/multiple-data.component';

@NgModule({
    // entryComponents: [
    //     UserComponent,
    //     GeolocalizacionComponent,
    //     PopoverListComponent,
    //     MultipleSelectComponent
    // ],
    declarations: [
        HeaderComponent,
        HeaderModalComponent,
        FotosComponent,
        UserComponent,
        GeolocalizacionComponent,
        PopoverListComponent,
        MultipleSelectComponent,
        CustomSelectComponent,
        CustomSelectTipoComponent,
        MultipleCheckboxComponent,
        DatosBotonModalComponent,
        MultipleDataComponent
    ],
    imports: [
        CommonModule,
        IonicModule,
        FormsModule
    ],
    exports: [
        HeaderComponent,
        HeaderModalComponent,
        FotosComponent,
        UserComponent,
        GeolocalizacionComponent,
        PopoverListComponent,
        MultipleSelectComponent,
        CustomSelectComponent,
        CustomSelectTipoComponent,
        MultipleCheckboxComponent,
        DatosBotonModalComponent,
        MultipleDataComponent
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ComponentsModule { }
