import { SeguridadService } from './../services/seguridad.service';
import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })

export class JwtInterceptor implements HttpInterceptor {
    token: string

    constructor(private seguridadService: SeguridadService) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        this.token = this.seguridadService.token
        // No reemplaza una cabecera puesta a propósito (token temporal del doble factor)
        if (this.token && !request.headers.has('Authorization')) {
            request = request.clone({
                setHeaders: {
                    Authorization: `${environment.tokenWord} ${this.token}`
                }
            });
        }
        return next.handle(request);
    }
}
