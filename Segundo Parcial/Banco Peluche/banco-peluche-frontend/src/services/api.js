const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:3000/api/clientes';

export async function getClients() {
  const res = await fetch(`${API_BASE}`);
  return res.json();
}

export async function getClient(id) {
  const res = await fetch(`${API_BASE}/${id}`);
  return res.json();
}

export async function createClient(data) {
  const res = await fetch(`${API_BASE}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateClient(id, data) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function calculateClient(id) {
  const res = await fetch(`${API_BASE}/calcular/${id}`, { method: 'POST' });
  return res.json();
}

export async function getStats() {
  const res = await fetch(`${API_BASE}/estadisticas`);
  return res.json();
}

export async function getDebtors() {
  const res = await fetch(`${API_BASE}/morosos`);
  return res.json();
}

export async function getNonDebtors() {
  const res = await fetch(`${API_BASE}/no-morosos`);
  return res.json();
}


export function exportPDFUrl(id) {
  return `${API_BASE}/${id}/export/pdf`;
}

export function exportXLSXUrl(id) {
  return `${API_BASE}/${id}/export/xlsx`;
}

export async function deleteClient(id) {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  return res.json();
}
