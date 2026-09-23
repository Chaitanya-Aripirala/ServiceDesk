import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../common/Badge';
import { Bell, Shield, User, LogOut, CheckCheck, Sparkles, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout, login, notifications, unreadCount, markAllRead } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const navigate = useNavigate();

  const demoAccounts = [
    { name: 'Sarah Connor', role: 'admin', email: 'admin@servicedesk.io', title: 'System Admin' },
    { name: 'Marcus Vance', role: 'manager', email: 'manager@servicedesk.io', title: 'IT Manager' },
    { name: 'Alex Rivera', role: 'technician', email: 'tech@servicedesk.io', title: 'IT Technician' },
    { name: 'David Chen', role: 'asset_manager', email: 'assetmgr@servicedesk.io', title: 'Asset Manager' },
    { name: 'Jordan Miller', role: 'employee', email: 'employee@servicedesk.io', title: 'Employee' },
  ];

  const handleSwitchRole = async (email) => {
    try {
      await login(email, 'Password123!');
      setShowRoleSwitcher(false);
      navigate('/');
    } catch (err) {
      console.error('Role switch failed:', err);
    }
  };

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)',
            }}
          >
            <Shield size={20} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
              ServiceDesk <span style={{ color: '#06b6d4' }}>Pro</span>
            </span>
            <span
              style={{
                display: 'block',
                fontSize: '0.65rem',
                color: 'var(--text-muted)',
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              Enterprise ITSM & Assets
            </span>
          </div>
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Quick Demo Role Switcher Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowRoleSwitcher(!showRoleSwitcher);
              setShowNotifications(false);
            }}
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(99, 102, 241, 0.1)',
              borderColor: 'rgba(99, 102, 241, 0.3)',
              color: '#818cf8',
            }}
          >
            <Sparkles size={14} />
            <span>Persona: <strong>{user?.name}</strong></span>
            <ChevronDown size={14} />
          </button>

          {showRoleSwitcher && (
            <div
              className="glass-card fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '270px',
                padding: '0.5rem',
                zIndex: 100,
                boxShadow: '0 15px 30px rgba(0,0,0,0.5)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Switch Demo Persona
              </div>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSwitchRole(acc.email)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: user?.email === acc.email ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: user?.email === acc.email ? '#818cf8' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = user?.email === acc.email ? 'rgba(99, 102, 241, 0.2)' : 'transparent')}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{acc.title}</div>
                  </div>
                  <RoleBadge role={acc.role} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleSwitcher(false);
            }}
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              width: '38px',
              height: '38px',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="glass-card fade-in"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '340px',
                maxHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
                boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  borderBottom: '1px solid var(--border-color)',
                }}
              >
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                    }}
                  >
                    <CheckCheck size={14} /> Mark all read
                  </button>
                )}
              </div>

              <div style={{ overflowY: 'auto', maxHeight: '320px', padding: '0.5rem' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '6px',
                        marginBottom: '0.35rem',
                        background: n.isRead ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                        borderLeft: n.isRead ? 'none' : '3px solid var(--primary)',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (n.link) navigate(n.link);
                        setShowNotifications(false);
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', marginBottom: '0.2rem' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Current User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
            alt={user?.name}
            style={{ width: '34px', height: '34px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-focus)' }}
          />
          <div style={{ display: 'none', md: 'block' }}>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff' }}>{user?.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.department}</div>
          </div>
          <button
            onClick={logout}
            title="Logout"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '6px',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};
