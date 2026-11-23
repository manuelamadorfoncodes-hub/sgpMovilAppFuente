import { ModalController } from '@ionic/angular';
import { Component, Input, OnInit } from '@angular/core';
import { DataLocalService } from './../../services/data-local.service';
import { UiServiceService } from './../../services/ui-service.service';
import { User } from './../../model/generales';
import { PlanActividad, Sam, SamAccion } from '../../model/plan-actividad';

@Component({
    selector: 'app-plan-sam',
    templateUrl: './plan-sam.page.html',
    styleUrls: ['./plan-sam.page.scss'],
})
export class PlanSamPage implements OnInit {
    @Input() actividadData: string
    actividad: PlanActividad = {}
    sam: Sam = {}
    acciones: SamAccion[] = []
    personal = []
    fechaInicioValida: any
    fechaFinValida: any
    fechaFinExtendida: any

    constructor(private modalController: ModalController,
        private uiService: UiServiceService,
        private dataLocalService: DataLocalService) { }

    async ngOnInit() {
        if (this.actividadData) {this.actividad = JSON.parse(this.actividadData)}
        // this.actividad = JSON.parse(this.actividadData)
        console.log(' SAM - this.actividad :>> ', this.actividad);
        this.fechaInicioValida = this.fechaATexto(this.actividad.fec_ini_plan)
        this.fechaFinValida = this.fechaATexto(this.actividad.fec_fin_plan)
        this.fechaFinExtendida = this.sumaAnhos(this.actividad.fec_fin_plan, 1)
        console.log('this.fechaNoFin :>> ', this.fechaFinExtendida);
        if (this.actividad.sam) {
            console.log('entra aquí');
            this.sam = this.actividad.sam
        } else {
            console.log('no hay sam');
            const user: User = await this.dataLocalService.leerUser()
            this.sam.nid_plan = this.actividad.nid_plan
            this.sam.nid_actividad = this.actividad.nid_actividad
            this.sam.cod_zonal_detecta = user.codZonal
            this.sam.txt_zonal_detecta = user.zonal
            this.sam.nid_detecta = user.nidPersonal
            this.sam.txt_detecta = `${user.apellidoPaterno} ${user.apellidoMaterno}, ${user.nombres}`
            this.sam.txt_documento = `${this.actividad.nid_actividad ? 'Actividad '+this.actividad.nid_actividad+': ' : ''}${this.actividad.txt_actividad} (${this.actividad.cod_plan})`
            this.sam.nid_investiga = user.nidPersonal
            console.log('this.sam :>> ', this.sam);
        }
        if (this.sam.acciones) {
            this.acciones = this.sam.acciones
            this.acciones.map((item, index) => {
                item.orden = index + 1
                item.controlFecha = `datetime${index}`
            })
        }
        if (this.acciones.length === 0) { this.acciones.push({ orden: 1, controlFecha: 'datetime1', est_accion: 'P', txt_est_accion: 'Pendiente' }) }
        console.log('ACCIONES :>> ', this.acciones);
        this.obtienePersonas()
    }

    fechaATexto (fecha: Date) {
        let fechaTexto = ''
        if (fecha) {
            const nuevaFecha = new Date(fecha.toString())
            fechaTexto = `${nuevaFecha.getFullYear()}-${('0' + (nuevaFecha.getMonth() + 1)).toString().slice(-2)}-${('0' + nuevaFecha.getDate().toString()).slice(-2)}T${('0' + nuevaFecha.getHours().toString()).slice(-2)}:${('0' + nuevaFecha.getMinutes().toString()).slice(-2)}:00-05:00`
        }
        return fechaTexto
    }
 
    sumaAnhos (fecha, anhos) {
        let fechaTexto = ''
        if (fecha) {
            const nuevaFecha = new Date(fecha.toString())
            fechaTexto = `${nuevaFecha.getFullYear()+anhos}-${('0' + (nuevaFecha.getMonth() + 1)).toString().slice(-2)}-${('0' + nuevaFecha.getDate().toString()).slice(-2)}T${('0' + nuevaFecha.getHours().toString()).slice(-2)}:${('0' + nuevaFecha.getMinutes().toString()).slice(-2)}:00-05:00`
        }
        return fechaTexto
    }

