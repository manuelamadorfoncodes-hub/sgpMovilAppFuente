import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonList, ModalController } from '@ionic/angular';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { Visita } from '../../model/visitas';
import { GrupoPartida, GrupoPartidaFoto, Partida, SubPresupuesto } from '../../model/presupuesto';
import { Archivo, Tipo } from '../../model/generales';

@Component({
    selector: 'app-visita-avance',
    templateUrl: './visita-avance.page.html',
    styleUrls: ['./visita-avance.page.scss'],
})
export class VisitaAvancePage implements OnInit {

    @ViewChild('fotoList') fotoList: IonList
    
    @Input() visita: Visita
    @Input() subPptoSelec: SubPresupuesto
    @Input() grupoTexto: string
    @Input() consulta = false
    @Input() accion: string
    @Input() ultimaVisita: Visita
    
    grupoPartida: GrupoPartida
    grupoSelecTexto: string
    partidaRepresentativa: Partida
    ultimaPartidaRepres: Partida
    grupoFotos: GrupoPartidaFoto[] = []
    observFotos: GrupoPartidaFoto[]
    isAgregaFotoOpen = false
    isGestionObserOpen = false
    tipoFoto: string
    nombreFoto: string
    descripFoto: string
    indexFoto: number
    foto: Archivo[] = []
    cambioPorcentaje = false
    esSupervisor = false
    isHistorialOpen = false
    historialFoto: GrupoPartidaFoto[] = []
    metradoAnterior: number
    avanceAnterior: number
    tipoFotoList: Tipo[] = [
        {cod_tipo: '01', txt_tipo: 'Avance'},
        {cod_tipo: '02', txt_tipo: 'Representativa'},
        {cod_tipo: '03', txt_tipo: 'Observación'},
        {cod_tipo: '04', txt_tipo: 'Observación Reiterada'},
        {cod_tipo: '05', txt_tipo: 'Observación Levantada'}
    ]
    nivelRiesgo: Tipo[] = [
        {cod_tipo: '01', txt_tipo: 'Bajo'},
        {cod_tipo: '02', txt_tipo: 'Medio'},
        {cod_tipo: '03', txt_tipo: 'Alto'}
    ]

    constructor(private modalController: ModalController,
            public dataLocalService: DataLocalService,
            private uiService: UiServiceService) { }

    async ngOnInit() {
        console.log('inicia............');
        if (this.grupoTexto) {
            this.grupoPartida = JSON.parse(this.grupoTexto)
            if (this.grupoPartida.visitaFoto) {
                this.grupoFotos = this.grupoPartida.visitaFoto
                this.grupoFotos.forEach(async visitaFoto => {
                    if (!visitaFoto.fotos) {visitaFoto.fotos = [await this.buscarTipoFoto(visitaFoto.tip_fotografia)]}
                })
            }
            if (this.grupoPartida.observacionFoto) {this.observFotos = this.grupoPartida.observacionFoto}

            if (this.accion === 'avanceGrupo') {
                if (this.subPptoSelec.esPartidaRepresentativa) {
                    this.partidaRepresentativa = this.grupoPartida.partida.find(partida => partida.flg_representativa === 1)
                    if (!this.partidaRepresentativa) {
                        this.consulta = true
                        this.uiService.alertaInformativa('No se ha encontrado la partida representativa.')
                    }
                    this.obternerDataUltVisita()
                }
                if (this.partidaRepresentativa) {
                    if (this.partidaRepresentativa.num_ejecutado_actual === 0) {this.partidaRepresentativa.num_ejecutado_actual = null}
                } else {
                    if (this.grupoPartida.porAvanceActual === 0) {this.grupoPartida.porAvanceActual = null}
                }
            }
            if (this.accion === 'avancePartida') {
                this.grupoPartida.partida.forEach(partida => {
                    if (partida.num_ejecutado_actual === 0) {partida.num_ejecutado_actual = null}
                });
            }

        }
        const user = await this.dataLocalService.leerUser()
        if (user.perfil.nidperfil === 52) {this.esSupervisor = true}

        console.log('this.consulta :>> ', this.consulta);
    }

