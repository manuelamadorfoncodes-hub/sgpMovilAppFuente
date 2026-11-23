import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DataLocalService } from 'src/app/services/data-local.service';
import { UiServiceService } from 'src/app/services/ui-service.service';
import { Usuario, FichaVivienda, FichaEmprendimiento, SolicitudUsuario, Solicitud, LineaBase, UsuarioParametro } from './../../model/usuarios';
import { Tipo, Archivo } from './../../model/generales';
import { Proyecto } from '../../model/proyectos';

@Component({
    selector: 'app-usuario-ficha',
    templateUrl: './usuario-ficha.page.html',
    styleUrls: ['./usuario-ficha.page.scss'],
})
export class UsuarioFichaPage implements OnInit {
    
    @Input() proyecto: Proyecto
    @Input() usuario: Usuario
    @Input() consulta = false
    @Input() fichaText: string
    @Input() nuevoUsuario = false
    @Input() linea = 0
    @Input() parametros: UsuarioParametro
    ficha: FichaVivienda = {}
    emprendimientos: FichaEmprendimiento[]
    fotos: Archivo[] = []
    titulo = "Parcela, Vivienda y Emprend."
    indexLinea: number
    listaTenenciaParcela: Tipo[] = []
    totalArea = 0
    anhoProyecto: number
    
    constructor(private modalController: ModalController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) {}

    async ngOnInit() {
        console.log('this.ficha :>> ', this.ficha);
        console.log('this.nuevoUsuario :>> ', this.nuevoUsuario);
        console.log('this.linea :>> ', this.linea);

        this.ficha.fec_visita = new Date()
        this.ficha.nid_linea = this.linea
        

        if (!this.nuevoUsuario) {
            if (this.linea > 0) {
                if (this.usuario.lineaBase) {
                    this.indexLinea = this.usuario.lineaBase.findIndex(item => item.nidLinea === this.linea) 
                    if (this.indexLinea >= 0) {
                        if (this.usuario.lineaBase[this.indexLinea].fichaVivienda) {this.ficha = this.usuario.lineaBase[this.indexLinea].fichaVivienda}
                    }
                }
            } else {
                if (this.usuario.ficha) {this.ficha = this.usuario.ficha}
            }
            this.crearListaArea()
            // if (this.ficha.txt_tip_tenencia_parcela) {
            //     const listaTenencia = this.ficha.txt_tip_tenencia_parcela.split(',') || []
            //     const listaArea = this.ficha.txt_num_area_parcela?.split(',') || []
            //     console.log('listaTenencia :>> ', listaTenencia);
            //     console.log('listaArea :>> ', listaArea);
            //     this.listaTeneciaParcela = this.parametros.tenenciaParcela
            //     for (let index = 0; index < this.listaTeneciaParcela.length; index++) {
            //         const element = this.listaTeneciaParcela[index];
            //         const idx = listaTenencia.findIndex(item => item === this.listaTeneciaParcela[index].cod_tipo)
            //         this.listaTeneciaParcela[index].numero = 0
            //         if (idx > 0) {
            //             this.listaTeneciaParcela[index].seleccionado = true
            //             this.listaTeneciaParcela[index].numero = parseInt(listaArea[idx])
            //         }
            //     }
            //     this.calcularTotalArea()
            // }

        } else {
            if (this.fichaText) {this.ficha = JSON.parse(this.fichaText)}
        }


        
        if (this.ficha.emprendimientos) {this.emprendimientos = this.ficha.emprendimientos}
     
        if (this.ficha.fotos) {this.fotos = this.ficha.fotos}

        if (this.fotos.length === 0) {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            this.fotos = archivos.fichaVivienda
        }

        if (!this.ficha.nid_version_ficha) {
            if (this.proyecto.nid_sub_tipo_proyecto === 116) {
                this.ficha.nid_version_ficha = 2
            } else {
                this.ficha.nid_version_ficha = 1
            }
        }

        if (this.ficha.nid_version_ficha === 1) {
            if (!this.ficha.nid_unidad_medida_area) {this.ficha.nid_unidad_medida_area = '7'}
        }

        if (this.ficha.nid_version_ficha === 2) {this.titulo = "Vivienda y Organización"}
        console.log(' ngOnInit  this.ficha :>> ', this.ficha);
        this.anhoProyecto = parseInt(this.usuario.codigo_expediente.substring(2,6))
    }

    async registrarEmpredimiento(ev) {
        if (this.ficha.flg_pertenece_org == '1') {
            if(!this.emprendimientos || this.emprendimientos.length === 0) {await this.agregarEmprendimiento()}
        } else {
            this.emprendimientos = undefined
        }
    }

