import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController } from '@ionic/angular';
import { FichaAsistTecMem, MejoraAsisTecMem, Usuario } from '../../model/usuarios';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { TecnologiaInsumo } from '../../model/proyectos';
import { Archivo } from '../../model/generales';

@Component({
    selector: 'app-asistencia-tecnica-mem-edit',
    templateUrl: './asistencia-tecnica-mem-edit.page.html',
    styleUrls: ['./asistencia-tecnica-mem-edit.page.scss'],
})
export class AsistenciaTecnicaMemEditPage implements OnInit {
    
    @ViewChild('ionInputEl', { static: false }) ionInputEl!: IonInput;
    @Input() usuario: Usuario
    @Input() index: number
    @Input() consulta: boolean = false
    @Input() fichaTexto: string
    @Input() ultimaFichaTexto: string
    ficha: FichaAsistTecMem = {}
    activos: TecnologiaInsumo[] = []
    fotos: Archivo[] = []
    titulo = ''
    lineaNegocio = []
    estados = []
    frecuencia = []
    redes = []
    regimen = []
    eslabon = []
    evidencia = []
    entidad = []
    miembro = []
    beneficio = []
    herramienta = []
    respuestas = []
    estadoActivo = []
    mejoras: MejoraAsisTecMem[] = []
    tipoMejoraList = []
    isAgregaMejora = false
    datoMejora = ''
    datoTipoMejora = ''
    existeInsumos = false
    // ruc = ''

