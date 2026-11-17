const express = require("express");
const {
  prepararAreaReservas,
  validarReservas,
} = require("../middleware/reservas");

function crearRouterReservas(controladorReservas) {
  const router = express.Router();

  router.use(prepararAreaReservas);
  router.get("/", controladorReservas.listar);
  router.get("/nueva", controladorReservas.mostrarFormulario);
  router.get("/:id/editar", controladorReservas.mostrarEdicion);
  router.post("/:id/editar", controladorReservas.guardarEdicion);
  router.get("/:id", controladorReservas.mostrarDetalle);
  router.post("/", validarReservas, controladorReservas.crear);

  return router;
}
module.exports = { crearRouterReservas };
