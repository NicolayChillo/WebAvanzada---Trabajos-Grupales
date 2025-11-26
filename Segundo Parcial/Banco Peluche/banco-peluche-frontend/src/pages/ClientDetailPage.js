import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, exportPDFUrl, exportXLSXUrl } from '../services/api';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const data = await getClient(id);
      setCliente(data);
    })();
  }, [id]);

  const downloadPDF = () => {
    window.open(exportPDFUrl(id), '_blank');
  };

  const downloadExcel = () => {
    window.open(exportXLSXUrl(id), '_blank');
  };

  if (!cliente) return <div className="container"><p>Cargando cliente...</p></div>;

  return (
    <div className="container">
      <header>
        <h1>Detalle cliente</h1>
      </header>

      <main>
        <div className="card detail">
          <h3>{cliente.nombre}</h3>
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

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button className="btn" onClick={downloadPDF}>Exportar PDF</button>
            <button className="btn" onClick={downloadExcel}>Exportar Excel</button>
            <button className="btn" onClick={() => navigate(-1)}>Volver</button>
          </div>
        </div>
      </main>
    </div>
  );
}
