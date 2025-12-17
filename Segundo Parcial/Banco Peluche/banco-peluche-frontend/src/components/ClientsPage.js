import React, { useEffect, useState } from 'react';
import ClientForm from './ClientForm';
import ClientList from './ClientList';
import StatsPanel from './StatsPanel';
import { getClients, getClient, getDebtors, getNonDebtors } from '../services/api';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [editing, setEditing] = useState(null);
  const [initialEdit, setInitialEdit] = useState(null);
  const [filterMode, setFilterMode] = useState('all');

  const load = async () => {
    const data = await getClients();
    const list = Array.isArray(data) ? data : [];
    setAllClients(list);
    setClients(list);
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
        <div className="filters">
          <button className={`btn ${filterMode === 'all' ? 'active' : ''}`} onClick={showAll}>Todos</button>
          <button className={`btn ${filterMode === 'morosos' ? 'active' : ''}`} onClick={showMorosos}>Morosos</button>
          <button className={`btn ${filterMode === 'noMorosos' ? 'active' : ''}`} onClick={showNoMorosos}>No Morosos</button>
        </div>
      </header>

      <main>
        <section className="split">
          <StatsPanel />
          <ClientList clients={clients} onRefresh={load} onEdit={onEdit} />
        </section>

        <section className="content-full" style={{ marginTop: 16 }}>
          <ClientForm onCreated={load} editId={editing} initial={initialEdit} onUpdated={() => { setEditing(null); setInitialEdit(null); load(); }} onCancel={() => { setEditing(null); setInitialEdit(null); }} />
        </section>
      </main>
    </div>
  );
}