    constructor(private modalController: ModalController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        console.log('AsistenciaTecnicaMemEditPage ngOnInit');
        this.titulo = this.usuario.asistenciaTecnicaMemList[this.index].tituloFicha
        const parametros = await this.dataLocalService.leerUsuariosParametro()
        this.tipoMejoraList = parametros.tipoMejora
        this.estados = parametros.estadoMejoras
        this.frecuencia = parametros.frecuenciaOrganiza
        this.redes = parametros.redesSociales
        this.regimen = parametros.regimenRuc
        this.eslabon = parametros.eslabonCadenaProd
        this.evidencia = parametros.evidenciaEslabon
        this.entidad = parametros.entidadApoyo
        this.miembro = parametros.participaMiembro
        this.beneficio = parametros.beneficios
        this.herramienta = parametros.herramientasContacto
        this.respuestas = parametros.respuestas
        this.estadoActivo = parametros.estadoActivo

        // if (this.consulta) {
        //     this.ficha = this.usuario.asistenciaTecnicaMemList[this.index].ultimaFicha
        // } else {
        //     if (this.usuario.asistenciaTecnicaMemList[this.index].nuevaFicha) {
        //         this.ficha = this.usuario.asistenciaTecnicaMemList[this.index].nuevaFicha
        console.log('this.fichaTexto :>> ', this.fichaTexto);
        if (this.fichaTexto) {
            this.ficha = JSON.parse(this.fichaTexto)
            if (this.ficha.activos) {
                this.activos = this.ficha.activos
                this.existeInsumos = true
            }
            if (this.ficha.fotos) {this.fotos = this.ficha.fotos}
            if (this.ficha.mejoras) {this.mejoras = this.ficha.mejoras}
            
        } else {
            const user = await this.dataLocalService.leerUser()
            const funcion = await this.dataLocalService.leerFuncion()
            this.ficha.fec_visita = new Date()
            this.ficha.cod_ficha = this.usuario.asistenciaTecnicaMemList[this.index].codigoFicha
            this.ficha.codigo_expediente = this.usuario.codigo_expediente
            this.ficha.nid_funcion = funcion.nid_funcion
            this.ficha.nid_personal = user.nidPersonal
            this.ficha.nid_personal_proyecto = this.usuario.nid_personal_proyecto
            if (this.usuario.tecnologias && this.usuario.tecnologias.length > 0) {
                console.log('this.usuario.tecnologias[0].cod_tecnologia :>> ', this.usuario.tecnologias[0].cod_tecnologia);
                this.ficha.cod_linea_negocio = this.usuario.tecnologias[0].cod_tecnologia.substring(2,4)
                this.ficha.txt_linea_negocio = this.usuario.tecnologias[0].txt_tecnologia
                console.log('this.ficha.cod_linea_negocio :>> ', this.ficha.cod_linea_negocio)
            }
            if (this.ficha.cod_ficha === '05') {
                if (this.usuario.tecnologias && this.usuario.tecnologias.length > 0 && this.usuario.tecnologias[0] && this.usuario.tecnologias[0].entregaInsumos && this.usuario.tecnologias[0].entregaInsumos.length > 0) {
                    const tecnologiasList = await this.dataLocalService.leerTecnologiaPartidaProyecto(this.usuario.codigo_expediente)
                    this.activos = tecnologiasList.find(item => item.cod_partida === this.usuario.tecnologias[0].cod_partida).insumos
                    this.activos = this.activos.filter(item => {
                        for (let index = 0; index < this.usuario.tecnologias[0].entregaInsumos.length; index++) {
                            const entrega = this.usuario.tecnologias[0].entregaInsumos[index]
                            if (entrega.nid_entrega) {
                                if (entrega.insumos.find(insumo => insumo.codigo_insumo === item.codigo_insumo)) {return true}

                            } 
                        }
                    })
                }
                this.activos.map((item, index) => item.nid_activo = index + 1)
                console.log('this.activos :>> ', this.activos);
                if (this.activos && this.activos.length > 0) {this.existeInsumos = true}
            }
            console.log('this.ficha.cod_ficha :>> ', this.ficha.cod_ficha);
            if (this.ficha.cod_ficha === '04' || this.ficha.cod_ficha === '05') {
                if (this.fotos.length === 0) {
                    const archivos = await this.dataLocalService.leerArchivosConfig()
                    this.fotos = archivos.asistTecMemActivos
                }
                console.log('this.fotos :>> ', this.fotos);
            }
            if (this.ficha.cod_ficha === '01' && this.ultimaFichaTexto) {
                const ultimaFicha = JSON.parse(this.ultimaFichaTexto)
                if (ultimaFicha && ultimaFicha.mejoras) {
                    this.mejoras = ultimaFicha.mejoras.filter(item => item.est_mejora !== '03')
                }
            }
        }
        if (this.ficha.cod_ficha === '05' && !this.existeInsumos) {
            await this.uiService.alertaInformativa('No es posible registrar esta ficha porque no se ha registrado la entrega de activos.')
        }
        
        console.log('THIS.FICHA fin del ngOnInit:>> ', this.ficha);
        console.log('this.existeInsumos :>> ', this.existeInsumos);
        console.log('this.activos :>> ', this.activos);
    }

    agregarMejora() {
        this.isAgregaMejora = true
    }

    async aceptarMejora() {
        if (!this.datoTipoMejora) {
            await this.uiService.alertaInformativa('Falta seleccionar el contenido temático.')
            return
        }
        if (!this.datoMejora) {
            await this.uiService.alertaInformativa('Falta la descripción de la mejora sugerida.')
            return
        }
        this.mejoras.push({
            codigo_expediente: this.ficha.codigo_expediente,
            nid_ficha: this.ficha.nid_ficha,
            tip_mejora: this.datoTipoMejora,
            txt_tipo_mejora: this.tipoMejoraList.find(item => item.cod_tipo === this.datoTipoMejora).txt_tipo,
            txt_mejora: this.datoMejora,
            est_mejora: '01'
        })
        this.isAgregaMejora = false
    }

    cerrarAgregarMejora() {
        this.datoTipoMejora = ''
        this.datoMejora = ''
        this.isAgregaMejora = false
    }

