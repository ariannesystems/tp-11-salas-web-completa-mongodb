function prepararAreaReservas(req, res, next) {
  res.locals.seccion = "Reservas de salas de estudio";
  next();
}
function validarReservas(req, res, next) {
  const valores = req.body ?? {};

  const estudiante =
    typeof valores.estudiante === "string" ? valores.estudiante.trim() : "";
  const email = typeof valores.email === "string" ? valores.email.trim() : "";
  const sala = typeof valores.sala === "string" ? valores.sala.trim() : "";
  const fecha = typeof valores.fecha === "string" ? valores.fecha.trim() : "";
  const turno = typeof valores.turno === "string" ? valores.turno.trim() : "";
  const personaRecibida = valores.personas;

  const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
  const turnos = ["Mañana", "Tarde", "Noche"];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const tipoPersonaValida =
    typeof personaRecibida === "number" ||
    (typeof personaRecibida === "string" && personaRecibida.trim() !== "");

  const personas = tipoPersonaValida ? Number(personaRecibida) : NaN;

  if (
    !estudiante ||
    !email ||
    !emailRegex.test(email) ||
    !salasPermitidas.includes(sala) ||
    !fecha ||
    !turnos.includes(turno) ||
    !Number.isFinite(personas) ||
    personas < 1 ||
    personas > 6
  ) {
    if (req.baseUrl === "/api/reservas") {
      return res.status(400).json({
        error:
          "Completá los campos, la cantidad de personas en la sala debe estar entre 1 a 6.",
      });
    }
    return res.status(400).render("reservas/nueva", {
      titulo: "Nueva reservas",
      error:
        "Completá los campos, la cantidad de personas en la sala debe estar entre 1 a 6.",
      valores,
    });
  }
  req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
  next();
}
module.exports = { prepararAreaReservas, validarReservas };
