import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, PopoverController } from '@ionic/angular';
import { MultipleSelectComponent } from '../../components/generales/multiple-select/multiple-select.component';
import { DataLocalService } from '../../services/data-local.service';
import { UiServiceService } from '../../services/ui-service.service';
import { Miembro, Usuario, UsuarioParametro } from '../../model/usuarios';
import { Tipo } from '../../model/generales';

@Component({
    selector: 'app-miembro-edit',
    templateUrl: './miembro-edit.page.html',
    styleUrls: ['./miembro-edit.page.scss'],
})
export class MiembroEditPage implements OnInit {

    @Input() usuario: Usuario
    @Input() miembrosList: Miembro[]
    @Input() miembro: Miembro = {}
    @Input() parametros: UsuarioParametro
    @Input() nuevo = false
    @Input() consulta = false
    @Input() nuevoUsuario = false
    miembroForm: FormGroup
    edad: number
    fecha: Date
    cotejo = false
    sinCotejar = false
    editCotejo = true
    observacion = ''
    fechaNacimiento: Date

    parentesco: Tipo[] = []
    meses: Tipo[] = []
    lengua: Tipo[] = []
    gradoInstruccion: Tipo[] = []
    grados: Tipo[] = []
    estadoCivil: Tipo[] = []
    etnia: Tipo[] = []
    ocupacion: Tipo[] = []
    
    discapacidad: any
    programaSocial: any
    ingresos: any

    flagNacionalidad = false
    flagParentesco = false
    flagAusenta = false
    flagIdioma = false
    flagOtraLengua = false
    flagEtnia = false
    flagEtniaAndina = false
    flagEtniaAmazonica = false
    flagOcupacion = false
    flagEducacion = false
    
    actualizaFecha = false

    constructor(private formBuilder: FormBuilder,
        private modalController: ModalController,
        public popoverController: PopoverController,
        private dataLocalService: DataLocalService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        console.log('this.consulta :>> ', this.consulta);
        if (this.nuevo) {
            this.miembro = {}
            this.miembro.codigo_expediente = this.usuario.codigo_expediente
            if (!this.nuevoUsuario) {this.miembro.nid_personal_proyecto = this.usuario.nid_personal_proyecto}
            this.miembro.fec_actualizacion = new Date()
        }
        this.fecha = new Date(this.miembro.fec_actualizacion)

        const hoy = new Date()
        const fechaCompara = new Date(hoy.getTime() - (365 * 8 * 24 * 60 * 60 * 1000))
        if (this.fecha < fechaCompara ) {this.actualizaFecha = true}
        
        this.parentesco = this.parametros.parentesco
        this.meses = this.parametros.meses
        this.lengua = this.parametros.lengua
        this.gradoInstruccion = this.parametros.gradoInstruccion
        this.estadoCivil = this.parametros.estadoCivil
        this.etnia = this.parametros.etnia
        this.ocupacion = this.parametros.ocupacion
        
        if (this.consulta) {
            if (!this.miembro.flg_ficha_completa || this.miembro.txt_observacion) {this.consulta = false}
        }

        this.inicializaForm()
        if (this.miembro.tip_nacionalidad === '02') {this.flagNacionalidad = true}
        if (this.miembro.tip_parentesco === '07' || this.miembro.tip_parentesco === '10') {this.flagParentesco = true}
        if (this.miembro.tip_ausente_hogar === '01') {this.flagAusenta = true}
        if (this.miembro.tip_idioma_materna === '09' ) {this.flagOtraLengua = true}
        if (this.miembro.tip_idioma_materna === '12') {this.flagIdioma = true}
        if (this.miembro.tip_etnia_identidad === '03' ) {this.flagEtniaAmazonica = true}
        if (this.miembro.tip_etnia_identidad === '04' ) {this.flagEtniaAndina = true}
        if (this.miembro.tip_etnia_identidad === '99') {this.flagEtnia = true}
        if (this.miembro.tip_ocupacion === '99') {this.flagOcupacion = true}
        if (this.miembro.tip_grado_instruccion === '13' || this.miembro.tip_grado_instruccion === '03' || this.miembro.tip_grado_instruccion === '05') {this.flagEducacion = true}
        if (this.miembro.tip_grado_instruccion === '13') {this.grados = this.parametros.inicial}
        if (this.miembro.tip_grado_instruccion === '03') {this.grados = this.parametros.primaria}
        if (this.miembro.tip_grado_instruccion === '05') {this.grados = this.parametros.secundaria}
        if (this.miembro.tip_documento_identidad === '01') {this.cotejo = true}
        if (this.cotejo && this.miembro.tip_observacion_cotejo && ('01,04'.includes(this.miembro.tip_observacion_cotejo))) {this.editCotejo = false}
        this.calcularEdad(this.miembro.fec_nacimiento)
        this.discapacidad = this.procesaRespMultipe(this.parametros.discapacidad, this.miembro.tip_txt_discapacidad, this.miembro.txt_discapacidad, '11. ¿Presenta algún tipo de discapacidad permanente que le impida o dificulte desarrollarse normalmente en sus actividades diarias?', 1)
        this.programaSocial = this.procesaRespMultipe(this.parametros.programaSocial, this.miembro.tip_txt_lista_ps, this.miembro.txt_programa_social, '12. ¿Pertenece en la actualidad a algún programa social?', 1)
        this.ingresos = this.procesaRespMultipe(this.parametros.ingresos, this.miembro.tip_txt_lista_ingreso, this.miembro.txt_ingreso, '18. ¿Cuáles son las fuentes de ingresos monetarios para cubrir los gastos del hogar y cuánto recibió por cada una (mensual)?', 2, this.miembro.txt_imp_ingreso)
    }