    obternerDataUltVisita() {
        console.log('this.ultimaVisita :>> ', this.ultimaVisita);
        if (this.grupoPartida && this.ultimaVisita) {
            const Pptos = this.ultimaVisita.presupuesto.ablEstructura
            if (Pptos) {
                console.log('subPptos :>> ', Pptos);
                const subPpto = Pptos.find(item => item.cod_rubro === this.grupoPartida.cod_rubro && item.cod_presupuesto === this.grupoPartida.cod_presupuesto)
                if (subPpto) {
                    const grupo = subPpto.grupoPartida.find(item => item.cod_rubro === this.grupoPartida.cod_rubro && item.cod_presupuesto === this.grupoPartida.cod_presupuesto && item.nid_grupo === this.grupoPartida.nid_grupo)
                    console.log('grupo :>> ', grupo);
                    this.metradoAnterior = grupo.numMetrado
                    this.avanceAnterior = grupo.porAvanceActual
                    console.log('grupoUltimaVisita ======:>> ', this.metradoAnterior, this.avanceAnterior);
                }
            }
        }
    }


    async agregarFoto() {
        console.log('this.esSupervisor :>> ', this.esSupervisor);
        this.isAgregaFotoOpen = true
        if (!this.esSupervisor) {this.tipoFotoList = this.tipoFotoList.filter(item => ['01','02'].includes(item.cod_tipo))}
        if (this.esSupervisor) {this.tipoFotoList = this.tipoFotoList.filter(item => ['01','02','03'].includes(item.cod_tipo))}
    }

    modificarFoto(index: number) {
        this.nombreFoto = this.grupoFotos[index].txt_nombre
        this.descripFoto = this.grupoFotos[index].txt_descripcion
        this.tipoFoto = this.grupoFotos[index].tip_fotografia
        this.indexFoto = index
        this.isAgregaFotoOpen = true
    }

    async buscarTipoFoto(tipo: string) {
        const archivos = await this.dataLocalService.leerArchivosConfig()
        console.log('archivos :>> ', archivos);
        console.log('this.tipoFoto :>> ', this.tipoFoto);
        let tipoFoto = ''
        if (tipo === '01') {tipoFoto = '0105'}
        if (tipo === '02') {tipoFoto = '0106'}
        if (tipo === '03') {tipoFoto = '0107'}
        if (tipo === '04') {tipoFoto = '0107'}
        if (tipo === '05') {tipoFoto = '0108'}
        const foto = archivos.visitaAvance.find(item => item.cod_archivo === tipoFoto)
        console.log('foto :>> ', foto);
        return foto
    }

    async aceptarFoto() {
        if (!this.nombreFoto) {
            this.uiService.alertaInformativa('Falta registrar el nombre de la fotografía.')
            return
        }
        if (!this.tipoFoto) {
            this.uiService.alertaInformativa('Falta registrar el tipo de fotografía.')
            return
        }
        console.log('this.indexFoto :>> ', this.indexFoto);
        if (this.indexFoto === 0 || this.indexFoto > 0) {
            console.log('this.indexFoto :>> ', this.indexFoto);
            this.grupoFotos[this.indexFoto].txt_nombre = this.nombreFoto
            this.grupoFotos[this.indexFoto].txt_descripcion = this.descripFoto
            this.grupoFotos[this.indexFoto].tip_fotografia = this.tipoFoto
            const foto: Archivo = await this.buscarTipoFoto(this.tipoFoto)
            this.grupoFotos[this.indexFoto].fotos[0].cod_archivo = foto.cod_archivo
            this.grupoFotos[this.indexFoto].fotos[0].txt_archivo = foto.txt_archivo

        } else {
            const foto = await this.buscarTipoFoto(this.tipoFoto)
            console.log('foto :>> ', foto);
            const grupoFoto: GrupoPartidaFoto = {
                cod_zonal: this.grupoPartida.cod_zonal,
                cod_anho: this.grupoPartida.cod_anho,
                cod_proyecto: this.grupoPartida.cod_proyecto,
                cod_rubro: this.grupoPartida.cod_rubro,
                cod_presupuesto: this.grupoPartida.cod_presupuesto,
                nid_grupo: this.grupoPartida.nid_grupo,
                nid_visita: this.grupoPartida.nid_visita,
                txt_nombre: this.nombreFoto,
                txt_descripcion: this.descripFoto,
                tip_fotografia: this.tipoFoto,
                fotos: [foto],
                cambio: true
            }
            this.grupoFotos.push(grupoFoto)
        }
        this.cerrarAgregarFoto()
    }

