import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assetService, userService } from '../../services/api';
import {
  ArrowLeft,
  HardDrive,
  Cpu,
  ShieldCheck,
  Wrench,
  History,
  Ticket,
  User,
  DollarSign,
  Plus,
  Edit,
  Sparkles
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { PriorityBadge, StatusBadge } from '../../components/common/Badge';

export const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAssetManager, isAdmin, isTechnician } = useAuth();

  const [asset, setAsset] = useState(null);
  const [relatedTickets, setRelatedTickets] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showLifecycleModal, setShowLifecycleModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [lifecycleNotes, setLifecycleNotes] = useState('');

  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintType, setMaintType] = useState('Scheduled Inspection');
  const [maintCost, setMaintCost] = useState(50);
  const [maintNotes, setMaintNotes] = useState('');

  const fetchAssetDetails = async () => {
    try {
      const res = await assetService.getAssetById(id);
      if (res.data.success) {
        setAsset(res.data.asset);
        setRelatedTickets(res.data.relatedTickets || []);
      }
    } catch (err) {
      console.error('Failed to load asset details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
    if (isAssetManager || isAdmin) {
      userService.getUsers().then((res) => {
        if (res.data.success) setUsersList(res.data.users);
      });
    }
  }, [id]);

  const handleUpdateLifecycle = async () => {
    try {
      await assetService.updateLifecycle(id, {
        status: targetStatus,
        assignedTo: targetUser || null,
        notes: lifecycleNotes,
      });
      setShowLifecycleModal(false);
      fetchAssetDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMaintenance = async () => {
    try {
      await assetService.addMaintenanceLog(id, {
        type: maintType,
        cost: maintCost,
        notes: maintNotes,
      });
      setShowMaintenanceModal(false);
      setMaintNotes('');
      fetchAssetDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Sparkles size={28} className="animate-spin inline" color="#06b6d4" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading asset #{id}...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Asset Not Found</h2>
        <button onClick={() => navigate('/assets')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Asset Inventory
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <button onClick={() => navigate('/assets')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Assets
        </button>

        {(isAssetManager || isAdmin || isTechnician) && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => {
                setTargetStatus(asset.status);
                setTargetUser(asset.assignedTo?._id || '');
                setShowLifecycleModal(true);
              }}
              className="btn btn-primary btn-sm"
            >
              Update Lifecycle / Assignment
            </button>
            <button
              onClick={() => setShowMaintenanceModal(true)}
              className="btn btn-secondary btn-sm"
            >
              <Wrench size={14} /> Log Maintenance
            </button>
          </div>
        )}
      </div>

      {/* Asset Hero Header */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#06b6d4' }}>
                {asset.assetTag}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', textTransform: 'uppercase' }}>
                {asset.type} • {asset.category}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '9999px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', textTransform: 'uppercase' }}>
                {asset.status}
              </span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{asset.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              {asset.manufacturer} {asset.model} • S/N: <strong style={{ color: '#fff' }}>{asset.serialNumber}</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Valuation</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              ${asset.currentValue}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Purchased for ${asset.purchaseCost} ({asset.depreciationRateAnnual}% annual depreciation)
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Split: Specs & Maintenance Left, History & Linked Tickets Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Specs & Maintenance Logs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Hardware Specs Card */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Cpu size={18} color="#06b6d4" />
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Technical Specifications</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Processor (CPU):</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{asset.specs?.cpu || 'Standard Multi-core'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Memory (RAM):</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{asset.specs?.ram || '16 GB'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Storage / SSD:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{asset.specs?.storage || '512 GB SSD'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Operating System:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{asset.specs?.os || 'Standard Enterprise OS'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Department:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{asset.department}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Physical Location:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{asset.location}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Vendor / Supplier:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{asset.vendorName || 'Direct OEM'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Warranty Expiration:</span>
                <div style={{ fontWeight: 600, color: '#34d399' }}>
                  {asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Maintenance Logs */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Wrench size={18} color="#fbbf24" />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Maintenance & Repair Records</h3>
              </div>
              <button onClick={() => setShowMaintenanceModal(true)} className="btn btn-secondary btn-sm">
                <Plus size={14} /> Add Log
              </button>
            </div>

            {asset.maintenanceLogs?.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                No maintenance incidents logged yet. Device in optimal condition.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {asset.maintenanceLogs?.map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff' }}>{m.type}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        By {m.performedBy} • {new Date(m.date).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {m.notes}
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                      ${m.cost}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: User Assignment & Lifecycle History & Related Tickets */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Current Custodian */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Current Assignee / Custodian
            </h4>
            {asset.assignedTo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={asset.assignedTo.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={asset.assignedTo.name}
                  style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{asset.assignedTo.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{asset.assignedTo.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#06b6d4' }}>{asset.assignedTo.department}</div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                In Stock ready for assignment
              </div>
            )}
          </div>

          {/* Related Support Tickets */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Ticket size={16} color="#818cf8" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Related Support Tickets</h4>
            </div>

            {relatedTickets.length === 0 ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No tickets logged for this asset.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {relatedTickets.map((t) => (
                  <Link
                    key={t._id}
                    to={`/tickets/${t._id}`}
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border-color)',
                      textDecoration: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>{t.title}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.ticketNumber} • {t.status}</div>
                    </div>
                    <PriorityBadge priority={t.priority} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Lifecycle Audit History */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <History size={16} color="#34d399" />
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>Lifecycle Audit History</h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem', marginLeft: '0.35rem' }}>
              {asset.lifecycleHistory?.map((item, idx) => (
                <div key={idx} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.35rem', top: '4px', width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>{item.action}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    By {item.performerName} • {new Date(item.timestamp).toLocaleDateString()}
                  </div>
                  {item.notes && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{item.notes}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Update Lifecycle */}
      <Modal isOpen={showLifecycleModal} onClose={() => setShowLifecycleModal(false)} title="Update Asset Lifecycle Status">
        <div>
          <div className="form-group">
            <label className="form-label">Asset Status</label>
            <select className="form-select" value={targetStatus} onChange={(e) => setTargetStatus(e.target.value)}>
              <option value="In-Stock">In-Stock (In IT Depot)</option>
              <option value="Assigned">Assigned to Employee</option>
              <option value="Under-Repair">Under-Repair / Maintenance</option>
              <option value="Retired">Retired / Disposed</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign To User (Optional)</label>
            <select className="form-select" value={targetUser} onChange={(e) => setTargetUser(e.target.value)}>
              <option value="">-- No User / Unassigned --</option>
              {usersList.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.department} - {u.jobTitle})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Reason / Handover Notes</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Assigned for new hire onboarding in Engineering pod..."
              value={lifecycleNotes}
              onChange={(e) => setLifecycleNotes(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setShowLifecycleModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={handleUpdateLifecycle} className="btn btn-primary btn-sm">Save Lifecycle Transition</button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Add Maintenance */}
      <Modal isOpen={showMaintenanceModal} onClose={() => setShowMaintenanceModal(false)} title="Record Maintenance Log">
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Maintenance Type</label>
              <select className="form-select" value={maintType} onChange={(e) => setMaintType(e.target.value)}>
                <option value="Scheduled Inspection">Scheduled Inspection</option>
                <option value="Hardware Repair">Hardware Repair</option>
                <option value="Battery Replacement">Battery Replacement</option>
                <option value="OS Reinstallation">OS Reinstallation</option>
                <option value="Upgrade">RAM/SSD Upgrade</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Repair Cost ($)</label>
              <input type="number" className="form-input" min="0" value={maintCost} onChange={(e) => setMaintCost(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Technician Notes</label>
            <textarea
              className="form-textarea"
              placeholder="What maintenance actions were performed..."
              value={maintNotes}
              onChange={(e) => setMaintNotes(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setShowMaintenanceModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={handleAddMaintenance} className="btn btn-primary btn-sm">Save Maintenance Record</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
