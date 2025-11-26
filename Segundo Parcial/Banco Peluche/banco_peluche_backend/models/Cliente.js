export default class Cliente {
  constructor(saldoAnterior, montoCompras, pagoRealizado) {
    this.saldoAnterior = Number(saldoAnterior);
    this.montoCompras = Number(montoCompras);
    this.pagoRealizado = Number(pagoRealizado);
  }
}
