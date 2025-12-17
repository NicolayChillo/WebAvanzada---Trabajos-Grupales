import React from 'react';
import { Link } from 'react-router-dom';
import { deleteClient } from '../services/api';

export default function ClientList({ clients, onRefresh, onEdit }) {
  const handleDelete = async (id) => {
    if (!window.confirm('Eliminar cliente?')) return;
    await deleteClient(id);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="card list">
      <h3>Clientes</h3>
      
      {clients.length === 0 ? (
        <p>No hay clientes aún.</p>
      ) : (
        <ul>
          {clients.map(c => (
            <li key={c._id} className="cliente-item">
              <div className="cliente-info">
                <strong>{c.nombre}</strong>
                <small>{c.email}</small>
              </div>
              <div className="cliente-actions">
                <Link className="btn" to={`/cliente/${c._id}`}>Ver Detalle</Link>
                <button className="btn" onClick={() => onEdit && onEdit(c._id)}>Editar</button>
                <button className="btn danger" onClick={() => handleDelete(c._id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