    inicializaForm() {
        this.fechaNacimiento = this.miembro.fec_nacimiento
        this.miembroForm = this.formBuilder.group({
            txt_apellido_paterno: [this.miembro.txt_apellido_paterno],
            txt_apellido_materno: [this.miembro.txt_apellido_materno],
            txt_nombres: [this.miembro.txt_nombres, [Validators.required]],
            tip_nacionalidad: [this.miembro.tip_nacionalidad, [Validators.required]],
            txt_nacionalidad: [this.miembro.txt_nacionalidad],
            tip_documento_identidad: [this.miembro.tip_documento_identidad, [Validators.required]],
            txt_documento_identidad: [this.miembro.txt_documento_identidad],
            fec_nacimiento: [this.miembro.fec_nacimiento, [Validators.required]],
            tip_sexo: [this.miembro.tip_sexo, [Validators.required]],
            tip_parentesco: [this.miembro.tip_parentesco, [Validators.required]],
            txt_parentesco: [this.miembro.txt_parentesco],
            tip_ausente_hogar: [this.miembro.tip_ausente_hogar],
            txt_mes_inicio: [this.miembro.txt_mes_inicio],
            txt_mes_fin: [this.miembro.txt_mes_fin],
            tip_txt_discapacidad: [this.miembro.tip_txt_discapacidad],
            txt_discapacidad: [this.miembro.txt_discapacidad],
            tip_txt_lista_ps: [this.miembro.tip_txt_lista_ps],
            txt_programa_social: [this.miembro.txt_programa_social],
            tip_idioma_materna: [this.miembro.tip_idioma_materna],
            txt_idioma: [this.miembro.txt_idioma],
            tip_otra_lengua: [this.miembro.tip_otra_lengua],
            tip_grado_instruccion: [this.miembro.tip_grado_instruccion],
            tip_grado_estudio: [this.miembro.tip_grado_estudio],
            tip_estado_civil: [this.miembro.tip_estado_civil],
            tip_etnia_identidad: [this.miembro.tip_etnia_identidad],
            txt_etnia_identidad: [this.miembro.txt_etnia_identidad],
            tip_otra_etnia: [this.miembro.tip_otra_etnia],
            tip_ocupacion: [this.miembro.tip_ocupacion],
            txt_ocupacion: [this.miembro.txt_ocupacion],
            tip_txt_lista_ingreso: [this.miembro.tip_txt_lista_ingreso],
            txt_ingreso: [this.miembro.txt_ingreso],
        })
    
        this.miembroForm.get('tip_nacionalidad').valueChanges.subscribe(valor => {if (valor === '02') {
            this.flagNacionalidad = true
        } else {
            this.flagNacionalidad = false
            this.miembroForm.get('txt_nacionalidad').setValue(null)
        }})
        this.miembroForm.get('tip_parentesco').valueChanges.subscribe(valor => {if (valor === '07' || valor === '10') {
            this.flagParentesco = true
        } else {
            this.flagParentesco = false
            this.miembroForm.get('txt_parentesco').setValue(null)
        }})
        this.miembroForm.get('tip_ausente_hogar').valueChanges.subscribe(valor => {if (valor === '01') {
            this.flagAusenta = true
        } else {
            this.flagAusenta = false
            this.miembroForm.get('txt_mes_inicio').setValue(null)
            this.miembroForm.get('txt_mes_fin').setValue(null)
        }})
        this.miembroForm.get('tip_idioma_materna').valueChanges.subscribe(valor => {
            console.log('valor :>> ', valor);
            if (valor === '09') {
                this.flagOtraLengua = true
                this.flagIdioma = false
                this.miembroForm.get('txt_idioma').setValue(null)
            }
            if (valor === '12') {
                this.flagIdioma = true
                this.flagOtraLengua = false
            }
            if (valor != '09' && valor != '12') {
                this.flagIdioma = false
                this.flagOtraLengua = false
                this.miembroForm.get('txt_idioma').setValue(null)
            }
            console.log('this.flagIdioma, this.flagOtraLengua :>> ', this.flagIdioma, this.flagOtraLengua);
        })
        this.miembroForm.get('tip_etnia_identidad').valueChanges.subscribe(valor => {
            console.log('valor Etnia:>> ', valor);
            if (valor === '03') {
                this.flagEtniaAmazonica = true
                this.flagEtniaAndina = false
                this.flagEtnia = false
                this.miembroForm.get('tip_otra_etnia').setValue(null)
                this.miembroForm.get('txt_etnia_identidad').setValue(null)
            }
            if (valor === '04') {
                this.flagEtniaAmazonica = false
                this.flagEtniaAndina = true
                this.flagEtnia = false
                this.miembroForm.get('tip_otra_etnia').setValue(null)
                this.miembroForm.get('txt_etnia_identidad').setValue(null)
            }
            if (valor === '99') {
                this.flagEtniaAmazonica = false
                this.flagEtniaAndina = false
                this.flagEtnia = true
                this.miembroForm.get('tip_otra_etnia').setValue(null)
            }
            if (valor != '03' && valor != '04' && valor != '99') {
                this.flagEtniaAmazonica = false
                this.flagEtniaAndina = false
                this.flagEtnia = false
                this.miembroForm.get('tip_otra_etnia').setValue(null)
                this.miembroForm.get('txt_etnia_identidad').setValue(null)
            }
            console.log('this.flagEtniaAmazonica, this.flagEtniaAndina, this.flagEtnia :>> ', this.flagEtniaAmazonica, this.flagEtniaAndina, this.flagEtnia);
        })
        this.miembroForm.get('tip_ocupacion').valueChanges.subscribe(valor => {if (valor === '99') {
            this.flagOcupacion = true
        } else {
            this.flagOcupacion = false
            this.miembroForm.get('txt_ocupacion').setValue(null)
        }})
        this.miembroForm.get('tip_grado_instruccion').valueChanges.subscribe(valor => {
            if (valor !== '13' && valor !== '03' && valor !== '05') {
                this.flagEducacion = false
            } else {
                this.flagEducacion = true
                this.miembroForm.get('tip_grado_estudio').setValue(null)
            }
            if (valor === '13') {this.grados = this.parametros.inicial}
            if (valor === '03') {this.grados = this.parametros.primaria}
            if (valor === '05') {this.grados = this.parametros.secundaria}
        })

        this.miembroForm.get('fec_nacimiento').valueChanges.subscribe(valor => {
            this.calcularEdad(valor)
            this.fechaNacimiento = valor
        })

        this.miembroForm.get('tip_documento_identidad').valueChanges.subscribe(valor => {
            if (valor == '01') {
                this.cotejo = true
                this.sinCotejar = true
            } else {
                this.cotejo = false
            } 
        })
        this.miembroForm.get('txt_documento_identidad').valueChanges.subscribe(valor => {if (this.cotejo) { this.sinCotejar = true}})
        this.miembroForm.get('txt_apellido_paterno').valueChanges.subscribe(valor => {if (this.cotejo) { this.sinCotejar = true}})
        this.miembroForm.get('txt_apellido_materno').valueChanges.subscribe(valor => {if (this.cotejo) { this.sinCotejar = true}})
        this.miembroForm.get('txt_nombres').valueChanges.subscribe(valor => {if (this.cotejo) { this.sinCotejar = true}})
        this.miembroForm.get('fec_nacimiento').valueChanges.subscribe(valor => {if (this.cotejo) { this.sinCotejar = true}})
        this.miembroForm.get('tip_sexo').valueChanges.subscribe(valor => {if (this.cotejo) { this.sinCotejar = true}})

    }