    actualizaConclusion() {
        console.log('this.ficha.tip_materiales_instalado - this.ficha.tip_adecuacion_instalado :>> ', this.ficha.tip_materiales_instalado, this.ficha.tip_adecuacion_instalado);
        console.log('this.ficha.flg_materiales_correcto - this.ficha.flg_adecuacion_correcto :>> ', this.ficha.flg_materiales_correcto, this.ficha.flg_adecuacion_correcto);
        if (this.ficha.cod_ficha === '04') {
            if (this.ficha.tip_materiales_instalado === '01' && this.ficha.flg_materiales_correcto === '1' && this.ficha.tip_adecuacion_instalado === '01' && this.ficha.flg_adecuacion_correcto === '1') {
                this.ficha.flg_cumple = '1'
                this.ficha.txt_recomienda = 'Dotar con activos productivos'
            } else {
                this.ficha.flg_cumple = '0'
                this.ficha.txt_recomienda = 'Absolver las observaciones'
            }
        }
        console.log('this.ficha.flg_cumple :>> ', this.ficha.flg_cumple);
    }
 
    async guardar() {
        await this.borrarDatos()
        if (this.ficha.cod_ficha === '05') {this.ficha.activos = this.activos}
        console.log('this.ficha.cod_ficha :>> ', this.ficha.cod_ficha);
        if (this.ficha.cod_ficha === '05' || this.ficha.cod_ficha === '04') {this.ficha.fotos = this.fotos}
        console.log('this.mejoras :>> ', this.mejoras);
        console.log('this.ficha.cod_ficha :>> ', this.ficha.cod_ficha);
        if (this.ficha.cod_ficha === '01') {this.ficha.mejoras = this.mejoras}
        console.log('this.ficha.mejoras :>> ', this.ficha.mejoras);
        this.ficha.flg_completa = this.validarFichaCompleta()
        this.usuario.asistenciaTecnicaMemList[this.index].nuevaFicha = this.ficha
        this.usuario.asistenciaTecnicaMemList[this.index].cambioFicha = true
        this.usuario.cambioAsistTecMem = true
        this.usuario.asistTecMemIncompleta = this.evaluarUsuarioAsistTecMemCompelta()
        console.log('this.usuario.asistTecMemCompleta :>>>>>> ', this.usuario.asistTecMemIncompleta);
        await this.uiService.presentLoading('Guardando...')
        await this.dataLocalService.guardarUsuario(this.usuario, false)
        await this.uiService.dismissLoading()
        this.modalController.dismiss();
    }

