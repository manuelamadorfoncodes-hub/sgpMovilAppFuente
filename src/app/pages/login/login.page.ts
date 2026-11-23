import { AfterContentChecked, Component, OnInit, ElementRef, ViewChild } from '@angular/core'
import { NgForm } from '@angular/forms';
import { MenuController, Platform, NavController } from '@ionic/angular'

import { Network } from '@capacitor/network';

import { SeguridadService } from '../../services/seguridad.service'
import { UiServiceService } from '../../services/ui-service.service'
import { environment } from '../../../environments/environment'

import { register } from 'swiper/element/bundle';

register();

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit, AfterContentChecked {

    @ViewChild('swiper')
    swiperRef: ElementRef | undefined
    
    usuarioLogin = {
        idUsuario: '',
        clave: ''
    }

    usuarioSolCodigo = {
        dni: '',
        correo: ''
    };

    usuarioRegistro = {
        dni: '',
        correo: '',
        clave: '',
        repClave: '',
        codigoValida: ''
    };

    verVolver = false
    accion = 'registrar'
    version = ''

    constructor(private platform: Platform,
                // private network: Network,
                private navCtrl: NavController,
                private menu: MenuController,
                private seguridadService: SeguridadService,
                private uiService: UiServiceService) { }

    ngOnInit() {
        this.menu.enable(false)
        this.version = environment.version
    }

    ngAfterContentChecked() {
        if (this.swiperRef) {this.swiperRef.nativeElement.allowTouchMove = false}
    }

    async login(fLogin: NgForm) {

        // const xxxx = await this.seguridadService.acuerdoConfidencialidad()

        if (fLogin.invalid) { return }
        const ok = await this.evaluarConexion()
        if (!ok) { return }

        const resp: string = await this.seguridadService.login(this.usuarioLogin.idUsuario, this.usuarioLogin.clave) 
        console.log('resp del login :>> ', resp);
        if (resp) {
            if (resp === 'ok') {
                // navegar al tabs
                this.navCtrl.navigateRoot('/inicio', { animated: true });
            } else {
                // mostrar alerta de usuario y contraseña no correctos
                this.uiService.alertaInformativa(resp);
            }
        } else {
            console.error('Login no responde');
            this.uiService.alertaInformativa('Error, la autenticación no responde.');
        }
    }


    async solicitarCodigo( fSolCodigo: NgForm ) {
        if ( fSolCodigo.invalid ) { return }
        const ok = await this.evaluarConexion()
        if (!ok) { return }

        const resp = await this.seguridadService.solicitarCodigo(this.usuarioSolCodigo.correo, this.usuarioSolCodigo.dni, this.accion)
        if ( resp['status'] !== 0 ) {
            this.uiService.alertaInformativa(resp['message']);
        } else {
            this.usuarioRegistro.correo = this.usuarioSolCodigo.correo
            this.usuarioRegistro.dni = this.usuarioSolCodigo.dni
            this.mostrarRegistro(this.accion)
        }
    }

    async registro( fRegistro: NgForm ) {
        if ( fRegistro.invalid ) { return }
        const ok = await this.evaluarConexion()
        if (!ok) { return }

        if ( this.usuarioRegistro.clave !== this.usuarioRegistro.repClave) {
            this.uiService.alertaInformativa('Las contraseñas no son iguales.')
            return
        }
        const resp = await this.seguridadService.registrar(this.usuarioRegistro.correo, this.usuarioRegistro.dni, this.usuarioRegistro.codigoValida, this.usuarioRegistro.clave, this.accion)
        if ( resp['status'] !== 0 ) {
            this.uiService.alertaInformativa(resp['message']);
        } else {
            this.mostrarLogin()
        }
    }

    mostrarLogin() {
        this.swiperRef?.nativeElement.swiper.slideTo(0)
    }

    mostrarSolicitaCodigo(accion) {
        this.accion = accion
        this.swiperRef?.nativeElement.swiper.slideTo(1)
    }

    mostrarRegistro(accion) {
        this.accion = accion
        this.swiperRef?.nativeElement.swiper.slideTo(2)
    }

    async evaluarConexion() {
        const evaluarConexion = await this.platform.ready().then((valor) => {
            if (valor === 'dom') {return false}
            return true
        })
        const conexion = (await Network.getStatus()).connected
        if (evaluarConexion && (!conexion)) {
            this.uiService.alertaInformativa('No se ha encontrado conexión a internet.')
            return false
        }
        return true
    }

}
