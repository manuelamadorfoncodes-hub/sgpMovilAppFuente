export const calcularEdad = (fechaNacimiento: Date, fechaEvalua?: Date) => {
    const nacimiento = new Date(fechaNacimiento)
    const actual = fechaEvalua ? new Date(fechaEvalua) : new Date()
    
    if (actual < new Date(nacimiento.getFullYear(), nacimiento.getMonth(), nacimiento.getDate()) ) {
        console.log('error de fechas')
        return
    }
    let edad: number
    const anhos = actual.getFullYear() - nacimiento.getFullYear()
    if (anhos > 0) {
        if (actual.getMonth() > nacimiento.getMonth()){
            edad = anhos
        } else {
            if (actual.getMonth() === nacimiento.getMonth()){
                if (actual.getDate() >= nacimiento.getDate()) {
                    edad = anhos
                } else {
                    edad = anhos - 1
                }
            } else {
                edad = anhos - 1
            }
        }
    } else {
        edad = 0
    }
    return edad
}