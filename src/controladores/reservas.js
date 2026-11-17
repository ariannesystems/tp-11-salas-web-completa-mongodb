function crearControladorReservas(servicio) {
  const SALAS = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
  const TURNOS = ["Mañana", "Tarde", "Noche"];
  const ESTADOS = ["pendiente", "confirmada"];

  async function listar(req, res) {
    const reservas = await servicio.listar();
    res.render("reservas/lista", {
      titulo: "Listas de reservas",
      reservas,
    });
  }

  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva Reservas",
      error: null,
      valores: {},
    });
  }

  async function mostrarDetalle(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe una reserva con ese identificador.",
      });
    }
    res.render("reservas/detalle", { titulo: reserva.estudiante, reserva });
  }

  async function crear(req, res) {
    await servicio.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  async function mostrarEdicion(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe la reserva que querés editar.",
      });
    }
    res.render("reservas/editar", {
      titulo: "Editar reserva",
      error: null,
      id: reserva.id,
      valores: { ...reserva },
    });
  }

  async function guardarEdicion(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }
    const datos = req.body ?? {};
    const valores = {
      estudiante: typeof datos.estudiante === "string" ? datos.estudiante : "",
      email: typeof datos.email === "string" ? datos.email : "",
      sala: typeof datos.sala === "string" ? datos.sala : "",
      fecha: typeof datos.fecha === "string" ? datos.fecha : "",
      turno: typeof datos.turno === "string" ? datos.turno : "",
      personas: typeof datos.personas === "string" ? datos.personas : "",
      estado: typeof datos.estado === "string" ? datos.estado : "",
    };
    const permitidos = [
      "estudiante",
      "email",
      "sala",
      "fecha",
      "turno",
      "personas",
      "estado",
    ];

    let hayCamposExtra = false;
    for (const campo of Object.keys(datos)) {
      if (!permitidos.includes(campo)) hayCamposExtra = true;
    }
    const personas =
      valores.personas.trim() === "" ? NaN : Number(valores.personas);

    if (
      hayCamposExtra ||
      !valores.estudiante.trim() ||
      !valores.email.trim().includes("@") ||
      !SALAS.includes(valores.sala) ||
      !valores.fecha.trim() ||
      !TURNOS.includes(valores.turno) ||
      !Number.isInteger(personas) ||
      personas < 1 ||
      personas > 6 ||
      !ESTADOS.includes(valores.estado)
    ) {
      return res.status(400).render("reservas/editar", {
        titulo: "Editar reserva",
        error:
          "Completá todos los campos, con un email válido y entre 1 y 6 personas.",
        id: reserva.id,
        valores,
      });
    }

    const reemplazo = {
      estudiante: valores.estudiante.trim(),
      email: valores.email.trim(),
      sala: valores.sala.trim(),
      fecha: valores.fecha.trim(),
      turno: valores.turno.trim(),
      personas,
      estado: valores.estado.trim(),
    };

    const actualizado = await servicio.reemplazar(reserva.id, reemplazo);
    if (!actualizado) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "La reserva ya no existe. No se guardaron cambios.",
      });
    }
    res.redirect(303, `/reservas/${actualizado.id}`);
  }

  async function listarApi(req, res) {
    const permitidos = ["sala", "orden", "pagina", "limite"];
    for (const campo of Object.keys(req.query)) {
      if (!permitidos.includes(campo)) {
        return res.status(400).json({ error: "Parámetro no permitido." });
      }
    }
    const sala = req.query.sala;
    if (sala !== undefined) {
      if (typeof sala !== "string" || sala.trim() === "") {
        return res
          .status(400)
          .json({ error: "El texto de sala debe tener contenido." });
      }
    }
    let orden = "estudiante";
    if (req.query.orden !== undefined) {
      orden = req.query.orden;
      if (
        orden !== "estudiante" &&
        orden !== "personas-asc" &&
        orden !== "personas-desc"
      ) {
        return res.status(400).json({ error: "Orden no permitido." });
      }
    }

    let pagina = 1;
    if (req.query.pagina !== undefined) {
      if (typeof req.query.pagina !== "string") {
        return res
          .status(400)
          .json({ error: "Enviá un solo valor de página." });
      }

      pagina = Number(req.query.pagina);
      if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) {
        return res
          .status(400)
          .json({ error: "Página fuera de rango permitido" });
      }
    }

    let limite = 2;
    if (req.query.limite !== undefined) {
      if (typeof req.query.limite !== "string") {
        return res
          .status(400)
          .json({ error: "Enviá un solo valor de límite." });
      }

      limite = Number(req.query.limite);
      if (!Number.isInteger(limite) || limite < 1 || limite > 20) {
        return res
          .status(400)
          .json({ error: "Límite fuera de rango permitido" });
      }
    }
    const resultado = await servicio.consultar(sala, orden, pagina, limite);
    res.json(resultado);
  }

  async function obtenerApi(req, res) {
    const reserva = await servicio.obtenerPorId(req.params.id);
    if (!reserva) {
      return res.status(404).json({ error: "Reserva no encontrada." });
    }
    res.json(reserva);
  }

  async function crearApi(req, res) {
    const reserva = await servicio.crear(req.reservaValidada);
    res.location(`/api/reservas/${reserva.id}`).status(201).json(reserva);
  }

  async function eliminarApi(req, res) {
    const eliminado = await servicio.eliminar(req.params.id);
    if (!eliminado) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.status(204).end();
  }

  async function reemplazarApi(req, res) {
    const reserva = await servicio.reemplazar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!reserva) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.json(reserva);
  }

  async function actualizarApi(req, res) {
    const reserva = await servicio.actualizar(
      req.params.id,
      req.cambiosValidos,
    );
    if (!reserva) {
      return res.status(404).json({ error: "Recurso no encontrado." });
    }
    res.json(reserva);
  }

  return {
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    mostrarEdicion,
    guardarEdicion,
    listarApi,
    obtenerApi,
    crearApi,
    eliminarApi,
    reemplazarApi,
    actualizarApi,
  };
}
module.exports = { crearControladorReservas };
