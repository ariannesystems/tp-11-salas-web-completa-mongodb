/*-----------------------------------------CREACION DE 3 MIDDLEWARE GLOBAL---------------------------------------*/

//MIDDLEWARE: Indentifica la solicitud HTTP
function crearIdentificadorSolicitud() {
  let numeroDeSolicitud = 0;

  return function identificarSolicitud(req, res, next) {
    numeroDeSolicitud += 1;
    res.locals.solicitudId = `SOL-${String(numeroDeSolicitud).padStart(4, "0")}`;
    next();
  };
}

//MIDDLEWARE: Mide la duracion de la solicitud operacion
function medirDuracion(req, res, next) {
  const inicio = process.hrtime.bigint();

  res.on("finish", () => {
    const fin = process.hrtime.bigint();
    const milisegundos = Number(fin - inicio) / 1_000_000;

    console.log(
      ` duración: [${res.locals.solicitudId}] ${req.method} ${req.originalUrl} ` +
        `${res.statusCode} ${milisegundos.toFixed(2)} ms`,
    );
  });

  next();
}

module.exports = { crearIdentificadorSolicitud, medirDuracion };