    async agregarEmprendimiento() {
        const archivos = await this.dataLocalService.leerArchivosConfig()
        const fotos = archivos.fichaEmprend
        const nuevo: FichaEmprendimiento = {
            codigo_expediente: this.usuario.codigo_expediente,
            nid_ficha: this.ficha.nid_ficha,
            fotos
        }
        if (this.emprendimientos && this.emprendimientos.length > 0) {
            this.emprendimientos.push(nuevo)
        } else {
            this.emprendimientos = [nuevo]
        }
    }

    eliminarOrganizacion(index) {
        this.emprendimientos.splice(index, 1)
    }

    selectId(nombre, index) {
        return `select${nombre}${index}` 
    }

    async guardar() {
        console.log('inicio de guardado ---- this.ficha :>> ', this.ficha);
        if (this.validarEmprendimientoDuplicado()) {
            await this.uiService.alertaInformativa('Ha registrado más de una vez el mismo tipo de actividad de un emprendimiento.')
            return
        }
        if (!this.ficha.codigo_expediente) {this.ficha.codigo_expediente = this.usuario.codigo_expediente}
        if (!this.nuevoUsuario && !this.ficha.nid_personal_proyecto) {this.ficha.nid_personal_proyecto = this.usuario.nid_personal_proyecto}
        if (!this.ficha.txt_tip_tenencia_parcela?.includes('99')) {this.ficha.txt_otro_tenencia_parcela = null}
        if (!this.ficha.txt_tip_uso_parcela?.includes('99')) {this.ficha.txt_otro_uso_parcela = null}
        if (!this.ficha.txt_tip_fuente_parcela?.includes('99')) {this.ficha.txt_otro_fuente_parcela = null}
        if (this.ficha.cod_material_pared != '99') {this.ficha.txt_otro_material_pared = null}
        if (this.ficha.cod_material_techo != '99') {this.ficha.txt_otro_material_techo = null}
        if (this.ficha.cod_iluminacion != '99') {this.ficha.txt_otro_iluminacion = null}
        if (this.ficha.cod_residuos != '99') {this.ficha.txt_otro_residuos = null}
        if (this.ficha.cod_recicla != '99') {this.ficha.txt_otro_recicla = null}
        if (this.ficha.cod_tipo_cocina != '99') {this.ficha.txt_otro_tipo_cocina = null}
        if (this.ficha.cod_tipo_cocina === '03') {
            this.ficha.num_bosta = null
            this.ficha.num_lenha = null
        }
        if (!(this.ficha.cod_tipo_cocina === '01' || this.ficha.cod_tipo_cocina === '02')) {this.ficha.txt_tip_combustible = null}
        console.log(' guaradar this.ficha.txt_tip_combustible :>> ', this.ficha.txt_tip_combustible);
        if (!this.ficha.txt_tip_combustible?.includes('99')) {this.ficha.txt_otro_combustible = null}
        if (this.ficha.flg_residuos == '1') {
            this.ficha.cod_residuos = null
            this.ficha.txt_otro_residuos = null
        }
        if (this.ficha.flg_residuos == '0') {
            this.ficha.cod_recicla = null
            this.ficha.txt_otro_recicla = null
        }
        // this.items.filter(item => item.seleccionado).map(val => val[this.valorId]).toString()

        this.ficha.txt_num_area_parcela = this.listaTenenciaParcela.filter(item => item.seleccionado).map(val => val.numero).toString()
        if (this.emprendimientos && this.emprendimientos.length > 0) {
            for (let index = 0; index < this.emprendimientos.length; index++) {
                if (!'21,27,99'.includes(this.emprendimientos[index].cod_tipo)) {this.emprendimientos[index].txt_otro_tipo = null}
                if (this.emprendimientos[index].flg_proyectos !=='1') {this.emprendimientos[index].txt_desc_proyectos = null}
            }
        }
        if (this.fotos) {this.ficha.fotos = this.fotos}
        this.ficha.emprendimientos = this.emprendimientos

        if (this.nuevoUsuario) {
            this.modalController.dismiss(this.ficha)
        } else {
            if (this.linea > 0) {
                // console.log('this.usuario.lineaBase :>> ', this.usuario.lineaBase);
                if (!this.usuario.lineaBase ) {
                    this.usuario.lineaBase = []
                    const lineaSalida: LineaBase = {nidLinea: this.linea}
                    this.indexLinea = this.usuario.lineaBase.push(lineaSalida) - 1
                    console.log('this.usuario.lineaBase :>> ', this.usuario.lineaBase);
                    console.log('this.indexLinea :>> ', this.indexLinea);
                } 
                console.log('this.usuario.lineaBase :>> ', this.usuario.lineaBase);
                console.log('this.usuario.lineaBase[this.indexLinea] :>> ', this.usuario.lineaBase[this.indexLinea]);
                this.usuario.lineaBase[this.indexLinea].fichaVivienda = this.ficha
                this.usuario.lineaBase[this.indexLinea].cambioFichaVivienda = true
                this.usuario.lineaBase[this.indexLinea].fichaViviendaIncompleto = this.evaluarFichaIncompleta()
                if (!this.ficha.nid_ficha) {this.usuario.eliminaFichaLSalidaVivienda = true}
            } else {
                this.usuario.ficha = this.ficha
                this.usuario.cambioFicha = true
                this.usuario.fichaIncompleto = this.evaluarFichaIncompleta()
            }

            await this.uiService.presentLoading('Guardando...')
            await this.dataLocalService.guardarUsuario(this.usuario, false)
            await this.uiService.dismissLoading()
            this.modalController.dismiss();
        }
    }

