import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assetService } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  HardDrive,
  Search,
  PlusCircle,
  Download,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Laptop,
  Sparkles
} from 'lucide-react';

export const AssetList = () => {
  const { user, isAssetManager, isAdmin } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (warrantyFilter) params.warrantyExpiring = 'true';

      const res = await assetService.getAssets(params);
      if (res.data.success) {
        setAssets(res.data.assets);
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [statusFilter, categoryFilter, warrantyFilter]);

  const handleExportCSV = () => {
    if (assets.length === 0) return;
    const headers = ['Asset Tag', 'Name', 'Category', 'Model', 'Serial Number', 'Status', 'Assigned User', 'Department', 'Current Value', 'Warranty Expiry'];
    const rows = assets.map(a => [
      a.assetTag,
      `"${a.name.replace(/"/g, '""')}"`,
      a.category,
      a.model,
      a.serialNumber,
      a.status,
      a.assignedTo?.name || 'In-Stock',
      a.department,
      `$${a.currentValue || a.purchaseCost}`,
      a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ServiceDesk_Assets_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const map = {
      'In-Stock': { bg: 'rgba(16, 185, 129, 0.15)', text: '#34d399' },
      Assigned: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa' },
      'Under-Repair': { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24' },
      Retired: { bg: 'rgba(100, 116, 139, 0.2)', text: '#94a3b8' },
    };
    const s = map[status] || map['In-Stock'];
    return (
      <span style={{ fontSize: '0.725rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: s.bg, color: s.text, textTransform: 'uppercase' }}>
        {status}
      </span>
    );
  };

  return (
    <div className="page-wrapper fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>IT Asset Inventory & Governance</h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Hardware, licenses, lifecycle tracking, depreciation and maintenance history
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary btn-sm">
            <Download size={15} /> Export Assets CSV
          </button>
          {(isAssetManager || isAdmin) && (
            <Link to="/assets/new" className="btn btn-primary btn-sm">
              <PlusCircle size={15} /> Catalog New Asset
            </Link>
          )}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by Asset Tag (AST-2024-001), Serial Number, Model, or Manufacturer..."
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAssets()}
            />
          </div>
          <button onClick={fetchAssets} className="btn btn-primary">
            Search
          </button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Lifecycle Statuses</option>
            <option value="In-Stock">In-Stock</option>
            <option value="Assigned">Assigned</option>
            <option value="Under-Repair">Under-Repair</option>
            <option value="Retired">Retired</option>
          </select>

          <select
            className="form-select"
            style={{ width: 'auto', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="Laptop">Laptop</option>
            <option value="Desktop">Desktop</option>
            <option value="Monitor">Monitor</option>
            <option value="Switch/Router">Switch/Router</option>
            <option value="Software License">Software License</option>
          </select>

          <button
            type="button"
            onClick={() => setWarrantyFilter(!warrantyFilter)}
            className="btn btn-sm"
            style={{
              background: warrantyFilter ? 'rgba(239, 68, 68, 0.25)' : 'rgba(255,255,255,0.05)',
              color: warrantyFilter ? '#f87171' : 'var(--text-secondary)',
              border: `1px solid ${warrantyFilter ? '#ef4444' : 'var(--border-color)'}`,
            }}
          >
            <AlertTriangle size={14} /> Warranty Expiring Soon (30d)
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <Sparkles size={24} className="animate-spin inline mr-2" /> Loading inventory...
          </div>
        ) : assets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
            <HardDrive size={36} color="#64748b" style={{ margin: '0 auto 1rem' }} />
            <h4 style={{ color: '#fff', marginBottom: '0.4rem' }}>No assets found</h4>
            <p style={{ fontSize: '0.85rem' }}>Try clearing filters or search term.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Asset Name & Model</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th>Department / Location</th>
                  <th>Current Value</th>
                  <th>Warranty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <Link
                        to={`/assets/${a._id}`}
                        style={{
                          fontWeight: 700,
                          color: '#06b6d4',
                          fontFamily: 'var(--font-mono)',
                          textDecoration: 'none',
                        }}
                      >
                        {a.assetTag}
                      </Link>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        <Link to={`/assets/${a._id}`} style={{ color: '#fff', textDecoration: 'none' }}>
                          {a.name}
                        </Link>
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        {a.manufacturer} • {a.model} • S/N: {a.serialNumber}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>{a.category}</span>
                    </td>

                    <td>{getStatusBadge(a.status)}</td>

                    <td>
                      {a.assignedTo ? (
                        <div style={{ fontSize: '0.825rem', color: '#fff' }}>{a.assignedTo.name}</div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>In IT Storage</span>
                      )}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.825rem', color: '#fff' }}>{a.department}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{a.location}</div>
                    </td>

                    <td style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                      ${a.currentValue || a.purchaseCost}
                    </td>

                    <td>
                      <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>
                        {a.warrantyExpiry ? new Date(a.warrantyExpiry).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>

                    <td>
                      <Link to={`/assets/${a._id}`} className="btn btn-secondary btn-sm">
                        View <ChevronRight size={14} />
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
