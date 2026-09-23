import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/api';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Layers,
  Users
} from 'lucide-react';

export const Reports = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsService.getDashboardAnalytics().then((res) => {
      if (res.data.success) {
        setAnalytics(res.data);
      }
      setLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Sparkles size={28} className="animate-spin inline" color="#6366f1" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Generating ITSM executive report...</p>
      </div>
    );
  }

  const { ticketSummary, kpis, breakdowns, technicianLeaderboard, assetSummary } = analytics || {};

  return (
    <div className="page-wrapper fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>SLA Performance & Executive Reporting</h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Service level agreement analytics, resolution velocity (MTTR), and department volume
          </p>
        </div>

        <button onClick={handlePrint} className="btn btn-secondary btn-sm">
          <Printer size={15} /> Print / Save as PDF
        </button>
      </div>

      {/* High-Level Scorecard */}
      <div className="stat-grid">
        <div className="glass-card stat-card">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Overall SLA Compliance
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
              {kpis?.slaComplianceRate}%
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Target threshold: ≥ 90%</div>
          </div>
          <CheckCircle2 size={28} color="#34d399" />
        </div>

        <div className="glass-card stat-card">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Mean Time to Resolution (MTTR)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.2rem' }}>
              {kpis?.mttrHours} <span style={{ fontSize: '1rem' }}>hours</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Benchmark: &lt; 8.0 hours</div>
          </div>
          <Clock size={28} color="#06b6d4" />
        </div>

        <div className="glass-card stat-card">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Average First Response Time
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#818cf8', marginTop: '0.2rem' }}>
              {kpis?.avgFirstResponseMins} <span style={{ fontSize: '1rem' }}>mins</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Benchmark: &lt; 45 mins</div>
          </div>
          <TrendingUp size={28} color="#818cf8" />
        </div>

        <div className="glass-card stat-card">
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Customer CSAT Score
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.2rem' }}>
              {kpis?.avgCsat} / 5.0
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>Based on {kpis?.csatCount || 4} ratings</div>
          </div>
          <Sparkles size={28} color="#fbbf24" />
        </div>
      </div>

      {/* Breakdowns 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Ticket Volume by Priority */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Incident Volume by Priority
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {Object.entries(breakdowns?.byPriority || {}).map(([priority, count]) => {
              const total = ticketSummary?.total || 1;
              const pct = Math.round((count / total) * 100);
              const colorMap = { Critical: '#f472b6', High: '#f87171', Medium: '#fbbf24', Low: '#60a5fa' };
              const barColor = colorMap[priority] || '#818cf8';

              return (
                <div key={priority}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{priority}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{count} tickets ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: barColor, borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Volume by Category */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Incident Volume by Service Category
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {breakdowns?.byCategory?.map((cat) => {
              const total = ticketSummary?.total || 1;
              const pct = Math.round((cat.count / total) * 100);

              return (
                <div key={cat.category}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{cat.category}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{cat.count} requests ({pct}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: '#6366f1', borderRadius: '4px' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Technician SLA Compliance Performance Table */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem' }}>
          Technician SLA Resolution & Compliance Audit
        </h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Technician Name</th>
              <th>Role / Specialization</th>
              <th>Active Queue</th>
              <th>Resolved Tickets</th>
              <th>SLA Breaches</th>
              <th>SLA Compliance Rate</th>
            </tr>
          </thead>
          <tbody>
            {technicianLeaderboard?.map((t) => (
              <tr key={t.id}>
                <td style={{ fontWeight: 600, color: '#fff' }}>{t.name}</td>
                <td style={{ color: 'var(--text-muted)' }}>{t.jobTitle || 'Support Engineer'}</td>
                <td style={{ fontWeight: 700, color: '#818cf8' }}>{t.activeTickets}</td>
                <td style={{ fontWeight: 700, color: '#34d399' }}>{t.resolvedTickets}</td>
                <td style={{ fontWeight: 700, color: t.breachedTickets > 0 ? '#f87171' : 'var(--text-muted)' }}>
                  {t.breachedTickets}
                </td>
                <td>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '9999px',
                      background: t.complianceRate >= 90 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: t.complianceRate >= 90 ? '#34d399' : '#f87171',
                    }}
                  >
                    {t.complianceRate}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
