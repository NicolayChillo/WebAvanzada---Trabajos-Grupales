export default class ResultadoCliente {
  constructor({
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
  }) {
    this.saldoAnterior = saldoAnterior;
    this.montoCompras = montoCompras;
    this.pagoRealizado = pagoRealizado;
    this.saldoBase = saldoBase;
    this.pagoMinimoBase = pagoMinimoBase;
    this.esMoroso = esMoroso;
    this.interes = interes;
    this.multa = multa;
    this.saldoActual = saldoActual;
    this.pagoMinimo = pagoMinimo;
    this.pagoNoIntereses = pagoNoIntereses;
  }
}
