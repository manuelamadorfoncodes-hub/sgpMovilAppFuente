import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Usuario } from '../../model/usuarios';
import { EntregaInsumo, TecnologiaColectiva, TecnologiaInsumo } from '../../model/proyectos';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';

@Component({
    selector: 'app-tecnologia-insumo',
    templateUrl: './tecnologia-insumo.page.html',
    styleUrls: ['./tecnologia-insumo.page.scss'],
})
export class TecnologiaInsumoPage implements OnInit {

    @Input() tipoEntrega: string
    @Input() tecnologiaColectiva: TecnologiaColectiva
    @Input() usuario: Usuario
    @Input() tecnologiaTexto: string
    @Input() index: number
    @Input() idx: number
    @Input() consulta = false
    tecnologia: any
    entregas: EntregaInsumo[] = []
    entregaEdit: EntregaInsumo = {}
    insumos: TecnologiaInsumo[] = []
    idxEntrega: number
    isModalOpen = false
    verAgregarEntrega = false
    insumosText: string
    usuarioFirma: any = {}
    puedeCambiarAHuella = true
    usarHuella = false
        
    constructor(private dataLocalService: DataLocalService,
        private modalController: ModalController,
        private uiService: UiServiceService
    ) { }

    async ngOnInit() {
        console.log('this.tipoEntrega :>> ', this.tipoEntrega);
        this.tecnologia = JSON.parse(this.tecnologiaTexto)
        console.log('this.tecnologia :>> ', this.tecnologia);

        if (this.tecnologia.entregaInsumos) {
            this.entregas = this.tecnologia.entregaInsumos
            console.log('this.entregas :>> ', this.entregas);
        }
                        
        if (this.entregas && this.entregas.length > 0) {
            this.entregas.forEach(entrega => {
                entrega.insumos.forEach(item => {
                    if(item.txt_observacion) {
                        item.flg_observacion = true
                    } else {
                        item.flg_observacion = false
                    }
                })
            })
            await this.insumosNoEntregados(this.entregas[0].codigo_expediente)
        } else {
            this.verAgregarEntrega = true
        }
        console.log('this.usuarioFirma :>> ', this.usuarioFirma);

    }

    async insumosNoEntregados(codigoProyecto, nidEntrega?) {
        const insumos: TecnologiaInsumo[] = []
        const tecnologiasList = await this.dataLocalService.leerTecnologiaPartidaProyecto(codigoProyecto)
        if (tecnologiasList) {
            const partida = tecnologiasList.find(item => item.cod_partida === this.tecnologia.cod_partida)
            if (partida && partida.insumos) {
                insumos.push(...partida.insumos)

                for (let index = 0; index < this.entregas.length; index++) {
                    for (let idx = 0; idx < this.entregas[index].insumos.length; idx++) {
                        const indexElimina = insumos.findIndex(item => item.codigo_insumo === this.entregas[index].insumos[idx].codigo_insumo)
                        if (indexElimina >= 0 && this.entregas[index].insumos[idx].flg_entregado) {
                            insumos.splice(indexElimina,1)
                        }
                    }
                }
            }
        }
        this.verAgregarEntrega = false
        if (insumos && insumos.length > 0) {this.verAgregarEntrega = true}
        if (nidEntrega) {
            const index = this.entregas.findIndex(item => item.nid_entrega === nidEntrega)
            if (index >= 0 && this.entregas[index].insumos && this.entregas[index].insumos.length > 0) {
                for (let idx = 0; idx < this.entregas[index].insumos.length; idx++) {
                    if (!this.entregas[index].insumos[idx].flg_entregado) {
                        const indexElimina = insumos.findIndex(item => item.codigo_insumo === this.entregas[index].insumos[idx].codigo_insumo)
                        if (indexElimina >= 0) {
                            insumos.splice(indexElimina,1)
                            this.entregas[index].insumos[idx].flg_eliminado = false
                        } else {
                            this.entregas[index].insumos[idx].flg_eliminado = true
                        }
                    }
                }
            }
        }
        if (this.tipoEntrega === 'C' && insumos && insumos.length > 0) {
            for (let index = 0; index < insumos.length; index++) {
                insumos[index].num_cantidad = Math.round(insumos[index].num_cantidad * this.tecnologiaColectiva.detalle[this.idx].num_metrado_detalle /this.tecnologiaColectiva.num_metrado_partida * 100)/100
            }
        }
        return insumos
    }
 
