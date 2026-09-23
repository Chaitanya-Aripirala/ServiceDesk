import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { RoleBadge } from '../../components/common/Badge';

export const Login = () => {
  const [email, setEmail] = useState('admin@servicedesk.io');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    {
      role: 'admin',
      name: 'Sarah Connor',
      email: 'admin@servicedesk.io',
      title: 'System Admin',
      description: 'Full IT Governance, SLA policy editor, category taxonomy, and audit trail',
    },
    {
      role: 'manager',
      name: 'Marcus Vance',
      email: 'manager@servicedesk.io',
      title: 'IT Manager',
      description: 'SLA breach monitoring, technician assignments, escalation triage, and KPI reports',
    },
    {
      role: 'technician',
      name: 'Alex Rivera',
      email: 'tech@servicedesk.io',
      title: 'IT Technician',
      description: 'Ticket queue, AI Copilot canned responses, work logs, and asset diagnostics',
    },
    {
      role: 'asset_manager',
      name: 'David Chen',
      email: 'assetmgr@servicedesk.io',
      title: 'Asset Manager',
      description: 'Hardware/software lifecycle, depreciation, maintenance logs, and inventory status',
    },
    {
      role: 'employee',
      name: 'Jordan Miller',
      email: 'employee@servicedesk.io',
      title: 'Employee / Requester',
      description: 'Submit tickets with live AI assistance, track SLA resolution, and rate CSAT',
    },
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('Password123!');
    setLoading(true);
    setError('');
    try {
      await login(demoEmail, 'Password123!');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '1100px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', alignItems: 'center' }}>
        {/* Left Side: Credentials Form */}
        <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(99, 102, 241, 0.6)',
              }}
            >
              <Shield size={24} color="#fff" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>ServiceDesk Pro</h1>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enterprise ITSM & Asset Governance</p>
            </div>
          </div>

          <h2 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>Welcome Back</h2>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Sign in to access your role-based helpdesk and IT assets workspace.
          </p>

          {error && (
            <div
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                fontSize: '0.825rem',
                marginBottom: '1.25rem',
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Corporate Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
                />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>

        {/* Right Side: 1-Click Demo Persona Switcher */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
            <Sparkles size={18} color="#06b6d4" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>1-Click Demo Persona Login</h3>
          </div>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Instantly switch between any of the 5 pre-configured roles to test role-specific workflows and dashboards:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {demoAccounts.map((acc) => (
              <div
                key={acc.email}
                className="glass-card glass-card-interactive"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderRadius: '12px',
                }}
                onClick={() => handleQuickLogin(acc.email)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{acc.name}</span>
                    <RoleBadge role={acc.role} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.description}</div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  style={{ borderRadius: '8px', padding: '0.4rem 0.75rem' }}
                >
                  <UserCheck size={14} /> Enter
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
