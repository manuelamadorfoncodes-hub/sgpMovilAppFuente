import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UiServiceService } from '../../services/ui-service.service';
import { DataLocalService } from '../../services/data-local.service';
import { TipoActividad } from '../../model/plan-actividad';
import { Archivo, Tipo } from '../../model/generales';
import { ProyActividad, ProyActividadDet } from '../../model/actividades';

@Component({
    selector: 'app-actividad-edit',
    templateUrl: './actividad-edit.page.html',
    styleUrls: ['./actividad-edit.page.scss'],
})
export class ActividadEditPage implements OnInit {

    @Input() consulta = false
    @Input() actividadTexto: string
    textoBuscar = ''
    actividad: ProyActividad
    actividadDetalle: ProyActividadDet[] = []
    participantes: ProyActividadDet[] = []
    esCapacitacion = false
    tiposActividad: TipoActividad[] = []
    fotos: Archivo[] = []
    cantidad = 0
    mem = false
    objetivos: Tipo[] = []
    metodologias: Tipo[] = []
    isModalOpen = false
    participantesTexto = ''
    maxFecha: any 
    
    constructor(private modalController: ModalController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        this.actividad = JSON.parse(this.actividadTexto)
        console.log('this.actividad :>> ', this.actividad);
        if (this.actividad.detalle) {this.actividadDetalle = this.actividad.detalle}
        if (this.actividad.fotos) {this.fotos = this.actividad.fotos}
        if (this.actividad.tip_actividad === '3' && this.actividad.tip_participante === 'LN') {this.mem = true}
        
        const parametros = await this.dataLocalService.leerParametroProyAct()
        this.objetivos = parametros.objetivo
        this.metodologias = parametros.metodologia
        
        if (this.mem) {
            this.actividad.num_asistentes = this.actividadDetalle.filter(item => item.flg_asistio).length
            // await this.cargarParticipantes()
        }
        if (this.actividad.tip_actividad === '5') {
            if (this.actividad.detalle && this.actividad.detalle.length > 0) {
                const archivos = await this.dataLocalService.leerArchivosConfig()
                for (let index = 0; index < this.actividad.detalle.length; index++) {
                    if (!this.actividad.detalle[index].fotosDetalle || this.actividad.detalle[index].fotosDetalle.length === 0) {this.actividad.detalle[index].fotosDetalle = archivos.actividadEduFin}
                }
            }
        } else {
            if (this.fotos.length === 0) {
                const archivos = await this.dataLocalService.leerArchivosConfig()
                this.fotos = archivos.actividadProyecto
            }
        }
        this.maxFecha = this.fechaATexto(new Date())
        console.log('this.fotos :>> ', this.actividad);
        if (!this.actividad.fec_ini_real) {this.actividad.fec_ini_real = new Date()}
        if (!this.actividad.fec_fin_real) {this.actividad.fec_fin_real = new Date()}
        
    }

    fechaATexto(fecha: Date) {
        const nuevaFecha = new Date(fecha.toString())
        const fechaTexto = `${nuevaFecha.getFullYear()}-${('0' + (nuevaFecha.getMonth() + 1)).toString().slice(-2)}-${('0' + nuevaFecha.getDate().toString()).slice(-2)}T${('0' + nuevaFecha.getHours().toString()).slice(-2)}:${('0' + nuevaFecha.getMinutes().toString()).slice(-2)}:00-05:00`
        return fechaTexto
    }