    async obtienePersonas() {
        if (this.actividad.txt_proyectos) {
            let proyectos = await this.dataLocalService.leerProyectos()
            const actividadProyectos = this.actividad.txt_proyectos.split(',')
            proyectos = proyectos.filter(proyecto => actividadProyectos.includes(proyecto.codigo_expediente))
            const agentesList = []
            for (let index = 0; index < proyectos.length; index++) {
                let agentes = await this.dataLocalService.leerAgentesProyecto(proyectos[index].codigo_expediente)
                agentes = agentes.filter(item => item.est_agente_proyecto === "A")
                if (agentes) { agentesList.push(...agentes) }
            }
            // agentesList = agentesList.filter(agente => tipoParticipanteAgente.find(item => item.txt_funciones.includes(agente.nid_funcion.toString())))
            console.log('agentesList :>> ', agentesList);
            agentesList.forEach(agente => {
                if (!this.personal.find(item => agente.txt_dni === item.txt_dni)) {
                    this.personal.push({
                        codigo_expediente: agente.codigo_expediente,
                        txt_dni: agente.txt_dni,
                        txt_personal: `${agente.txt_apellido_paterno} ${agente.txt_apellido_materno}, ${agente.txt_nombres} ( ${agente.txt_funcion} - ${agente.codigo_expediente} )`,
                        nid_personal: agente.nid_personal,
                        txt_cargo: agente.txt_funcion,
                        texto: `${agente.txt_apellido_paterno} ${agente.txt_apellido_materno}, ${agente.txt_nombres} ( ${agente.txt_funcion} - ${agente.codigo_expediente} )`
                    })
                }
            })
        } else {
            const plan = (await this.dataLocalService.leerPlan()).find(item => item.nid_plan === this.actividad.nid_plan)
            if (plan) {
                console.log('plan :>> ', plan);
                if (this.actividad.cod_zonal_ambito) {
                    console.log('this.actividad.cod_zonal_ambito :>> ', this.actividad.cod_zonal_ambito);
                    this.personal = plan.zonales.find(item => item.cod_zonal === this.actividad.cod_zonal_ambito).personalZonal
                    console.log('this.personas!! :>> ', this.personal);
                } else {
                    this.personal = plan.zonales.find(item => item.cod_zonal === this.sam.cod_zonal_detecta).personalZonal
                }
            }
        }
        if (!this.personal.find(item => item.nid_personal === this.sam.nid_detecta)){
            this.personal.push({
                nid_personal: this.sam.nid_detecta,
                txt_personal: this.sam.txt_detecta
            })
        }
        this.personal.push({ nid_personal: 0, txt_personal: 'OTRO' })
    }

    agregarAccion() {
        const orden = this.acciones.length + 1
        this.acciones.push({
            orden,
            controlFecha: `datetime${orden}`,
            est_accion: 'P',
            txt_est_accion: 'Pendiente'
        })
    }

    eliminarAccion(index: number) {
        console.log('elimina la accion');
        this.acciones.splice(index, 1)
    }

    async guardar() {
        // if (this.sam.fec_deteccion) {
        //     const fecha = this.sam.fec_deteccion.toString()
        //     this.sam.fec_deteccion = new Date(fecha.substring(0, 11)+'00:00'+fecha.substring(16))
        // }
        console.log('this.sam :>> ', this.sam);
        this.sam.acciones = this.acciones
        this.actividad.sam = this.sam
        this.actividad.samCambio = true
        this.actividad.samIncompleta = this.evaluarDatosIcompletos()
        await this.uiService.presentLoading('Guardando...')
        console.log('this.actividad :>> ', this.actividad);
        await this.dataLocalService.guardarPlanActividad(this.actividad)
        await this.uiService.dismissLoading()
        this.salir()
    }

    evaluarDatosIcompletos() {
        if (!this.sam.fec_deteccion) {return true}
        if (!this.sam.tip_origen) {return true}
        if (!this.sam.tip_solicitud) {return true}
        if (!this.sam.txt_descripcion) {return true}
        if (!this.sam.txt_documento) {return true}
        if (!this.sam.txt_causa) {return true}
        if (!this.sam.nid_investiga) {return true}
        if (this.acciones.length === 0) {return true}
        for (let index = 0; index < this.acciones.length; index++) {
            if (!this.acciones[index].txt_accion) {return true}
            if (!this.acciones[index].nid_responsable) {return true}
            if (!this.acciones[index].fec_implementacion) {return true}
        }
        return false
    }

    salir() {
        this.modalController.dismiss();
    }

}
