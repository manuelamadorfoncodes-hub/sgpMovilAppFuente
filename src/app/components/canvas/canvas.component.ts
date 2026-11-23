import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import SignaturePad from 'signature_pad';
import { ArchivoService } from '../../services/archivo.service';

@Component({
    selector: 'app-canvas',
    templateUrl: './canvas.component.html',
    styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent implements OnInit {

    @ViewChild('canvas', { static: true }) canvasPadElement: ElementRef
    @Output() registrar = new EventEmitter();
    @Output() cancelar = new EventEmitter();
    canvasPad: any
    
    constructor(private elementRef: ElementRef,
        private archivoService: ArchivoService
    ) { }

    ngOnInit() {
        const canvas: any = this.elementRef.nativeElement.querySelector('canvas')
        canvas.width = window.innerWidth - 6
        canvas.height = canvas.width / 4 * 3 //window.innerHeight
        if (this.canvasPad) {
            this.canvasPad.clear();
        }
    }

    ngAfterViewInit() {
        this.canvasPad = new SignaturePad(this.canvasPadElement.nativeElement, {
            penColor: 'rgb(0,0,0)',
            backgroundColor: 'rgb(255,255,255)'
        })
        this.canvasPad.clear()
    }

    cancel() {
        this.cancelar.emit()
    }

    async aceptar() {
        if( this.canvasPad.isEmpty()) {return}
        const imagen = this.canvasPad.toDataURL("image/jpeg")
        const savedImageFile = await this.archivoService.guardarImagenDataUrl(imagen)
        const data = {
            urlFile: savedImageFile.filepath,
            urlHttp: savedImageFile.webviewPath
        }
        this.registrar.emit(data)
    }

}