    async borrarDatos() {
        // if (this.ficha.cod_ficha === '01') {
        //     if (!this.ficha.txt_otro_mejora) {this.ficha.est_otro_mejora = null }
        //     if (!this.ficha.txt_otro_mejora) { this.ficha.txt_otro_observ = null }
        // }

        if (this.ficha.cod_ficha === '02') {
            console.log('entra aqui');
            console.log('this.ficha.flg_gestion_tareas :>> ', this.ficha.flg_gestion_tareas);
            if (this.ficha.flg_gestion_tareas === '0') {this.ficha.tip_gestion_frecuencia = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.flg_facebook = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.txt_link_facebook = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.flg_whatsapp = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.txt_link_whatsapp = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.flg_instagram = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.txt_link_instagram = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.flg_tiktok = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.txt_link_tiktok = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.flg_otra_red_social = null}
            if (this.ficha.flg_marketing_redes === '0') {this.ficha.txt_otra_red_social = null}
            if (this.ficha.flg_formal_ruc === '0') {this.ficha.tip_formal_regimen = null}
            if (this.ficha.tip_formal_regimen !== '99') {this.ficha.txt_otro_regimen = null}
        }
        
        if (this.ficha.cod_ficha === '03') {
            if (this.ficha.flg_identifica_eslabon === '0') {this.ficha.tip_eslabon = null}
            if (this.ficha.tip_eslabon !== '99') {this.ficha.txt_otro_eslabon = null}
            if (this.ficha.flg_identifica_eslabon === '0') {this.ficha.txt_tip_evidencia_eslabon = null}
            if (!this.ficha.txt_tip_evidencia_eslabon?.includes('99')) {this.ficha.txt_otra_evidencia = null}
            if (this.ficha.flg_identifica_entidad === '0') {this.ficha.flg_camara_comercio = null}
            if (this.ficha.flg_identifica_entidad === '0') {this.ficha.flg_ong = null}
            if (this.ficha.flg_identifica_entidad === '0') {this.ficha.flg_municipalidad = null}
            if (this.ficha.flg_identifica_entidad === '0') {this.ficha.flg_otra_entidad = null}
            if (this.ficha.flg_identifica_entidad === '0' || !this.ficha.flg_ong) {this.ficha.txt_ong = null}
            if (this.ficha.flg_identifica_entidad === '0' || !this.ficha.flg_municipalidad) {this.ficha.txt_municipalidad = null}
            if (this.ficha.flg_identifica_entidad === '0' || !this.ficha.flg_otra_entidad) {this.ficha.txt_otra_entidad = null}
            if (this.ficha.flg_identifica_entidad === '0') {this.ficha.tip_miembro_activo = null}
            if (this.ficha.flg_identifica_entidad === '0') {this.ficha.txt_tip_beneficio = null}
            if (!this.ficha.txt_tip_beneficio?.includes('99')) {this.ficha.txt_otro_beneficio = null}
            if (this.ficha.flg_identifica_entidad === '0') {this.ficha.txt_tip_contacto = null}
            if (!this.ficha.txt_tip_contacto?.includes('99')) {this.ficha.txt_otro_contacto = null}
        }

        if (this.ficha.cod_ficha === '04') {
            if (this.ficha.tip_electricidad_instalado !== '01') {this.ficha.flg_electricidad_correcto = null}
            if (this.ficha.tip_mejora_instalado !== '01') {this.ficha.flg_mejora_correcto = null}
            if (this.ficha.tip_mobiliario_instalado !== '01') {this.ficha.flg_mobiliario_correcto = null}
            if (this.ficha.tip_division_instalado !== '01') {this.ficha.flg_division_correcto = null}
            if (this.ficha.tip_orden_instalado !== '01') {this.ficha.flg_orden_correcto = null}
            if (this.ficha.tip_materiales_instalado !== '01') {this.ficha.flg_materiales_correcto = null}
            if (this.ficha.tip_adecuacion_instalado !== '01') {this.ficha.flg_adecuacion_correcto = null}
            if (!this.ficha.txt_otra_adecuac_nombre) {this.ficha.tip_otra_adecuac_instalado = null}
            if (!this.ficha.txt_otra_adecuac_nombre) {this.ficha.flg_otra_adecuac_correcto = null}
            if (!this.ficha.txt_otra_adecuac_nombre) {this.ficha.txt_otra_adecuac_observ = null}
            if (this.ficha.tip_otra_adecuac_instalado !== '01') {this.ficha.flg_otra_adecuac_correcto = null}
        }
    }

