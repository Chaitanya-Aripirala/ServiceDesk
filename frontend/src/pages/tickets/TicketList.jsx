import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService, userService } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Search,
  Filter,
  PlusCircle,
  Download,
  AlertTriangle,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';
import { SLAProgress } from '../../components/common/SLAProgress';

export const TicketList = () => {
  const { user, isManager, isAdmin, isTechnician } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [breachedOnly, setBreachedOnly] = useState(false);
  const [myQueueOnly, setMyQueueOnly] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (breachedOnly) params.breached = 'true';
      if (myQueueOnly) params.myQueue = 'true';

      const res = await ticketService.getTickets(params);
      if (res.data.success) {
        setTickets(res.data.tickets);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter, breachedOnly, myQueueOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTickets();
  };

  // CSV Export utility
  const handleExportCSV = () => {
    if (tickets.length === 0) return;
    const headers = ['Ticket ID', 'Title', 'Category', 'Priority', 'Status', 'Requester', 'Assignee', 'Department', 'Created At'];
    const rows = tickets.map(t => [
      t.ticketNumber,
      `"${t.title.replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      t.requester?.name || 'Unassigned',
      t.assignedTo?.name || 'Unassigned',
      t.department,
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ServiceDesk_Tickets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="page-wrapper fade-in">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Support Tickets & Incidents</h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Track, assign, and manage enterprise SLA service requests
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            <Download size={15} /> Export CSV
          </button>
          <Link to="/tickets/new" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> New Ticket
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search by ticket # (INC-1001), keywords, category, or requester..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            <Filter size={14} /> Filters:
          </div>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Assigned">Assigned</option>
            <option value="In-Progress">In-Progress</option>
            <option value="Pending-User">Pending User</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
            <option value="Escalated">Escalated</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Hardware">Hardware</option>
            <option value="Software">Software</option>
            <option value="Network & Connectivity">Network & Connectivity</option>
            <option value="Access & Security">Access & Security</option>
            <option value="Email & Collaboration">Email & Collaboration</option>
            <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
          </select>

          {/* Breached SLA Toggle */}
          <button
            type="button"
            onClick={() => setBreachedOnly(!breachedOnly)}
            className="btn btn-sm"
            style={{
              background: breachedOnly ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
              color: breachedOnly ? '#f87171' : 'var(--text-secondary)',
              border: `1px solid ${breachedOnly ? '#ef4444' : 'var(--border-color)'}`,
            }}
          >
            <AlertTriangle size={14} /> Breached SLA Only
          </button>

          {/* Technician My Queue Toggle */}
          {(isTechnician || isManager) && (
            <button
              type="button"
              onClick={() => setMyQueueOnly(!myQueueOnly)}
              className="btn btn-sm"
              style={{
                background: myQueueOnly ? 'rgba(99, 102, 241, 0.25)' : 'rgba(255,255,255,0.05)',
                color: myQueueOnly ? '#818cf8' : 'var(--text-secondary)',
                border: `1px solid ${myQueueOnly ? '#6366f1' : 'var(--border-color)'}`,
              }}
            >
              My Assigned Queue
            </button>
          )}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Sparkles size={24} className="animate-spin inline mr-2" /> Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            <Ticket size={36} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ color: '#fff', marginBottom: '0.4rem' }}>No tickets found matching your criteria</h4>
            <p style={{ fontSize: '0.85rem' }}>Try clearing filters or search term to see more requests.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Title & Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Requester</th>
                  <th>Assignee</th>
                  <th style={{ minWidth: '180px' }}>Resolution SLA</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <Link
                        to={`/tickets/${t._id}`}
                        style={{
                          fontWeight: 700,
                          color: '#818cf8',
                          fontFamily: 'var(--font-mono)',
                          textDecoration: 'none',
                          fontSize: '0.85rem',
                        }}
                      >
                        {t.ticketNumber}
                      </Link>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', marginBottom: '0.15rem' }}>
                        <Link to={`/tickets/${t._id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                          {t.title}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {t.category} • {t.subcategory}
                      </div>
                    </td>

                    <td>
                      <PriorityBadge priority={t.priority} />
                    </td>

                    <td>
                      <StatusBadge status={t.status} />
                    </td>

                    <td>
                      <div style={{ fontSize: '0.825rem', color: '#fff' }}>{t.requester?.name || 'User'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.department}</div>
                    </td>

                    <td>
                      {t.assignedTo ? (
                        <div style={{ fontSize: '0.825rem', color: '#38bdf8' }}>{t.assignedTo.name}</div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>

                    <td>
                      <SLAProgress
                        deadline={t.slaResolutionDeadline}
                        createdAt={t.createdAt}
                        isBreached={t.isSlaResolutionBreached}
                        isCompleted={['Resolved', 'Closed'].includes(t.status)}
                        completedAt={t.resolvedAt}
                        label="SLA Target"
                      />
                    </td>

                    <td>
                      <Link
                        to={`/tickets/${t._id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.3rem 0.6rem' }}
                      >
                        Details <ChevronRight size={14} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