    async agregarEntrega() {
        const existe = await this.existeEntrega()
        if (existe) {
            return await this.uiService.alertaConfirmacion(`¿Está seguro de agregar una nueva entrega?`).then(async (resp) => {
                if (resp) {await this.nuevaEntrega()}  
            })
        } else {
            await this.nuevaEntrega()
        }
    }

    async existeEntrega() {
        let existe = false
        if (this.entregas && this.entregas.length > 0) {
            const fecha = new Date()
            const fechaTexto = `${('0' + fecha.getDate().toString()).slice(-2)}${('0' + (fecha.getMonth() + 1)).toString().slice(-2)}${fecha.getFullYear()}`
            this.entregas.forEach(async item => {
                const fechaEntrega = new Date(item.fec_entrega)
                const fechaTextoEntrega = `${('0' + fechaEntrega.getDate().toString()).slice(-2)}${('0' + (fechaEntrega.getMonth() + 1)).toString().slice(-2)}${fechaEntrega.getFullYear()}`
                if (fechaTexto == fechaTextoEntrega) {existe = true}
            })
        }
        return existe
    }

    async nuevaEntrega() {
        if (this.tipoEntrega === 'U') {
            this.entregaEdit.codigo_expediente = this.usuario.codigo_expediente,
            this.entregaEdit.tip_entrega = 'U'
            this.entregaEdit.nid_personal_proyecto = this.usuario.nid_personal_proyecto
            this.entregaEdit.nid_tecnologia = this.tecnologia.nid_tecnologia
            this.entregaEdit.txt_dni_usuario = this.usuario.txt_documento_identidad
            this.entregaEdit.txt_usuario = `${this.usuario.txt_apellido_paterno} ${this.usuario.txt_apellido_materno}, ${this.usuario.txt_nombres}`
        }
        if (this.tipoEntrega === 'C') {
            this.entregaEdit.codigo_expediente = this.tecnologiaColectiva.codigo_expediente
            this.entregaEdit.nid_detalle = this.tecnologia.nid_detalle
            this.entregaEdit.tip_entrega = 'C'
        }
        this.entregaEdit.fec_entrega = new Date()
        this.entregaEdit.est_entrega = 'R'
        this.entregaEdit.cod_partida = this.tecnologia.cod_partida
        this.entregaEdit.cod_tecnologia = this.tecnologia.cod_tecnologia
        
        this.insumos = await this.insumosNoEntregados(this.entregaEdit.codigo_expediente)
        
        const archivos = await this.dataLocalService.leerArchivosConfig()
        this.entregaEdit.firmas = archivos.entregaInsumos.filter(item => item.cod_archivo === '0080')
        this.usarHuella = false
        this.idxEntrega = -1
        this.isModalOpen = true
    }

    async editarEntrega(entregaEdit: EntregaInsumo, indexEdita: number) {
        this.entregaEdit = entregaEdit
        this.insumosText = JSON.stringify( this.entregaEdit.insumos)
        this.insumos = []
        this.insumos.push(...this.entregaEdit.insumos)
        const noEntregado = await this.insumosNoEntregados(entregaEdit.codigo_expediente, entregaEdit.nid_entrega)
        this.insumos.push(...noEntregado)
        console.log('Editar entrega - this.entregaEdit :>> ', this.entregaEdit);
        if (this.entregaEdit.tip_entrega === 'C') {
            this.usuarioFirma.txt_dni_firma = this.entregaEdit.txt_dni_usuario
            this.usuarioFirma.nid_personal_proyecto = this.entregaEdit.nid_personal_proyecto
            this.usuarioFirma.txt_usuario_firma = this.entregaEdit.txt_usuario
        }

        const existe = this.entregaEdit.firmas.filter(item => item.nid_archivo).length
        if (existe > 0) {this.puedeCambiarAHuella = false}
        if (this.puedeCambiarAHuella) {
            const existeImagen = this.entregaEdit.firmas.filter(item => item.cod_archivo === '0082').length
            if (existeImagen) {this.usarHuella = true}
        }

        this.idxEntrega = indexEdita
        this.isModalOpen = true
    }

