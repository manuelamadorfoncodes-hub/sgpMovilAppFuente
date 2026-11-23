import { Injectable } from '@angular/core';
// import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree, CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { SeguridadService } from './../services/seguridad.service';
import { UtilService } from '../services/util.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioGuard implements CanLoad {
    constructor(private seguridadService: SeguridadService,
        public router: Router,
        private utilService: UtilService) {}

    canLoad(): Observable<boolean> | Promise<boolean> | boolean {
        console.log('guard');
        return this.seguridadService.existeToken()
    }

    // canLoad(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | UrlTree | boolean {
    //     // if (this.authService.isLoggedIn !== true) {
    //     //   window.alert('Access Denied, Login is Required to Access This Page!');
    //     //   this.router.navigate(['sign-in']);
    //     // }
    //     // return true;
    //     return this.seguridadService.existeToken()
    // }
}
