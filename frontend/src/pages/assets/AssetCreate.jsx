import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { assetService, userService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HardDrive, PlusCircle } from 'lucide-react';

export const AssetCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: 'Hardware',
    category: 'Laptop',
    manufacturer: 'Dell',
    model: 'Latitude 7440',
    serialNumber: '',
    status: 'In-Stock',
    department: 'IT Support',
    location: 'HQ IT Depot Storage Shelf A3',
    purchaseCost: 1450,
    depreciationRateAnnual: 20,
    warrantyExpiry: new Date(Date.now() + 365 * 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    vendorName: 'Dell Enterprise Solutions',
    specs: {
      cpu: 'Intel Core i7-1370P',
      ram: '32 GB DDR5',
      storage: '1 TB NVMe SSD',
      os: 'Windows 11 Enterprise',
    },
    notes: '',
  });

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    userService.getUsers().then((res) => {
      if (res.data.success) setUsersList(res.data.users);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.serialNumber) return;

    setLoading(true);
    setError('');
    try {
      const res = await assetService.createAsset(formData);
      if (res.data.success) {
        navigate(`/assets/${res.data.asset._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to catalog asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <button onClick={() => navigate(-1)} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem' }}>
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HardDrive size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Catalog New IT Asset</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Register hardware, serial numbers, specifications, warranty, and initial assignment.
            </p>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Asset Name <span style={{ color: '#f87171' }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Dell Latitude 7440 Ultra"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Serial Number <span style={{ color: '#f87171' }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. DLL-998822-Z"
                  className="form-input"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software License</option>
                  <option value="Network">Network</option>
                  <option value="Peripheral">Peripheral</option>
                  <option value="Cloud">Cloud Resource</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Laptop">Laptop</option>
                  <option value="Desktop">Desktop</option>
                  <option value="Server">Server</option>
                  <option value="Monitor">Monitor</option>
                  <option value="Switch/Router">Switch/Router</option>
                  <option value="Smartphone">Smartphone</option>
                  <option value="Software License">Software License</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Manufacturer</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Model Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Vendor / Supplier</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.vendorName}
                  onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Purchase Cost ($)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.purchaseCost}
                  onChange={(e) => setFormData({ ...formData, purchaseCost: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Depreciation (%)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.depreciationRateAnnual}
                  onChange={(e) => setFormData({ ...formData, depreciationRateAnnual: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warranty Expiration Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.warrantyExpiry}
                  onChange={(e) => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                />
              </div>
            </div>

            {/* Specs Section */}
            <div style={{ margin: '1rem 0', padding: '1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', color: '#06b6d4' }}>
                Hardware Specifications
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input
                  type="text"
                  placeholder="CPU (e.g. Intel i7-1370P / Apple M3 Max)"
                  className="form-input"
                  value={formData.specs.cpu}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, cpu: e.target.value } })}
                />
                <input
                  type="text"
                  placeholder="RAM (e.g. 32 GB DDR5)"
                  className="form-input"
                  value={formData.specs.ram}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, ram: e.target.value } })}
                />
                <input
                  type="text"
                  placeholder="Storage (e.g. 1 TB SSD)"
                  className="form-input"
                  value={formData.specs.storage}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, storage: e.target.value } })}
                />
                <input
                  type="text"
                  placeholder="OS (e.g. Windows 11 Enterprise / macOS)"
                  className="form-input"
                  value={formData.specs.os}
                  onChange={(e) => setFormData({ ...formData, specs: { ...formData.specs, os: e.target.value } })}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
                {loading ? 'Cataloging Asset...' : 'Save & Catalog Asset'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
