import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Ticket,
  PlusCircle,
  HardDrive,
  BookOpen,
  BarChart3,
  Sliders,
  ShieldAlert,
  Users,
  Layers,
  Clock,
  FileSpreadsheet
} from 'lucide-react';

export const Sidebar = () => {
  const { user, isAdmin, isManager, isTechnician, isAssetManager, isEmployee } = useAuth();

  const navItemStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.7rem 1rem',
    borderRadius: '10px',
    fontSize: '0.85rem',
    fontWeight: 600,
    textDecoration: 'none',
    color: isActive ? '#ffffff' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'rgba(99, 102, 241, 0.18)' : 'transparent',
    border: isActive ? '1px solid rgba(99, 102, 241, 0.4)' : '1px solid transparent',
    transition: 'all 0.15s ease-in-out',
    marginBottom: '0.35rem',
  });

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: 'rgba(9, 13, 22, 0.95)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 68px)',
        padding: '1.25rem 0.85rem',
        position: 'sticky',
        top: '68px',
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '0.675rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 0.75rem 0.5rem' }}>
          Workspace
        </div>

        <NavLink to="/" style={navItemStyle}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/tickets" end style={navItemStyle}>
          <Ticket size={18} />
          <span>All Tickets</span>
        </NavLink>

        <NavLink to="/tickets/new" style={navItemStyle}>
          <PlusCircle size={18} color="#06b6d4" />
          <span style={{ color: '#06b6d4' }}>New Request</span>
        </NavLink>

        <NavLink to="/knowledge" style={navItemStyle}>
          <BookOpen size={18} />
          <span>Knowledge Base</span>
        </NavLink>

        {/* Asset Management Section */}
        {(isAssetManager || isTechnician || isManager || isAdmin) && (
          <>
            <div style={{ fontSize: '0.675rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '1rem 0.75rem 0.5rem' }}>
              Asset Management
            </div>
            <NavLink to="/assets" style={navItemStyle}>
              <HardDrive size={18} />
              <span>IT Assets</span>
            </NavLink>
          </>
        )}

        {/* Manager & Admin Reports & Governance */}
        {(isManager || isAdmin) && (
          <>
            <div style={{ fontSize: '0.675rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '1rem 0.75rem 0.5rem' }}>
              Governance & Reports
            </div>
            <NavLink to="/reports" style={navItemStyle}>
              <BarChart3 size={18} />
              <span>SLA Performance</span>
            </NavLink>
          </>
        )}

        {/* Admin Console Section */}
        {isAdmin && (
          <>
            <div style={{ fontSize: '0.675rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '1rem 0.75rem 0.5rem' }}>
              System Admin
            </div>
            <NavLink to="/admin" style={navItemStyle}>
              <Sliders size={18} />
              <span>Admin Console</span>
            </NavLink>
          </>
        )}
      </div>

      {/* Role Pill info footer */}
      <div
        style={{
          padding: '0.75rem',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--border-color)',
          fontSize: '0.75rem',
        }}
      >
        <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Signed in as:</div>
        <div style={{ fontWeight: 700, color: '#fff' }}>{user?.name}</div>
        <div style={{ color: '#06b6d4', fontWeight: 600, fontSize: '0.7rem' }}>{user?.role?.toUpperCase()}</div>
      </div>
    </aside>
  );
};
