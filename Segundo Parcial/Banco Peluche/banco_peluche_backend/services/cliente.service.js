import ResultadoCliente from '../models/ResultadoCliente.js';

class ClienteService {

  calcularCliente(cliente) {

    const saldoAnterior = cliente.saldoAnterior;
    const montoCompras  = cliente.montoCompras;
    const pagoRealizado = cliente.pagoRealizado;

    // Paso 2 — Saldo Base
    const saldoBase = saldoAnterior + montoCompras - pagoRealizado;

    // Paso 3 — Pago mínimo base (15%)
    const pagoMinimoBase = 0.15 * saldoBase;

    // Paso 4 — Verificar morosidad
    let esMoroso = pagoRealizado < pagoMinimoBase;

    let interes = 0;
    let multa = 0;

    if (esMoroso) {
      // Paso 5A — Interés
      interes = 0.12 * saldoBase;

      // Paso 6A — Multa
      multa = 200;
    }

    // Paso 7A / 6B — Saldo actual
    const saldoActual = saldoBase + interes + multa;

    // Paso 9 — Pago mínimo
    const pagoMinimo = 0.15 * saldoActual;

    // Paso 10 — Pago sin intereses
    const pagoNoIntereses = 0.85 * saldoActual;

    // Devolver objeto completo
    return new ResultadoCliente({
      saldoAnterior,
      montoCompras,
      pagoRealizado,
      saldoBase,
      pagoMinimoBase,
      esMoroso,
      interes,
      multa,
      saldoActual,
      pagoMinimo,
      pagoNoIntereses
    });
  }
}

export default new ClienteService();
