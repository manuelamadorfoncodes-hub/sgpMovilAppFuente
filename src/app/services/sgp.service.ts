import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';
import { environment } from '../../environments/environment'
import { Usuario, TecnologiaFase, UsuarioParametro, Integrante, Miembro, FichaMujer, FichaAsistTecMem, LineaBaseMem } from '../model/usuarios';
import { ActividadProductiva, TecnologiaAvance, TecnologiaAvanceProd, ActividadProdDetalle, FichaVivienda, FichaEmprendimiento } from './../model/usuarios';
import { Resp } from '../model/interfaces';
import { Proyecto, TecnologiaColectivaDetalle, TecnologiaColectiva, EntregaInsumo, TecnologiaInsumo } from '../model/proyectos';
import { Zonal, ArchivosConfig, Archivo, Funcion, Portafolio } from '../model/generales';
import { ActividadDetalle, PlanActividad, ActividadParametro, Plan, SamAccion } from '../model/plan-actividad';
import { Notificacion } from '../model/notificaciones';
import { Visita, VisitaParametro } from '../model/visitas';
import { Eri, EriParametro, InformeEri } from '../model/eri';
import { ProyActividad } from '../model/actividades';
import { AgenteParametro, Evaluacion } from '../model/agentes';
import { GrupoPartidaFoto } from '../model/presupuesto';

@Injectable({
  providedIn: 'root'
})
export class SgpService {

    proyectosListener = new EventEmitter<Proyecto[]>()
    mensajeListener = new EventEmitter<string>()

    
    constructor(private apiService: ApiService,
        private storage: StorageService) { }

    get(url: string): Observable<Resp> {
        this.apiService.setUrlPathApi(url)
        return this.apiService.execGetJson().pipe()
    }

    post(url: string, data: any): Observable<Resp> {
        this.apiService.setUrlPathApi(url)
        return this.apiService.execPostJson(data).pipe()
    }

    getCorreo(url: string): Observable<Resp> {
        this.apiService.setUrlPathApiCorreo(url)
        return this.apiService.execGetJson().pipe()
    }

    postCorreo(url: string, data: any): Observable<Resp> {
        this.apiService.setUrlPathApiCorreo(url)
        return this.apiService.execPostJson(data).pipe()
    }

    postReporte(url: string, data: any): Observable<Resp> {
        this.apiService.setUrlPathApiReporte(url)
        return this.apiService.execPostJson(data).pipe()
    }

    postBase(url: string, data: any): Observable<Resp> {
        this.apiService.setUrlPathApiBase(url)
        return this.apiService.execPostJson(data).pipe()
    }
    // desuso 2023-10-11
    // async postFile(url: string, data: any, archivo: Archivo) {
    //     this.apiService.setUrlPathApi(url)
    //     return await this.apiService.uploadFile(data, archivo)
    // }

    getArchivo(url: string): Observable<Resp> {
        this.apiService.setUrlPathApiArchivo(url)
        return this.apiService.execGetJson().pipe()
    }

    // async postUploadFile(url: string, data: any, archivo: Archivo) {
    //     this.apiService.setUrlPathApiArchivo(url)
    //     return await this.apiService.uploadFile(data, archivo)
    // }

    // async postDownloadFile(url: string, rutaArchivo: string) {
    //     this.apiService.setUrlPathApiArchivo(url)
    //     return await this.apiService.downloadFile(rutaArchivo)
    // }

