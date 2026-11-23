import { Component, OnInit, ViewChild } from '@angular/core';
import { IonList, ModalController, PopoverController } from '@ionic/angular';
import { ActionSheetController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { DataLocalService } from '../../services/data-local.service';
import { SincronizaService } from '../../services/sincroniza/sincroniza.service';
import { UiServiceService } from 'src/app/services/ui-service.service';
import { Usuario, UsuarioParametro } from '../../model/usuarios';
import { Opcion } from '../../model/generales';
import { Proyecto, Ambito } from '../../model/proyectos';
import { UsuarioResumenComponent } from 'src/app/components/usuario-resumen/usuario-resumen.component';
import { TecnologiasPage } from '../tecnologias/tecnologias.page';
import { UsuarioSolicitudPage } from '../usuario-solicitud/usuario-solicitud.page';
import { UsuarioEditPage } from '../usuario-edit/usuario-edit.page';
import { ActividadProdListPage } from '../actividad-prod-list/actividad-prod-list.page';
import { UsuarioFichaPage } from '../usuario-ficha/usuario-ficha.page';
import { UsuarioCaracterizacionPage } from '../usuario-caracterizacion/usuario-caracterizacion.page';
import { MiembroListPage } from '../miembro-list/miembro-list.page';
import { UsuarioFichaMujerPage } from '../usuario-ficha-mujer/usuario-ficha-mujer.page';
import { AsistenciaTecnicaMemPage } from '../asistencia-tecnica-mem/asistencia-tecnica-mem.page';
import { SeleccionMemPage } from '../seleccion-mem/seleccion-mem.page';
import { LineaBaseMemPage } from '../linea-base-mem/linea-base-mem.page';

@Component({
  selector: 'app-usuario',
  templateUrl: './usuario.page.html',
  styleUrls: ['./usuario.page.scss'],
})
export class UsuarioPage implements OnInit {
@ViewChild('listaUsuarios', { static: true}) listaUsuarios: IonList
    texto = 'recibe texto'
    textoBuscar = ''
    proyecto: Proyecto
    codigoProyecto = ''
    usuarios: Usuario[] = []
    defaultHref = '/tabsPrincipal/tabsPrincipal/proyectos'
    opcion: Opcion
    usuarios$: Observable<Usuario[]>
    flagCargando = false
    ambito: Ambito[] = []
    usuarioParametro: UsuarioParametro
    botonNuevo = false
    opcionesMenu = []
    isActionUsuariosModalOpen = false
    usuarioSeleccionado = ''

    constructor(public popoverController: PopoverController,
        private actionSheetCtrl: ActionSheetController,
        public dataLocalService: DataLocalService,
        private modalController: ModalController,
        private sincronizaService: SincronizaService,
        private uiService: UiServiceService) { }

    async ngOnInit() {
        this.flagCargando = true
        this.proyecto = await this.dataLocalService.leerProyectoSeleccionado()
        this.usuarios = await this.dataLocalService.leerUsuariosProyecto(this.proyecto.codigo_expediente)
        this.flagCargando = false
        this.codigoProyecto = this.proyecto.codigo_expediente
        this.usuarios$ = this.dataLocalService.leerUsuarios$()
        this.usuarios$.subscribe(usuarios => this.usuarios = usuarios)
        this.opcion = await this.dataLocalService.leerOpcion('usuarios')
        if (this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'nuevo') >= 0) {this.botonNuevo = true}
        this.ambito = await this.dataLocalService.leerAmbitoProyecto(this.proyecto.codigo_expediente)
        this.usuarioParametro = await this.dataLocalService.leerUsuariosParametro()
        console.log('this.usuarios :>> ', this.usuarios);
    }

    buscar(event) {
        this.textoBuscar = event.detail.value;
        console.log('entra a buscar');
    }
    
    async abrirOpciones2(usuarioSeleccionado: Usuario, index: number) {
        console.log('usuarioSeleccionado :>> ', usuarioSeleccionado);
        console.log('this.proyecto.nid_sub_tipo_proyecto :>> ', this.proyecto.nid_sub_tipo_proyecto);
        let buttons = []
        if (!usuarioSeleccionado.flgDatos) {
            buttons.push({
                text: 'Sincronizar usuario', icon: 'sync-outline', objeto: 'sincroniza', // cssClass: 'action-dark',
                handler: () => { this.enviar(usuarioSeleccionado) }
            })
            buttons.push({
                text: 'Cancelar', icon: 'close', role: 'cancel', objeto: 'cancelar',
                handler: () => { console.log('Cancel clicked') }
            })
        } else {
            const usuario = await this.dataLocalService.leerUsuario(usuarioSeleccionado.codigo_expediente, usuarioSeleccionado.id)
            console.log('USUARIO :>> ', usuario);
            usuario.orden = usuarioSeleccionado.orden
    
            let registrarSolicitud = false
            if (this.proyecto.fec_inicio) {
                const hoy = new Date()
                const fecha = new Date(this.proyecto.fec_inicio)
                const fechaInicio = new Date(fecha.getTime() + (this.usuarioParametro.diasSolicitudCambio * 24 * 60 * 60 * 1000))
                if (fechaInicio > hoy ) {
                    registrarSolicitud = true
                }
            } else {
                registrarSolicitud = true
            }

            
            let incorporacionValida = false
            if (usuario.est_personal === 'R' && usuario.fec_termino) {
                const hoy = new Date()
                const fecha = new Date(usuario.fec_termino)
                const fechaTermino = new Date(fecha.getTime() + (this.usuarioParametro.diasRetiroUsuario * 24 * 60 * 60 * 1000))
                if (fechaTermino > hoy ) {
                    incorporacionValida = true
                }
            }
            
            let registraDiagnostico = false
            if (usuario.est_personal === 'A' && usuario.fec_inicio && usuario.flg_incorporado) {
                const hoy = new Date()
                const fecha = new Date(usuario.fec_inicio)
                const fechaInicio = new Date(fecha.getTime() + (this.usuarioParametro.diasRetiroUsuario * 24 * 60 * 60 * 1000))
                if (fechaInicio > hoy ) {
                    registraDiagnostico = true
                }
            }
            console.log('registraDiagnostico :>> ', registraDiagnostico);

            let etapaCompatibilidad = false
            if (usuario.flg_ejecucion && this.proyecto.fec_inicio) {
                const hoy = new Date()
                const fecha = new Date(this.proyecto.fec_inicio)
                const fechaLimite = new Date(fecha.getTime() + (this.usuarioParametro.diasCompatibilidad * 24 * 60 * 60 * 1000))
                if (fechaLimite > hoy ) {etapaCompatibilidad = true}
            }
            console.log('etapaCompatibilidad :>> ', etapaCompatibilidad);

            let etapaCompatibilidadMem = false
            if (usuario.flg_ejecucion && this.proyecto.fec_inicio) {
                const hoy = new Date()
                const fecha = new Date(this.proyecto.fec_inicio)
                const fechaLimite = new Date(fecha.getTime() + (this.usuarioParametro.diasCompatibilidadMem * 24 * 60 * 60 * 1000))
                if (fechaLimite > hoy ) {etapaCompatibilidadMem = true}
            }
            console.log('this.proyecto.fec_inicio :>> ', this.proyecto.fec_inicio);
            console.log('etapaCompatibilidadMem :>> ', etapaCompatibilidadMem);

            let periodo24 = false
            if (this.proyecto.periodo_24) {
                const hoy = new Date()
                const periodoActual = hoy.getFullYear() + ("0"+(hoy.getMonth()+1)).toString().slice(-2)
                if (this.proyecto.periodo_24 <= periodoActual) {periodo24 = true}
            }

            let registraLineaSalida = false
            if (usuario.fec_inicio) {
                console.log('usuario.codigo_expediente :>> ', usuario.codigo_expediente);
                const periodos = await this.dataLocalService.leerProyectoPeriodo(usuario.codigo_expediente)
                if (periodos && periodos.length > 0) {
                    if (this.usuarioParametro.mesLineaSalida) {
                        const periodo = periodos.find(item => item.cod_mes === this.usuarioParametro.mesLineaSalida).cod_periodo
                        const hoy = new Date()
                        const periodoActual = hoy.getFullYear() + ("0"+(hoy.getMonth()+1)).toString().slice(-2)
                        if (periodo <= periodoActual) {registraLineaSalida = true}
                    }
                }
            }
            console.log('registraLineaSalida :>> ', registraLineaSalida);

            let registraLineaSalidaMem = false
            if (this.proyecto.nid_sub_tipo_proyecto === 117 && usuario.fec_inicio) {
                console.log('Es MEM :>> ', this.proyecto.nid_sub_tipo_proyecto);
                const periodos = await this.dataLocalService.leerProyectoPeriodo(usuario.codigo_expediente)
                if (periodos && periodos.length > 0) {
                    if (this.usuarioParametro.mesLineaSalidaMem) {
                        const periodo = periodos.find(item => item.cod_mes === this.usuarioParametro.mesLineaSalidaMem).cod_periodo
                        const hoy = new Date()
                        const periodoActual = hoy.getFullYear() + ("0"+(hoy.getMonth()+1)).toString().slice(-2)
                        if (periodo <= periodoActual) {registraLineaSalidaMem = true}
                    }
                }
            }
            console.log('registraLineaSalidaMem :>> ', registraLineaSalidaMem);


            let miembroIncompleto = false
            if (usuario.miembros && usuario.miembros.length > 0) {
                for (let index = 0; index < usuario.miembros.length; index++) {
                    if (!usuario.miembros[index].flg_ficha_completa || usuario.miembros[index].txt_observacion) {
                        miembroIncompleto = true
                    }
                }
            }
            console.log('miembroIcompleto :>> ', miembroIncompleto);

            const opciones = [
                {
                    text: 'Editar nuevo usuario', icon: 'create-outline', objeto: 'nuevo',
                    handler: () => { this.abrirSolicitud(usuario, 'NU', 'Nuevo usuario') }
                },
                {
                    text: 'Consultar usuario', icon: 'body-outline', objeto: 'consultar',
                    handler: () => { this.abrirModalUsuario(usuario, 'Consulta de usuario', true) }
                },
                {
                    text: `${this.proyecto.nid_sub_tipo_proyecto === 116 ? "Vivienda y organización" : "Parcela, vivienda y emprendimientos"}`, icon: 'home-outline', objeto: 'ficha',
                    handler: () => { this.abrirFicha(usuario, false, 0) }
                },
                {
                    text: `${this.proyecto.nid_sub_tipo_proyecto === 116 ? "Vivienda y organización" : "Parcela, vivienda y emprendimientos"}`, icon: 'home-outline', objeto: 'fichaConsulta',
                    handler: () => { this.abrirFicha(usuario, true, 0, etapaCompatibilidad) }
                },
                {
                    text: 'Actividades productivas', icon: 'leaf-outline', objeto: 'actividadProductiva',
                    handler: () => { this.abrirActividadProductivaList(usuario, registraDiagnostico, 0, etapaCompatibilidad) }
                },
                {
                    text: 'Ficha de caracterización emprendedores', icon: 'flower-outline', objeto: 'fichaMujer',
                    handler: () => { this.abrirFichaMujer(usuario, false) }
                },
                {
                    text: 'Consultar ficha de caracterización emprendedores', icon: 'flower-outline', objeto: 'fichaMujerConsulta',
                    handler: () => { this.abrirFichaMujer(usuario, true) }
                },
                {
                    text: 'Línea de base MEM', icon: 'log-in-outline', objeto: 'lineaBaseMem',
                    handler: () => { this.abrirLineaBaseMem(usuario, 0, false) }
                },
                {
                    text: 'Consultar línea de base MEM', icon: 'log-in-outline', objeto: 'lineaBaseMemConsulta',
                    handler: () => { this.abrirLineaBaseMem(usuario, 0, true) }
                },
                {
                    text: 'Integrantes del hogar', icon: 'people-circle-outline', objeto: 'integrantes',
                    handler: () => { this.abrirMiembroList(usuario, false, registraDiagnostico, etapaCompatibilidad) }
                },
                {
                    text: 'Consultar integrantes del hogar', icon: 'people-circle-outline', objeto: 'integrantesConsulta',
                    handler: () => { this.abrirMiembroList(usuario, true, registraDiagnostico, etapaCompatibilidad) }
                },
                {
                    text: 'Cambio de datos', icon: 'newspaper-outline', objeto: 'cambioDatos',
                    handler: () => { this.abrirSolicitud(usuario, 'CD', 'Cambio de datos') }
                },
                {
                    text: 'Reemplazo', icon: 'swap-horizontal-outline', objeto: 'reemplazo',
                    handler: () => { this.abrirSolicitud(usuario, 'RE', 'Reemplazo') }
                },
                {
                    text: 'Retiro', icon: 'close-circle-outline', objeto: 'retiro',
                    handler: () => { this.abrirSolicitud(usuario, 'RT', 'Retiro') }
                },
                {
                    text: 'Incorporación por retiro', icon: 'person-add-outline', objeto: 'incorporacionRetiro',
                    handler: () => { this.abrirSolicitud(usuario, 'IR', 'Incorporación por Retiro') }
                },
                {
                    text: 'Incorporación por traslado', icon: 'person-add-outline', objeto: 'incorporacionTraslado',
                    handler: () => { this.abrirSolicitud(usuario, 'IT', 'Incorporación por Traslado') }
                },
                {
                    text: 'Cambio de titular', icon: 'people-outline', objeto: 'cambioTitular',
                    handler: () => { this.abrirSolicitud(usuario, 'CT', 'Cambio de Titular') }
                },
                {
                    text: 'Asignación del Yachachiq', icon: 'shirt-outline', objeto: 'asignacionYachachiq',
                    handler: () => { this.abrirModalUsuario(usuario, 'Asignación del Yachachiq', false) }
                },
                {
                    text: (this.proyecto.nid_sub_tipo_proyecto === 117 || (this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF')) ? 'Líneas de negocio' : 'Tecnologías', icon: 'hammer-outline', objeto: 'tecnologias',
                    handler: () => { this.abrirTecnologias(usuario) }
                },
                {
                    text: 'Ficha de caracterización', icon: 'medal-outline', objeto: 'caracterizacion',
                    handler: () => { this.abrirCaracterizacion(usuario) }
                },
                {
                    text: 'Asistencia Técnica MEM', icon: 'paper-plane-outline', objeto: 'asisTecMem',
                    handler: () => { this.abrirAsistenciaTecnicaMem(usuario) }
                },
                {
                    text: 'Criterios de selección para concursos de emprendimientos - MEM', icon: 'medal-outline', objeto: 'seleccionMem',
                    handler: () => { this.abrirSeleccionMEM(usuario) }
                },
                {
                    text: 'Línea de salida MEM', icon: 'log-out-outline', objeto: 'lineaSalidaMem',
                    handler: () => { this.abrirLineaBaseMem(usuario, 1, this.opcion.opciones.find(op => op.txtnombreobjeto === 'lineaSalidaMem')?.flgconsulta) }
                },
                {
                    text: 'Línea de salida: Parcela, vivienda y emprendimientos', icon: 'home-outline', objeto: 'lineaSalidaFichaVivienda',
                    handler: () => { this.abrirFicha(usuario, false, 1) }
                },
                {
                    text: 'Línea de salida: Actividades productivas', icon: 'leaf-outline', objeto: 'lineaSalidaActivProductiva',
                    handler: () => { this.abrirLineaBaseActiviProdList(usuario, 1) }
                },
                {
                    text: 'Sincronizar usuario', icon: 'sync-outline', objeto: 'sincroniza',
                    handler: () => { this.enviar(usuario) }
                },
                {
                    text: 'Cancelar', icon: 'close', role: 'cancel', objeto: 'cancelar',
                    handler: () => { console.log('Cancel clicked') }
                }
            ]
            console.log('parseInt(usuario.codigo_expediente.substring(2,6)) :>> ', parseInt(usuario.codigo_expediente.substring(2,6)));
            console.log('usuario.flg_ejecucion>> ', usuario.flg_ejecucion)
            opciones.map(item => {
                if (item.objeto === 'nuevo' && (
                    usuario.est_personal !== 'U'
                )) { return }
                if (item.objeto === 'consultar' && (
                    usuario.est_personal === 'U' ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                if (item.objeto === 'ficha' && (
                    [107,117,112].includes(this.proyecto.nid_sub_tipo_proyecto) ||
                    (this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF') ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    (usuario.flg_ejecucion && (parseInt(usuario.codigo_expediente.substring(2,6)) < 2021 || !registraDiagnostico))
                )) { return }
                if (item.objeto === 'fichaConsulta' && (
                    parseInt(usuario.codigo_expediente.substring(2,6)) < 2021 ||
                    [107,117,112].includes(this.proyecto.nid_sub_tipo_proyecto) ||
                    (this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF') ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'ficha') < 0 ||
                    !usuario.flg_ejecucion || registraDiagnostico
                )) { return }
                if (item.objeto === 'actividadProductiva' && (
                    // this.proyecto.flg_ejecucion ||
                    [107,117,112,116].includes(this.proyecto.nid_sub_tipo_proyecto) ||
                    (this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF') ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    // (usuario.flg_ejecucion && (parseInt(usuario.codigo_expediente.substring(2,6)) < 2021 || !registraDiagnostico))
                    (usuario.flg_ejecucion && parseInt(usuario.codigo_expediente.substring(2,6)) < 2021)
                )) { return }
                if (item.objeto === 'fichaMujer' && (
                    !(this.proyecto.nid_sub_tipo_proyecto === 117 || (this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF')) ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    ((this.opcion.opciones.find(op => op.txtnombreobjeto === item.objeto)?.flgconsulta) ||
                    (usuario.flg_ejecucion && !registraDiagnostico && !etapaCompatibilidad && !usuario.txt_incompleto?.includes('-Ficha de Caracterización Emp.')))
                )) { return }
                if (item.objeto === 'fichaMujerConsulta' && (
                    !(this.proyecto.nid_sub_tipo_proyecto === 117 || (this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF')) ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'fichaMujer') < 0 ||
                    ((!this.opcion.opciones.find(op => op.txtnombreobjeto === 'fichaMujer')?.flgconsulta) &&
                    (!usuario.flg_ejecucion || registraDiagnostico || etapaCompatibilidad || usuario.txt_incompleto?.includes('-Ficha de Caracterización Emp.')))
                )) { return }
                if (item.objeto === 'lineaBaseMem' && (
                    this.proyecto.nid_sub_tipo_proyecto !== 117 ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    ((this.opcion.opciones.find(op => op.txtnombreobjeto === item.objeto)?.flgconsulta) ||
                    (usuario.flg_ejecucion && !registraDiagnostico && !etapaCompatibilidadMem))
                )) { return }
                if (item.objeto === 'lineaBaseMemConsulta' && (
                    this.proyecto.nid_sub_tipo_proyecto !== 117 ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'lineaBaseMem') < 0 ||
                    ((!this.opcion.opciones.find(op => op.txtnombreobjeto === 'lineaBaseMem')?.flgconsulta) &&
                    (!usuario.flg_ejecucion || registraDiagnostico || etapaCompatibilidadMem))
                )) { return }
                if (item.objeto === 'integrantes' && (
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    (usuario.flg_ejecucion && !registraDiagnostico && !etapaCompatibilidad && !miembroIncompleto)
                )) { return }
                if (item.objeto === 'integrantesConsulta' && (
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === 'integrantes') < 0 ||
                    !usuario.flg_ejecucion || registraDiagnostico || etapaCompatibilidad || miembroIncompleto
                )) { return }
                if (item.objeto === 'cambioDatos' && (
                    (!(usuario.est_personal === 'A' || usuario.est_personal === 'R') || // !registrarSolicitud || // se retira esta validación
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0) ||
                    (usuario.solicitud && usuario.solicitud.tip_cambio && usuario.solicitud.tip_cambio !== 'CD')
                )) { return }
                if (item.objeto === 'reemplazo' && (
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion || !registrarSolicitud ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    (usuario.solicitud && usuario.solicitud.tip_cambio && usuario.solicitud.tip_cambio !== 'RE')
                )) { return }
                if (item.objeto === 'retiro' && (
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion || !registrarSolicitud ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    (usuario.solicitud && usuario.solicitud.tip_cambio && usuario.solicitud.tip_cambio !== 'RT')
                )) { return }
                if (item.objeto === 'incorporacionRetiro' && (
                    usuario.est_personal !== 'R' || usuario.nid_personal_reemplazo || !registrarSolicitud || !incorporacionValida ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    (usuario.solicitud && usuario.solicitud.tip_cambio && usuario.solicitud.tip_cambio !== 'IR')
                )) { return }
                if (item.objeto === 'incorporacionTraslado' && (
                    usuario.est_personal !== 'R' || !this.proyecto.flg_ejecucion || !registrarSolicitud || !incorporacionValida ||
                    usuario.nid_personal_reemplazo || !this.proyecto.proyectos_nec ||
                    this.proyecto.nid_sub_tipo_proyecto === 112 || this.proyecto.nid_sub_tipo_proyecto === 116 ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    (usuario.solicitud && usuario.solicitud.tip_cambio && usuario.solicitud.tip_cambio !== 'IT')
                )) { return }
                if (item.objeto === 'cambioTitular' && (
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion || // !registrarSolicitud || // se retira esta validación
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    (usuario.solicitud && usuario.solicitud.tip_cambio && usuario.solicitud.tip_cambio !== 'CT')
                )) { return }
                if (item.objeto === 'asignacionYachachiq' && (
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                if (item.objeto === 'tecnologias' && (
                    usuario.est_personal === 'U' ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                if (item.objeto === 'caracterizacion' && (
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion || !periodo24 ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                if (item.objeto === 'asisTecMem' && (
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                if (item.objeto === 'seleccionMem' && (
                    this.proyecto.nid_sub_tipo_proyecto !== 117 ||
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                if (item.objeto === 'lineaSalidaActivProductiva' && (
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion || !registraLineaSalida ||
                    parseInt(usuario.codigo_expediente.substring(2,6)) < 2022 ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                if (item.objeto === 'lineaSalidaFichaVivienda' && (
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion || !registraLineaSalida ||
                    parseInt(usuario.codigo_expediente.substring(2,6)) < 2022 ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0
                )) { return }
                console.log('registraLineaSalidaMem :>> ', registraLineaSalidaMem);
                if (item.objeto === 'lineaSalidaMem' && (
                    this.proyecto.nid_sub_tipo_proyecto !== 117 ||
                    this.opcion.opciones.findIndex(op => op.txtnombreobjeto === item.objeto) < 0 ||
                    usuario.est_personal !== 'A' || !this.proyecto.flg_ejecucion || !registraLineaSalidaMem
                )) { return }
                buttons.push(item)
            })
        }
        // cambio linea
        // const actionSheet = await this.actionSheetCtrl.create({ header: `Usuario Nro. Doc.: ${usuarioSeleccionado.txt_documento_identidad}  ${usuarioSeleccionado.txt_nombres}`, buttons, cssClass: 'accionSheetUsuarios' });
        // await actionSheet.present();
        this.opcionesMenu = buttons
        this.usuarioSeleccionado = `Usuario Nro. Doc.: ${usuarioSeleccionado.txt_documento_identidad}  ${usuarioSeleccionado.txt_nombres}`
        this.isActionUsuariosModalOpen = true
        console.log('this.isActionUsuariosModalOpen :>> ', this.isActionUsuariosModalOpen);
    }

    ejecutarOpcion(opcion) {
        console.log('opcion :>> ', opcion);
    }

    async abrirTecnologias(usuario: Usuario) {
        const modal = await this.modalController.create({
            component: TecnologiasPage,
            componentProps: {
                usuario,
                fechaInicio: this.proyecto.fec_inicio,
                parametros: this.usuarioParametro,
                portafolio: this.proyecto.nid_sub_tipo_proyecto,
                grupo: this.proyecto.tip_grupo
            }
        })
        await modal.present();
    }

    async nuevoUsuario() {
        const usuario: Usuario = {
            codigo_expediente: this.proyecto.codigo_expediente,
            est_personal: 'U',
            txt_estado: 'Nuevo'
        }
        const cambio = {
            tip_cambio: 'NU',
            txt_tipo_cambio: 'Nuevo usuario'
        }
        this.abrirModalSolicitud(usuario, cambio, true)
    }

    async abrirSolicitud(usuario: Usuario, tip_cambio: string, txt_tipo_cambio: string) {
        const cambio = {
            tip_cambio,
            txt_tipo_cambio
        }
        this.abrirModalSolicitud(usuario, cambio, false)
    }

    private async abrirModalSolicitud(usuario: Usuario, cambio: any, nuevo: boolean) {
        console.log('this.proyecto :>> ', this.proyecto);
        const modal = await this.modalController.create({
            component: UsuarioSolicitudPage,
            componentProps: {
                proyecto: this.proyecto,
                usuario,
                cambio,
                nuevo,
                usuario1: true,
                ambito: this.ambito,
                causales: this.usuarioParametro.causalRetiroUsuario,
                proyectosNec: this.proyecto.proyectos_nec ? this.proyecto.proyectos_nec.split(',') : []
            }
        })
        await modal.present();
    }

    private async abrirModalUsuario(usuario: Usuario, titulo: string, consulta: boolean) {
        const yachachiqs = []
        if (!consulta) {
            let agentes = await this.dataLocalService.leerAgentesProyecto(usuario.codigo_expediente)
            agentes = agentes.filter(item => item.nid_funcion === 483)
            yachachiqs.push({
                nidPersonal: 0,
                nombre: 'NINGUNO'
            })
            agentes.map(item => {
                if (!yachachiqs.find(val => val.nidPersonal === item.nid_personal)) {
                    yachachiqs.push({
                        nidPersonal: item.nid_personal,
                        nombre: item.txt_apellido_paterno + ' ' + item.txt_apellido_materno + ', ' + item.txt_nombres
                    })
                }
            })
        } else {
            if (usuario.fotos && usuario.fotos.length > 0 && (this.proyecto.nid_sub_tipo_proyecto === 107 || this.proyecto.nid_sub_tipo_proyecto === 117 ||
                (this.proyecto.nid_sub_tipo_proyecto === 123 && this.proyecto.tip_grupo === 'NF')
            )) {
                usuario.fotos = usuario.fotos.filter(item => item.cod_archivo !== '0011')
            }
            if (usuario.fotos && usuario.fotos.length > 0 && this.proyecto.nid_sub_tipo_proyecto === 112) {
                usuario.fotos = usuario.fotos.filter(item => !(item.cod_archivo === '0009' || item.cod_archivo === '0010'))
            }
            if (usuario.fotos && usuario.fotos.length > 0 && this.proyecto.nid_sub_tipo_proyecto === 116) {
                usuario.fotos = usuario.fotos.filter(item => (item.cod_archivo === '0009' || item.cod_archivo === '0010'))
            }
        }
        const modal = await this.modalController.create({
            component: UsuarioEditPage,
            componentProps: {
                usuario,
                titulo,
                consulta,
                yachachiqs
            }
        })
        await modal.present();
    }

    async abrirFichaMujer(usuario: Usuario, consulta: boolean) {
        const modal = await this.modalController.create({
            component: UsuarioFichaMujerPage,
            componentProps: {
                usuario,
                consulta
            }
        })
        await modal.present();
        this.listaUsuarios.closeSlidingItems()
    }

    async enviar(usuario: Usuario) {
        const respUsuario = await this.sincronizaService.usuario(usuario, true)
        if (!respUsuario) {this.uiService.alertaInformativa('No se sincronizó la información.')}
    }

    async verResumen() {
        const popover = await this.popoverController.create({
            component: UsuarioResumenComponent,
            // cssClass: 'my-custom-class',
            // event: ev,
            translucent: true,
            componentProps: {
                usuarios: this.usuarios
            }
        });
        await popover.present();
    }

    async eliminarSolicitud(usuarioSeleccionado: Usuario) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la solicitud de ${usuarioSeleccionado.txt_tipo_cambio}?`).then(async (resp) => {
            if (resp) {
                if (usuarioSeleccionado.est_personal === 'U') {
                    await this.dataLocalService.eliminarUsuario(usuarioSeleccionado)
                } else {
                    const usuario = await this.dataLocalService.leerUsuario(usuarioSeleccionado.codigo_expediente, usuarioSeleccionado.id)
                    usuario.solicitud.tip_cambio = null
                    usuario.solicitud.txt_tipo_cambio = null
                    usuario.solicitudCambioIncompleto = null
                    if (!usuario.cambioTecnologia) {usuario.solicitud = null}
                    if (usuario.cambioTecnologia) {
                        if (usuario.solicitud.usuario1) {usuario.solicitud.usuario1 = null}
                        if (usuario.solicitud.usuario2) {usuario.solicitud.usuario2 = null}
                    }
                    await this.dataLocalService.guardarUsuario(usuario, false)
                }
            }
        })
        this.listaUsuarios.closeSlidingItems()
    }

    async eliminarAsignacionYachachiq(usuarioSeleccionado: Usuario) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la asignación del Yachachiq?`).then(async (resp) => {
            if (resp) {
                const usuario = await this.dataLocalService.leerUsuario(usuarioSeleccionado.codigo_expediente, usuarioSeleccionado.id)
                usuario.fecYachachiq = null
                usuario.nidYachachiq = null
                usuario.fecFinYachachiq = null
                usuario.flg_cambio_yachachiq = false

                await this.dataLocalService.guardarUsuario(usuario, false)
            }
        })
        this.listaUsuarios.closeSlidingItems()
    }

    async abrirActividadProductivaList(usuario: Usuario, registraDiagnostico: boolean, linea: number, etapaCompatibilidad: boolean) {
        let consulta = this.opcion.opciones.find(op => op.txtnombreobjeto === 'actividadProductiva').flgconsulta
        console.log('consulta abrirActividadProductivaList 1111 - usuario.flg_ejecucion:>> ', consulta, usuario.flg_ejecucion);
        if (!consulta && usuario.flg_ejecucion && parseInt(usuario.codigo_expediente.substring(2,6)) > 2021) {
            if (!(registraDiagnostico || usuario.txt_incompleto?.includes('-Actividades productivas') || etapaCompatibilidad)) {consulta = true }
        }
        console.log('consulta abrirActividadProductivaList 2222:>> ', consulta);
        const modal = await this.modalController.create({
            component: ActividadProdListPage,
            componentProps: {
                usuario,
                consulta,
                linea
            }
        })
        await modal.present();
    }

    async abrirLineaBaseActiviProdList(usuario: Usuario, linea: number) {
        const modal = await this.modalController.create({
            component: ActividadProdListPage,
            componentProps: {
                usuario,
                linea
            }
        })
        await modal.present();
    }

    async abrirFicha(usuario: Usuario, consulta: boolean, linea: number, etapaCompatibilidad?: boolean) {
        if (consulta) {
            let consultaPermiso = this.opcion.opciones.find(op => op.txtnombreobjeto === 'ficha').flgconsulta
            if (!consultaPermiso && usuario.flg_ejecucion && parseInt(usuario.codigo_expediente.substring(2,6)) > 2021) {
                if (usuario.txt_incompleto?.includes('-Parcela, Vivienda y Emp.') || etapaCompatibilidad) {consulta = false }
            }
        }
        const parametros = await this.dataLocalService.leerUsuariosParametro()
        const modal = await this.modalController.create({
            component: UsuarioFichaPage,
            componentProps: {
                proyecto: this.proyecto,
                usuario,
                consulta: this.opcion.opciones.find(op => op.txtnombreobjeto === 'ficha').flgconsulta ? true : consulta,
                linea,
                parametros
            }
        })
        await modal.present()
        this.listaUsuarios.closeSlidingItems()
    }
    
    async abrirCaracterizacion(usuario: Usuario) {
        const modal = await this.modalController.create({
            component: UsuarioCaracterizacionPage,
            id: 'caracterizacionModal',
            componentProps: {
                usuario,
                parametros: this.usuarioParametro
            }
        })
        await modal.present();
    }

    async eliminarFichaCaracterizacion(usuarioSeleccionado: Usuario) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la Ficha de Caracterización del Usuario?`).then(async (resp) => {
            if (resp) {
                const usuario = await this.dataLocalService.leerUsuario(usuarioSeleccionado.codigo_expediente, usuarioSeleccionado.id)
                usuario.fichaCaracterizacion = null
                usuario.cambioCaracterizacion = null
                usuario.estadoCaracterizacion = null
                usuario.fichaCaracterizIncompleto = null

                await this.dataLocalService.guardarUsuario(usuario, false)
            }
        })
        this.listaUsuarios.closeSlidingItems()
    }
    
    async abrirMiembroList(usuario: Usuario, consulta: boolean, registraDiagnostico: boolean, etapaCompatibilidad: boolean) {
        console.log('consulta abrirMiembroList:>> ', consulta);
        if (!consulta && usuario.flg_ejecucion && !registraDiagnostico && !etapaCompatibilidad) {consulta = true}
        const modal = await this.modalController.create({
            component: MiembroListPage,
            componentProps: {
                usuario,
                parametros: this.usuarioParametro,
                consulta: this.opcion.opciones.find(op => op.txtnombreobjeto === 'integrantes').flgconsulta ? true : consulta
            }
        })
        await modal.present();
    }

    async eliminarFichaMujer(usuarioSeleccionado: Usuario) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la ficha de caracterización?`).then(async (resp) => {
            if (resp) {
                const usuario = await this.dataLocalService.leerUsuario(usuarioSeleccionado.codigo_expediente, usuarioSeleccionado.id)
                if (usuario.fichaMujer.nid_ficha) {
                    await this.uiService.alertaInformativa('La ficha ya fue sincronizada, no se puede eliminar.')
                    return
                }
                usuario.fichaMujer = null
                usuario.cambioFichaMujer = null
                usuario.fichaMujerIncompleto = null

                await this.dataLocalService.guardarUsuario(usuario, false)
            }
        })
        this.listaUsuarios.closeSlidingItems()
    }

    datosLinea(usuario: Usuario, nidLinea: number) {
        if (!usuario.lineaBase) {return ''}
        const datos = usuario.lineaBase.find(item => item.nidLinea === nidLinea)
        if (!datos) {return ''}
        return `${datos.cambioFichaVivienda ? '-Lin. Salida: Parc., Viv. y Emp.' + (datos.fichaViviendaIncompleto ? ' (Incompleto)' : '') : ''} ${datos.cambioActividadProd ? '-Lin. Salida Act. Prod.' + (datos.actividadProdIncompleto ? ' (Incompleto)' : '') : ''}`
        // if (datos) {return }
    }

    async eliminarLinSalidaFichaVivienda(usuarioSeleccionado: Usuario) {
        await this.uiService.alertaConfirmacion(`¿Está seguro que desea eliminar la Ficha de Parcela, Vivienda y Emprendimientos de la Línea de Salida?`).then(async (resp) => {
            if (resp) {
                const usuario = await this.dataLocalService.leerUsuario(usuarioSeleccionado.codigo_expediente, usuarioSeleccionado.id)
                if (usuario.lineaBase && usuario.lineaBase.length > 0) {
                    const index = usuario.lineaBase.findIndex(item => item.nidLinea === 1)
                    console.log('index :>> ', index);
                    if (index >= 0) {
                        if (usuario.lineaBase[index].cambioFichaVivienda && !usuario.lineaBase[index].fichaVivienda.nid_ficha) {
                            usuario.lineaBase[index].fichaVivienda = null
                            usuario.lineaBase[index].cambioFichaVivienda = null
                            usuario.lineaBase[index].fichaViviendaIncompleto = null
                        }
                    }
                }
                usuario.eliminaFichaLSalidaVivienda = false

                await this.dataLocalService.guardarUsuario(usuario, false)
            }
        })
        this.listaUsuarios.closeSlidingItems()
    }

    async abrirAsistenciaTecnicaMem(usuario) {
        const modal = await this.modalController.create({
            component: AsistenciaTecnicaMemPage,
            componentProps: {
                usuario
            }
        })
        await modal.present();
    }

    async abrirSeleccionMEM(usuario) {
        const modal = await this.modalController.create({
            component: SeleccionMemPage,
            componentProps: {
                usuario,
                fichaTexto: usuario.fichaSeleccionMem ? JSON.stringify(usuario.fichaSeleccionMem) : null
            }
        })
        await modal.present();
    }

    async abrirLineaBaseMem(usuario, nidLinea, consulta) {
        let fichaTexto = ''
        if (nidLinea === 0) {fichaTexto = usuario.lineaBaseMem ? JSON.stringify(usuario.lineaBaseMem) : null}
        if (nidLinea === 1) {fichaTexto = usuario.lineaSalidaMem ? JSON.stringify(usuario.lineaSalidaMem) : null}
        const modal = await this.modalController.create({
            component: LineaBaseMemPage,
            componentProps: {
                usuario,
                fichaTexto,
                nidLinea,
                consulta
            }
        })
        await modal.present();
    }
}
