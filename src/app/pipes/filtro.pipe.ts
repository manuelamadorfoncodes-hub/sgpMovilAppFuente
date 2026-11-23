import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filtro'
})
export class FiltroPipe implements PipeTransform {

    transform(lista: any[], texto: string, columna1: string, columna2: string, columna3: string, columna4: string): any[] {
        console.log('entra a filtro');
        if (texto === '') {
            return lista;
        }

        texto = texto.toUpperCase();

        if (columna1 && columna1 === 'txt_apellido_paterno' && columna2 && columna2 === 'txt_apellido_materno' && columna3 && columna3 === 'txt_nombres') {
            return lista.filter(item => {
                return  ((`${item[columna1]} ${item[columna2]}, ${item[columna3]}`).toUpperCase().includes(texto)) ||
                        (columna4 ? (item[columna4] ? item[columna4].toUpperCase().includes(texto) : false) : false)
            });
        }

        return lista.filter(item => {
            return  (columna1 ? (item[columna1] ? item[columna1].toUpperCase().includes(texto) : false) : false) ||
                    (columna2 ? (item[columna2] ? item[columna2].toUpperCase().includes(texto) : false) : false) ||
                    (columna3 ? (item[columna3] ? item[columna3].toUpperCase().includes(texto) : false) : false) ||
                    (columna4 ? (item[columna4] ? item[columna4].toUpperCase().includes(texto) : false) : false)
        });
    }
}