    obtenerPortafolios() {
        return new Promise<Portafolio>( resolve => {
            this.get(`/general/portafolios`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const portafolios: Portafolio = resp.result
                await this.storage.set('portafolios', portafolios)
                resolve(portafolios)
            })
        })
    }

    obtenerFuncion(perfil: number) {
        console.log('obtenerFuncion');
        return new Promise<Funcion>( resolve => {
            this.get(`/agente/obtenerFuncion/${perfil}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const funcion: Funcion = resp.result
                await this.storage.set('funcion', funcion)
                resolve(funcion)
            })
        })
    }

    obtenerFuncionAgente(perfil: number, nidPersonal: number) {
        console.log('obtenerFuncionAgente');
        return new Promise<Funcion>( resolve => {
            this.get(`/agente/obtenerFuncionAgente/${perfil}/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const funcion: Funcion = resp.result
                await this.storage.set('funcion', funcion)
                resolve(funcion)
            })
        })
    }

    obtenerZonales(nidPersonal: number) {
        return new Promise<Zonal[]>( resolve => {
            this.get(`/agente/listarZonales/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const zonales: Zonal[] = resp.result
                await this.storage.set('zonales', zonales)
                resolve(zonales)
            })
        })
    }

    obtenerProyectosPorZonal(zonal: string) {
        return new Promise<Proyecto[]>( resolve => {
            this.get(`/proyecto/listarPorZonal/${zonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const proyectos: Proyecto[] = resp.result
                await this.storage.set(`proyectos${zonal}`, proyectos)
                resolve(proyectos)
            })
        })
    }

    obtenerProyectosPorAgente(nidFuncion: number, nidPersonal: number, codZonal: string) {
        return new Promise<Proyecto[]>( resolve => {
            this.get(`/agente/listarProyectosPorZonal/${nidFuncion}/${nidPersonal}/${codZonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const proyectos: Proyecto[] = resp.result
                await this.storage.set(`proyectos`, proyectos)
                this.proyectosListener.emit(proyectos)
                resolve(proyectos)
            })
        })
    }

    obtenerAgenteParametro() {
        return new Promise<AgenteParametro>( resolve => {
            this.get(`/agente/obtenerParametros`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const parametros: AgenteParametro = resp.result
                await this.storage.set(`agenteParametro`, parametros)
                resolve(parametros)
            })
        })
    }

    obtenerAgente(codigoProyecto: string, nidFuncion: number, nidPersonal: number, nidAsignacion: number, index: number) {
        return new Promise<any>( resolve => {
            this.get(`/agente/obtenerAgente/${codigoProyecto}/${nidFuncion}/${nidPersonal}/${nidAsignacion}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const agente = resp.result
                resolve(agente)
            })
        })
    }

    guardarEvaluacion(evaluacion: Evaluacion) {
        const parametros = {
            evaluacion: JSON.stringify(evaluacion)
        }
        console.log('parametros :>> ', parametros);
        return new Promise<any>( resolve => {
            this.post(`/agente/guardarEvaluacion`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    // obtenerProyectoDatos(codigo: string, nidFuncion: number, nidPersonal: number) {
    //     return new Promise<Proyecto>( resolve => {
    //         this.mensajeListener.emit('Proyecto' + codigo)
    //         this.get(`/proyecto/obtenerProyecto/${codigo}/${nidFuncion}/${nidPersonal}`).subscribe(async resp => {
    //             if (!resp.result) { resolve(null) }
    //             const proyecto: Proyecto = resp.result
    //             const proyectoGuardar: Proyecto = {
    //                 codigo_expediente: proyecto.codigo_expediente,
    //                 nombre_ne: proyecto.nombre_ne,
    //                 nombre_nec: proyecto.nombre_nec,
    //                 fec_inicio: proyecto.fec_inicio,
    //                 flg_ejecucion: proyecto.flg_ejecucion,
    //                 nid_tipo_proyecto: proyecto.nid_tipo_proyecto,
    //                 nid_sub_tipo_proyecto: proyecto.nid_sub_tipo_proyecto,
    //                 cod_zonal_ubicacion: proyecto.cod_zonal_ubicacion,
    //                 proyectos_nec: proyecto.proyectos_nec,
    //                 periodo_24: proyecto.periodo_24,
    //                 flgDatos: true,
    //                 cantidadUsuarios: proyecto.usuariosList ? proyecto.usuariosList.length : null
    //             }
    //             if (proyecto.usuariosList && proyecto.usuariosList.length > 0) {
    //                 this.mensajeListener.emit('#P:' + proyecto.usuariosList.length)
    //                 for (let index = 0; index < proyecto.usuariosList.length; index++) {
    //                     this.mensajeListener.emit('Usuario DNI ' + proyecto.usuariosList[index].txt_documento_identidad + ' (U' + (proyecto.usuariosList[index].nid_personal_proyecto || 0) + ' S' + (proyecto.usuariosList[index].nid_solicitud || 0) + ')')
    //                     const usuario = await this.obtenerUsuario(codigo, proyecto.usuariosList[index].nid_personal_proyecto || 0, proyecto.usuariosList[index].nid_solicitud || 0)
    //                     proyecto.usuariosList[index].id = index
    //                     proyecto.usuariosList[index].orden = index
    //                     proyecto.usuariosList[index].txt_tipo_cambio = usuario.solicitud ? usuario.solicitud.txt_tipo_cambio : null
    //                     proyecto.usuariosList[index].txt_estado_solicitud = usuario.solicitud ? usuario.solicitud.txt_estado_solicitud : null
    //                     proyecto.usuariosList[index].cambioTecnologia = usuario.cambioTecnologia
    //                     proyecto.usuariosList[index].registroAvanceTec = usuario.registroAvanceTec
    //                     proyecto.usuariosList[index].txt_incompleto = usuario.txt_incompleto
    //                     proyecto.usuariosList[index].estadoCaracterizacion = usuario.fichaCaracterizacion ? usuario.fichaCaracterizacion.est_ficha : null
    //                     usuario.id = index
    //                     await this.storage.set(`${codigo}.usuario${index}`, usuario)
    //                     this.mensajeListener.emit('#U')
    //                 }
    //             }
    //             await this.storage.set(`${codigo}`, proyectoGuardar)
    //             await this.storage.set(`${codigo}.ambito`, proyecto.ambito)
    //             await this.storage.set(`${codigo}.tecnologiaPartida`, proyecto.tecnologiaPartida)
    //             await this.storage.set(`${codigo}.usuarios`, proyecto.usuariosList)
    //             await this.storage.set(`${codigo}.actividades`, proyecto.actividades)
    //             await this.storage.set(`${codigo}.agentes`, proyecto.agentes)
    //             await this.storage.set(`${codigo}.nucleoEjecutor`, proyecto.nucleoEjecutor)
    //             await this.storage.set(`${codigo}.eri`, proyecto.eri)
    //             await this.storage.set(`${codigo}.periodos`, proyecto.periodos)
    //             console.log('proyecto :>> ', proyecto);
    //             resolve(proyecto)
    //         })
    //     })
    // }

    obtenerProyectoDatosBase(codigo: string, nidFuncion: number, nidPersonal: number) {
        return new Promise<Proyecto>( resolve => {
            this.mensajeListener.emit('Proyecto' + codigo)
            this.get(`/proyecto/obtenerProyecto/${codigo}/${nidFuncion}/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const proyecto: Proyecto = resp.result
                const proyectoGuardar: Proyecto = {
                    codigo_expediente: proyecto.codigo_expediente,
                    nombre_ne: proyecto.nombre_ne,
                    nombre_nec: proyecto.nombre_nec,
                    fec_inicio: proyecto.fec_inicio,
                    flg_ejecucion: proyecto.flg_ejecucion,
                    nid_tipo_proyecto: proyecto.nid_tipo_proyecto,
                    nid_sub_tipo_proyecto: proyecto.nid_sub_tipo_proyecto,
                    cod_zonal_ubicacion: proyecto.cod_zonal_ubicacion,
                    proyectos_nec: proyecto.proyectos_nec,
                    periodo_24: proyecto.periodo_24,
                    txt_incompleto: proyecto.txt_incompleto,
                    tip_grupo: proyecto.tip_grupo
                }
                await this.storage.set(`${codigo}`, proyectoGuardar)
                await this.storage.set(`${codigo}.ambito`, proyecto.ambito)
                await this.storage.set(`${codigo}.tecnologiaPartida`, proyecto.tecnologiaPartida)
                await this.storage.set(`${codigo}.nucleoEjecutor`, proyecto.nucleoEjecutor)
                await this.storage.set(`${codigo}.periodos`, proyecto.periodos)
                await this.storage.set(`${codigo}.presupuesto`, proyecto.presupuesto)
                for (let index = 0; index < proyecto.agentes.length; index++) {
                    proyecto.agentes[index].id = index
                    proyecto.agentes[index].nombre = proyecto.agentes[index].txt_apellido_paterno + ' ' + proyecto.agentes[index].txt_apellido_materno + ', ' + proyecto.agentes[index].txt_nombres
                }
                await this.storage.set(`${codigo}.agentes`, proyecto.agentes)
                console.log('proyecto :>> ', proyecto.presupuesto);
                resolve(proyecto)
            })
        })
    }

    obtenerListaUsuarios(codigo: string, nidFuncion: number, nidPersonal: number) {
        return new Promise<Usuario[]>( resolve => {
            this.mensajeListener.emit('Proyecto' + codigo)
            this.get(`/usuario/listar/${codigo}/${nidFuncion}/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const usuariosList: Usuario[] = resp.result
                if (usuariosList && usuariosList.length > 0) {
                    for (let index = 0; index < usuariosList.length; index++) {
                        usuariosList[index].id = index
                        usuariosList[index].orden = index
                        usuariosList[index].flgDatos = false
                        // falta eliminar el detalle de usuarios
                    }
                    await this.storage.set(`${codigo}.usuarios`, usuariosList)
                    const proyecto: Proyecto = await this.storage.get(codigo)
                    proyecto.cantidadUsuarios = usuariosList.length
                    await this.storage.set(codigo, proyecto)
                }
                resolve(usuariosList)
            })
        })
    }

    obtenerArchivosConfigurados() {
        return new Promise<ArchivosConfig[]>( resolve => {
            this.get(`/general/archivosConfigurados`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                console.log('resp.result :>> ', resp.result);
                const archivosConfig: ArchivosConfig[] = resp.result
                await this.storage.set(`archivosConfig`, archivosConfig)
                resolve(archivosConfig)
            })
        })
    }

    obtenerUsuarioParametro() {
        return new Promise<UsuarioParametro>( resolve => {
            this.get(`/usuario/listarParametros`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const usuarioParametro: UsuarioParametro = resp.result
                await this.storage.set(`usuarioParametro`, usuarioParametro)
                resolve(usuarioParametro)
            })
        })
    }

    obtenerTecnologiaFase() {
        return new Promise<TecnologiaFase[]>( resolve => {
            this.get(`/usuarioTecnologia/listarFases`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const tecnologiaFase: TecnologiaFase[] = resp.result
                await this.storage.set(`tecnologiaFase`, tecnologiaFase)
                resolve(tecnologiaFase)
            })
        })
    }

    obtenerActividadProductiva() {
        return new Promise<ActividadProductiva[]>( resolve => {
            this.get(`/usuarioTecnologia/listarActividadesProd`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const actividadProductiva: ActividadProductiva[] = resp.result
                await this.storage.set(`actividadProductiva`, actividadProductiva)
                resolve(actividadProductiva)
            })
        })
    }

    // enviarActividadSuper(actividad: ActividadSuper) {
    //     const parametros = {
    //         actividad: JSON.stringify(actividad)
    //     }
    //         return new Promise<number>( resolve => {
    //         this.post(`/actividad/guardarSin`, parametros).subscribe(async resp => {
    //             if (resp.result < 1) { resolve(null) }
    //             resolve(resp.result)
    //         })
    //     })
    // }

    // enviarActividadProyectos(nid_actividad: number, proyectos: string) {
    //     return new Promise<number>( resolve => {
    //         this.post(`/actividad/guardarProyectos`, {nid_actividad, proyectos}).subscribe(async resp => {
    //             if (resp.result < 1) { resolve(null) }
    //             resolve(resp.result)
    //         })
    //     })
    // }

    // enviarActividadParticipante(participante: ActividadDetalle) {
    //     return new Promise<number>( resolve => {
    //         this.post(`/actividad/guardarParticipante`, participante).subscribe(async resp => {
    //             if (resp.result < 1) { resolve(null) }
    //             resolve(resp.result)
    //         })
    //     })
    // }

    // async enviarActividadFoto(foto: Archivo) {

    //     // const nidArchivo = await this.guardarFoto(foto)

    //     return new Promise<number>( resolve => {
    //         this.post(`/actividad/guardarFoto`, foto).subscribe(async resp => {
    //             if (resp.result < 1) { resolve(null) }
    //             resolve(resp.result)
    //         })
    //     })
    // }

    enviarSolicitdCambio (usuario: Usuario) {
        const data = JSON.stringify(usuario)
        const parametros = {
            data
        }

        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarSolicitudCambio`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    observarSolicitudCambio (codigoProyecto: string, nidSolicitud: number) {
        const parametros = {
            codigoProyecto,
            nidSolicitud
        }
        return new Promise<any>( resolve => {
            this.post(`/usuario/observarSolicitud`, parametros).subscribe(resp => {
                if (resp.status === 0) { resolve(resp.result) }
                resolve(null)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    aprobarSolicitudCambio (codigoProyecto: string, nidSolicitud: number) {
        const parametros = {
            codigoProyecto,
            nidSolicitud
        }
        return new Promise<any>( resolve => {
            this.post(`/usuario/aprobarSolicitud`, parametros).subscribe(resp => {
                console.log('resp :>> ', resp);
                if (resp.status === 0 && resp.result > 0) { resolve(resp.result) }
                resolve(null)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    obtenerUsuario (codigoProyecto: string, nidPersonalProyecto: number, nidSolicitud: number) {
        return new Promise<Usuario>( resolve => {
            this.get(`/usuario/obtener/${codigoProyecto}/${nidPersonalProyecto}/${nidSolicitud}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const usuario: Usuario = resp.result
                resolve(usuario)
            })
        })
    }

    obtenerIntegrantes(codigoProyecto: string, nidPersonalProyecto: number) {
        return new Promise<Integrante[]>( resolve => {
            this.get(`/usuario/listarIntetrantes/${codigoProyecto}/${nidPersonalProyecto}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const integrantes: Integrante[] = resp.result
                resolve(integrantes)
            })
        })
    }

    async guardarSolicitudFoto(foto: Archivo, codigoProyecto: string, nidSolicitud: number, nidCambio: number, tecnologia: string, partida: string, dni: string) {
        let fileName: string
        if (foto.txt_grupo === 'HOGAR') {
            fileName = `${dni}_${foto.txt_archivo}.jpg`
        }
        if (foto.txt_grupo === 'HOGAR01') {
            fileName = `${dni}_DJ_Hogar_Emancipado.jpg`
        }
        if (foto.txt_grupo === 'TECNOLOGIA') {
            const fecha = new Date(foto.fec_archivo)
            fileName = `${dni}_Inicio_${tecnologia}_${('0' + fecha.getDate().toString()).slice(-2)}${('0' + (fecha.getMonth() + 1)).toString().slice(-2)}${fecha.getFullYear()}.jpg`
        }

        // const options = {
        //     fileKey: 'doc_archivo',
        //     fileName,
        //     params: {
        //         nid_modulo: environment.nidModulo.toString(),
        //         cod_sitio: environment.site,
        //         flg_confidencial: 0
        //     },
        // }

        // console.log(options);
        // console.log('JSON.stringify(foto) :>> ', JSON.stringify(foto));
        // console.log('foto.cod_archivo :>> ', foto.cod_archivo);
        // if (foto.cod_archivo === '0010') {
        //     console.log('PROVOCAR ERROR');
        //     return null
        // }

        // const respuesta = await this.postUploadFile(`/archivo/guardar`, options, foto)
        
        console.log('llega aqui FOTO :>> ', foto);
        const respuesta = await this.apiService.execPostFile(foto, fileName)
        console.log('respuesta :>> ', respuesta);
        
        
        let nidArchivo = 0
        if (!respuesta) {return null}
        if (respuesta && respuesta.status === 0 && respuesta.result > 0) {nidArchivo = respuesta.result } else { return respuesta}
        const parametros = {
            data: JSON.stringify(foto),
            codigoProyecto,
            nidSolicitud,
            nidCambio,
            tecnologia,
            partida,
            nidArchivo
        }

        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarSolicitudArchivo`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })

    }

    enviarAsignacionYachachiq(codigoProyecto: string, nidPersonalProyecto: number, nidPersonalYachachiq: number, fechaAsignacion: Date, fechaTerminoAsignacion: Date) {
        const parametros = {
            codigoProyecto,
            nidPersonalProyecto,
            nidPersonalYachachiq,
            fechaAsignacion,
            fechaTerminoAsignacion
        }

        return new Promise<any>( resolve => {
            this.post(`/usuario/asignarYachachiq`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarTecnologiaAvance(avance: TecnologiaAvance) {
        const parametros = {
            avance: JSON.stringify(avance)
        }

        console.log('avance :>> ', avance);
        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarTecnologiaAvance`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarTecnologiaAvanceProd(avanceProd: TecnologiaAvanceProd) {
        const parametros = {
            avanceProd: JSON.stringify(avanceProd)
        }

        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarTecnologiaAvanceProd`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    async guardarProyectoArchivo(foto: Archivo, codigoProyecto: string, atributos: string, nidFuncion: number, nidPersonal: number, nombreArchivo: string) {
        // const options = {
        //     fileKey: 'doc_archivo',
        //     fileName: nombreArchivo,
        //     params: {
        //         nid_modulo: environment.nidModulo.toString(),
        //         cod_sitio: environment.site,
        //         flg_confidencial: 0
        //     },
        // }

        // console.log(options);
        // console.log('JSON.stringify(foto) :>> ', JSON.stringify(foto));
        // console.log('foto.cod_archivo :>> ', foto.cod_archivo);
        // if (foto.txt_archivo === 'Foto xxx') {
        //     console.log('PROVOCAR ERROR');
        //     return null
        // }

        // const respuesta = await this.postUploadFile(`/archivo/guardar`, options, foto)
        // return resp

        const respuesta = await this.apiService.execPostFile(foto, nombreArchivo)

        let nidArchivo = 0
        if (!respuesta) {return null}
        if (respuesta && respuesta.status === 0 && respuesta.result > 0) {nidArchivo = respuesta.result } else { return respuesta}
        const parametros = {
            data: JSON.stringify(foto),
            codigoProyecto,
            nidArchivo,
            atributos,
            nidFuncion,
            nidPersonal
        }

        console.log('parametros :>> ', parametros);
        return new Promise<any>( resolve => {
            this.post(`/proyecto/guardarArchivo`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })

    }

    obtenerLinkFoto (nidArchivo: number) {
        return new Promise<Usuario>( resolve => {
            this.getArchivo(`/archivo/obtenerLink/${nidArchivo}/${environment.nidModulo}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                resolve(resp.result)
            })
        })
    }

    // async obtenerArchivo (nidArchivo: number, rutaArchivo: string) {
    //     const respuesta = await this.postDownloadFile(`/archivo/obtenerArchivo/${nidArchivo}/${environment.nidModulo}`, rutaArchivo)
    //     return respuesta
    // }

    guardarActividadProductiva(actividadDetList: ActividadProdDetalle) {
        const parametros = {
            actividad: JSON.stringify(actividadDetList)
        }

        console.log('parametros guardarActividadProductiva !!!!!!!:>> ', parametros);
        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarActividadProductiva`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarFichaUsuario(ficha: FichaVivienda) {
        const parametros = {
            ficha: JSON.stringify(ficha)
        }

        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarFicha`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarFichaEmprendimiento(ficha: FichaEmprendimiento) {
        const parametros = {
            ficha: JSON.stringify(ficha)
        }
        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarFichaEmpredimiento`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarFichaCaracterizacion(ficha: FichaVivienda) {
        const parametros = {
            ficha: JSON.stringify(ficha)
        }
        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarFichaCaracterizacion`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    obtenerNotificaciones() {
        return new Promise<Notificacion[]>( resolve => {
            this.getCorreo(`/notificacion/listarPaginado/${environment.nidModulo}/1/100`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const notificaciones: Notificacion[] = resp.result
                await this.storage.set('notificaciones', notificaciones)
                resolve(notificaciones)
            })
        })
    }

    obtenerNotificacionesNuevas(ultimaNotificacion: any) {
        return new Promise<Notificacion[]>( resolve => {
            this.getCorreo(`/notificacion/listarNuevas/${environment.nidModulo}/${ultimaNotificacion}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const notificaciones: Notificacion[] = resp.result
                // await this.storage.set('notificaciones', notificaciones)
                resolve(notificaciones)
            })
        })
    }

    marcarLeidoNotificacion(nidNotificacion: number, fecLectura: Date) {
        const parametros = {
            nidNotificacion,
            fecLectura
        }

        return new Promise<any>( resolve => {
            this.postCorreo(`/notificacion/marcarLeido/`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    eliminarNotificacion(nidNotificacion: number, fecEliminacion: Date) {
        const parametros = {
            nidNotificacion,
            fecEliminacion
        }

        return new Promise<any>( resolve => {
            this.postCorreo(`/notificacion/eliminar/`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarMiembro(miembro: Miembro) {
        const parametros = {
            miembro: JSON.stringify(miembro)
        }
        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarMiembro`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }


    obtenerVisitaParametro() {
        return new Promise<VisitaParametro>( resolve => {
            this.get(`/visita/obtenerParametros`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const visitaParametro: VisitaParametro = resp.result
                await this.storage.set(`visitaParametro`, visitaParametro)
                resolve(visitaParametro)
            })
        })
    }

    obtenerVisita(codigoProyecto: string, nidVisita: number) {
        return new Promise<Visita>( resolve => {
            this.get(`/visita/obtener/${codigoProyecto}/${nidVisita}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                console.log('resp.result obtenerVisitas:>> ', resp.result);
                const visita: Visita = resp.result
                resolve(visita)
            })
        })
    }

    obtenerVisitas(codigoProyecto: string, nidFuncion: number, nidPersonal: number) {
        return new Promise<Visita[]>( resolve => {
            this.get(`/visita/listar/${codigoProyecto}/${nidFuncion}/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                
                const visitas: Visita[] = resp.result
                await this.storage.set(`${codigoProyecto}.visitas`, visitas)
                resolve(visitas)
            })
        })
    }

    guardarVisita(visita: Visita) {
        const parametros = {
            visita: JSON.stringify(visita)
        }
        return new Promise<any>( resolve => {
            this.post(`/visita/guardar`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarVisitaFoto(foto: GrupoPartidaFoto) {
        const parametros = {
            foto: JSON.stringify(foto)
        }
        return new Promise<any>( resolve => {
            this.post(`/visita/guardarFoto`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    eliminarVisitaFoto(foto: GrupoPartidaFoto) {
        const parametros = {
            foto: JSON.stringify(foto)
        }
        return new Promise<any>( resolve => {
            this.post(`/visita/eliminarFoto`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    obtenerActividadParametros() {
        return new Promise<ActividadParametro[]>( resolve => {
            this.get(`/planActividad/obtenerParametros`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const parametros: ActividadParametro[] = resp.result
                await this.storage.set(`actividadParametro`, parametros)
                resolve(parametros)
            })
        })
    }

    obtenerPlanList(nidFuncion: number, nidPersonal: number) {
        return new Promise<Plan[]>( resolve => {
            this.get(`/planActividad/listarPlan/${nidFuncion}/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const planList: Plan[] = resp.result
                await this.storage.set(`planes`, planList)
                resolve(planList)
            })
        })
    }

    obtenerPlanActividad(nidPlan: number, nidActividad: number, nidDetalle: number) {
        return new Promise<PlanActividad>( resolve => {
            this.get(`/planActividad/obtener/${nidPlan}/${nidActividad}/${nidDetalle}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const planActividad: PlanActividad = resp.result
                resolve(planActividad)
            })
        })
    }

    obtenerPlanActividadList(nidFuncion: number, nidPersonal: number) {
        console.log('nidFuncion :>> ', nidFuncion);
        return new Promise<PlanActividad[]>( resolve => {
            this.get(`/planActividad/listar/${nidFuncion}/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const planActividadesList: PlanActividad[] = resp.result
                for (let index = 0; index < planActividadesList.length; index++) {planActividadesList[index].id = index}
                await this.storage.set(`planActividades`, planActividadesList)
                resolve(planActividadesList)
            })
        })
    }

    obtenerPlanProyectos(nidFuncion: number, nidPersonal: number, codZonal: string) {
        return new Promise<Proyecto[]>( resolve => {
            this.get(`/planActividad/listarProyectos/${nidFuncion}/${nidPersonal}/${codZonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const proyectos: Proyecto[] = resp.result
                console.log('proyectos :>> ', proyectos);
                await this.storage.set(`proyectos`, proyectos)
                this.proyectosListener.emit(proyectos)
                resolve(proyectos)
            })
        })
    }

    validarSolicitudAprobada(codigoProyecto: string, fechaSolicitud: Date, nidFuncion: number, nidPersonal: number) {
        const parametros = {
            codigoProyecto,
            fechaSolicitud,
            nidFuncion,
            nidPersonal
        }

        console.log('parametros :>> ', parametros);
        return new Promise<any>( resolve => {
            this.post(`/usuario/validarSolicitudAprobada`, parametros).subscribe(resp => {
                console.log('resp sgpService-validarSolicitudAprobada:>> ', resp);
                resolve(resp.result)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarPlanActividad(actividad: PlanActividad) {
        const parametros = {
            actividad: JSON.stringify(actividad)
        }
        console.log('parametros :>> ', parametros);
        return new Promise<any>( resolve => {
            this.post(`/planActividad/guardar`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarActEjecDetalle(actividadDet: ActividadDetalle) {
        const parametros = {
            actividadDetalle: JSON.stringify(actividadDet)
        }
        console.log('parametros :>> ', parametros);
        return new Promise<any>( resolve => {
            this.post(`/planActividad/guardarEjecDetalle`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    async guardarActividadArchivo(foto: Archivo, atributos: string, nidFuncion: number, nidPersonal: number, nombreArchivo: string) {
        // const options = {
        //     fileKey: 'doc_archivo',
        //     fileName: nombreArchivo,
        //     params: {
        //         nid_modulo: environment.nidModulo.toString(),
        //         cod_sitio: environment.site,
        //         flg_confidencial: 0
        //     },
        // }

        // console.log(options);
        // console.log('JSON.stringify(foto) :>> ', JSON.stringify(foto));
        // console.log('foto.cod_archivo :>> ', foto.cod_archivo);
        // if (foto.txt_archivo === 'Foto xxx') {
        //     console.log('PROVOCAR ERROR');
        //     return null
        // }

        // const respuesta = await this.postUploadFile(`/archivo/guardar`, options, foto)
        // return resp

        const respuesta = await this.apiService.execPostFile(foto, nombreArchivo)

        let nidArchivo = 0
        if (!respuesta) {return null}
        if (respuesta && respuesta.status === 0 && respuesta.result > 0) {nidArchivo = respuesta.result } else { return respuesta}
        const parametros = {
            data: JSON.stringify(foto),
            atributos,
            nidFuncion,
            nidPersonal,
            nidArchivo
        }
        console.log('parametros Actividad Archivo:>> ', parametros);
        return new Promise<any>( resolve => {
            this.post(`/planActividad/guardarArchivo`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })

    }

    obtenerAccionesList(nidPersonal: number) {
        return new Promise<SamAccion[]>( resolve => {
            this.get(`/planActividad/listarAcciones/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const accionList: SamAccion[] = resp.result
                for (let index = 0; index < accionList.length; index++) {accionList[index].id = index}
                await this.storage.set(`acciones`, accionList)
                resolve(accionList)
            })
        })
    }

    obtenerAccion(nidPlan: number, nidActividad: number, nidDetalle: Number, nidAccion: number) {
        return new Promise<SamAccion>( resolve => {
            this.get(`/planActividad/obtenerAccion/${nidPlan}/${nidActividad}/${nidDetalle}/${nidAccion}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const accion: SamAccion = resp.result
                resolve(accion)
            })
        })
    }


    guardarAccionActividad(accion: SamAccion) {
        const parametros = {
            accion: JSON.stringify(accion)
        }
        return new Promise<any>( resolve => {
            this.post(`/planActividad/guardarAccion`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    obtenerParametrosProyAct() {
        return new Promise<ActividadParametro[]>( resolve => {
            this.get(`/actividad/obtenerParametros`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const parametros: ActividadParametro[] = resp.result
                await this.storage.set(`parametroProyAct`, parametros)
                resolve(parametros)
            })
        })
    }

    obtenerActividad(codigoExpediente: string, nidFuncion: number, nidFacilitador: number, nidActividad: number) {
        return new Promise<ProyActividad>( resolve => {
            this.get(`/actividad/obtener/${codigoExpediente}/${nidFuncion}/${nidFacilitador}/${nidActividad}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const actividad: ProyActividad = resp.result
                resolve(actividad)
            })
        })
    }

    obtenerProyActividadList(codigoExpediente: string, nidFuncion: number, nidFacilitador: number) {
        return new Promise<ProyActividad[]>( resolve => {
            this.get(`/actividad/listar/${codigoExpediente}/${nidFuncion}/${nidFacilitador}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const actividadList: ProyActividad[] = resp.result
                if (actividadList && actividadList.length > 0) {
                    for (let index = 0; index < actividadList.length; index++) {
                        actividadList[index].id = index
                        actividadList[index].orden = index
                    }
                    await this.storage.set(`${codigoExpediente}.actividades`, actividadList)
                }
                resolve(actividadList)
            })
        })
    }

    guardarProyActividadEjec(actividad: ProyActividad) {
        
        const parametros = {
            actividad: JSON.stringify(actividad)
        }
        console.log('parametros :>> ', parametros);
        return new Promise<any>( resolve => {
            this.post(`/actividad/guardar`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    obtenerTecnologiaColectivaList(codigo, nidFuncion, nidPersonal) {
        return new Promise<TecnologiaColectiva[]>( resolve => {
            this.get(`/tecnologiaColectiva/listar/${codigo}/${nidFuncion}/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const tecnologiaList: TecnologiaColectiva[] = resp.result
                // for (let index = 0; index < tecnologiaList.length; index++) {tecnologiaList[index].id = index}
                await this.storage.set(`${codigo}.tecnologiaColectiva`, tecnologiaList)
                resolve(tecnologiaList)
            })
        })
    }
    
    obtenerTecColectivaDetalle(codigo: string, nidDetalle: number) {
        return new Promise<TecnologiaColectivaDetalle>( resolve => {
            this.get(`/tecnologiaColectiva/obtenerDetalle/${codigo}/${nidDetalle}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const detalle: TecnologiaColectivaDetalle = resp.result
                resolve(detalle)
            })
        })
    }

    guardarTecColectivaDetalle(detalle: TecnologiaColectivaDetalle) {
        console.log('guardarTecnologiaPartidaDetalle detalle :>> ', detalle);
        const parametros = {
            detalle: JSON.stringify(detalle)
        }
        return new Promise<any>( resolve => {
            this.post(`/tecnologiaColectiva/guardarDetalle`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarTecColectivaAvance(avance: TecnologiaAvance) {
        console.log('guardarTecnologiaPartidaDetalle avance :>> ', avance);
        const parametros = {
            avance: JSON.stringify(avance)
        }
        return new Promise<any>( resolve => {
            this.post(`/tecnologiaColectiva/guardarAvance`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarTecColectivaAvanceProd(avanceProd: TecnologiaAvanceProd) {
        const parametros = {
            avanceProd: JSON.stringify(avanceProd)
        }

        return new Promise<any>( resolve => {
            this.post(`/tecnologiaColectiva/guardarTecnologiaAvanceProd`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarEntregaActivo(entrega: EntregaInsumo) {
        console.log('guardarEntregaActivo :>> ', entrega);
        const parametros = {
            entrega: JSON.stringify(entrega)
        }
        return new Promise<any>( resolve => {
            this.post(`/entregaInsumo/guardarEntrega`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarEntregaInsumo(insumo: TecnologiaInsumo) {
        console.log('guardarEntregaInsumo :>> ', insumo);
        const parametros = {
            insumo: JSON.stringify(insumo)
        }
        return new Promise<any>( resolve => {
            this.post(`/entregaInsumo/guardarInsumo`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    obtenerEntregaInsumo(codigo: string, codPartida: string) {
        return new Promise<EntregaInsumo>( resolve => {
            this.get(`/entregaInsumo/obtenerEntrega/${codigo}/${codPartida}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const entrega: EntregaInsumo = resp.result
                console.log('entrega  33333333333:>> ', entrega);
                resolve(entrega)
            })
        })
    }

    enviarAsignacionTecDetalleYachachiq(codigoProyecto: string, nidDetalle: number, nidPersonalYachachiq: number, fechaAsignacion: Date, fechaTerminoAsignacion: Date) {
        const parametros = {
            codigoProyecto,
            nidDetalle,
            nidPersonalYachachiq,
            fechaAsignacion,
            fechaTerminoAsignacion
        }

        return new Promise<any>( resolve => {
            this.post(`/tecnologiaColectiva/asignarTecDetalleYachachiq`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarFichaMujer(ficha: FichaMujer) {
        console.log('guardarFichaMujer :>> ', ficha);
        const parametros = {
            ficha: JSON.stringify(ficha)
        }
        return new Promise<any>( resolve => {
            this.post(`/usuario/guardarFichaMujer`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarFichaAsistTecMem(ficha: FichaAsistTecMem) {
        console.log('guardarFichaMujer :>> ', ficha);
        const parametros = {
            ficha: JSON.stringify(ficha)
        }
        return new Promise<any>(resolve => {
            this.post(`/usuario/guardarFichaAsistTecMem`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarFichaSeleccionMem(ficha: FichaAsistTecMem) {
        console.log('guardarFichaMujer :>> ', ficha);
        const parametros = {
            ficha: JSON.stringify(ficha)
        }
        return new Promise<any>(resolve => {
            this.post(`/usuario/guardarFichaSeleccionMem`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    guardarLineaBaseMem(ficha: LineaBaseMem) {
        console.log('guardarLineaBaseMujer :>> ', ficha);
        const parametros = {
            ficha: JSON.stringify(ficha)
        }
        return new Promise<any>(resolve => {
            this.post(`/usuario/guardarLineaBaseMem`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

    obtenerEriParametros() {
        return new Promise<EriParametro[]>( resolve => {
            this.get(`/eri/obtenerParametros`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const parametros: EriParametro[] = resp.result
                await this.storage.set(`eriParametro`, parametros)
                resolve(parametros)
            })
        })
    }

    obtenerEri(codNec: string, codEri: string, nidFuncion?: number, nidPersonal?: number) {
        if (nidPersonal) {
            return new Promise<Eri>( resolve => {
                this.get(`/eri/obtenerPorAgente/${codNec}/${codEri}/${nidFuncion}/${nidPersonal}`).subscribe(async resp => {
                    if (!resp.result) { resolve(null) }
                    const eri: Eri = resp.result
                    resolve(eri)
                })
            })
        } else {
            return new Promise<Eri>( resolve => {
                this.get(`/eri/obtener/${codNec}/${codEri}`).subscribe(async resp => {
                    if (!resp.result) { resolve(null) }
                    const eri: Eri = resp.result
                    resolve(eri)
                })
            })
        }
    }

    obtenerEriPorAgente(codigo: string, nidFuncion: number, nidPersonal: number) {
        console.log('nidFuncion, nidPersonal :>> ', nidFuncion, nidPersonal);
        return new Promise<Eri[]>( resolve => {
            this.get(`/eri/listarPorAgente/${codigo}/${nidFuncion}/${nidPersonal}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const eriList: Eri[] = resp.result
                if (eriList && eriList.length > 0) {
                    for (let index = 0; index < eriList.length; index++) {
                        eriList[index].id = index
                    }
                    await this.storage.set(`${codigo}.eri`, eriList)
                }
                resolve(eriList)
            })
        })
    }

    obtenerEriList(codigo: string) {
        return new Promise<Eri[]>( resolve => {
            this.get(`/eri/listar/${codigo}`).subscribe(async resp => {
                if (!resp.result) { resolve(null) }
                const eriList: Eri[] = resp.result
                if (eriList && eriList.length > 0) {
                    for (let index = 0; index < eriList.length; index++) {
                        eriList[index].id = index
                    }
                    await this.storage.set(`${codigo}.eri`, eriList)
                }
                resolve(eriList)
            })
        })
    }

    guardarInformeEri(informe: InformeEri) {
        
        console.log('informe :>> ', informe);
        const parametros = {
            informe: JSON.stringify(informe)
        }
        console.log('parametros :>> ', parametros);
        return new Promise<any>( resolve => {
            this.post(`/eri/guardarInforme`, parametros).subscribe(resp => {
                resolve(resp)
            })
        }).catch((error) => {
            console.error(error);
        })
    }

}