    actualizarFecha() {
        this.fecha = new Date()
        this.calcularEdad(this.miembroForm.get('fec_nacimiento').value)
    }

    procesaRespMultipe(opciones, respuestas, otro, pregunta, columnas, datos?) {
        let lista = []
        let flagOtro = false
        let total = 0
        if (respuestas) {
            for (let index = 0; index < respuestas.length; index++) {
                const fila = opciones.findIndex(item => item.cod_tipo === respuestas[index])
                if (fila >= 0) {
                    lista.push({
                        dato1: opciones[fila].txt_tipo,
                        dato2: datos ? datos[index] : null
                    })
                }
            }
            if (datos && datos.length > 0) {datos.forEach(item => {total = total + (item ? item : 0)})}
            if (respuestas.includes('99')) {
                flagOtro = true
                lista.push({dato1: otro, dato2: null})
            }
        }

        const parametros = {pregunta, opciones, respuestas, lista, flagOtro, otro, columnas, datos, total }
        return parametros
    }

    async abrirMultipleSelect(parametros) {
        if (this.consulta) {return}
        const popover = await this.popoverController.create({
            component: MultipleSelectComponent,
            cssClass: 'custom-modal-select',
            translucent: true,
            componentProps: {
                parametros
            }
        });
        await popover.present();
        const { data } = await popover.onDidDismiss();
    }

