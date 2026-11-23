import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
    selector: 'app-header-modal',
    templateUrl: './header-modal.component.html',
    styleUrls: ['./header-modal.component.scss'],
})
export class HeaderModalComponent implements OnInit {

    @Input() titulo: string
    @Output() cerrar = new EventEmitter();

    constructor() { }

    ngOnInit() { }

    salir() {
        this.cerrar.emit()
    }
}