    evaluarFichaIncompleta() {
        if (this.ficha.nid_version_ficha === 1  && ((this.anhoProyecto >= 2025 && this.linea === 0) || (this.anhoProyecto >= 2022 && this.linea > 0))) {
            if (!this.ficha.txt_tip_tenencia_parcela) {return true}
            if (this.ficha.txt_tip_tenencia_parcela?.includes('99') && !this.ficha.txt_otro_tenencia_parcela) {return true}
            if (!this.ficha.txt_num_area_parcela) {return true}
            if (!this.ficha.nid_unidad_medida_area) {return true}
            if (!this.ficha.txt_tip_uso_parcela) {return true}
            if (this.ficha.txt_tip_uso_parcela?.includes('99') && !this.ficha.txt_otro_uso_parcela) {return true}
            if (!this.ficha.txt_tip_fuente_parcela) {return true}
            if (this.ficha.txt_tip_fuente_parcela?.includes('99') && !this.ficha.txt_otro_fuente_parcela) {return true}
            const area = this.ficha.txt_num_area_parcela.split(',')
            for (let index = 0; index < area.length; index++) {
                if (isNaN(parseInt(area[index]))) {return true}
            }
        }
        if (!this.ficha.cod_material_pared) {return true}
        if (this.ficha.cod_material_pared === '99' && !this.ficha.txt_otro_material_pared) {return true}
        if (!this.ficha.cod_material_techo) {return true}
        if (this.ficha.cod_material_techo === '99' && !this.ficha.txt_otro_material_techo) {return true}
        if (this.ficha.nid_version_ficha === 2 && !this.ficha.cod_iluminacion) {return true}
        if (this.ficha.nid_version_ficha === 2 && this.ficha.cod_iluminacion === '99' && !this.ficha.txt_otro_iluminacion) {return true}
        if (!this.ficha.num_habitaciones) {return true}
        if (!this.ficha.cod_ambiente_cocinar) {return true}
        if (!this.ficha.cod_tipo_cocina) {return true}
        if (this.ficha.cod_tipo_cocina === '99' && !this.ficha.txt_otro_tipo_cocina) {return true}
        if (this.ficha.nid_version_ficha === 1 && this.ficha.cod_tipo_cocina !== '03' && !(this.ficha.num_bosta || this.ficha.num_lenha)) {return true}
        if (this.ficha.nid_version_ficha === 2 && ('01,02'.includes(this.ficha.cod_tipo_cocina)) && !this.ficha.txt_tip_combustible) {return true}
        if (this.ficha.nid_version_ficha === 2 && this.ficha.txt_tip_combustible?.includes('99') && !this.ficha.txt_otro_combustible) {return true}
        if (!this.ficha.flg_residuos) {return true}
        if (this.ficha.flg_residuos === '0' && !this.ficha.cod_residuos) {return true}
        if (this.ficha.flg_residuos === '1' && !this.ficha.cod_recicla) {return true}
        if (this.ficha.cod_residuos === '99' && !this.ficha.txt_otro_residuos) {return true}
        if (this.ficha.cod_recicla === '99' && !this.ficha.txt_otro_recicla) {return true}
        if (!this.ficha.cod_tratamiento_agua) {return true}
        if (!this.ficha.flg_pertenece_org) {return true}
        if (!this.ficha.fotos) {return true}
        for (let index = 0; index < this.ficha.fotos.length; index++) {
            if (!this.ficha.fotos[index].nueva && !this.ficha.fotos[index].enviada && !this.ficha.fotos[index].nid_archivo) {return true}
        }
        if (this.ficha.flg_pertenece_org === '1') {
            if (this.emprendimientos.length === 0) {return true}
            for (let index = 0; index < this.emprendimientos.length; index++) {
                if (this.ficha.nid_version_ficha === 1 && (index === 0 || (this.emprendimientos[index].cod_tipo || this.emprendimientos[index].num_integrantes || this.emprendimientos[index].cod_tiempo || this.emprendimientos[index].imp_ingresos))) {
                    if (!this.emprendimientos[index].cod_tipo) {return true}
                    if ('21,27,99'.includes(this.emprendimientos[index].cod_tipo) && !this.emprendimientos[index].txt_otro_tipo) {return true}
                    if (!this.emprendimientos[index].num_integrantes) {return true}
                    if (!this.emprendimientos[index].cod_tiempo) {return true}
                    if (!this.emprendimientos[index].imp_ingresos) {return true}
                    for (let idx = 0; idx < this.emprendimientos[index].fotos.length; idx++) {
                        if (!this.emprendimientos[index].fotos[idx].nueva && !this.emprendimientos[index].fotos[idx].enviada && !this.emprendimientos[index].fotos[idx].nid_archivo) {return true}
                    }
                }
                if (this.ficha.nid_version_ficha === 2 && (index === 0 || (this.emprendimientos[index].cod_recurso_natural || this.emprendimientos[index].flg_proyectos))) {
                    if (!this.emprendimientos[index].cod_recurso_natural) {return true}
                    if (this.emprendimientos[index].cod_recurso_natural === '99' && !this.emprendimientos[index].txt_otro_recurso) {return true}
                    if (!this.emprendimientos[index].flg_proyectos) {return true}
                    if (this.emprendimientos[index].flg_proyectos === '1' && !this.emprendimientos[index].txt_desc_proyectos) {return true}
                }
            }
        }
        return false
    }

