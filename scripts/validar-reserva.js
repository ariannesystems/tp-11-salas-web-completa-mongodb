const { Reserva } = require("../src/modelos/reservas");

async function main() {

    const reserva = new Reserva({
        estudiante: "Pear Jam",
        email: "info@gmail.com",
        sala: 'Sala Norte',
        fecha: '09/10/2026',
        turno: 'Tarde',
        personas: 4
    });

    await reserva.validate();
    console.log("Datos válidos; todavía no guardamos en MongoDB.");
}

main().catch((error) => {

    console.error("Validación rechazada:", error.name);

    if (error.errors) {
        console.error("Campos a revisar:", Object.keys(error.errors).join(", "));
    }
    process.exitCode = 1;
});