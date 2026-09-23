import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const SLAProgress = ({ deadline, createdAt, isBreached, isCompleted, completedAt, label = 'Resolution SLA' }) => {
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [percentRemaining, setPercentRemaining] = useState(100);
  const [statusColor, setStatusColor] = useState('success');

  useEffect(() => {
    if (!deadline) {
      setTimeLeftStr('No SLA');
      return;
    }

    const updateTimer = () => {
      const now = isCompleted && completedAt ? new Date(completedAt).getTime() : new Date().getTime();
      const end = new Date(deadline).getTime();
      const start = createdAt ? new Date(createdAt).getTime() : end - 4 * 60 * 60 * 1000;
      const totalDuration = Math.max(1, end - start);
      const diff = end - now;

      if (isBreached || diff < 0) {
        const breachDiff = Math.abs(diff);
        const hours = Math.floor(breachDiff / (1000 * 60 * 60));
        const mins = Math.floor((breachDiff % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeftStr(`Breached by ${hours > 0 ? `${hours}h ` : ''}${mins}m`);
        setPercentRemaining(0);
        setStatusColor('danger');
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) {
          setTimeLeftStr(`${hours}h ${mins}m left`);
        } else if (mins > 0) {
          setTimeLeftStr(`${mins}m ${secs}s left`);
        } else {
          setTimeLeftStr(`${secs}s left`);
        }

        const pct = Math.max(0, Math.min(100, Math.round((diff / totalDuration) * 100)));
        setPercentRemaining(pct);

        if (pct < 20) {
          setStatusColor('danger');
        } else if (pct < 50) {
          setStatusColor('warning');
        } else {
          setStatusColor('success');
        }
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, createdAt, isBreached, isCompleted, completedAt]);

  const colorStyles = {
    success: { bar: '#10b981', text: '#34d399', bg: 'rgba(16, 185, 129, 0.12)' },
    warning: { bar: '#f59e0b', text: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)' },
    danger: { bar: '#ef4444', text: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' },
  };

  const currentTheme = colorStyles[statusColor];

  return (
    <div style={{ background: currentTheme.bg, padding: '0.6rem 0.85rem', borderRadius: '8px', border: `1px solid ${currentTheme.text}35` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          {isBreached ? <AlertTriangle size={13} color="#f87171" /> : isCompleted ? <CheckCircle2 size={13} color="#34d399" /> : <Clock size={13} color="#94a3b8" />}
          {label}
        </span>
        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: currentTheme.text, fontFamily: 'var(--font-mono)' }}>
          {isCompleted && !isBreached ? 'Met on Time' : timeLeftStr}
        </span>
      </div>

      <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            width: isCompleted && !isBreached ? '100%' : `${percentRemaining}%`,
            height: '100%',
            backgroundColor: isCompleted && !isBreached ? '#10b981' : currentTheme.bar,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
    </div>
  );
};
