const mongoose = require("mongoose");

const reservaSchema = new mongoose.Schema(
  {
    estudiante: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, match: /@/ },
    sala: {
      type: String,
      required: true,
      enum: ["Sala Norte", "Sala Sur", "Sala Multimedia"],
      default: "Sala Sur",
    },
    fecha: { type: String, required: true, trim: true },
    turno: {
      type: String,
      required: true,
      enum: ["Mañana", "Tarde", "Noche"],
      default: "Tarde",
    },
    personas: { type: Number, required: true, min: 1, max: 6 },
    estado: {
      type: String,
      required: true,
      enum: ["pendiente", "confirmada"],
      default: "pendiente",
    },
  },
  { collection: "reservas" },
);

const Reserva = mongoose.model("Reserva", reservaSchema);

module.exports = { Reserva };