    async guardar() {
        const ok = await this.validacionOk()
        if (!ok) { return }

        this.miembro.fec_actualizacion = this.fecha
        this.miembro.txt_apellido_paterno = this.miembroForm.get('txt_apellido_paterno').value ? this.miembroForm.get('txt_apellido_paterno').value.toUpperCase() : undefined
        this.miembro.txt_apellido_materno = this.miembroForm.get('txt_apellido_materno').value ? this.miembroForm.get('txt_apellido_materno').value.toUpperCase() : undefined
        this.miembro.txt_nombres = this.miembroForm.get('txt_nombres').value ? this.miembroForm.get('txt_nombres').value.toUpperCase() : undefined
        this.miembro.tip_nacionalidad = this.miembroForm.get('tip_nacionalidad').value
        this.miembro.txt_nacionalidad = this.miembroForm.get('txt_nacionalidad').value
        this.miembro.tip_documento_identidad = this.miembroForm.get('tip_documento_identidad').value
        this.miembro.txt_documento_identidad = this.miembroForm.get('txt_documento_identidad').value
        this.miembro.fec_nacimiento = this.miembroForm.get('fec_nacimiento').value
        this.miembro.tip_sexo = this.miembroForm.get('tip_sexo').value
        this.miembro.tip_parentesco = this.miembroForm.get('tip_parentesco').value
        this.miembro.txt_parentesco = this.miembroForm.get('txt_parentesco').value
        if (this.miembro.tip_parentesco) {this.miembro.textoParentesco = this.parentesco.find(value => value.cod_tipo === this.miembro.tip_parentesco).txt_tipo}
        this.miembro.tip_ausente_hogar = this.miembroForm.get('tip_ausente_hogar').value
        this.miembro.txt_mes_inicio = this.miembroForm.get('txt_mes_inicio').value
        this.miembro.txt_mes_fin = this.miembroForm.get('txt_mes_fin').value
        this.miembro.tip_txt_discapacidad = this.discapacidad.respuestas
        this.miembro.txt_discapacidad = this.discapacidad.otro
        this.miembro.tip_txt_lista_ps = this.programaSocial.respuestas
        this.miembro.txt_programa_social = this.programaSocial.otro

        if (this.edad >= 3) {
            this.miembro.tip_idioma_materna = this.miembroForm.get('tip_idioma_materna').value
            this.miembro.tip_otra_lengua = this.miembroForm.get('tip_otra_lengua').value
            this.miembro.txt_idioma = this.miembroForm.get('txt_idioma').value
            this.miembro.tip_grado_instruccion = this.miembroForm.get('tip_grado_instruccion').value
            this.miembro.tip_grado_estudio = this.miembroForm.get('tip_grado_estudio').value
        }
        if (this.edad >= 12) {
            this.miembro.tip_estado_civil = this.miembroForm.get('tip_estado_civil').value
            this.miembro.tip_etnia_identidad = this.miembroForm.get('tip_etnia_identidad').value
            this.miembro.txt_etnia_identidad = this.miembroForm.get('txt_etnia_identidad').value
            this.miembro.tip_otra_etnia = this.miembroForm.get('tip_otra_etnia').value
        }
        if (this.edad >= 14) {
            this.miembro.tip_ocupacion = this.miembroForm.get('tip_ocupacion').value
            this.miembro.txt_ocupacion = this.miembroForm.get('txt_ocupacion').value
            this.miembro.tip_txt_lista_ingreso = this.ingresos.respuestas
            this.miembro.txt_ingreso  = this.ingresos.otro
            this.miembro.txt_imp_ingreso = this.ingresos.datos
        }
        if (this.miembro.tip_nacionalidad !== '02') {this.miembro.txt_nacionalidad = null}
        if (this.miembro.tip_parentesco !== '07' && this.miembro.tip_parentesco !== '10') {this.miembro.txt_parentesco = null}
        if (this.miembro.tip_ausente_hogar !== '01') {
            this.miembro.txt_mes_inicio = null
            this.miembro.txt_mes_fin = null
        }
        if (this.miembro.tip_idioma_materna !== '09') {this.miembro.tip_otra_lengua = null}
        if (this.miembro.tip_idioma_materna !== '12') {this.miembro.txt_idioma = null}
        if (this.miembro.tip_grado_instruccion !== '13' && this.miembro.tip_grado_instruccion !== '03' && this.miembro.tip_grado_instruccion !== '05') {this.miembro.tip_grado_estudio = null}
        if (this.miembro.tip_etnia_identidad !== '03' && this.miembro.tip_etnia_identidad !== '04' ) {this.miembro.tip_otra_etnia = null}
        if (this.miembro.tip_etnia_identidad !== '99') {this.miembro.txt_etnia_identidad = null}
        if (this.miembro.tip_ocupacion !== '99') {this.miembro.txt_ocupacion = null}

        if (this.sinCotejar) {this.miembro.flg_cotejo = false}
        this.miembro.cambioMiembro = true
        this.miembro.flg_ficha_completa = !this.informacionIncompleta()

        if (this.nuevo) {
            if (!this.miembrosList) {this.miembrosList = []}
            this.miembrosList.push(this.miembro)
        }

        if (this.nuevoUsuario) {
            this.modalController.dismiss(this.miembrosList)
        } else {
            this.usuario.miembros = this.miembrosList
            this.usuario.cambioMiembros = true
            this.usuario.miembrosIncompleto = this.evaluarUsuarioIncompleto()

            await this.uiService.presentLoading('Guardando...')
            await this.dataLocalService.guardarUsuario(this.usuario, false)
            await this.uiService.dismissLoading()
            this.modalController.dismiss();
        }
    }

