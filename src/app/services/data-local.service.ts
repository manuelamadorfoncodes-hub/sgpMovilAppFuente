import { Portafolio, Reporte, Tipo, ZonalModulo } from './../model/generales';
import { EventEmitter, Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { TiposActividadesSuper, PlanActividad, ActividadParametro, Plan, SamAccion } from '../model/plan-actividad';
import { Proyecto, Ambito, TecnologiaPartida, NuecleoEjecutor, Periodo, TecnologiaColectiva, TecnologiaColectivaDetalle, EntregaInsumo } from '../model/proyectos';
import { Usuario, TecnologiaFase, UsuarioParametro, ActividadProductiva } from '../model/usuarios';
import { Opcion, Zonal, Perfil, ArchivosConfig, User, Funcion } from '../model/generales';
import { Eri, EriParametro } from '../model/eri';
import { Notificacion } from '../model/notificaciones';
import { Visita, VisitaParametro } from '../model/visitas';
import { ProyActividad, ParametroProyAct } from '../model/actividades';
import { Agente, AgenteParametro } from '../model/agentes';
import { GrupoPartida, Presupuesto } from '../model/presupuesto';

@Injectable({
    providedIn: 'root'
})
export class DataLocalService {


    private actividades: ProyActividad[] = []
    private actividades$ = new Subject<ProyActividad[]>();
    private proyectos: Proyecto[]
    private proyectos$ = new Subject<Proyecto[]>()
    private usuarios: Usuario[] = []
    private usuarios$ = new Subject<Usuario[]>()
    // private agentes: Agente[] = []
    // private agentes$ = new Subject<Agente[]>()

    notificacionesListener = new EventEmitter<Notificacion[]>()
    notificacionesSinLeerListener = new EventEmitter<number>()
    visitasListener = new EventEmitter<Visita[]>()
    planActividadesListener = new EventEmitter<PlanActividad[]>()
    accionesListener = new EventEmitter<SamAccion[]>()
    eriListener = new EventEmitter<Eri[]>()
    agentesListener = new EventEmitter<Agente[]>()
    
    constructor(private storage: StorageService) {}

    async leerFlagDataInicial() {
        const flag = await this.storage.get('flagDataInicial') || null
        return flag
    }

    async guardarFlagDataInicial() {
        await this.storage.set('flagDataInicial', 1)
        return 1
    }

    async leerUser() {
        const user: User = await this.storage.get('user') || null
        return user
    }

    async guardarUser(user: User) {
        await this.storage.set('user', user)
        return user
    }

    async leerModulo() {
        const modulo = await this.storage.get('modulo') || null
        return modulo
    }

    async leerPermisoZonal() {
        const zonal = await this.storage.get('permisoZonal') || null
        return zonal
    }

    async buscarOpcion(nombreOpcion: string, opciones:  Opcion[]) {
        for (let index = 0; index < opciones.length; index++) {
            if (opciones[index].txtnombreobjeto === nombreOpcion) {
                return opciones[index]
            } else {
                if (opciones[index].opciones) {
                    const opcionEncontrada: Opcion = await this.buscarOpcion(nombreOpcion, opciones[index].opciones)
                    if (opcionEncontrada) {return opcionEncontrada}
                // } else {
                //     return null
                }
            }
        }
    }

    async leerOpcion(nombreOpcion: string) {
        const permisoZonal: ZonalModulo = await this.leerPermisoZonal()
        const opciones: Opcion[] = permisoZonal.opciones
        const opcion: Opcion = await this.buscarOpcion(nombreOpcion, opciones)
        return opcion
    }

    async leerZonales() {
        const zonales: Zonal[] = await this.storage.get('zonales') || null
        return zonales
    }

    async leerPerfiles() {
        const perfiles: Perfil[] = await this.storage.get('perfiles') || null
        return perfiles
    }

    async leerFuncion() {
        const funcion: Funcion = await this.storage.get('funcion') || null
        return funcion
    }

    async leerActividadSuperTipos() {
        const tipos: TiposActividadesSuper = await this.storage.get('tiposActividadesSuper') || null
        return tipos
    }

    async leerPortafolios() {
        const portafolios: Portafolio[] = await this.storage.get('portafolios') || null
        return portafolios
    }

    async leerArchivosConfig() {
        const archivos: ArchivosConfig = await this.storage.get('archivosConfig') || null
        return archivos
    }

    async leerTecnologiaFase() {
        const tecnologiaFase: TecnologiaFase[] = await this.storage.get('tecnologiaFase') || null
        return tecnologiaFase
    }

    async leerActividadProductiva() {
        const actividadProductiva: ActividadProductiva[] = await this.storage.get('actividadProductiva') || null
        return actividadProductiva
    }

    leerProyectos$(): Observable<Proyecto[]> {
        return this.proyectos$.asObservable();
    }

    async leerProyectos() {
        const zonal = await this.leerZonalSeleccionada()
        if (zonal) {
            this.proyectos = await this.storage.get(`proyectos${zonal.cod_zonal}`) || null
        } else {
            this.proyectos = await this.storage.get('proyectos') || null
        }
        this.proyectos$.next(this.proyectos);
        return this.proyectos
    }

    // async leerProyectosPorZonal() {
    //     const zonal = await this.leerZonalSeleccionada()
    //     const proyectos: Proyecto[] = await this.storage.get(`proyectos${zonal.cod_zonal}`) || null
    //     return proyectos
    // }

    async guardarZonalSeleccionada(zonal: Zonal) {
        await this.storage.set('zonalSeleccionada', zonal)
    }

    async leerZonalSeleccionada() {
        const zonalSelecionada: Zonal = await this.storage.get('zonalSeleccionada') || null
        return zonalSelecionada
    }

    async guardarProyectoSeleccionado(proyecto: Proyecto) {
        await this.storage.set('proyectoSeleccionado', proyecto)
    }

    async leerProyectoSeleccionado() {
        const proyectoSeleccionado: Proyecto = await this.storage.get('proyectoSeleccionado') || null
        return proyectoSeleccionado
    }

    async guardarProyectoLista(proyecto: Proyecto, zonal?: Zonal) {
        if (!zonal) {zonal = await this.leerZonalSeleccionada()}
        if (zonal) {
            this.proyectos = await this.storage.get(`proyectos${zonal.cod_zonal}`) || null
            const index = this.proyectos.findIndex(proy => proy.codigo_expediente === proyecto.codigo_expediente)
            this.proyectos[index] = proyecto
            await this.storage.set(`proyectos${zonal.cod_zonal}`, this.proyectos)
        } else {
            this.proyectos = await this.storage.get('proyectos') || null
            const index = this.proyectos.findIndex(proy => proy.codigo_expediente === proyecto.codigo_expediente)
            this.proyectos[index] = proyecto
            await this.storage.set(`proyectos`, this.proyectos)
        }
        this.proyectos$.next(this.proyectos);
    }

    async leerProyecto(codigo: string) {
        const proyecto: Proyecto = await this.storage.get(codigo) || null
        return proyecto
    }

    async eliminarProyectos() {
        const proyectos = await this.leerProyectos()
        if (proyectos) {
            for (let index = 0; index < proyectos.length; index++) {
                this.storage.eliminarProyecto(proyectos[index].codigo_expediente)
            }
            await this.storage.remove('proyectos')
            await this.storage.remove('proyectoSeleccionado')
        }
    }

    async leerAmbitoProyecto(codigo: string) {
        const ambito: Ambito[] = await this.storage.get(`${codigo}.ambito`) || []
        return ambito
    }

    async leerTecnologiaPartidaProyecto(codigo: string) {
        const tecnologiaPartida: TecnologiaPartida[] = await this.storage.get(`${codigo}.tecnologiaPartida`) || []
        return tecnologiaPartida
    }

    // leerAgentes$(): Observable<Agente[]> {
    //     return this.agentes$.asObservable();
    // }

    async leerAgentesProyecto(codigo: string) {
        const agentes: Agente[] = await this.storage.get(`${codigo}.agentes`) || []
        // const proyecto: Proyecto = await this.leerProyecto(codigo)
        this.agentesListener.emit(agentes)
        return agentes
    }

    // async leerAgentesProyecto(codigo: string) {
    //     this.agentes = await this.storage.get(`${codigo}.agentes`) || []
    //     // const proyecto: Proyecto = await this.leerProyecto(codigo)
    //     // this.agentesListener.emit(agentes)
    //     this.agentes$.next(this.agentes);
    //     return this.agentes
    // }

    async leerAgenteParametro() {
        const agenteParametro: AgenteParametro = await this.storage.get(`agenteParametro`) || null
        return agenteParametro
    }

    // async guardarAgente(agente: Agente) {
    //     const agenteList: Agente[] = await this.storage.get(`${agente.codigo_expediente}.agentes`) || []
    //     agenteList[agente.id] = agente
    //     await this.storage.set(`${agente.codigo_expediente}.agentes`, agenteList)
    //     // this.agentesListener.emit(agenteList)
    //     this.agentes = agenteList
    //     this.agentes$.next(this.agentes)
    //     return agente
    // }

    async guardarAgente(agente: Agente) {
        const agenteList: Agente[] = await this.storage.get(`${agente.codigo_expediente}.agentes`) || []
        agente.nombre = agente.txt_apellido_paterno + ' ' + agente.txt_apellido_materno + ', ' + agente.txt_nombres
        agenteList[agente.id] = agente
        await this.storage.set(`${agente.codigo_expediente}.agentes`, agenteList)
        this.agentesListener.emit(agenteList)
        return agente
    }


    async leerNucleoEjecutorProyecto(codigo: string) {
        const nucleoEjecutor: NuecleoEjecutor[] = await this.storage.get(`${codigo}.nucleoEjecutor`) || []
        // const proyecto: Proyecto = await this.leerProyecto(codigo)
        return nucleoEjecutor
    }

    async leerProyectoPeriodo(codigo: string) {
        const periodos: Periodo[] = await this.storage.get(`${codigo}.periodos`) || []
        // const proyecto: Proyecto = await this.leerProyecto(codigo)
        return periodos
    }
    // async leerActividadesSuper() {
    //     const zonal = await this.leerZonalSeleccionada()
    //     this.planActividades = await this.storage.get(`actividadesSuper${zonal.cod_zonal}`) || []
    //     this.planActividades$.next(this.planActividades);
    //     return this.planActividades
    // }

    async leerVisitaParametro() {
        const visitaParametro: VisitaParametro = await this.storage.get(`visitaParametro`) || null
        return visitaParametro
    }

    async leerVisitasProyecto(codigo: string) {
        const visitasList: Visita[] = await this.storage.get(`${codigo}.visitas`) || []
        return visitasList
    }

    async guardarVisita(visita: Visita, index: number, nueva?: boolean) {
        visita = this.actualizarPptoVisita(visita, nueva)
        const visitasList = await this.storage.get(`${visita.codigo_expediente}.visitas`) || []
        if (index || index === 0) {
            visitasList[index] = visita
        } else {
            visitasList.unshift(visita)
        }
        await this.storage.set(`${visita.codigo_expediente}.visitas`, visitasList)
        this.visitasListener.emit(visitasList)
    }

    async eliminarVisita(codigo: string, index: number) {
        const visitasList = await this.storage.get(`${codigo}.visitas`)
        visitasList.splice(index,1)
        await this.storage.set(`${codigo}.visitas`, visitasList)
        this.visitasListener.emit(visitasList)
    }

    async leerUsuariosParametro() {
            const usuarioParametro: UsuarioParametro = await this.storage.get(`usuarioParametro`) || null
            return usuarioParametro
    }

    async leerUsuariosProyecto(codigo: string) {
        this.usuarios = await this.storage.get(`${codigo}.usuarios`) || []
        this.usuarios$.next(this.usuarios)
        return this.usuarios
    }

    leerUsuarios$(): Observable<Usuario[]> {
        return this.usuarios$.asObservable();
    }

    async leerUsuario(proyecto: string, id: number) {
        const usuario: Usuario = await this.storage.get(`${proyecto}.usuario${id}`) || null
        return usuario
    }

    // cambio txt_documento_identidad
    async guardarUsuario(usuario: Usuario, nuevo: boolean) {
        const usuarios: Usuario[] = await this.leerUsuariosProyecto(usuario.codigo_expediente)
        if (nuevo) {
            usuario.id = usuarios.length
            usuario.orden = 0

            const usuarioNuevo: Usuario = {
                id: usuario.id,
                orden: usuario.orden,
                codigo_expediente: usuario.codigo_expediente,
                nid_personal_proyecto: usuario.nid_personal_proyecto,
                tip_documento_identidad: usuario.tip_documento_identidad,
                txt_documento_identidad: usuario.txt_documento_identidad,
                txt_apellido_paterno: usuario.txt_apellido_paterno,
                txt_apellido_materno: usuario.txt_apellido_materno,
                txt_nombres: usuario.txt_nombres,
                fec_inicio: usuario.fec_inicio,
                fec_termino: usuario.fec_termino,
                est_personal: usuario.est_personal,
                txt_estado: usuario.txt_estado,
                txt_tipo_cambio: usuario.solicitud ? usuario.solicitud.txt_tipo_cambio : null,
                txt_estado_solicitud: usuario.solicitud ? usuario.solicitud.txt_estado_solicitud : null,
                cambioTecnologia: usuario.cambioTecnologia,
                solicitudCambioIncompleto: usuario.solicitudCambioIncompleto,
                num_latitud: usuario.num_latitud,
                num_longitud: usuario.num_longitud,
                observacionGeolocalizacion: usuario.observacionGeolocalizacion,
                flgDatos: true,
            }

            usuarios.unshift(usuarioNuevo)
            await this.storage.set(`${usuario.codigo_expediente}.usuario${usuario.id}`, usuario)
            for (let index = 0; index < usuarios.length; index++) {
                usuarios[index].orden = index;
            }
        } else {
            usuarios[usuario.orden].tip_documento_identidad = usuario.tip_documento_identidad
            usuarios[usuario.orden].txt_documento_identidad = usuario.txt_documento_identidad
            usuarios[usuario.orden].txt_apellido_paterno = usuario.txt_apellido_paterno
            usuarios[usuario.orden].txt_apellido_materno = usuario.txt_apellido_materno
            usuarios[usuario.orden].txt_nombres = usuario.txt_nombres
            usuarios[usuario.orden].txt_estado = usuario.txt_estado
            usuarios[usuario.orden].est_personal = usuario.est_personal
            usuarios[usuario.orden].nid_solicitud = usuario.nid_solicitud
            usuarios[usuario.orden].txt_tipo_cambio = usuario.solicitud ? usuario.solicitud.txt_tipo_cambio : null
            usuarios[usuario.orden].txt_estado_solicitud = usuario.solicitud ? usuario.solicitud.txt_estado_solicitud : null
            usuarios[usuario.orden].cambioFicha = usuario.cambioFicha
            usuarios[usuario.orden].fichaIncompleto = usuario.fichaIncompleto
            usuarios[usuario.orden].cambioActividadProd = usuario.cambioActividadProd
            usuarios[usuario.orden].actividadProdIncompleto = usuario.actividadProdIncompleto
            usuarios[usuario.orden].cambioTecnologia = usuario.cambioTecnologia
            usuarios[usuario.orden].cambioTecnologiaIncompleto = usuario.cambioTecnologiaIncompleto
            usuarios[usuario.orden].solicitudCambioIncompleto = usuario.solicitudCambioIncompleto
            usuarios[usuario.orden].registroAvanceTec = usuario.registroAvanceTec
            usuarios[usuario.orden].tipoAvance = usuario.tipoAvance
            usuarios[usuario.orden].registroAvanceIncompleto = usuario.registroAvanceIncompleto
            usuarios[usuario.orden].flg_cambio_yachachiq = usuario.flg_cambio_yachachiq
            usuarios[usuario.orden].txt_yachachiq = usuario.txt_yachachiq
            usuarios[usuario.orden].nid_personal_reemplazo = usuario.nid_personal_reemplazo
            usuarios[usuario.orden].txt_incompleto = usuario.txt_incompleto
            usuarios[usuario.orden].cambioCaracterizacion = usuario.cambioCaracterizacion
            usuarios[usuario.orden].estadoCaracterizacion = usuario.estadoCaracterizacion
            usuarios[usuario.orden].fichaCaracterizIncompleto = usuario.fichaCaracterizIncompleto
            usuarios[usuario.orden].estadoCaracterizacion = usuario.fichaCaracterizacion ? usuario.fichaCaracterizacion.est_ficha : null
            usuarios[usuario.orden].flgDatos = true
            usuarios[usuario.orden].cambioMiembros = usuario.cambioMiembros
            usuarios[usuario.orden].miembrosIncompleto = usuario.miembrosIncompleto
            usuarios[usuario.orden].cambioEntregaInsumos = usuario.cambioEntregaInsumos
            usuarios[usuario.orden].entregaInsumosIncompleto = usuario.entregaInsumosIncompleto
            usuarios[usuario.orden].cambioFichaMujer = usuario.cambioFichaMujer
            usuarios[usuario.orden].fichaMujerIncompleto = usuario.fichaMujerIncompleto
            usuarios[usuario.orden].lineaBase = usuario.lineaBase
            usuarios[usuario.orden].eliminaFichaLSalidaVivienda = usuario.eliminaFichaLSalidaVivienda
            usuarios[usuario.orden].num_latitud = usuario.num_latitud
            usuarios[usuario.orden].num_longitud = usuario.num_longitud
            usuarios[usuario.orden].observacionGeolocalizacion = usuario.observacionGeolocalizacion
            usuarios[usuario.orden].cambioAsistTecMem = usuario.cambioAsistTecMem
            usuarios[usuario.orden].asistTecMemIncompleta = usuario.asistTecMemIncompleta
            usuarios[usuario.orden].cambioSeleccionMem = usuario.cambioSeleccionMem
            usuarios[usuario.orden].seleccionMemIncompleta = usuario.seleccionMemIncompleta
            usuarios[usuario.orden].cambioLineaBaseMem = usuario.cambioLineaBaseMem
            usuarios[usuario.orden].lineaBaseMemIncompleta = usuario.lineaBaseMemIncompleta
            usuarios[usuario.orden].cambioLineaSalidaMem = usuario.cambioLineaSalidaMem
            usuarios[usuario.orden].lineaSalidaMemIncompleta = usuario.lineaSalidaMemIncompleta

            usuario.flgDatos = true
            await this.storage.set(`${usuario.codigo_expediente}.usuario${usuario.id}`, usuario)
        }
        await this.storage.set(`${usuario.codigo_expediente}.usuarios`, usuarios)
        this.usuarios = usuarios
        this.usuarios$.next(this.usuarios)
        return usuarios[usuario.orden]
    }

    async eliminarUsuario(usuario: Usuario) {
        let usuarios: Usuario[] = await this.leerUsuariosProyecto(usuario.codigo_expediente)
        await this.storage.remove(`${usuario.codigo_expediente}.usuario${usuario.id}`)
        const algo = usuarios.splice(usuario.orden,1)
        for (let index = 0; index < usuarios.length; index++) {
            usuarios[index].orden = index;
        }
        await this.storage.set(`${usuario.codigo_expediente}.usuarios`, usuarios)
        this.usuarios = usuarios
        this.usuarios$.next(this.usuarios)
        return usuarios
    }

    async leerEriParametro() {
        const eriParametro: EriParametro = await this.storage.get(`eriParametro`) || null
        return eriParametro
    }

    async leerEri(codigo: string) {
        const eriList: Eri[] = await this.storage.get(`${codigo}.eri`) || []
        this.eriListener.emit(eriList)
        return eriList
    }

    async guardarEri(eri: Eri) {
        console.log('eri, index :>> ', eri);
        const eriList: Eri[] = await this.storage.get(`${eri.codigo_expediente}.eri`)
        eriList[eri.id] = eri
        await this.storage.set(`${eri.codigo_expediente}.eri`, eriList)
        this.eriListener.emit(eriList)
    }

    async leerActividades(codigo: string) {
        this.actividades = await this.storage.get(`${codigo}.actividades`) || []
        // this.actividades$.next(this.actividades);
        return this.actividades
    }

    leerActividades$(): Observable<ProyActividad[]> {
        return this.actividades$.asObservable();
    }

    // async guardarActividad(actividad: Actividad) {
    //     const proyecto: Proyecto = await this.leerProyectoSeleccionado()
    //     if (actividad.id) {
    //         proyecto.actividades[actividad.id] = actividad
    //     } else {
    //         if (proyecto.actividades) {
    //             actividad.id = proyecto.actividades.length
    //         } else {
    //             actividad.id = 0
    //             const actividades: Actividad[] = []
    //             proyecto.actividades = actividades
    //         }
    //         proyecto.actividades.push(actividad)
    //     }
    //     this.guardarProyecto(proyecto)
    //     this.actividades = proyecto.actividades
    //     this.actividades$.next(this.actividades);Listener
    // }

    async  guardarActividad(actividad: ProyActividad) {
        console.log('actividad :>> ', actividad);
        console.log('actividad.orden :>> ', actividad.orden);

        const actividades: ProyActividad[] = await this.leerActividades(actividad.codigo_expediente)
        actividades[actividad.orden] = actividad
        console.log('actividades[actividad.orden] :>> ', actividades[actividad.orden]);
        await this.storage.set(`${actividad.codigo_expediente}.actividades`, actividades)
        this.actividades = actividades
        this.actividades$.next(this.actividades)
        return actividades[actividad.orden]
    }

    async leerNotificaciones() {
        const notificacionList: Notificacion[] = await this.storage.get(`notificaciones`) || []
        this.notificacionesListener.emit(notificacionList)
        this.actualizaCantidadNotificaciones(notificacionList)
        return notificacionList
    }

    async guardarNotificacionesNuevas(notificacionNuevas: Notificacion[]) {
        const notificacionList: Notificacion[] = await this.storage.get(`notificaciones`) || []
        notificacionList.unshift(...notificacionNuevas)
        await this.storage.set('notificaciones', notificacionList)
        this.notificacionesListener.emit(notificacionList)
        this.actualizaCantidadNotificaciones(notificacionList)
        return notificacionList
    }

    async marcarNotificacionLeida(notificacionList: Notificacion[], notificacion: Notificacion) {
        const leidas: Notificacion[] = await this.storage.get('notiLeidas') || []
        leidas.push(notificacion)
        await this.storage.set('notiLeidas', leidas)
        await this.storage.set('notificaciones', notificacionList)
        this.actualizaCantidadNotificaciones(notificacionList)
    }

    async eliminarNotificacion(notificacionList: Notificacion[], notificacion: Notificacion) {
        const eliminadas: Notificacion[] = await this.storage.get('notiEliminadas') || []
        eliminadas.push(notificacion)
        await this.storage.set('notiEliminadas', eliminadas)
        await this.storage.set('notificaciones', notificacionList)
        this.actualizaCantidadNotificaciones(notificacionList)
    }

    async leerNotificacionesLeidas() {
        const notificacionList: Notificacion[] = await this.storage.get(`notiLeidas`) || []
        return notificacionList
    }

    async leerNotificacionesEliminadas() {
        const notificacionList: Notificacion[] = await this.storage.get(`notiEliminadas`) || []
        return notificacionList
    }

    actualizaCantidadNotificaciones(notificacionList: Notificacion[]) {
        let cantidad = 0
        for (let index = 0; index < notificacionList.length; index++) {
            if (!notificacionList[index].flg_eliminado && !notificacionList[index].flg_leido) {cantidad ++}
        }
        this.notificacionesSinLeerListener.emit(cantidad)
    }

    async leerActividadParametro() {
        const actividadParametro: ActividadParametro = await this.storage.get(`actividadParametro`) || null
        return actividadParametro
    }

    async leerPlan() {
        const planList: Plan[] = await this.storage.get(`planes`) || []
        console.log('planList :>> ', planList);
        return planList
    }

    async leerPlanActividades() {
        const planActividadesList: PlanActividad[] = await this.storage.get(`planActividades`) || []
        return planActividadesList
    }

    async leerPlanActividad(index) {
        const planActividadesList: PlanActividad[] = await this.storage.get(`planActividades`) || []
        return planActividadesList[index]
    }

    async guardarPlanActividad(actividad: PlanActividad) {
        const planActividadesList: PlanActividad[] = await this.storage.get(`planActividades`) || []
        if (actividad.id || actividad.id === 0) {
            planActividadesList[actividad.id] = actividad
        } else {
            planActividadesList.unshift(actividad)
            for (let index = 0; index < planActividadesList.length; index++) {
                planActividadesList[index].id = index;
            }
        }
        await this.storage.set(`planActividades`, planActividadesList)
        this.planActividadesListener.emit(planActividadesList)
        return planActividadesList
    }

    async eliminarPlanActividad(index: number) {
        const planActividadesList: PlanActividad[] = await this.storage.get(`planActividades`) || []
        planActividadesList.splice(index,1)
        await this.storage.set(`planActividades`, planActividadesList)
        this.planActividadesListener.emit(planActividadesList)
        return planActividadesList
    }

    async leerAcciones() {
        const accionesList: SamAccion[] = await this.storage.get(`acciones`) || []
        return accionesList
    }

    async guardarAccionActividad(accion: SamAccion, index: number) {
        const accionActividList: SamAccion[] = await this.storage.get(`acciones`) || []
        if (index || index === 0) {
            accionActividList[index] = accion
        } else {
            accion.id = accionActividList.length
            accionActividList.unshift(accion)
        }
        await this.storage.set(`acciones`, accionActividList)
        this.accionesListener.emit(accionActividList)
        return accionActividList
    }

    async leerReportes() {
        const reportesList: Reporte[] = await this.storage.get(`reportes`) || []
        return reportesList
    }

    // async leerEris() {
    //     const eriList: Eri[] = await this.storage.get(`eris`) || []
    //     return eriList
    // }

    async leerTecnologiaColectiva (codigoProyecto: string) {
        const tecnologiaList: TecnologiaColectiva[] = await this.storage.get(`${codigoProyecto}.tecnologiaColectiva`)
        return tecnologiaList
    }

    async guardarTecnologiaColectivaList(tecnologiaColectiva: TecnologiaColectiva[]) {
        await this.storage.set(`${tecnologiaColectiva[0].codigo_expediente}.tecnologiaColectiva`, tecnologiaColectiva)
        return tecnologiaColectiva
    }

    async guardarTecnologiaColectiva(tecnologia: TecnologiaColectiva, index: number) {
        const tecnologiaList: TecnologiaColectiva[] = await this.storage.get(`${tecnologia.codigo_expediente}.tecnologiaColectiva`) || []
        tecnologiaList[index] = tecnologia
        await this.storage.set(`${tecnologia.codigo_expediente}.tecnologiaColectiva`, tecnologiaList)
        return tecnologia
    }

    async guardarTecnologiaColectivaDetalle(indexTec: number, detalle: TecnologiaColectivaDetalle, indexDet: number) {
        console.log('detalle :>> ', detalle);
        const tecnologiaList: TecnologiaColectiva[] = await this.storage.get(`${detalle.codigo_expediente}.tecnologiaColectiva`) || []
        tecnologiaList[indexTec].detalle[indexDet] = detalle
        await this.storage.set(`${detalle.codigo_expediente}.tecnologiaColectiva`, tecnologiaList)
        return detalle
    }

    // async guardarTecnologiaColectivaEntregaActivos(indexTec: number, entrega: EntregaInsumo) {
    //     const tecnologiaList: TecnologiaColectiva[] = await this.storage.get(`${entrega.codigo_expediente}.tecnologiaColectiva`) || []
    //     tecnologiaList[indexTec].entregaInsumos = entrega
    //     await this.storage.set(`${entrega.codigo_expediente}.tecnologiaColectiva`, tecnologiaList)
    //     return entrega
    // }

    async leerParametroProyAct() {
        const parametroProyAct: ParametroProyAct = await this.storage.get(`parametroProyAct`) || null
        return parametroProyAct
    }

    async leerPresupuestoProyecto(codigo: string) {
        const presupuesto: Presupuesto = await this.storage.get(`${codigo}.presupuesto`) || []
        return presupuesto
    }

    actualizarPptoVisita(visita: Visita, nueva?: boolean) {
        if (visita.presupuesto) {
            // determinar si es partida representativa
            for (let idxPpto = 0; idxPpto < visita.presupuesto.ablEstructura.length; idxPpto++) {
                const subPpto = visita.presupuesto.ablEstructura[idxPpto]
                if (subPpto.grupoPartida && subPpto.grupoPartida.length > 0) {
                    for (let idxGrupo = 0; idxGrupo < subPpto.grupoPartida.length; idxGrupo++) {
                        const grupo = subPpto.grupoPartida[idxGrupo]
                        if (grupo.partida && grupo.partida.length > 0) {
                            if (grupo.partida.find(item => item.flg_representativa === 1)) {
                                visita.presupuesto.esPartidaRepresentativa = true
                                break
                            }
                        }
                    }
                }
                if (visita.presupuesto.esPartidaRepresentativa) {break}
            }
            console.log('esPartidaRepresentativa?: boolean :>> ', visita.presupuesto.esPartidaRepresentativa);
            let sumaEjecSubPpto = 0
            let sumaPresSubPpto = 0
            for (let idxPpto = 0; idxPpto < visita.presupuesto.ablEstructura.length; idxPpto++) {
                const subPpto = visita.presupuesto.ablEstructura[idxPpto]
                if (visita.presupuesto.esPartidaRepresentativa) {subPpto.esPartidaRepresentativa = true}
                let sumaPptoActual = 0
                let sumaPptoProgramado = 0
                let sumaPptoEjecutado = 0
                if (subPpto.grupoPartida && subPpto.grupoPartida.length > 0) {
                    for (let idxGrupo = 0; idxGrupo < subPpto.grupoPartida.length; idxGrupo++) {
                        const grupo = subPpto.grupoPartida[idxGrupo];
                        let sumaCostoPRep = 0
                        let sumaCostoPGrp = 0
                        if (grupo.partida && grupo.partida.length > 0) {
                            //if (grupo.partida.find(item => item.flg_representativa === 1)) {subPpto.esPartidaRepresentativa = true}
                            if (subPpto.esPartidaRepresentativa && !(grupo.partida.find(item => item.flg_representativa === 1))) {
                                grupo.numMetrado = 0
                                grupo.porAvanceActual = 0
                                grupo.porAvanceProgramado = 0
                                grupo.porAvanceEjecutado = 0
                            }
                            for (let idxPart = 0; idxPart < grupo.partida.length; idxPart++) {
                                const partida = grupo.partida[idxPart];
                                //if (nueva) {partida.num_ejecutado_actual = partida.num_ejecutado || 0}
                                if (subPpto.esPartidaRepresentativa && partida.flg_representativa === 1) {
                                    grupo.numMetrado = partida.num_ejecutado_actual
                                    grupo.porAvanceActual = Math.round((partida.num_ejecutado_actual / partida.num_presupuestado) * 100) / 100
                                    grupo.porAvanceProgramado = Math.round((partida.num_programado / partida.num_presupuestado) * 100) / 100
                                    grupo.porAvanceEjecutado = Math.round((partida.num_ejecutado / partida.num_presupuestado) * 100) / 100
                                }
                                sumaCostoPRep = sumaCostoPRep + (partida.imp_costo_partida * partida.num_presupuestado)
                                sumaCostoPGrp = sumaCostoPGrp + (partida.num_ejecutado_actual * partida.imp_costo_partida)
                                grupo.partida[idxPart] = partida
                            }
                        }
                        if (subPpto.esPartidaRepresentativa) {
                            grupo.imp_ejecutado_actual = sumaCostoPRep * grupo.porAvanceActual
                            grupo.imp_programado = sumaCostoPRep * grupo.porAvanceProgramado
                            grupo.imp_ejecutado = sumaCostoPRep * grupo.porAvanceEjecutado
                        } else {
                            grupo.imp_ejecutado_actual = sumaCostoPGrp
                        }

                        if (subPpto.esPartidaRepresentativa) {
                            // grupo.porAvanceActual = Math.round((grupo.imp_ejecutado_actual / grupo.imp_presupuestado * 100) * 100) / 100
                            // grupo.porcentajeAvanceAcumulado = Math.round((impProgramadoGrupo / grupo.imp_presupuestado * 100) * 100) / 100
                            // grupo.porcentajeAvanceValorizado = Math.round((impEjecutadoGrupo / grupo.imp_presupuestado * 100) * 100) / 100
                        } else {
                            grupo.porAvanceActual = Math.round((grupo.imp_ejecutado_actual / grupo.imp_presupuestado) * 100) / 100
                            grupo.porAvanceProgramado = Math.round((grupo.imp_programado / grupo.imp_presupuestado) * 100) / 100
                            grupo.porAvanceEjecutado = Math.round((grupo.imp_ejecutado / grupo.imp_presupuestado) * 100) / 100
                            grupo.porAvanceEdit = grupo.porAvanceActual * 100
                        }
                        sumaPptoActual = sumaPptoActual + grupo.imp_ejecutado_actual
                        sumaPptoProgramado = sumaPptoProgramado + grupo.imp_programado
                        sumaPptoEjecutado = sumaPptoEjecutado + grupo.imp_ejecutado
                        grupo.icono = grupo.flg_concluida === 1 ? 1 : (grupo.flg_concluida === 0 ? 2 : 0) // flg_incompleto
                        subPpto.grupoPartida[idxGrupo] = grupo
                    }
                }
                subPpto.imp_ejecutado_actual = sumaPptoActual
                subPpto.imp_programado = sumaPptoProgramado
                subPpto.imp_ejecutado = sumaPptoEjecutado

                subPpto.porAvanceActual = Math.round((subPpto.imp_ejecutado_actual / subPpto.imp_presupuestado) *100) / 100
                subPpto.porAvanceEjecutado = Math.round((subPpto.imp_ejecutado / subPpto.imp_presupuestado) *100) / 100
                
                sumaEjecSubPpto = sumaEjecSubPpto + subPpto.imp_ejecutado_actual
                sumaPresSubPpto = sumaPresSubPpto + subPpto.imp_presupuestado

                const existeIncompleto = subPpto.grupoPartida.find(item => item.flg_concluida === 1)
                const existeCompleto = subPpto.grupoPartida.find(item => item.flg_concluida === 0)
                subPpto.flg_concluida = existeIncompleto ? 1 : (existeCompleto ? 0 : null) // flg_incompleto
                subPpto.icono = existeIncompleto ? 1 : (existeCompleto ? 2 : 0)
                visita.presupuesto.ablEstructura[idxPpto] = subPpto
            }
            visita.por_avance = Math.round(sumaEjecSubPpto / sumaPresSubPpto * 1000) / 1000
            
            visita.incompleto = visita.presupuesto.ablEstructura.find(item => item.flg_concluida === 1) ? true : (visita.presupuesto.ablEstructura.find(item => item.flg_concluida === 0) ? false : true)
        }
        return visita
    }
}
