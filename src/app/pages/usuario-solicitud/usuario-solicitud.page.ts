import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { ComunidadNativa } from './../../model/proyectos';
import { Solicitud, Miembro } from 'src/app/model/usuarios';
import { Usuario, SolicitudUsuario, Tecnologia } from '../../model/usuarios';
import { Ambito, Proyecto } from '../../model/proyectos';
import { Archivo, Tipo } from '../../model/generales';
import { TecnologiasPage } from '../tecnologias/tecnologias.page';
import { ActividadProdListPage } from '../actividad-prod-list/actividad-prod-list.page';
import { UsuarioFichaPage } from '../usuario-ficha/usuario-ficha.page';
import { MiembroListPage } from '../miembro-list/miembro-list.page';
import { UsuarioFichaMujerPage } from '../usuario-ficha-mujer/usuario-ficha-mujer.page';

@Component({
    selector: 'app-usuario-solicitud',
    templateUrl: './usuario-solicitud.page.html',
    styleUrls: ['./usuario-solicitud.page.scss'],
})
export class UsuarioSolicitudPage implements OnInit {

    @Input() cambio: any
    @Input() nuevo: boolean
    @Input() proyecto: Proyecto
    @Input() usuario: Usuario
    @Input() solicitud: Solicitud = {}
    @Input() usuario1: boolean
    @Input() ambito: Ambito[] = []
    @Input() causales: Tipo[] = []
    @Input() proyectosNec: string[] = []
    
    titulo = ''
    solUsuario: SolicitudUsuario = {}
    solUsuario2: SolicitudUsuario
    solicitudForm: FormGroup
    edit1 = false
    edit2 = false
    edit3 = false
    fotos: Archivo[] = []
    tipoCambio = 'NU'
    tecNoOfertada: any[]
    modificado = false
    integrantes: Miembro[] = []
    comunidadNativa: ComunidadNativa[] = []
    archivoHogarEmancipado: Archivo[] = []
    menorEdad = false
    // cambio linea
    admiteExtranjeros = false
    fechaNacimiento: Date
    fechaInicio: Date
    fechaCambio: Date
    tieneFichaVivienda = true
    tieneActividadProd = true
    nombreFichaVivienda = 'Vivienda Saludable y Emprendimientos'
    tieneFichaMujer = false