    async guardar() {
        if (this.actividad.detalle && this.actividad.detalle.length > 0) {
            for (let index = 0; index < this.actividad.detalle.length; index++) {
                if (this.mem && !this.actividad.detalle[index].cod_grupo_usuario) {this.actividad.detalle[index].cod_grupo_usuario = this.actividad.cod_grupo_usuario}
                if (this.actividad.detalle[index].seEvaluo && !this.actividad.detalle[index].num_operaciones) {
                    await this.uiService.alertaConfirmacion('Falta registrar el número de operaciones.')
                    return
                }
            }
        }
        if (this.actividad.tip_metodologia !== '99') {this.actividad.txt_otra_metodologia = null}
        if (this.actividad.detalle) {
            this.actividad.detalle.map(item => {
                if (item.txt_flag_material_entregado && !item.txt_flag_material_entregado[8]) {item.txt_material_entregado = null}
            })
        }
        console.log('this.fotos :>> ', this.fotos);
        this.actividad.fotos = this.fotos
        console.log('this.actividad.detalle :>> ', this.actividad.detalle);
        await this.uiService.presentLoading('Guardando...')
        console.log('this.actividadDetalle.length :>> ', this.actividadDetalle.length);
        this.actividad.detalle = this.actividadDetalle
        this.actividad.fotos = this.fotos
        if (!this.actividad.actividadCambio) {this.actividad.backupRegistro = this.actividadTexto}
        this.actividad.actividadCambio = true
        this.actividad.flg_completo = this.informacionCompleta()
        await this.dataLocalService.guardarActividad(this.actividad)
        await this.uiService.dismissLoading()
        this.salir()
    }

    buscar(event) {
        this.textoBuscar = event.detail.value;
    }
    
    // async cargarParticipantes() {
    //     const usuarios = await this.dataLocalService.leerUsuariosProyecto(this.actividad.codigo_expediente)
    //     usuarios.forEach(usuario => {
    //         this.participantes.push({
    //             codigo_expediente: this.actividad.codigo_expediente,
    //             nid_funcion: this.actividad.nid_funcion,
    //             nid_facilitador: this.actividad.nid_facilitador,
    //             nid_actividad: this.actividad.nid_actividad,
    //             cod_grupo_usuario: this.actividad.cod_grupo_usuario,
    //             nid_miembro: usuario.nid_personal_proyecto,
    //             cod_dni: usuario.txt_documento_identidad,
    //             txt_apellido_paterno: usuario.txt_apellido_paterno,
    //             txt_apellido_materno: usuario.txt_apellido_materno,
    //             txt_nombres: usuario.txt_nombres,
    //             flg_asistio: false,
    //             guardado: false
    //         })
    //     })
    //     console.log('this.participantes.length :>> ', this.participantes.length);
    // }

    async registrarAsistencia() {
        this.participantesTexto = JSON.stringify(this.actividadDetalle)
        // if (this.actividadDetalle && this.actividadDetalle.length > 0) {
        //     console.log('registrarAsistencia this.actividadDetalle.length', this.actividadDetalle.length);
        //     this.actividadDetalle.forEach(detalle => {
        //         const index = this.participantes.findIndex(item => item.nid_miembro === detalle.nid_miembro)
        //         if (this.participantes && this.participantes.length > 0 && index && index>= 0) {
        //             this.participantes[index].flg_asistio = detalle.flg_asistio
        //             this.participantes[index].guardado = detalle.guardado
        //         }
        //     })
        // }
        // console.log('this.participantes Nro. :>> ', this.participantes.length);
        this.isModalOpen = true
    }

    aceptarParticipantes() {
        // this.actividadDetalle = []
        // this.participantes.forEach(item => {if (item.flg_asistio || item.guardado ) {this.actividadDetalle.push(item)}})
        this.actividad.num_asistentes = this.actividadDetalle.filter(item => item.flg_asistio).length
        this.isModalOpen = false
    }

    calcularAsistencia() {
        if (this.mem) {
            if (this.actividad?.num_integrantes > 0 && this.actividad.num_asistentes > 0) {
                return Math.round(this.actividad.num_asistentes * 100 / this.actividad?.num_integrantes)
            } else {
                return 0
            }
        } else {
            const num_asistentes = this.actividadDetalle.filter(item => item.flg_asistio || item.seEvaluo).length
            if (!this.actividad.num_integrantes || this.actividad.num_integrantes !== this.actividad.num_meta_participante) {this.actividad.num_integrantes = this.actividad.num_meta_participante}
            this.actividad.num_asistentes = num_asistentes
            if (this.actividad?.num_meta_participante > 0 && num_asistentes > 0) {
                return Math.round(num_asistentes * 100 / this.actividad?.num_meta_participante)
            } else {
                return 0
            }
        }
    }    

