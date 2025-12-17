import React, { useEffect, useMemo, useState } from 'react';
import { getStats } from '../services/api';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function StatsPanel() {
  const [stats, setStats] = useState({ total: 0, morosos: 0, noMorosos: 0 });

  const loadStats = async () => {
    try {
      const st = await getStats();
      if (st && st.data) setStats(st.data);
    } catch (e) {
      // ignore errors for polling
    }
  };

  useEffect(() => {
    loadStats();
    const id = setInterval(loadStats, 5000);
    return () => clearInterval(id);
  }, []);

  const chartData = useMemo(() => ({
    labels: ['Morosos', 'No Morosos'],
    datasets: [
      {
        label: 'Clientes',
        data: [stats.morosos || 0, stats.noMorosos || 0],
        backgroundColor: ['#ff6b6b', '#2ebf7a'],
        borderColor: ['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.08)'],
        borderWidth: 1,
      }
    ]
  }), [stats]);

  const options = useMemo(() => ({
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { enabled: true }
    },
    responsive: true,
    maintainAspectRatio: false
  }), []);

  return (
    <div className="card stats-panel">
      <div className="stats-header">
        <h3>Estadísticas en tiempo real</h3>
        <small className="muted">Actualiza cada 5s</small>
      </div>
      <div className="chart-wrap">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="stats-footer">
        <div className="stat">Total: <strong>{stats.total}</strong></div>
        <div className="stat">Morosos: <strong>{stats.morosos}</strong></div>
        <div className="stat">No Morosos: <strong>{stats.noMorosos}</strong></div>
      </div>
    </div>
  );
}