    cerrarAgregarFoto() {
        this.nombreFoto = null
        this.descripFoto = null
        this.tipoFoto = null
        this.indexFoto = null
        this.isAgregaFotoOpen = false
    }

    async eliminarFoto(index) {
        if (!this.grupoFotos[index].nid_fotografia) {
            const resp = await this.uiService.alertaConfirmacion('¿Está seguro de eliminar la fotografía?')
            if (resp) {
                this.grupoFotos.splice(index,1)
            }
        } else {
            const resp = await this.uiService.alertaConfirmacion('La fotografía ya ha sido sincronizada ¿está seguro de eliminarla?')
            if (resp) {
                this.grupoFotos[index].eliminada = true
                await this.uiService.alertaInformativa('La fotografía se eliminará en la próxima sincronización.')
            }
        }
        console.log('index :>> ', index);
        // await this.fotoList.closeSlidingItems()
        const closed = await this.fotoList.closeSlidingItems();
        if (closed) {
          console.log('Sliding item was closed.');
        } else {
          console.log('No sliding items were open.');
        }
    }

    async guardar() {
        console.log('this.cambioPorcentaje :>> ', this.cambioPorcentaje);
        if (this.cambioPorcentaje) {this.distribuirAvance()}
        console.log('this.visita :>> ', this.visita);
        this.grupoPartida.visitaFoto = this.grupoFotos
        this.grupoPartida.observacionFoto = this.observFotos
        this.grupoPartida.flg_concluida = this.evaluarIncompleto()
        this.grupoPartida.icono = this.grupoPartida.flg_concluida === 1 ? 1 : (this.grupoPartida.flg_concluida === 0 ? 2 : 0)
        this.grupoPartida.cambio = true
        this.grupoPartida.fec_ult_modificacion = new Date()
        this.visita.presupuesto.ablEstructura[this.subPptoSelec.index].grupoPartida[this.grupoPartida.index] = this.grupoPartida
        this.visita.presupuesto.ablEstructura[this.subPptoSelec.index].cambio = true
        this.visita.presupuesto.ablEstructura[this.subPptoSelec.index].fec_ult_modificacion = new Date()
        console.log('Guardar...');
        this.visita.cambio = true
        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarVisita(this.visita, this.visita.index)
        await this.uiService.dismissLoading()
        this.modalController.dismiss()
    }

    distribuirAvance() {
        this.grupoPartida.porAvanceActual = this.grupoPartida.porAvanceEdit / 100
        this.grupoPartida.imp_ejecutado_actual = this.grupoPartida.porAvanceActual * this.grupoPartida.imp_presupuestado
        console.log('this.grupoPartida.imp_ejecutado_actual :>> ', this.grupoPartida.imp_ejecutado_actual);
        for (let index = 0; index < this.grupoPartida.partida.length; index++) {
            const porcentajePartida = this.grupoPartida.partida[index].imp_costo_partida * this.grupoPartida.partida[index].num_presupuestado / this.grupoPartida.imp_presupuestado
            console.log('porcentajePartida :>> ', porcentajePartida);
            const ejecutadoActualPartida = this.grupoPartida.imp_ejecutado_actual * porcentajePartida
            console.log('ejecutadoActualPartida :>> ', ejecutadoActualPartida);
            this.grupoPartida.partida[index].num_ejecutado_actual = Math.round((ejecutadoActualPartida / this.grupoPartida.partida[index].imp_costo_partida) * 1000) / 1000
            console.log('this.grupoPartida.partida[index].num_ejecutado_actual :>> ', this.grupoPartida.partida[index].num_ejecutado_actual);
        }
        this.cambioPorcentaje = false
    }

    // Incompleto paratida representativa supervisor
    // ▪	Si no ha registrado el ejecutado acumulado.
    // ▪	Si el nivel de riesgo es medio o alto, es obligatorio colocar un motivo del riesgo.
    // ▪	Si se ha creado nueva foto de reporte (sea cual fuera el tipo de foto) pero no se ha cargado la fotografía.
    // ▪	Si se tienen observaciones anteriores y no se les ha marcado como reiterar observación o cerrar observación.
    
