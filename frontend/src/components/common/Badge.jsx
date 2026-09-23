import React from 'react';

export const PriorityBadge = ({ priority }) => {
  const p = priority || 'Medium';
  const classMap = {
    Critical: 'badge-critical',
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low',
  };

  return (
    <span className={`badge ${classMap[p] || 'badge-medium'}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1 inline-block" />
      {p}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const s = status || 'Open';
  const classMap = {
    Open: 'badge-open',
    Assigned: 'badge-assigned',
    'In-Progress': 'badge-in-progress',
    'Pending-User': 'badge-pending-user',
    Resolved: 'badge-resolved',
    Closed: 'badge-closed',
    Escalated: 'badge-escalated',
    Reopened: 'badge-critical',
  };

  return (
    <span className={`badge ${classMap[s] || 'badge-open'}`}>
      {s}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const labels = {
    admin: { label: 'System Admin', bg: 'rgba(236, 72, 153, 0.15)', text: '#f472b6' },
    manager: { label: 'IT Manager', bg: 'rgba(168, 85, 247, 0.15)', text: '#c084fc' },
    technician: { label: 'IT Technician', bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
    asset_manager: { label: 'Asset Manager', bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
    employee: { label: 'Employee', bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
  };

  const current = labels[role] || { label: role, bg: 'rgba(255,255,255,0.1)', text: '#fff' };

  return (
    <span
      style={{
        backgroundColor: current.bg,
        color: current.text,
        border: `1px solid ${current.text}40`,
        padding: '0.2rem 0.6rem',
        borderRadius: '9999px',
        fontSize: '0.725rem',
        fontWeight: '700',
        textTransform: 'uppercase',
        display: 'inline-flex',
        alignItems: 'center',
      }}
    >
      {current.label}
    </span>
  );
};
