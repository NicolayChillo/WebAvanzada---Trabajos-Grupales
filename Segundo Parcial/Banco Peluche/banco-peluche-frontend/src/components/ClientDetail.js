import React, { useEffect, useState } from 'react';
import { getClient } from '../services/api';

export default function ClientDetail({ id, onClose }) {
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const data = await getClient(id);
      setCliente(data);
    })();
  }, [id]);

  if (!id) return null;

  return (
    <div className="card detail">
      <div className="detail-header">
        <h3>Detalle cliente</h3>
        <button className="btn" onClick={onClose}>Cerrar</button>
      </div>
      {!cliente ? (
        <p>Cargando...</p>
      ) : (
        <div>
          <p><b>Nombre:</b> {cliente.nombre}</p>
          <p><b>Email:</b> {cliente.email}</p>
          <p><b>Teléfono:</b> {cliente.telefono}</p>
          <p><b>Dirección:</b> {cliente.direccion}</p>
          <h4>Valores financieros</h4>
          <p>Saldo anterior: {cliente.saldoAnterior}</p>
          <p>Monto compras: {cliente.montoCompras}</p>
          <p>Pago realizado: {cliente.pagoRealizado}</p>
          <h4>Resultado</h4>
          {cliente.resultado ? (
            <div>
              <p>Saldo actual: {cliente.resultado.saldoActual}</p>
              <p>Interés: {cliente.resultado.interes}</p>
              <p>Multa: {cliente.resultado.multa}</p>
              <p>Pago mínimo: {cliente.resultado.pagoMinimo}</p>
              <p>Es moroso: {String(cliente.resultado.esMoroso)}</p>
            </div>
          ) : (
            <p>No hay cálculo disponible.</p>
          )}
        </div>
      )}
    </div>
  );
}
