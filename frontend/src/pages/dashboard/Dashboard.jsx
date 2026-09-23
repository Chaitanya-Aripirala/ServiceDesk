import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, ticketService, assetService } from '../../services/api';
import {
  Ticket,
  AlertTriangle,
  CheckCircle2,
  Clock,
  HardDrive,
  BarChart3,
  Users,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { SLAProgress } from '../../components/common/SLAProgress';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user, isAdmin, isManager, isTechnician, isAssetManager, isEmployee } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [urgentTickets, setUrgentTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [analyticsRes, ticketsRes] = await Promise.all([
          analyticsService.getDashboardAnalytics(),
          ticketService.getTickets({ limit: 6, order: 'desc' }),
        ]);

        if (analyticsRes.data.success) {
          setAnalytics(analyticsRes.data);
        }
        if (ticketsRes.data.success) {
          setUrgentTickets(ticketsRes.data.tickets);
        }
      } catch (err) {
        console.error('Failed to load dashboard analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Sparkles size={28} className="animate-spin inline" color="#6366f1" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading ServiceDesk telemetry...</p>
      </div>
    );
  }

  const { ticketSummary, kpis, breakdowns, technicianLeaderboard, assetSummary } = analytics || {};

  return (
    <div className="page-wrapper fade-in">
      {/* Welcome Banner */}
      <div
        className="glass-card"
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Welcome back, {user?.name}</h1>
            <span
              style={{
                fontSize: '0.725rem',
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
                background: 'rgba(99, 102, 241, 0.2)',
                color: '#818cf8',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {user?.department}
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            {isEmployee
              ? 'Self-Service Support Hub & Incident Tracking'
              : isAssetManager
              ? 'IT Asset Procurement, Lifecycle & Hardware Governance'
              : 'Real-time Service Desk Telemetry & SLA Escalation Center'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/tickets/new" className="btn btn-primary">
            <PlusCircle size={16} /> Submit New Request
          </Link>
          <Link to="/knowledge" className="btn btn-secondary">
            <BookOpen size={16} /> Knowledge Base
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="stat-grid">
        <div className="glass-card stat-card">
          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Incidents
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
              {ticketSummary?.open + ticketSummary?.inProgress || 0}
            </div>
            <div style={{ fontSize: '0.725rem', color: '#818cf8', marginTop: '0.2rem' }}>
              {ticketSummary?.open || 0} unassigned / awaiting triage
            </div>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Ticket size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              SLA Compliance
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: kpis?.slaComplianceRate >= 90 ? '#34d399' : '#f87171', marginTop: '0.25rem' }}>
              {kpis?.slaComplianceRate || 94}%
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Target: 90% SLA Resolution
            </div>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Mean Time to Resolve (MTTR)
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#06b6d4', marginTop: '0.25rem' }}>
              {kpis?.mttrHours || 3.8} <span style={{ fontSize: '1rem', fontWeight: 600 }}>hrs</span>
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Avg First Response: {kpis?.avgFirstResponseMins || 28}m
            </div>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
            <Clock size={24} />
          </div>
        </div>

        <div className="glass-card stat-card">
          <div>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              IT Assets Active
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>
              {assetSummary?.assigned || 0} / {assetSummary?.total || 0}
            </div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              Valuation: ${((assetSummary?.totalCurrentValue || 0) / 1000).toFixed(1)}k
            </div>
          </div>
          <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <HardDrive size={24} />
          </div>
        </div>
      </div>

      {/* Main 2-Column Dashboard Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* Left Column: Urgent Ticket Stream */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Active Support Queue</h3>
              <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Live ticket feed with SLA timers & priority tags</p>
            </div>
            <Link to="/tickets" style={{ fontSize: '0.8rem', color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              View All ({urgentTickets.length}) <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {urgentTickets.map((t) => (
              <Link
                key={t._id}
                to={`/tickets/${t._id}`}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  textDecoration: 'none',
                  borderRadius: '10px',
                }}
              >
                <div style={{ maxWidth: '60%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {t.ticketNumber}
                    </span>
                    <PriorityBadge priority={t.priority} />
                    <StatusBadge status={t.status} />
                  </div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Requester: {t.requester?.name || 'User'} • Dept: {t.department}
                  </div>
                </div>

                <div style={{ minWidth: '180px' }}>
                  <SLAProgress
                    deadline={t.slaResolutionDeadline}
                    createdAt={t.createdAt}
                    isBreached={t.isSlaResolutionBreached}
                    isCompleted={['Resolved', 'Closed'].includes(t.status)}
                    completedAt={t.resolvedAt}
                    label="Resolution SLA"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Column: Technician Leaderboard & Category Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Technician Workload */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Users size={18} color="#818cf8" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Technician Capacity</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {technicianLeaderboard?.map((tech) => (
                <div
                  key={tech.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>{tech.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tech.jobTitle || 'Technician'}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '9999px',
                        background: tech.activeTickets > 3 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: tech.activeTickets > 3 ? '#f87171' : '#34d399',
                      }}
                    >
                      {tech.activeTickets} Active
                    </span>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {tech.resolvedTickets} resolved
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Asset Lifecycle Health */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <HardDrive size={18} color="#fbbf24" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Asset Inventory Health</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>In-Stock Ready</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{assetSummary?.inStock || 0}</div>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Assigned to Users</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#60a5fa' }}>{assetSummary?.assigned || 0}</div>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>In-Repair</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fbbf24' }}>{assetSummary?.underRepair || 0}</div>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Warranty Expiring</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f87171' }}>{assetSummary?.expiringWarranties || 0}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
