import { Component, OnInit, Input } from '@angular/core';
import { Usuario } from '../../model/usuarios';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-usuario-resumen',
    templateUrl: './usuario-resumen.component.html',
    styleUrls: ['./usuario-resumen.component.scss'],
})
export class UsuarioResumenComponent implements OnInit {

    @Input() usuarios: Usuario[] = []

    total: number

    constructor(public popoverController: PopoverController) { }

    ngOnInit() { }

    contarActivo() {
        let contador = 0
        this.usuarios.map(usuario => {
            if (usuario.txt_estado === 'Activo') {contador++}
        })
        return contador
    }

    contarNuevo() {
        let contador = 0
        this.usuarios.map(usuario => {
            if (usuario.txt_estado === 'Nuevo') {contador++}
        })
        return contador
    }

    contarSinEnviar() {
        let contador = 0
        this.usuarios.map(usuario => {
            if (usuario.txt_estado_solicitud === 'Sin enviar') {contador++}
        })
        return contador
    }

    contarObservada() {
        let contador = 0
        this.usuarios.map(usuario => {
            if (usuario.txt_estado_solicitud === 'Observada') {contador++}
        })
        return contador
    }

    contarEnviada() {
        let contador = 0
        this.usuarios.map(usuario => {
            if (usuario.txt_estado_solicitud === 'Enviada') {contador++}
        })
        return contador
    }

    contarSolicitud() {
        let contador = 0
        this.usuarios.map(usuario => {
            if (usuario.txt_estado_solicitud) {contador++}
        })
        return contador
    }

    cerrar() {
        console.log('cerrar :>> ');
        this.popoverController.dismiss()
    }
    
}
