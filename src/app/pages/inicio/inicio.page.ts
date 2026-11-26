import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { UiServiceService } from 'src/app/services/ui-service.service';
import { DataLocalService } from '../../services/data-local.service';
import { UtilService } from '../../services/util.service';
import { SgpService } from '../../services/sgp.service';
import { ReportesService } from './../../services/reportes.service';
import { User, Modulo, Zonal, Funcion, Opcion } from '../../model/generales';
import { Proyecto } from '../../model/proyectos';
import { ActualizacionService } from '../../services/actualizacion.service';

@Component({
    selector: 'app-inicio',
    templateUrl: './inicio.page.html',
    styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {

    user: User
    funcion: Funcion
    opcion = ''
    // modulo: Modulo
    ruta: string
    mensaje = ''
    progreso = 0
    cantidadProyectos = 0
    cantidadUsuarios = 0
    tienePlanActividad = false
    tieneAcciones = false
    tieneUsuarios = false
    tieneTecColectiva = false
    tieneActividad = false
    tieneEri = false
    tieneEvalAgente = false
    tieneVisitas = false

    constructor(private navCtrl: NavController,
        private uiService: UiServiceService,
        private sgpService: SgpService,
        private dataLocalService: DataLocalService,
        private utilService: UtilService,
        private reportesService: ReportesService,
        private actualizacionService: ActualizacionService) { }

    async ngOnInit() {
        console.log('INICIO...');
        // si hay una versión obligatoria, bloquea con la pantalla de actualización.
        if (await this.actualizacionService.revisar()) { return }
        let permisoZonal = await this.dataLocalService.leerPermisoZonal()
        let flagDataInicial
        if (!permisoZonal) {
            console.log('NO existe permiso zonal...');
            // para la version 3.2.0 hacia atrás
            const modulo = await this.dataLocalService.leerModulo()
            this.user = await this.dataLocalService.leerUser()
            await this.utilService.renuevaPermisos(this.user, modulo.zonales[0])
            permisoZonal = await this.dataLocalService.leerPermisoZonal()            
        }
        // desde la version 3.3.0 - actividadSuper
        console.log('PERMISOZONAL :>> ', permisoZonal);
        
        // if (await this.dataLocalService.leerOpcion('actividadSuper')) {this.tienePlanActividad = true}
        // if (await this.dataLocalService.leerOpcion('acciones')) {this.tieneAcciones = true}
        if (await this.dataLocalService.leerOpcion('usuarios')) {this.tieneUsuarios = true}
        if (await this.dataLocalService.leerOpcion('tecnologiasColectivas')) {this.tieneTecColectiva = true}
        if (await this.dataLocalService.leerOpcion('actividades')) {this.tieneActividad = true}
        if (await this.dataLocalService.leerOpcion('eri')) {this.tieneEri = true}
        if (await this.dataLocalService.leerOpcion('registrarEvaluacion')) {this.tieneEvalAgente = true}
        if (await this.dataLocalService.leerOpcion('visistas')) {this.tieneVisitas = true}
        if (this.tienePlanActividad) {
            this.ruta = `/tabsPrincipal/tabsPrincipal/planActividades`
        } else {
            if (this.tieneAcciones) {
                this.ruta = `/tabsPrincipal/tabsPrincipal/acciones`
            } else {
                this.ruta = `/tabsPrincipal/tabsPrincipal/proyectos`
            }
        }
        flagDataInicial = await this.dataLocalService.leerFlagDataInicial()
        console.log('Ini flagDataInicial :>> ', flagDataInicial);
        if (!flagDataInicial) {
            await this.cargarDataInicial().catch(async error => {
                console.error('Error al cargar la data inicial:', error)
                await this.uiService.dismissLoading()
            })
        }
        await this.uiService.dismissLoading()
        this.navCtrl.navigateRoot(this.ruta, { animated: true })
    }

    async cargarDataInicial() {
        this.mensaje = 'Importando: Información inicial'
        const modulo: Modulo = await this.dataLocalService.leerModulo()
        if (modulo && modulo.perfiles.length !== 1) {
            this.uiService.presentToast('Se ha detectado diferentes perfiles activos. Comuníquese con la Unidad Territorial de FONCODES.')
            return
        }

        await this.uiService.dismissLoading()
        const ok = await this.utilService.evaluarConexion()
        if (!ok) {
            this.ruta = '/login'
            return
        }

        await this.uiService.presentLoading('Cargando informacion...')

        this.progreso = 0.01
        this.user = await this.dataLocalService.leerUser()
        this.progreso = 0.04
        await this.sgpService.obtenerNotificaciones()
        this.progreso = 0.08

        this.funcion = await this.dataLocalService.leerFuncion()
        console.log('this.funcion :>> ', this.funcion);
        this.progreso = 0.10

        await this.dataLocalService.eliminarProyectos()

        if (this.tieneAcciones) {
            await this.sgpService.obtenerAccionesList(this.user.nidPersonal)
        }
        this.progreso = 0.12

        if (this.tienePlanActividad) {
            await this.sgpService.obtenerPlanList(this.funcion.nid_funcion, this.user.nidPersonal)
            await this.sgpService.obtenerPlanActividadList(this.funcion.nid_funcion, this.user.nidPersonal)
            const proyectoList: Proyecto[] = await this.sgpService.obtenerPlanProyectos(this.funcion.nid_funcion, this.user.nidPersonal, this.user.codZonal)
            console.log('proyectoList :>> ', proyectoList);
            this.progreso = 0.15
            if (proyectoList) {
                await this.descargarDatosProyectos(proyectoList) 
            }
        } else {
            const proyectoList: Proyecto[] = await this.sgpService.obtenerProyectosPorAgente(this.funcion.nid_funcion, this.user.nidPersonal, this.user.codZonal)
            this.progreso = 0.15
            if (proyectoList) {
                await this.descargarDatosProyectos(proyectoList) 
            }
            // await this.sgpService.obtenerEriPorAgente(this.funcion.nid_funcion, this.user.nidPersonal)
            
        }

        this.mensaje = 'Importando: Configuración'
        if (this.tienePlanActividad || this.tieneAcciones) {
            this.progreso = 0.85
            await this.sgpService.obtenerActividadParametros()
            await this.sgpService.obtenerPortafolios()
            await this.sgpService.obtenerEriParametros()
        }
        if (this.tieneVisitas) {
            this.progreso = 0.85
            await this.sgpService.obtenerVisitaParametro()
        }
        if (this.tieneEvalAgente) {
            this.progreso = 0.86
            await this.sgpService.obtenerAgenteParametro()
        }
        if (this.tieneUsuarios) {
            this.progreso = 0.87
            await this.sgpService.obtenerActividadProductiva()
            this.progreso = 0.88
            await this.sgpService.obtenerTecnologiaFase()
            this.progreso = 0.93
            await this.sgpService.obtenerUsuarioParametro()
            this.progreso = 0.95
            await this.reportesService.obtenerReportes()
        }
        if (this.tieneActividad) {
            this.progreso = 0.96
            await this.sgpService.obtenerParametrosProyAct()
        }
        if (this.tieneEri) {
            this.progreso = 0.97
            await this.sgpService.obtenerEriParametros()
        }
        
        this.progreso = 0.98
        await this.sgpService.obtenerArchivosConfigurados()
        this.progreso = 0.99
        await this.dataLocalService.guardarFlagDataInicial()
        this.progreso = 1
        this.mensaje = 'Proceso terminado'
    }

    async descargarDatosProyectos(proyectoList: Proyecto[], zonal?: Zonal) {
        this.cantidadProyectos = proyectoList.length
        for (let index = 0; index < proyectoList.length; index++) {
            const proyecto = await this.sgpService.obtenerProyectoDatosBase(proyectoList[index].codigo_expediente, this.funcion.nid_funcion, this.user.nidPersonal)
            this.incrementaProgreso()
            if (proyecto.nid_tipo_proyecto == 27) {
                const usuariosList = await this.sgpService.obtenerListaUsuarios(proyectoList[index].codigo_expediente, this.funcion.nid_funcion, this.user.nidPersonal)
                if (usuariosList) {
                    proyectoList[index].cantidadUsuarios = usuariosList.length
                    await this.dataLocalService.guardarProyectoLista(proyectoList[index], zonal)
                }
                if (this.tieneTecColectiva) {await this.sgpService.obtenerTecnologiaColectivaList(proyectoList[index].codigo_expediente, this.funcion.nid_funcion, this.user.nidPersonal)}
                if (this.tieneEri) {
                    if (this.user.perfil.nidperfil === 34) {
                        await this.sgpService.obtenerEriPorAgente(proyectoList[index].codigo_expediente, this.funcion.nid_funcion, this.user.nidPersonal)
                    } else {
                        await this.sgpService.obtenerEriList(proyectoList[index].codigo_expediente)
                    }
                }
                if (this.tieneActividad) {await this.sgpService.obtenerProyActividadList(proyectoList[index].codigo_expediente, this.funcion.nid_funcion, this.user.nidPersonal)}
            } else {
                await this.sgpService.obtenerVisitas(proyectoList[index].codigo_expediente, this.funcion.nid_funcion, this.user.nidPersonal)
                this.incrementaProgreso()
            }
        }
        
    }

    calculaProgreso(mensaje: string) {
        if (mensaje.startsWith('#')) {
            if (mensaje.includes('P')) {
                this.progreso += 0.01
                this.cantidadUsuarios = parseInt(mensaje.substr(3))
            }
            if (mensaje.includes('U')) {
                this.progreso += (94 - this.cantidadProyectos) / this.cantidadProyectos / this.cantidadUsuarios / 100
            }

        } else {
            this.mensaje = 'Importando: ' + mensaje
        }
    }

    incrementaProgreso() {
        this.progreso += (70 / this.cantidadProyectos / 2 / 100)
    }
}