    evaluarIncompleto() {
        if (this.esSupervisor) {
            if (this.subPptoSelec.esPartidaRepresentativa && this.partidaRepresentativa ) {
                if (!this.partidaRepresentativa.num_ejecutado_actual) {return 1}
            }
            if (this.grupoPartida.observacionFoto && this.grupoPartida.observacionFoto.length > 0) {
                if (this.grupoPartida.observacionFoto.find(item => (!item.flg_levantada && !item.flg_reiterada))) {return 1}
            }    
        }
        if (!this.grupoPartida.tip_riesgo) {return 1}
        if (this.grupoPartida.tip_riesgo !== '01' && !this.grupoPartida.txt_riesgo) {return 1}
        if (!this.grupoPartida.visitaFoto || this.grupoPartida.visitaFoto.length === 0) {return 1}
        for (let index = 0; index < this.grupoPartida.visitaFoto.length; index++) {
            const visitaFoto = this.grupoPartida.visitaFoto[index];
            if (!visitaFoto.txt_nombre) {return 1}
            if (!visitaFoto.tip_fotografia) {return 1}
            if (!visitaFoto.fotos || visitaFoto.fotos.length === 0 ) {return 1}
            if (!visitaFoto.fotos[0].nueva && !visitaFoto.fotos[0].enviada && !visitaFoto.fotos[0].nid_archivo) {return 1}
        }
        if (!this.grupoPartida.visitaFoto.find(item => item.tip_fotografia === '01')) {return 1}
        if (!this.grupoPartida.visitaFoto.find(item => item.tip_fotografia === '02')) {return 1}

        return 0
    }
                                
    async retiterarObservacion(index) {
        this.indexFoto = index
        this.tipoFoto = '04'
        const foto: Archivo = await this.buscarTipoFoto(this.tipoFoto)
        this.foto.push(foto)
        this.isGestionObserOpen = true
    }

    async levantarObservacion(index) {
        this.indexFoto = index
        this.tipoFoto = '05'
        const foto: Archivo = await this.buscarTipoFoto(this.tipoFoto)
        this.foto.push(foto)
        this.isGestionObserOpen = true
    }

    historialObservacion(index) {
        this.historialFoto = this.grupoPartida.observacionFoto[index].historialFoto
        this.isHistorialOpen = true
    }
    
    aceptarObservacion() {
        if (!this.nombreFoto) {
            this.uiService.alertaInformativa('Falta registrar el nombre de la fotografía.')
            return
        }
        if (!this.foto || this.foto.length === 0 ) {
            this.uiService.alertaInformativa('Falta la fotografía.')
            return
        }
        if (!this.foto[0].nueva && !this.foto[0].enviada && !this.foto[0].nid_archivo) {
            this.uiService.alertaInformativa('Falta la fotografía.')
            return
        }

        console.log('this.indexFoto :>> ', this.indexFoto);
        console.log('this.grupoFotos[this.indexFoto] :>> ', this.grupoFotos[this.indexFoto]);
        this.observFotos[this.indexFoto].txt_nombre = this.nombreFoto
        this.observFotos[this.indexFoto].txt_descripcion = this.descripFoto
        this.observFotos[this.indexFoto].tip_fotografia = this.tipoFoto
        this.observFotos[this.indexFoto].fec_fotografia = this.visita.fec_visita
        this.observFotos[this.indexFoto].flg_reiterada = this.tipoFoto === '04' ? 1 : 0
        this.observFotos[this.indexFoto].flg_levantada = this.tipoFoto === '05' ? 1 : 0
        this.observFotos[this.indexFoto].fotos = this.foto
        this.observFotos[this.indexFoto].nid_archivo = null
        this.observFotos[this.indexFoto].cambio = true
        this.cerrarGestionObservacion()
    }

    cerrarGestionObservacion() {
        this.foto = []
        console.log('this.foto cerrarGestionObservacion:>>>>>> ', this.foto);
        this.indexFoto = null
        this.tipoFoto = null
        this.nombreFoto = null
        this.descripFoto = null
        this.isGestionObserOpen = false
    }

    cerrarHistorial() {
        this.historialFoto = []
        this.isHistorialOpen = false
    }

    salir() {
        this.modalController.dismiss()
    }


}