    validarFichaCompleta() {
        if (!this.ficha.cod_linea_negocio) {return false}

        if (this.ficha.cod_ficha === '01') {
            if (!this.ficha.txt_recomendacion) {return false}
            for (let index = 0; index < this.mejoras.length; index++) {
                if (!this.mejoras[index].est_mejora) {return false}
                if (this.mejoras[index].est_mejora !== '01' && !this.mejoras[index].txt_observacion) {return false}
            }
        }

        if (this.ficha.cod_ficha === '02') {
            if (!this.ficha.flg_gestion_ingresos) {return false}
            if (!this.ficha.flg_gestion_formato) {return false}
            if (!this.ficha.flg_gestion_tareas) {return false}
            if (this.ficha.flg_gestion_tareas === '1' && !this.ficha.tip_gestion_frecuencia) {return false}
            if (!this.ficha.txt_gestion_observacion) {return false}
            if (!this.ficha.flg_edu_fin_dinero) {return false}
            if (!this.ficha.flg_edu_fin_institucion) {return false}
            if (!this.ficha.flg_edu_fin_documentos) {return false}
            if (!this.ficha.txt_edu_fin_observacion) {return false}
            if (!this.ficha.flg_marketing_redes) {return false}
            if (this.ficha.flg_marketing_redes === '1' && !this.ficha.flg_facebook && !this.ficha.flg_whatsapp && !this.ficha.flg_instagram && !this.ficha.flg_tiktok && !this.ficha.flg_otra_red_social) {return false}
            if (this.ficha.flg_facebook && !this.ficha.txt_link_facebook) {return false} 
            if (this.ficha.flg_whatsapp && !this.ficha.txt_link_whatsapp) {return false} 
            if (this.ficha.flg_instagram && !this.ficha.txt_link_instagram) {return false} 
            if (this.ficha.flg_tiktok && !this.ficha.txt_link_tiktok) {return false} 
            if (this.ficha.flg_otra_red_social && !this.ficha.txt_otra_red_social) {return false} 
            // if (this.ficha.flg_marketing_redes === '1' && !this.ficha.txt_tip_marketing_redes) {return false}
            // if (this.ficha.txt_tip_marketing_redes?.includes('99') && !this.ficha.txt_otra_red_social) {return false}
            if (!this.ficha.flg_marketing_tecnicas) {return false}
            if (!this.ficha.txt_marketing_observ) {return false}
            if (!this.ficha.flg_formal_ruc) {return false}
            if (this.ficha.flg_formal_ruc === '1' && !this.ficha.txt_ruc) {return false}
            if (this.ficha.flg_formal_ruc === '1' && !this.ficha.tip_formal_regimen) {return false}
            if (this.ficha.tip_formal_regimen === '99' && !this.ficha.txt_otro_regimen) {return false}
            if (!this.ficha.flg_formal_tramite) {return false}
            if (!this.ficha.txt_formal_observacion) {return false}
        }
        if (this.ficha.cod_ficha === '03') {
            if (!this.ficha.flg_conoce_preparativos) {return false}
            if (!this.ficha.flg_sabe_organizar) {return false}
            if (!this.ficha.flg_demuestra_habilidades) {return false}
            if (!this.ficha.txt_ferias_observacion) {return false}
            if (!this.ficha.flg_identifica_eslabon) {return false}
            if (this.ficha.flg_identifica_eslabon === '1' && !this.ficha.tip_eslabon) {return false}
            if (this.ficha.tip_eslabon === '99' && !this.ficha.txt_otro_eslabon) {return false}
            if (this.ficha.flg_identifica_eslabon === '1' && !this.ficha.txt_tip_evidencia_eslabon) {return false}
            if (this.ficha.txt_tip_evidencia_eslabon?.includes('99') && !this.ficha.txt_otra_evidencia) {return false}
            if (!this.ficha.flg_ventajas_integrar) {return false}
            if (!this.ficha.txt_cadena_observacion) {return false}
            if (!this.ficha.flg_identifica_entidad) {return false}
            if (this.ficha.flg_identifica_entidad === '1') {
                if (!this.ficha.flg_camara_comercio && !this.ficha.flg_ong && !this.ficha.flg_municipalidad && !this.ficha.flg_otra_entidad) {return false}
                if (this.ficha.flg_ong && !this.ficha.txt_ong) {return false}
                if (this.ficha.flg_municipalidad && !this.ficha.txt_municipalidad) {return false}
                if (this.ficha.flg_otra_entidad && !this.ficha.txt_otra_entidad) {return false}
                if (!this.ficha.tip_miembro_activo) {return false}
                if (!this.ficha.txt_tip_beneficio) {return false}
                if (this.ficha.txt_tip_beneficio?.includes('99') && !this.ficha.txt_otro_beneficio) {return false}
                if (!this.ficha.txt_tip_contacto) {return false}
                if (this.ficha.txt_tip_contacto?.includes('99') && !this.ficha.txt_otro_contacto) {return false}
            }
        }
        if (this.ficha.cod_ficha === '04') {
            if (!this.ficha.tip_electricidad_instalado) {return false}
            if (this.ficha.tip_electricidad_instalado === '01' && !this.ficha.flg_electricidad_correcto) {return false}
            if (!this.ficha.txt_electricidad_observ) {return false}
            if (!this.ficha.tip_mejora_instalado) {return false}
            if (this.ficha.tip_mejora_instalado === '01' && !this.ficha.flg_mejora_correcto) {return false}
            if (!this.ficha.txt_mejora_observ) {return false}
            if (!this.ficha.tip_mobiliario_instalado) {return false}
            if (this.ficha.tip_mobiliario_instalado === '01' && !this.ficha.flg_mobiliario_correcto) {return false}
            if (!this.ficha.txt_mobiliario_observ) {return false}
            if (!this.ficha.tip_division_instalado) {return false}
            if (this.ficha.tip_division_instalado === '01' && !this.ficha.flg_division_correcto) {return false}
            if (!this.ficha.txt_division_observ) {return false}
            if (!this.ficha.tip_orden_instalado) {return false}
            if (this.ficha.tip_orden_instalado === '01' && !this.ficha.flg_orden_correcto) {return false}
            if (!this.ficha.txt_orden_observ) {return false}
            if (!this.ficha.tip_materiales_instalado) {return false}
            if (this.ficha.tip_materiales_instalado === '01' && !this.ficha.flg_materiales_correcto) {return false}
            if (!this.ficha.txt_materiales_observ) {return false}
            if (!this.ficha.tip_adecuacion_instalado) {return false}
            if (this.ficha.tip_adecuacion_instalado === '01' && !this.ficha.flg_adecuacion_correcto) {return false}
            if (!this.ficha.txt_adecuacion_observ) {return false}
            if (this.ficha.txt_otra_adecuac_nombre && !this.ficha.tip_otra_adecuac_instalado) {return false}
            if (this.ficha.tip_otra_adecuac_instalado === '01' && !this.ficha.flg_otra_adecuac_correcto) {return false}
            if (this.ficha.txt_otra_adecuac_nombre && !this.ficha.txt_otra_adecuac_observ) {return false}
            if (!this.ficha.fotos) {return false}
            console.log('this.ficha.fotos :>> ', this.ficha.fotos);
            // OJO OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
            // for (let index = 0; index < this.ficha.fotos.length; index++) {
            //     if (!this.ficha.fotos[index].nueva && !this.ficha.fotos[index].enviada && !this.ficha.fotos[index].nid_archivo) {
            //         console.log('Incompleto FOTO nueva, enviada, nid_archivo:>> ', this.ficha.fotos[index]);
            //         return false
                    
            //     }
            // }
        }
        if (this.ficha.cod_ficha === '05') {
            if (!this.ficha.txt_activo_observ) {return false}
            if (!this.ficha.activos) {return false}
            if (!this.ficha.flg_activo_utilizado) {return false}
            if (!this.ficha.flg_activo_seguro) {return false}
            if (!this.ficha.flg_activo_mantenimiento) {return false}
            if (!this.ficha.txt_condicion_observ) {return false}
            if (!this.activos || this.activos.length === 0) {return false}
            for (let index = 0; index < this.activos.length; index++) {
                if (!this.activos[index].flg_uso_emprendimiento) {return false}
                if (!this.activos[index].est_activo) {return false}
            }
            if (!this.ficha.fotos) {return false}
            for (let index = 0; index < this.ficha.fotos.length; index++) {
                if (!this.ficha.fotos[index].nueva && !this.ficha.fotos[index].enviada) {return false}
            }
        }
        return true
    }

    evaluarUsuarioAsistTecMemCompelta () {
        let incompleta = false
        this.usuario.asistenciaTecnicaMemList.forEach(ficha => {
            if (ficha.nuevaFicha) {
                if (!ficha.nuevaFicha.flg_completa) {incompleta = true}
            }
        })
        return incompleta
    }

    onInput(event: Event) {
        const value = (event.target as HTMLIonInputElement).value ?? '';
    
        // Removes non alphanumeric characters
        // const filteredValue = (value as string).replace(/[^a-zA-Z0-9]+/g, '');
        const filteredValue = (value as string).replace(/[^0-9]+/g, '');
    
        /**
         * Update both the state variable and
         * the component to keep them in sync.
         */
        this.ionInputEl.value = this.ficha.txt_ruc = filteredValue;
      }



    async salir() {
        this.modalController.dismiss();
    }

}