    async validacionOk() {
        if (!this.miembroForm.get('tip_documento_identidad').value) {
            await this.uiService.alertaInformativa('Falta registrar el tipo de documento.')
            return false
        }
        if (this.miembroForm.get('tip_documento_identidad').value !== '00' && !this.miembroForm.get('txt_documento_identidad').value) {
            await this.uiService.alertaInformativa('Falta registrar el número de documento de identidad.')
            return false
        }
        if (this.miembroForm.get('tip_documento_identidad').value === '01' && this.miembroForm.get('txt_documento_identidad').value.length !== 8) {
            await this.uiService.alertaInformativa('El DNI debe tener 8 dígitos.')
            return false
        }
        if (!this.miembroForm.get('txt_nombres').value) {
            await this.uiService.alertaInformativa('Falta registrar el nombre del integrante.')
            return false
        }
        if (!this.miembroForm.get('fec_nacimiento').value) {
            await this.uiService.alertaInformativa('Falta registrar la fecha de nacimiento del integrante.')
            return false
        }
        if (!this.miembroForm.get('tip_sexo').value) {
            await this.uiService.alertaInformativa('Falta registrar el sexo del integrante.')
            return false
        }
        return true
    }

    informacionIncompleta() {
        if (!this.miembro.tip_nacionalidad) {return true}
        if (this.miembro.tip_nacionalidad === '02' && !this.miembro.txt_nacionalidad) {return true}
        if (!this.miembro.tip_parentesco) {return true}
        if ((this.miembro.tip_parentesco === '07'|| this.miembro.tip_parentesco === '10') && !this.miembro.txt_parentesco) {return true}
        if (!this.miembro.tip_ausente_hogar) {return true}
        if (this.miembro.tip_ausente_hogar === '01' && (!this.miembro.txt_mes_inicio || !this.miembro.txt_mes_fin)) {return true}
        if (!this.miembro.tip_txt_discapacidad) {return true}
        if (this.miembro.tip_txt_discapacidad.includes('99') && !this.miembro.txt_discapacidad) {return true}
        if (!this.miembro.tip_txt_lista_ps) {return true}
        if (this.miembro.tip_txt_lista_ps.includes('99') && !this.miembro.txt_programa_social) {return true}
        if (this.edad >= 3) {
            if (!this.miembro.tip_idioma_materna) {return true}
            if (this.miembro.tip_idioma_materna === '09' && !this.miembro.tip_otra_lengua) {return true}
            if (this.miembro.tip_idioma_materna === '12' && !this.miembro.txt_idioma) {return true}
            if (!this.miembro.tip_grado_instruccion) {return true}
            if ((this.miembro.tip_grado_instruccion === '13' || this.miembro.tip_grado_instruccion === '03' || this.miembro.tip_grado_instruccion === '05') && !this.miembro.tip_grado_estudio) {return true}
        }
        if (this.edad >= 12) {
            if (!this.miembro.tip_estado_civil) {return true}
            if (!this.miembro.tip_etnia_identidad) {return true}
            if ((this.miembro.tip_etnia_identidad === '03' || this.miembro.tip_etnia_identidad === '04') && !this.miembro.tip_otra_etnia) {return true}
            if ((this.miembro.tip_etnia_identidad === '99') && !this.miembro.txt_etnia_identidad) {return true}
        }
        if (this.edad >= 14) {
            if (!this.miembro.tip_ocupacion) {return true}
            if (this.miembro.tip_ocupacion === '99' && !this.miembro.txt_ocupacion) {return true}
            if (!this.miembro.tip_txt_lista_ingreso) {return true}
            if (this.miembro.tip_txt_lista_ingreso.includes('99') && !this.miembro.txt_ingreso) {return true}
            let resp = false
            if (this.miembro.tip_txt_lista_ingreso.length > 0) {
                for (let index = 0; index < this.miembro.tip_txt_lista_ingreso.length; index++) {
                    if (this.miembro.tip_txt_lista_ingreso[index] !== '00' && (!this.miembro.txt_imp_ingreso[index] || parseFloat(this.miembro.txt_imp_ingreso[index]) <= 0)) {resp = true}
                }
            }
            if (resp) {return true}
        }
        return false
    }

    evaluarUsuarioIncompleto() {
        if (this.miembrosList) {
            for (let index = 0; index < this.miembrosList.length; index++) {if (!this.miembrosList[index].flg_ficha_completa) {return true}}
        }
        return false
    }

    salir() {
        this.modalController.dismiss();
    }

    calcularEdad(fechaNacimiento: Date) {
        const nacimiento = new Date(fechaNacimiento)
        const actual = new Date(this.fecha)
        if (actual < new Date(nacimiento.getFullYear(), nacimiento.getMonth(), nacimiento.getDate()) ) {
            console.log('error de fechas')
            this.observacion = 'Error: La fecha de nacimiento no puede ser mayor que fecha de recojo de la información.'
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
        console.log('edad :>> ', edad);
        this.edad = edad
    }
}
