import React, { useEffect, useState } from 'react';
import ClientForm from './ClientForm';
import ClientList from './ClientList';
import { getClients, getStats, getClient, getDebtors, getNonDebtors } from '../services/api';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [initialEdit, setInitialEdit] = useState(null);
  const [stats, setStats] = useState({ total: 0, morosos: 0, noMorosos: 0 });
  const [filterMode, setFilterMode] = useState('all');

  const load = async () => {
    const data = await getClients();
    const list = Array.isArray(data) ? data : [];
    setAllClients(list);
    setClients(list);
    const st = await getStats();
    if (st && st.data) setStats(st.data);
  };

  useEffect(() => { load(); }, []);

  const onEdit = async (id) => {
    setEditing(id);
    const data = await getClient(id);
    setInitialEdit(data);
  };

  const showAll = async () => {
    setFilterMode('all');
    setClients(allClients);
  };

  const showMorosos = async () => {
    setFilterMode('morosos');
    const data = await getDebtors();
    setClients(Array.isArray(data) ? data : []);
  };

  const showNoMorosos = async () => {
    setFilterMode('noMorosos');
    const data = await getNonDebtors();
    setClients(Array.isArray(data) ? data : []);
  };

  return (
    <div className="container">
      <header>
        <h1>Banco Peluche - Clientes</h1>
        <div className="stats">
          <div className="stat">Total: <strong>{stats.total}</strong></div>
          <div className="stat">Morosos: <strong>{stats.morosos}</strong></div>
          <div className="stat">No Morosos: <strong>{stats.noMorosos}</strong></div>
        </div>
        <div className="filters">
          <button className={`btn ${filterMode === 'all' ? 'active' : ''}`} onClick={showAll}>Todos</button>
          <button className={`btn ${filterMode === 'morosos' ? 'active' : ''}`} onClick={showMorosos}>Morosos</button>
          <button className={`btn ${filterMode === 'noMorosos' ? 'active' : ''}`} onClick={showNoMorosos}>No Morosos</button>
        </div>
      </header>

      <main>
        <section className="content-full">
          <ClientForm onCreated={load} editId={editing} initial={initialEdit} onUpdated={() => { setEditing(null); setInitialEdit(null); load(); }} onCancel={() => { setEditing(null); setInitialEdit(null); }} />
          <ClientList clients={clients} onRefresh={load} onEdit={onEdit} />
        </section>
      </main>
    </div>
  );
}