    validarEmprendimientoDuplicado() {
        if (this.emprendimientos && this.emprendimientos.length > 0) {
            for (let index = 0; index < this.emprendimientos.length; index++) {
                if (this.emprendimientos[index].cod_tipo && !'21,27,99'.includes(this.emprendimientos[index].cod_tipo) && this.emprendimientos.find((item, idx) => index !== idx && item.cod_tipo === this.emprendimientos[index].cod_tipo) ) {return true}
            }
        }
        return false
    }

    crearListaArea() {
        const listaTenencia = this.ficha.txt_tip_tenencia_parcela?.split(',') || []
        const listaArea = this.ficha.txt_num_area_parcela?.split(',') || []
        console.log('listaTenencia :>> ', listaTenencia);
        console.log('listaArea :>> ', listaArea);
        

        this.listaTenenciaParcela = this.parametros.tenenciaParcela
        console.log('this.listaTenenciaParcela :>> ', this.listaTenenciaParcela);
        for (let index = 0; index < this.listaTenenciaParcela.length; index++) {
            // this.listaTeneciaParcela[index].numero = 0
            this.listaTenenciaParcela[index].seleccionado = false
            if (listaTenencia.length > 0) {
                const idx = listaTenencia.findIndex(item => item === this.listaTenenciaParcela[index].cod_tipo)
                console.log('idx :>> ', idx);
                if (idx >= 0) {
                    this.listaTenenciaParcela[index].seleccionado = true
                    this.listaTenenciaParcela[index].numero = parseInt(listaArea[idx])
                }

            }
            console.log('this.listaTenenciaParcela for :>> ', this.listaTenenciaParcela);
        }
        this.calcularTotalArea()
    }

    actualizarListaArea() {
        for (let index = 0; index < this.listaTenenciaParcela.length; index++) {
            if (this.ficha.txt_tip_tenencia_parcela) {
                const listaTenencia = this.ficha.txt_tip_tenencia_parcela.split(',') || []
                const idx = listaTenencia.findIndex(item => item === this.listaTenenciaParcela[index].cod_tipo)
                if (idx >= 0) {
                    this.listaTenenciaParcela[index].seleccionado = true
                }
            }
        }
    }

    validarNumero(index: number) {
        this.listaTenenciaParcela[index].numero = Math.round(this.listaTenenciaParcela[index].numero)
        this.calcularTotalArea()
    }  

    calcularTotalArea() {
        this.totalArea = 0
        this.listaTenenciaParcela.forEach(item => {
            console.log('item.numero :>> ', item.numero);
            if (item.numero) {this.totalArea = this.totalArea + item.numero}
        })
        console.log('this.totalArea :>> ', this.totalArea);
    }

    salir() {
        this.modalController.dismiss();
    }
}
