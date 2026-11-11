const express = require("express");
const { validarReservas } = require("../middleware/reservas");
const {
  validarReemplazoReserva,
  validarActualizacionReserva,
} = require("../middleware/cambios-reservas");

function crearRouterReservasApi(controlador) {
  const router = express.Router();

  router.get("/", controlador.listarApi);
  router.get("/:id", controlador.obtenerApi);
  router.post("/", validarReservas, controlador.crearApi);
  router.delete("/:id", controlador.eliminarApi);
  router.put(
    "/:id",
    validarReservas,
    validarReemplazoReserva,
    controlador.reemplazarApi,
  );
  router.patch("/:id", validarActualizacionReserva, controlador.actualizarApi);

  return router;
}
module.exports = { crearRouterReservasApi };
