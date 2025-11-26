import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const resultadoSchema = new Schema({
  saldoBase: { type: Number },
  pagoMinimoBase: { type: Number },
  esMoroso: { type: Boolean },
  interes: { type: Number },
  multa: { type: Number },
  saldoActual: { type: Number },
  pagoMinimo: { type: Number },
  pagoNoIntereses: { type: Number }
}, { _id: false });

const clienteSchema = new Schema(
  {
    // Datos personales del cliente
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    telefono: { type: String },
    direccion: { type: String },

    // Datos financieros
    saldoAnterior: { type: Number, required: true },
    montoCompras: { type: Number, required: true },
    pagoRealizado: { type: Number, required: true },

    // Resultado del cálculo
    resultado: { type: resultadoSchema },
    esMoroso: { type: Boolean }
  },
  { timestamps: true }
);

export const Cliente = model('Cliente', clienteSchema);