    cerrarModal() {
        // this.participantes.forEach(item => {
        //     item.flg_asistio = false
        //     item.guardado = false
        // })
        this.actividadDetalle = JSON.parse(this.participantesTexto)
        this.isModalOpen = false
    }

    informacionCompleta() {
        if (this.mem) {
            if (!this.actividad.txt_actividad) {return false}
            if (!this.actividad.tip_objetivo) {return false}
            if (!this.actividad.tip_metodologia) {return false}
            if (this.actividad.tip_metodologia === '99' && !this.actividad.txt_otra_metodologia) {return false}
            if (!this.actividad.num_asistentes) {return false}
            if (!this.actividad.fotos) {return false}
        } else {
            if (this.actividad.detalle && this.actividad.detalle.length > 0) {
                if (!this.actividad.detalle.find(item => item.flg_asistio || item.seEvaluo)) {return false}
                for (let index = 0; index < this.actividad.detalle.length; index++) {
                    if (this.actividad.detalle[index].seEvaluo && !this.actividad.detalle[index].num_operaciones) {return false}
                    if (this.actividad.detalle[index].seEvaluo) {
                        if (!this.actividad.detalle[index].fotosDetalle) {return false}
                        for (let index = 0; index < this.actividad.detalle[index].fotosDetalle.length; index++) {
                            if (!this.actividad.detalle[index].fotosDetalle[index].nueva && !this.actividad.detalle[index].fotosDetalle[index].enviada && !this.actividad.detalle[index].fotosDetalle[index].nid_archivo) {return false}
                        }
                    }
                }
            }
            
        }
        if (this.actividad.fotos && this.actividad.fotos.length > 0) {
            for (let index = 0; index < this.actividad.fotos.length; index++) {
                if (!this.actividad.fotos[index].nueva && !this.actividad.fotos[index].enviada && !this.actividad.fotos[index].nid_archivo) {return false}
            }
        }
    
        return true
    }

    limpiarNoAsisto(index) {
        if (!this.actividad.detalle[index].flg_asistio) {
            this.actividad.detalle[index].num_puntaje_eval_ent = null
            this.actividad.detalle[index].num_puntaje_eval_sal = null
            this.actividad.detalle[index].txt_flag_material_entregado = [false,false,false,false,false,false,false,false]
            this.actividad.detalle[index].txt_material_entregado = null
        }
    }

    limpiarNoSeEvaluo(index) {
        if (!this.actividad.detalle[index].seEvaluo) {
            this.actividad.detalle[index].num_cta_nueva_aper = null
            this.actividad.detalle[index].num_operaciones = null
            this.actividad.detalle[index].num_operaciones_otros = null
            this.actividad.detalle[index].flg_cambios = null
            this.actividad.detalle[index].preguntas = ['0','0','0','0']
            this.actividad.detalle[index].txt_comentarios_cambios = null
        }
    }

    validaNumero(valor, dato) {
        console.log('valor, dato :>> ', valor, dato);
        const valorText = valor.detail.value.toString()
        // const value = (event.target as HTMLIonInputElement).value ?? '';

        // Removes non alphanumeric characters
        const filteredValue = valorText.replace(/[^0-9]+/g, '');
    
        /**
         * Update both the state variable and
         * the component to keep them in sync.
         */
        // this.ionInputEl.value = this.inputModel = filteredValue;
        this.actividad[dato] = parseInt(filteredValue)
        // console.log('this.actividad[dato]. :>> ', this.actividad[dato]);
        // if (dato === 'num_integrantes') {this.ionInputNroParticip = this.actividad[dato]}
        // if (dato === 'num_asistentes') {this.ionInputNroAsist = this.actividad[dato]}
        
    }

    salir() {
        this.modalController.dismiss();
    }

}