    onWillDismiss(ev) {
        console.log('ev :>> ', ev);
        this.isModalOpen = false
    }

    async eliminarEntrega(indexElimina) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la entrega de activos?`).then(async (resp) => {
            if (resp) {
                this.entregas.splice(indexElimina,1)
                if (this.tipoEntrega === 'U') {
                    this.usuario.tecnologias[this.index].entregaInsumos = this.entregas
                    this.usuario.tecnologias[this.index].cambioEntregaInsumos = this.evaluarExisteCambio()
                    this.usuario.tecnologias[this.index].entregaInsumosIncompleto = this.evaluarTecnologiaIncompleto()
                    this.usuario.cambioEntregaInsumos = this.evaluarExisteCambioUsuario()
                    this.usuario.entregaInsumosIncompleto = this.evaluarUsuarioIncompleto()
                    await this.dataLocalService.guardarUsuario(this.usuario, false)
                    await this.insumosNoEntregados(this.usuario.codigo_expediente)
                }
                if (this.tipoEntrega === 'C') {
                    this.tecnologiaColectiva.detalle[this.idx].entregaInsumos = this.entregas
                    this.tecnologiaColectiva.detalle[this.idx].cambioEntregaInsumos = this.evaluarExisteCambio()
                    this.tecnologiaColectiva.detalle[this.idx].entregaInsumosIncompleto = this.evaluarDetalleIncompleto()
                    await this.dataLocalService.guardarTecnologiaColectiva(this.tecnologiaColectiva, this.index)
                    await this.insumosNoEntregados(this.tecnologiaColectiva.codigo_expediente)
                }
            }
        })
    }

    evaluarExisteCambio() {
        if (!this.entregas || this.entregas.length <= 0) {return false}
        for (let index = 0; index < this.entregas.length; index++) {
            if (this.entregas[index].est_entrega === 'R' || this.entregas[index].est_entrega === 'O') {return true}
        }
        return false
    }

    evaluarExisteCambioUsuario() {
        for (let index = 0; index < this.usuario.tecnologias.length; index++) {
            if (this.usuario.tecnologias[index].cambioEntregaInsumos) {return true}
        }
        return false
    }

    marcarTodo(event) {
        const check = event.detail.checked
        if (check) {
            this.insumos.forEach(item => item.flg_entregado = true)
        } else {
            this.insumos.forEach(item => item.flg_entregado = false)
        }
    }

    agregarObservacion(index) {
        this.insumos[index].flg_observacion = true
    }

    async buscarUsuario() {
        if (this.usuarioFirma?.txt_dni_firma) {
            const usuarios = await this.dataLocalService.leerUsuariosProyecto(this.entregaEdit.codigo_expediente)
            const usuario = usuarios.find(item => item.txt_documento_identidad == this.usuarioFirma.txt_dni_firma)
            if (usuario) {
                this.usuarioFirma.nid_usuario_firma = usuario.nid_personal_proyecto
                this.usuarioFirma.txt_usuario_firma = `${usuario.txt_apellido_paterno} ${usuario.txt_apellido_materno}, ${usuario.txt_nombres}`
            } else {
                this.usuarioFirma = {}
            }
            console.log('usuario :>> ', this.usuarioFirma);
        }
    }

    async cambiarAHuella() {
        let siCambiar = true
        const existeCaptura = this.entregaEdit.firmas.filter(item => item.nueva).length
        if (existeCaptura > 0) {
            const resp = await this.uiService.alertaConfirmacion('¿Está seguro de cambiar? La firma o huella capturada se eliminará.')
            console.log('resp :>> ', resp);
            if (!resp) {siCambiar = false}
        }
        if (siCambiar) {
            const archivos = await this.dataLocalService.leerArchivosConfig()
            if (this.usarHuella) {
                this.entregaEdit.firmas = archivos.entregaInsumos.filter(item => item.cod_archivo === '0082')
            } else {
                this.entregaEdit.firmas = archivos.entregaInsumos.filter(item => item.cod_archivo === '0080')
            }
        } 
    }

    async guardar() {
        if (!this.insumos || this.insumos.length === 0) {
            await this.uiService.alertaInformativa('Falta registrar los insumos de la entrega.')
            return false
        }
        if (!(this.insumos.findIndex(item => item.flg_entregado || item.nid_entrega) >= 0)) {
            await this.uiService.alertaInformativa('Falta marcar los insumos entregados.')
            return false
        }   
        console.log('guardar this.entrega :>> ', this.entregaEdit);
        this.entregaEdit.est_entrega = 'R'
        if (this.usuarioFirma.nid_usuario_firma) {
            this.entregaEdit.nid_personal_proyecto = this.usuarioFirma.nid_usuario_firma
            this.entregaEdit.txt_usuario = this.usuarioFirma.txt_usuario_firma
            this.entregaEdit.txt_dni_usuario = this.usuarioFirma.txt_dni_firma
        }
        this.entregaEdit.insumos = this.insumos.filter(item => item.flg_entregado || item.nid_insumo)
        this.entregaEdit.incompleto = this.evaluarEntregaIncompleta()
        if (this.idxEntrega === -1) {
            this.entregas.push(this.entregaEdit)
        } else {
            this.entregas[this.idxEntrega] = this.entregaEdit
        }

        if (this.tipoEntrega === 'U') {
            this.usuario.tecnologias[this.index].entregaInsumos = this.entregas
            this.usuario.tecnologias[this.index].cambioEntregaInsumos = true
            this.usuario.tecnologias[this.index].entregaInsumosIncompleto = this.evaluarTecnologiaIncompleto()
            this.usuario.cambioEntregaInsumos = true
            this.usuario.entregaInsumosIncompleto = this.evaluarUsuarioIncompleto()
            await this.uiService.presentLoading('Guardando...')
            await this.dataLocalService.guardarUsuario(this.usuario, false)
            await this.uiService.dismissLoading()
        }

        if (this.tipoEntrega === 'C') {
            this.tecnologiaColectiva.detalle[this.idx].entregaInsumos = this.entregas
            this.tecnologiaColectiva.detalle[this.idx].cambioEntregaInsumos = true
            this.tecnologiaColectiva.detalle[this.idx].entregaInsumosIncompleto = this.evaluarDetalleIncompleto()
            await this.uiService.presentLoading('Guardando...')
            await this.dataLocalService.guardarTecnologiaColectiva(this.tecnologiaColectiva, this.index)
            await this.uiService.dismissLoading()
        }
        await this.insumosNoEntregados(this.entregaEdit.codigo_expediente)
        this.insumosText = null
        this.cerrarModal()
    }

    evaluarEntregaIncompleta() {
        if (!this.entregaEdit.insumos) {return true}
        if (!(this.entregaEdit.insumos.findIndex(item => item.flg_entregado) >= 0)) {return true}
        if (!this.entregaEdit.nid_personal_proyecto) {return true}
        if (!this.entregaEdit.firmas) {return true}
        for (let index = 0; index < this.entregaEdit.firmas.length; index++) {
            if (!this.entregaEdit.firmas[index].nueva && !this.entregaEdit.firmas[index].enviada) {return true}
        }     
        return false  
    }

    evaluarTecnologiaIncompleto() {
        for (let index = 0; index < this.usuario.tecnologias[this.index].entregaInsumos.length; index++) {
            if (this.usuario.tecnologias[this.index].entregaInsumos[index].incompleto) {return true}
        }
        return false
    }

    evaluarUsuarioIncompleto() {
        for (let index = 0; index < this.usuario.tecnologias.length; index++) {
            if (this.usuario.tecnologias[index].entregaInsumosIncompleto) {return true}
        }
        return false
    }

    evaluarDetalleIncompleto() {
        for (let index = 0; index < this.tecnologiaColectiva.detalle[this.idx].entregaInsumos.length; index++) {
            if (this.tecnologiaColectiva.detalle[this.idx].entregaInsumos[index].incompleto) {return true}
        }
        return false
    }

    async salir() {
        this.modalController.dismiss();
    }

    cerrarModal() {
        if (this.insumosText) {this.entregaEdit.insumos = JSON.parse(this.insumosText)}
        this.entregaEdit = {}
        this.usuarioFirma = {}
        this.insumos = []
        this.isModalOpen = false
    }
}