    constructor(private modalController: ModalController,
        private formBuilder: FormBuilder,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    // cambio toda la funcion
    async ngOnInit() {
        if (this.proyecto.nid_sub_tipo_proyecto === 107) {this.admiteExtranjeros = true}
        if ([107,117,112].includes(this.proyecto.nid_sub_tipo_proyecto) ||(this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF')) {
            this.tieneFichaVivienda = false
            this.tieneActividadProd = false
        }
        if (this.proyecto.nid_sub_tipo_proyecto === 116) {
            this.nombreFichaVivienda = 'Vivienda Saludable y Organización'
            this.tieneActividadProd = false
        }
        if (this.proyecto.nid_sub_tipo_proyecto === 117 || (this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF')) {
            this.tieneFichaMujer = true
        }
        this.titulo = this.cambio.txt_tipo_cambio
        if (this.usuario1) {
            if (!this.usuario.solicitud || !this.usuario.solicitud.tip_cambio) {
                this.solicitud = {
                    codigo_expediente: this.proyecto.codigo_expediente,
                    cod_zonal_solicitud: this.proyecto.cod_zonal_ubicacion,
                    nid_personal_proyecto: this.usuario.nid_personal_proyecto,
                    est_solicitud: 'R',
                    txt_estado_solicitud: 'Sin enviar',
                    tip_cambio: this.cambio.tip_cambio,
                    txt_tipo_cambio: this.cambio.txt_tipo_cambio,
                    fec_solicitud: new Date(),
                }
                if (this.usuario.solicitud && this.usuario.solicitud.est_solicitud === 'E') {this.solicitud.est_solicitud = 'E'}
                this.solUsuario = {
                    tip_documento_identidad: this.usuario.tip_documento_identidad,
                    txt_documento_identidad: this.usuario.txt_documento_identidad,
                    txt_apellido_paterno: this.usuario.txt_apellido_paterno,
                    txt_apellido_materno: this.usuario.txt_apellido_materno,
                    txt_nombres: this.usuario.txt_nombres,
                    tip_sexo: this.usuario.tip_sexo,
                    fec_nacimiento: this.usuario.fec_nacimiento,
                    txt_domicilio: this.usuario.txt_domicilio,
                    cod_ubigeo: this.usuario.cod_ubigeo,
                    txt_ubigeo: this.usuario.txt_ubigeo,
                    nid_comunidad_nativa: this.usuario.nid_comunidad_nativa,
                    txt_telefono: this.usuario.txt_telefono,
                    fec_inicio: this.usuario.fec_inicio,
                    est_personal: this.usuario.est_personal,
                    txt_estado: this.usuario.txt_estado,
                }
            } else {
                this.solicitud = this.usuario.solicitud
                this.solUsuario = this.usuario.solicitud.usuario1
            }
            this.tipoCambio = this.solicitud.tip_cambio
            if (this.solicitud.usuario2) {
                const usuario2: SolicitudUsuario = {}
                usuario2.tip_documento_identidad = this.solicitud.usuario2.tip_documento_identidad
                usuario2.txt_documento_identidad = this.solicitud.usuario2.txt_documento_identidad
                usuario2.txt_apellido_paterno = this.solicitud.usuario2.txt_apellido_paterno
                usuario2.txt_apellido_materno = this.solicitud.usuario2.txt_apellido_materno
                usuario2.txt_nombres = this.solicitud.usuario2.txt_nombres
                usuario2.tip_sexo = this.solicitud.usuario2.tip_sexo
                usuario2.fec_nacimiento = this.solicitud.usuario2.fec_nacimiento
                usuario2.txt_domicilio = this.solicitud.usuario2.txt_domicilio
                usuario2.cod_ubigeo = this.solicitud.usuario2.cod_ubigeo
                usuario2.txt_ubigeo = this.solicitud.usuario2.txt_ubigeo
                usuario2.nid_comunidad_nativa = this.solicitud.usuario2.nid_comunidad_nativa
                usuario2.txt_telefono = this.solicitud.usuario2.txt_telefono
                usuario2.fec_inicio = this.solicitud.usuario2.fec_inicio
                usuario2.est_personal = this.solicitud.usuario2.est_personal
                usuario2.txt_estado = this.solicitud.usuario2.txt_estado
                usuario2.fec_cambio = this.solicitud.usuario2.fec_cambio
                usuario2.cod_causal = this.solicitud.usuario2.cod_causal
                usuario2.txt_comentario_causal = this.solicitud.usuario2.txt_comentario_causal
                usuario2.tecnologiaNoOfertada = this.solicitud.usuario2.tecnologiaNoOfertada
                if (this.solicitud.usuario2.tecnologiaNoOfertada) {this.tecNoOfertada = this.solicitud.usuario2.tecnologiaNoOfertada.map(item => item.solicitudTecnologia)}
                usuario2.fotos = this.solicitud.usuario2.fotos
                usuario2.archivoHogarEmancipado = this.solicitud.usuario2.archivoHogarEmancipado
                usuario2.actividadesProductivas = this.solicitud.usuario2.actividadesProductivas
                this.solUsuario2 = usuario2
            }
            if (this.tipoCambio === 'NU' && this.solUsuario.tecnologiaNoOfertada) {
                this.tecNoOfertada = this.solUsuario.tecnologiaNoOfertada.map(item => item.solicitudTecnologia)
            }
        } else {
            if (this.solicitud && this.solicitud.usuario2) {
                this.solUsuario = this.solicitud.usuario2
            }
        }

        if (this.solUsuario.cod_ubigeo) {this.comunidadNativa = this.ambito.find(item => item.codigo_ubigeo === this.solUsuario.cod_ubigeo)?.comunidadNativa}
        this.inicializaForm()

        if (this.tipoCambio === 'NU') {
            this.edit1 = true
            this.edit2 = true
        }
        if (this.tipoCambio === 'CD') {
            this.edit2 = true
        }
        if (this.tipoCambio === 'RT' || this.tipoCambio === 'RE' || this.tipoCambio === 'CT' ) {
            this.edit3 = true
        }

        if (this.edit2) {
            if (this.solUsuario.fotos) {
                const archivos = await this.dataLocalService.leerArchivosConfig()
                this.fotos = this.solUsuario.fotos
                this.fotos.forEach(item => {
                    const foto = archivos.hogar.find(archivo => archivo.cod_archivo === item.cod_archivo)
                    if (foto) {
                        item.flg_georeferencia = foto.flg_georeferencia
                        item.tip_carga = foto.tip_carga
                        item.txt_valor = foto.txt_valor
                        item.flagCargando = false
                    }
                })
            } else {
                const archivos = await this.dataLocalService.leerArchivosConfig()
                this.fotos = archivos.hogar
                if (this.usuario.fotos && this.solicitud.tip_cambio === 'CD') {
                    this.fotos.forEach(item => {
                        const foto = this.usuario.fotos.find(archivo => archivo.cod_archivo === item.cod_archivo)
                        if (foto) {
                            item.nid_archivo = foto.nid_archivo
                            item.fec_archivo = foto.fec_archivo
                            item.num_latitud = foto.num_latitud
                            item.num_longitud = foto.num_longitud
                        }
                    })
                }
            }
            if (this.solicitud.tip_cambio === 'CT') {
                this.fotos = this.fotos.filter(item => item.txt_valor === 'CT')
            }
            if (this.proyecto.nid_sub_tipo_proyecto === 107 || this.proyecto.nid_sub_tipo_proyecto === 117 || (this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF')) {
                this.fotos = this.fotos.filter(item => item.cod_archivo !== '0011')
            }
            if (this.proyecto.nid_sub_tipo_proyecto === 112) {
                this.fotos = this.fotos.filter(item => !(item.cod_archivo === '0009' || item.cod_archivo === '0010'))
            }
            if (this.proyecto.nid_sub_tipo_proyecto === 116) {
                this.fotos = this.fotos.filter(item => (item.cod_archivo === '0009' || item.cod_archivo === '0010'))
            }
            if (this.usuario.miembros) {this.integrantes = this.usuario.miembros.filter(item => item.txt_documento_identidad != this.usuario.txt_documento_identidad && this.calcularEdad(item.fec_nacimiento) > 13)}
        }
        
        if (this.edit1) {
            if (this.solUsuario.fec_nacimiento) {this.evaluarMenorEdad(this.solUsuario.fec_nacimiento)}
            this.archivoHogarEmancipado = this.solUsuario.archivoHogarEmancipado
            if (!this.archivoHogarEmancipado) {
                const archivos = await this.dataLocalService.leerArchivosConfig()
                this.archivoHogarEmancipado = archivos.hogarEmancipado
            }
        }

        if (!this.solicitud.nid_funcion_solicita) {
            const user = await this.dataLocalService.leerUser()
            const funcion = await this.dataLocalService.leerFuncion()
            // this.solicitud.cod_zonal_solicitud = this.proyecto.cod_zonal_ubicacion
            this.solicitud.nid_personal_solicita = user.nidPersonal
            this.solicitud.nid_funcion_solicita = funcion.nid_funcion
        }
        console.log('edit 1 2 3 :>> ', this.edit1, this.edit2, this.edit3);
    }

    // cambio toda la funcion
    inicializaForm() {
        if (this.solUsuario) {
            this.fechaNacimiento = this.solUsuario.fec_nacimiento
            this.fechaInicio = this.solUsuario.fec_inicio
            this.fechaCambio = this.solUsuario.fec_cambio
            this.solicitudForm = this.formBuilder.group({
                tip_documento_identidad: [this.solUsuario.tip_documento_identidad, [Validators.required]],
                txt_documento_identidad: [this.solUsuario.txt_documento_identidad, [Validators.required, Validators.minLength(8), Validators.maxLength(11), Validators.pattern('^[0-9]*$')]],
                txt_apellido_paterno: [this.solUsuario.txt_apellido_paterno],
                txt_apellido_materno: [this.solUsuario.txt_apellido_materno],
                txt_nombres: [this.solUsuario.txt_nombres, [Validators.required]],
                tip_sexo: [this.solUsuario.tip_sexo, [Validators.required]],
                fec_nacimiento: [this.solUsuario.fec_nacimiento, [Validators.required]],
                txt_domicilio: [this.solUsuario.txt_domicilio],
                cod_ubigeo: [this.solUsuario.cod_ubigeo, [Validators.required]],
                nid_comunidad_nativa: [this.solUsuario.nid_comunidad_nativa],
                txt_telefono: [this.solUsuario.txt_telefono, [Validators.minLength(9), Validators.maxLength(9), Validators.pattern('^[0-9]*$')]],
                fec_inicio: [this.solUsuario.fec_inicio],
                fec_cambio: [this.solUsuario.fec_cambio],
                cod_causal: [this.solUsuario.cod_causal],
                txt_comentario_causal: [this.solUsuario.txt_comentario_causal],
                nid_integrante: [this.solUsuario.nid_integrante],
                txt_traslado: [this.solUsuario.txt_traslado]
            })
        }
    
        if (this.tipoCambio === 'CT' || this.tipoCambio === 'RE' || this.tipoCambio === 'RT') {
            this.solicitudForm.get('fec_cambio').setValidators([Validators.required]);
            this.solicitudForm.get('txt_telefono').setValidators(null);
        }
        if (this.tipoCambio === 'IR' || this.tipoCambio === 'IT') {
            this.solicitudForm.get('txt_telefono').setValidators(null);
        }
        if (this.tipoCambio === 'RE' || this.tipoCambio === 'RT') {
            this.solicitudForm.get('fec_cambio').setValidators([Validators.required]);
        }

        this.solicitudForm.get('fec_nacimiento').valueChanges.subscribe(valor => {
            console.log('valor :>> ', valor);
            this.evaluarMenorEdad(valor)
            this.fechaNacimiento = valor
            console.log('this.fechaNacimiento :>> ', this.fechaNacimiento);
        })

        this.solicitudForm.get('cod_ubigeo').valueChanges.subscribe(valor => {
            this.comunidadNativa = this.ambito.find(item => item.codigo_ubigeo === valor).comunidadNativa || []
            if (this.comunidadNativa && this.comunidadNativa.length === 1) {
                this.solicitudForm.get('nid_comunidad_nativa').setValue(this.comunidadNativa[0].nid_comunidad_nativa)    
            } else {
                this.solicitudForm.get('nid_comunidad_nativa').setValue(null)
            }
        })

        this.solicitudForm.get('nid_integrante').valueChanges.subscribe(valor => {
            const integrante = this.integrantes.find(item => item.nid_identificador === valor)
            console.log('integrante.tip_documento_identidad :>> ', integrante.tip_documento_identidad);
            this.solicitudForm.get('tip_documento_identidad').setValue(integrante.tip_documento_identidad === '01' ? 'D' : (integrante.tip_documento_identidad === '02' ? '2': null))
            this.solicitudForm.get('txt_documento_identidad').setValue(integrante.txt_documento_identidad)
            this.solicitudForm.get('txt_apellido_paterno').setValue(integrante.txt_apellido_paterno)
            this.solicitudForm.get('txt_apellido_materno').setValue(integrante.txt_apellido_materno)
            this.solicitudForm.get('txt_nombres').setValue(integrante.txt_nombres)
            this.solicitudForm.get('tip_sexo').setValue(integrante.tip_sexo === '01' ? 'M' : 'F')
            this.solicitudForm.get('fec_nacimiento').setValue(integrante.fec_nacimiento)
            this.solicitudForm.get('txt_telefono').setValue(integrante.txt_celular)
        })

        this.solicitudForm.get('fec_inicio').valueChanges.subscribe(valor => {this.fechaInicio = valor})
        this.solicitudForm.get('fec_cambio').valueChanges.subscribe(valor => {this.fechaCambio = valor})
    }

    async nuevoUsuario() {
        const modal = await this.modalController.create({
            component: UsuarioSolicitudPage,
            componentProps: {
                usuario: this.usuario,
                solicitud: this.solicitud,
                proyecto: this.proyecto,
                cambio: {tip_cambio: 'NU', txt_tipo_cambio: this.cambio.txt_tipo_cambio},
                nuevo: false,
                usuario1: false,
                ambito: this.ambito,
                proyectosNec: this.proyectosNec
            }
        })

        await modal.present();
        const { data } = await modal.onDidDismiss()
        if (data) {
            console.log('data nuevoUsuario:>> ', data);
            this.solicitud.usuario2 = data
            // if (data.integrantes) {this.usuario.integrantes = data.integrantes}
        }
    }

    async abrirTecnologias() {
        if (this.solicitud.tip_cambio !== 'NU' && !this.solicitud.usuario2) {
            await this.uiService.alertaInformativa('Falta registrar los datos del nuevo usuario.')
            return
        }
        let tecnologiaNoOfertada: Tecnologia[] = []
        if (this.tipoCambio === 'NU' && this.solUsuario.tecnologiaNoOfertada) {
            tecnologiaNoOfertada = this.solUsuario.tecnologiaNoOfertada
        }
        if (this.tipoCambio !== 'NU' && this.solicitud.usuario2.tecnologiaNoOfertada) {
            tecnologiaNoOfertada = this.solicitud.usuario2.tecnologiaNoOfertada
        }
        const modal = await this.modalController.create({
            component: TecnologiasPage,
            componentProps: {
                usuario: this.usuario,
                nuevoUsuario: true,
                tecnologiaNoOfertada,
                fechaInicio: this.proyecto.fec_inicio
            }
        })
        await modal.present()
        const { data } = await modal.onDidDismiss()
        if (data) {
            this.modificado = data.modificado
            if (this.tipoCambio === 'NU') {
                this.solUsuario.tecnologiaNoOfertada = data.tecNoOfer
            } else {
                this.solicitud.usuario2.tecnologiaNoOfertada = data.tecNoOfer
            }
        }
    }

    async fichaVivienda() {
        console.log('this.solicitud :>> ', this.solicitud);
        if (this.solicitud.tip_cambio !== 'NU' && !this.solicitud.usuario2) {
            await this.uiService.alertaInformativa('Falta registrar los datos del nuevo usuario.')
            return
        }
        const parametros = await this.dataLocalService.leerUsuariosParametro()
        const modal = await this.modalController.create({
            component: UsuarioFichaPage,
            componentProps: {
                proyecto: this.proyecto,
                usuario: this.usuario,
                consulta: this.solicitud.est_solicitud === 'E' ? true : false,
                nuevoUsuario: true,
                fichaText: this.solicitud.usuario2.ficha ? JSON.stringify(this.solicitud.usuario2.ficha) : null,
                parametros
            }
        })
        await modal.present()
        const { data } = await modal.onDidDismiss()
        if (data) {
            console.log('data ficha :>> ', data);
            this.solicitud.usuario2.ficha = data
        }
    }

    async fichaMujer() {
        console.log('fichaMujer: this.solicitud :>> ', this.solicitud);
        if (this.solicitud.tip_cambio !== 'NU' && !this.solicitud.usuario2) {
            await this.uiService.alertaInformativa('Falta registrar los datos del nuevo usuario.')
            return
        }
        const modal = await this.modalController.create({
            component: UsuarioFichaMujerPage,
            componentProps: {
                usuario: this.usuario,
                esSolicitudCambio: true,
                fichaText: this.solicitud.usuario2.fichaMujer ? JSON.stringify(this.solicitud.usuario2.fichaMujer) : null
            }
        })
        await modal.present()
        const { data } = await modal.onDidDismiss()
        if (data) {
            console.log('fichaMujer: data ficha :>> ', data);
            this.solicitud.usuario2.fichaMujer = data
        }
    }

    async actividadesProd() {
        console.log('this.solicitud :>> ', this.solicitud);
        if (this.solicitud.tip_cambio !== 'NU' && !this.solicitud.usuario2) {
            await this.uiService.alertaInformativa('Falta registrar los datos del nuevo usuario.')
            return
        }
        // if (!this.solicitud.usuario2.actividadesProductivas) {this.solicitud.usuario2.actividadesProductivas = []}
        const modal = await this.modalController.create({
            component: ActividadProdListPage,
            componentProps: {
                usuario: this.usuario,
                consulta: this.solicitud.est_solicitud === 'E' ? true : false,
                nuevoUsuario: true,
                actividadesProductivas: this.solicitud.usuario2.actividadesProductivas ? this.solicitud.usuario2.actividadesProductivas : []
            }
        })
        await modal.present()
        const { data } = await modal.onDidDismiss()
        if (data) {
            console.log('data :>> ', data);
            this.solicitud.usuario2.actividadesProductivas = data
        }
    }

    async abrirIntegrantes() {
        console.log('this.solicitud :>> ', this.solicitud);
        if (this.solicitud.tip_cambio !== 'NU' && !this.solicitud.usuario2) {
            await this.uiService.alertaInformativa('Falta registrar los datos del nuevo usuario.')
            return
        }
        // if (!this.solicitud.usuario2.actividadesProductivas) {this.solicitud.usuario2.actividadesProductivas = []}
        const modal = await this.modalController.create({
            component: MiembroListPage,
            componentProps: {
                usuario: this.usuario,
                consulta: this.solicitud.est_solicitud === 'E' ? true : false,
                nuevoUsuario: true,
                miembros: this.solicitud.usuario2.miembros ? this.solicitud.usuario2.miembros : []
            }
        })
        await modal.present()
        const { data } = await modal.onDidDismiss()
        if (data) {
            // this.modificado = data.modificado
            console.log('data :>> ', data);
            this.solicitud.usuario2.miembros = data
            // if (this.tipoCambio === 'NU') {
            //     this.solUsuario.tecnologiaNoOfertada = data.tecNoOfer
            // } else {
            //     this.solicitud.usuario2.tecnologiaNoOfertada = data.tecNoOfer
            // }
        }
    }

    // async descargarIntegrantes() {
    //     this.integrantes = await this.sincronizaService.integrantes(this.usuario)
    // }

    // cambio toda la funcion
    async guardar() {
        let respUsuario: Usuario
        const ok = await this.validacionOk()
        if (!ok) { return }

        this.solUsuario.tip_documento_identidad = this.solicitudForm.get('tip_documento_identidad').value
        this.solUsuario.txt_documento_identidad = this.solicitudForm.get('txt_documento_identidad').value
        this.solUsuario.txt_apellido_paterno = this.solicitudForm.get('txt_apellido_paterno').value ? this.solicitudForm.get('txt_apellido_paterno').value.toUpperCase() : undefined
        this.solUsuario.txt_apellido_materno = this.solicitudForm.get('txt_apellido_materno').value ? this.solicitudForm.get('txt_apellido_materno').value.toUpperCase() : undefined
        this.solUsuario.txt_nombres = this.solicitudForm.get('txt_nombres').value.toUpperCase()
        this.solUsuario.tip_sexo = this.solicitudForm.get('tip_sexo').value
        this.solUsuario.fec_nacimiento = this.solicitudForm.get('fec_nacimiento').value
        this.solUsuario.txt_domicilio = this.solicitudForm.get('txt_domicilio').value ? this.solicitudForm.get('txt_domicilio').value.toUpperCase() : undefined
        this.solUsuario.cod_ubigeo = this.solicitudForm.get('cod_ubigeo').value
        this.solUsuario.nid_comunidad_nativa = this.solicitudForm.get('nid_comunidad_nativa').value
        this.solUsuario.txt_telefono = this.solicitudForm.get('txt_telefono').value
        this.solUsuario.fec_inicio = this.solicitudForm.get('fec_inicio').value
        this.solUsuario.fec_cambio = this.solicitudForm.get('fec_cambio').value
        this.solUsuario.cod_causal = this.solicitudForm.get('cod_causal').value
        this.solUsuario.txt_comentario_causal = this.solicitudForm.get('txt_comentario_causal').value
        this.solUsuario.txt_traslado = this.solicitudForm.get('txt_traslado').value
        this.solUsuario.fotos = this.fotos
        if (!this.admiteExtranjeros && !this.solUsuario.tip_documento_identidad) {this.solUsuario.tip_documento_identidad = 'D'}
        this.solUsuario.informacionIncompleta = this.informacionIncompleta()
        if (this.menorEdad) {
            this.solUsuario.archivoHogarEmancipado = this.archivoHogarEmancipado
        } else {
            this.solUsuario.archivoHogarEmancipado = null
        }
        
        if (this.usuario1) {
            this.solicitud.usuario1 = this.solUsuario
            console.log('guardar this.tipoCambio :>> ', this.tipoCambio);
            if (this.tipoCambio === 'NU') {
                this.usuario.codigo_expediente = this.proyecto.codigo_expediente
                this.usuario.tip_documento_identidad = this.solUsuario.tip_documento_identidad
                this.usuario.txt_documento_identidad = this.solUsuario.txt_documento_identidad
                this.usuario.txt_apellido_paterno = this.solUsuario.txt_apellido_paterno
                this.usuario.txt_apellido_materno = this.solUsuario.txt_apellido_materno
                this.usuario.txt_nombres = this.solUsuario.txt_nombres
                if (this.fotos?.length > 0) {
                    const fotoVivienda = this.fotos.find(item => item.cod_archivo === '0010')
                    if (fotoVivienda && fotoVivienda.nueva) {
                        this.usuario.num_latitud = fotoVivienda.num_latitud
                        this.usuario.num_longitud = fotoVivienda.num_longitud
                        this.usuario.observacionGeolocalizacion = await this.evaluaGeolocalizacion(fotoVivienda)
                    }
                }
            }

            console.log('guardar this.solicitud.tip_cambio :>> ', this.solicitud.tip_cambio);
            if (this.solicitud.tip_cambio === 'NU') {
                let index: number
                if (this.usuario.miembros) {
                    index = this.usuario.miembros.findIndex(item => item.flg_titular)
                    // if (index >= 0 && (!this.usuario.miembros[index].flg_cotejo || !(this.usuario.miembros[index].tip_observacion_cotejo === '01' || this.usuario.miembros[index].tip_observacion_cotejo === '07'))) {
                    if (index >= 0) {
                        this.usuario.miembros[index].tip_documento_identidad = this.solUsuario.tip_documento_identidad === '2' ? '02' : '01'
                        this.usuario.miembros[index].txt_documento_identidad = this.solUsuario.txt_documento_identidad
                        this.usuario.miembros[index].txt_apellido_paterno = this.solUsuario.txt_apellido_paterno
                        this.usuario.miembros[index].txt_apellido_materno = this.solUsuario.txt_apellido_materno
                        this.usuario.miembros[index].txt_nombres = this.solUsuario.txt_nombres
                        this.usuario.miembros[index].fec_nacimiento = this.solUsuario.fec_nacimiento
                        this.usuario.miembros[index].tip_sexo = this.solUsuario.tip_sexo === 'M' ? '01' : '02'
                        this.usuario.miembros[index].tip_parentesco = '01'
                        this.usuario.miembros[index].textoParentesco = 'Jefe/Jefa'
                        this.usuario.miembros[index].flg_cotejo = false
                        this.usuario.miembros[index].cambioMiembro = true
                        this.usuario.cambioMiembros = true
                    }
                }
                console.log('this.solUsuario :>> ', this.solUsuario);
                if (!this.usuario.miembros || index < 0) {
                    if (!this.usuario.miembros) {this.usuario.miembros = []}
                    this.usuario.miembros.push({
                        codigo_expediente: this.usuario.codigo_expediente,
                        flg_titular: true,
                        fec_actualizacion: new Date(),
                        tip_nacionalidad: '01',
                        tip_documento_identidad: this.solUsuario.tip_documento_identidad === '2' ? '02' : '01',
                        txt_documento_identidad: this.solUsuario.txt_documento_identidad,
                        txt_apellido_paterno: this.solUsuario.txt_apellido_paterno,
                        txt_apellido_materno: this.solUsuario.txt_apellido_materno,
                        txt_nombres: this.solUsuario.txt_nombres,
                        fec_nacimiento: this.solUsuario.fec_nacimiento,
                        tip_sexo: this.solUsuario.tip_sexo === 'M' ? '01' : '02',
                        tip_parentesco: '01',
                        textoParentesco: 'Jefe/Jefa',
                        flg_cotejo: false,
                        cambioMiembro: true
                    })
                    this.usuario.cambioMiembros = true
                }
            }

            if (this.solicitud.tip_cambio === 'CD') {
                if (this.fotos?.length > 0) {
                    const fotoVivienda = this.fotos.find(item => item.cod_archivo === '0010')
                    if (fotoVivienda && fotoVivienda.nueva) {
                        this.usuario.observacionGeolocalizacion = await this.evaluaGeolocalizacion(fotoVivienda)
                    }
                }
            }

            this.usuario.solicitud = this.solicitud
            this.usuario.solicitud.est_solicitud = 'R'
            this.usuario.solicitud.txt_estado_solicitud = 'Sin enviar'
            this.usuario.solicitudCambioIncompleto = this.evaluarSolicitudIncompleta()
            await this.uiService.presentLoading('Guardando...')
            respUsuario = await this.dataLocalService.guardarUsuario(this.usuario, this.nuevo)
            await this.uiService.dismissLoading()
        } else {
            // let integrantes
            // if (this.integrantes && this.integrantes.length > 0) {integrantes = this.integrantes}
            this.modalController.dismiss(this.solUsuario);
        }
        this.modalController.dismiss(respUsuario);
    }

    async validacionOk() {
        if (this.tipoCambio === 'NU' && this.solicitud.tip_cambio === 'IT' && !this.solicitudForm.get('txt_traslado').value) {
            await this.uiService.alertaInformativa('Falta seleccionar el código del proyecto de procedencia.')
            return false
        }
        // cambio
        if (this.admiteExtranjeros) {
            if (!this.solicitudForm.get('tip_documento_identidad').value) {
                await this.uiService.alertaInformativa('Falta registrar el tipo de documento.')
                return false
            }
            if (!this.solicitudForm.get('txt_documento_identidad').value) {
                await this.uiService.alertaInformativa('Falta registrar el número de documento.')
                return false
            }
            if (this.solicitudForm.get('txt_documento_identidad').value.length > 11) {
                await this.uiService.alertaInformativa('El número de documento no debe exeder de 11 caracteres.')
                return false
            }
        } else {
            if (!this.solicitudForm.get('txt_documento_identidad').value) {
                await this.uiService.alertaInformativa('Falta registrar el número de DNI.')
                return false
            }
            if (this.solicitudForm.get('txt_documento_identidad').value.length !== 8) {
                await this.uiService.alertaInformativa('El DNI debe tener 8 dígitos.')
                return false
            }
        }
        // fin cambio
        if (!this.solicitudForm.get('txt_nombres').value) {
            await this.uiService.alertaInformativa('Falta registrar el nombre del usuario.')
            return false
        }
        if (!this.solicitudForm.get('fec_nacimiento').value) {
            await this.uiService.alertaInformativa('Falta registrar la fecha de nacimiento del usuario.')
            return false
        }
        if (!this.solicitudForm.get('tip_sexo').value) {
            await this.uiService.alertaInformativa('Falta registrar el sexo del usuario.')
            return false
        }
        if (!this.solicitudForm.get('cod_ubigeo').value && this.solicitud.tip_cambio !== 'CT') {
            await this.uiService.alertaInformativa('Falta registrar la ubicación geográfica del usuario.')
            return false
        }
        if (!this.solicitudForm.get('nid_comunidad_nativa').value && (this.solicitud.tip_cambio === 'NU' || this.solicitud.tip_cambio === 'CD') && this.comunidadNativa && this.comunidadNativa.length > 0) {
            await this.uiService.alertaInformativa('Falta seleccionar la comunidad nativa del usuario.')
            return false
        }
        if (this.solicitudForm.get('txt_telefono').value && this.solicitudForm.get('txt_telefono').value.length !== 9) {
            await this.uiService.alertaInformativa('El número de celular debe tener 9 dígitos.')
            return false
        }
        if (this.tipoCambio !== 'NU' && (this.solicitud.tip_cambio === 'CT' || this.solicitud.tip_cambio === 'RE' || this.solicitud.tip_cambio === 'IR' || this.solicitud.tip_cambio === 'IT')) {
            if (!this.solicitud.usuario2) {
                await this.uiService.alertaInformativa('Falta registrar los datos del nuevo usuario.')
                return false
            }
        }
        if ((this.tipoCambio === 'RE' || this.tipoCambio === 'RT') && !this.solicitudForm.get('fec_cambio').value) {
            await this.uiService.alertaInformativa('Falta registrar la fecha de retiro.')
            return false
        }
        return true
    }

    informacionIncompleta() {
        if (!this.edit2 ) {return false}
        if (!this.solUsuario.fotos && this.solicitud.tip_cambio !== 'IT') {return true}
        if (this.solUsuario.fotos && this.solicitud.tip_cambio !== 'IT') {
            for (let index = 0; index < this.solUsuario.fotos.length; index++) {
                if (this.proyecto.nid_sub_tipo_proyecto === 112) {
                    if (this.solUsuario.fotos[index].cod_archivo === '0011' && !this.solUsuario.fotos[index].nueva && !this.solUsuario.fotos[index].enviada && !this.solUsuario.fotos[index].nid_archivo) {return true}
                } else {
                    if (this.proyecto.nid_sub_tipo_proyecto === 116) {
                        if (this.solUsuario.fotos[index].cod_archivo === '0009' && !this.solUsuario.fotos[index].nueva && !this.solUsuario.fotos[index].enviada && !this.solUsuario.fotos[index].nid_archivo) {return true}
                        if (this.solUsuario.fotos[index].cod_archivo === '0010' && !this.solUsuario.fotos[index].nueva && !this.solUsuario.fotos[index].enviada && !this.solUsuario.fotos[index].nid_archivo) {return true}
                    } else {
                        if (!this.solUsuario.fotos[index].nueva && !this.solUsuario.fotos[index].enviada && !this.solUsuario.fotos[index].nid_archivo) {return true}
                    }
                }
            }
        }
        if (this.menorEdad && (!this.solUsuario.archivoHogarEmancipado || this.solUsuario.archivoHogarEmancipado.length !== 1)) {return true}
        if (this.menorEdad && !this.solUsuario.archivoHogarEmancipado[0].nueva && !this.solUsuario.archivoHogarEmancipado[0].enviada && !this.solUsuario.archivoHogarEmancipado[0].nid_archivo) {return true}
        if (this.solUsuario.tecnologiaNoOfertada && this.solUsuario.tecnologiaNoOfertada.length > 0) {
            for (let index = 0; index < this.solUsuario.tecnologiaNoOfertada.length; index++) {
                if (this.solUsuario.tecnologiaNoOfertada[index].cambioIncompleto) {return true}
            }
            return false
        }  
        return false
    }

    evaluarSolicitudIncompleta() {
        if (this.usuario.solicitud.usuario1 && this.usuario.solicitud.usuario1.informacionIncompleta) {return true}
        if (this.usuario.solicitud.usuario2 && this.usuario.solicitud.usuario2.informacionIncompleta) {return true}
        if (this.usuario.solicitud.usuario2 && this.solicitud.usuario2.tecnologiaNoOfertada && this.solicitud.usuario2.tecnologiaNoOfertada.length > 0) {
            for (let index = 0; index < this.solicitud.usuario2.tecnologiaNoOfertada.length; index++) {
                if (this.solicitud.usuario2.tecnologiaNoOfertada[index].cambioIncompleto) {return true}
            }
            return false
        }
        return false
    }

    async salir() {
        let salir = true
        if (this.modificado) {
            await this.uiService.alertaConfirmacion('¿Desea cerrar sin guardar los cambios realizados en tecnologías?').then((resp) => {
                if (!resp) { salir = false }
            })
        }
        if (salir) {
            if (this.usuario1 && this.solUsuario2) {
                if (this.tecNoOfertada) {
                    this.tecNoOfertada.map((item, index) => {
                        if (item) {
                            this.solUsuario2.tecnologiaNoOfertada[index].solicitudTecnologia = item
                        } else {
                            this.solUsuario2.tecnologiaNoOfertada[index].solicitudTecnologia = undefined
                        }
                    })
                } else {
                    this.solUsuario.tecnologiaNoOfertada = undefined
                }
                this.usuario.solicitud.usuario2 = this.solUsuario2
            }

            if (this.usuario1 && this.tipoCambio === 'NU' && this.solUsuario.tecnologiaNoOfertada) {
                if (this.tecNoOfertada) {
                    this.tecNoOfertada.map((item, index) => {
                        if (item) {
                            this.solUsuario.tecnologiaNoOfertada[index].solicitudTecnologia = item
                        } else {
                            this.solUsuario.tecnologiaNoOfertada[index].solicitudTecnologia = undefined
                        }
                    })
                } else {
                    this.solUsuario.tecnologiaNoOfertada = undefined
                }
                if (this.usuario.solicitud.usuario2) {this.usuario.solicitud.usuario2 = this.solUsuario2}
            }

            this.modalController.dismiss();
        }
    }

    evaluarMenorEdad(fechaNacimiento: Date) {
        const edad = this.calcularEdad(fechaNacimiento, this.solicitud.fec_solicitud)

        if (edad < 18) {
            this.menorEdad = true
        } else {
            this.menorEdad = false
        }
    }

    calcularEdad(fechaNacimiento: Date, fechaEvalua?: Date) {
        const nacimiento = new Date(fechaNacimiento)
        const actual = fechaEvalua ? new Date(fechaEvalua) : new Date()
        
        if (actual < new Date(nacimiento.getFullYear(), nacimiento.getMonth(), nacimiento.getDate()) ) {
            console.log('error de fechas')
            return
        }
        let edad: number
        const anhos = actual.getFullYear() - nacimiento.getFullYear()
        if (anhos > 0) {
            if (actual.getMonth() > nacimiento.getMonth()){
                edad = anhos
            } else {
                if (actual.getMonth() === nacimiento.getMonth()){
                    if (actual.getDate() >= nacimiento.getDate()) {
                        edad = anhos
                    } else {
                        edad = anhos - 1
                    }
                } else {
                    edad = anhos - 1
                }
            }
        } else {
            edad = 0
        }
        return edad
    }

    async evaluaGeolocalizacion(fotoVivienda: Archivo) {
        console.log('valida evaluaGeolocalizacion');
        let observacion = ''
        console.log('fotoVivienda.num_latitud :>> ', fotoVivienda.num_latitud);
        console.log('fotoVivienda.num_longitud :>> ', fotoVivienda.num_longitud);
        const usuarios = await this.dataLocalService.leerUsuariosProyecto(this.usuario.codigo_expediente)
        for (let index = 0; index < usuarios.length; index++) {
            if (usuarios[index].id != this.usuario.id) {
                console.log('usuarios[index].num_latitud :>> ', usuarios[index].num_latitud);
                if (this.redondear(usuarios[index].num_latitud) === this.redondear(fotoVivienda.num_latitud) && this.redondear(usuarios[index].num_longitud) === this.redondear(fotoVivienda.num_longitud)) {
                    observacion = observacion + ', '+usuarios[index].txt_documento_identidad
                }
            }
        }
        if (observacion.length > 0) {
            observacion = '- Geolocalización de la vivienda duplicada con el/los usuario(s) con DNI ' + observacion.substring(2)
        }
        return observacion
    }

    redondear(numero) {
        return Math.round(numero * 100000)/100000
    }
}
