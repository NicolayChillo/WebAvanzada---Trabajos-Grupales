import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClient, exportPDFUrl, exportXLSXUrl } from '../services/api';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cliente, setCliente] = useState(null);

  useEffect(() => {
    const loadClient = async () => {
      if (!id) return;
      const data = await getClient(id);
      setCliente(data);
    };
    loadClient();
  }, [id]);

  const downloadPDF = () => {
    window.open(exportPDFUrl(id), '_blank');
  };

  const downloadExcel = () => {
    window.open(exportXLSXUrl(id), '_blank');
  };

  const formatNumber = (num) => {
    const n = Number(num);
    return isNaN(n) ? '0.00' : n.toFixed(2);
  };

  if (!cliente) return <div className="container"><p>Cargando cliente...</p></div>;

  return (
    <div className="container detail-page">
      <header className="page-head">
        <div>
          <p className="eyebrow">Cliente #{id}</p>
          <h1>Detalle del cliente</h1>
          <p className="muted">Revisa sus datos personales y el resumen financiero en un vistazo.</p>
        </div>
        <div className="pill-row">
          <span className="pill">{cliente.email}</span>
          <span className="pill">{cliente.telefono || 'Sin teléfono'}</span>
        </div>
      </header>

      <main className="detail-layout">
        <section className="card detail">
          <div className="detail-hero">
            <div>
              <p className="eyebrow">Nombre completo</p>
              <h2>{cliente.nombre}</h2>
              <p className="muted">{cliente.direccion || 'Sin dirección registrada'}</p>
            </div>
            <div className="pill status">{cliente.resultado?.esMoroso ? 'Moroso' : 'Al día'}</div>
          </div>

          <div className="detail-grid">
            <div className="metric-card">
              <p className="label">Saldo anterior</p>
              <p className="value">{formatNumber(cliente.saldoAnterior)}</p>
            </div>
            <div className="metric-card">
              <p className="label">Monto compras</p>
              <p className="value">{formatNumber(cliente.montoCompras)}</p>
            </div>
            <div className="metric-card">
              <p className="label">Pago realizado</p>
              <p className="value">{formatNumber(cliente.pagoRealizado)}</p>
            </div>
            {cliente.resultado && (
              <>
                <div className="metric-card">
                  <p className="label">Saldo base</p>
                  <p className="value">{formatNumber(cliente.resultado.saldoBase)}</p>
                </div>
                <div className="metric-card">
                  <p className="label">Pago mínimo base (15%)</p>
                  <p className="value">{formatNumber(cliente.resultado.pagoMinimoBase)}</p>
                </div>
                <div className="metric-card">
                  <p className="label">Interés (12%)</p>
                  <p className="value">{formatNumber(cliente.resultado.interes)}</p>
                </div>
                <div className="metric-card">
                  <p className="label">Multa</p>
                  <p className="value">{formatNumber(cliente.resultado.multa)}</p>
                </div>
                <div className="metric-card highlight">
                  <p className="label">Saldo actual</p>
                  <p className="value">{formatNumber(cliente.resultado.saldoActual)}</p>
                </div>
                <div className="metric-card">
                  <p className="label">Pago mínimo (15%)</p>
                  <p className="value">{formatNumber(cliente.resultado.pagoMinimo)}</p>
                </div>
                <div className="metric-card">
                  <p className="label">Pago sin intereses</p>
                  <p className="value">{formatNumber(cliente.resultado.pagoNoIntereses)}</p>
                </div>
              </>
            )}
          </div>

          {!cliente.resultado && (
            <div className="empty-state">
              <p className="muted">No hay cálculo disponible todavía.</p>
            </div>
          )}

          <div className="actions-bar">
            <button className="btn secondary" onClick={() => navigate(-1)}>Volver</button>
            <div className="actions-gap">
              <button className="btn primary" onClick={downloadPDF}>Exportar PDF</button>
              <button className="btn" onClick={downloadExcel}>Exportar Excel</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
