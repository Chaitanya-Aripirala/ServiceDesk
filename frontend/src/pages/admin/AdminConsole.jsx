import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userService, slaService, auditService } from '../../services/api';
import {
  Sliders,
  Users,
  Clock,
  Layers,
  ShieldCheck,
  Plus,
  Edit,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  Sparkles
} from 'lucide-react';
import { RoleBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';

export const AdminConsole = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'employee',
    department: 'Engineering',
    jobTitle: 'Software Engineer',
  });

  // SLA policies state
  const [policies, setPolicies] = useState([]);
  const [categories, setCategories] = useState([]);

  // Audit Logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditModule, setAuditModule] = useState('');

  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [usersRes, policiesRes, categoriesRes, auditRes] = await Promise.all([
        userService.getUsers(),
        slaService.getPolicies(),
        slaService.getCategories(),
        auditService.getAuditLogs({ limit: 40 }),
      ]);

      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (policiesRes.data.success) setPolicies(policiesRes.data.policies);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.categories);
      if (auditRes.data.success) setAuditLogs(auditRes.data.logs);
    } catch (err) {
      console.error('Failed to load admin console data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.createUser(newUserData);
      if (res.data.success) {
        setShowCreateUserModal(false);
        setNewUserData({ name: '', email: '', password: 'Password123!', role: 'employee', department: 'Engineering', jobTitle: 'Software Engineer' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await userService.updateUser(userId, { isActive: !currentStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #ec4899 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Sliders size={22} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Global Admin & ITSM Governance</h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            User roles, SLA escalation policy matrices, category taxonomies, and audit trails
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Users size={15} /> User Management ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('sla')}
          className={`btn btn-sm ${activeTab === 'sla' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Clock size={15} /> SLA Policies & Targets
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`btn btn-sm ${activeTab === 'categories' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <Layers size={15} /> Category Taxonomy
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`btn btn-sm ${activeTab === 'audit' ? 'btn-primary' : 'btn-secondary'}`}
        >
          <History size={15} /> System Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: User Management */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ position: 'relative', width: '320px' }}>
              <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="form-input"
                style={{ paddingLeft: '2.25rem', fontSize: '0.825rem' }}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <button onClick={() => setShowCreateUserModal(true)} className="btn btn-primary btn-sm">
              <Plus size={15} /> Create User
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>Job Title</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users
                .filter(u => !userSearch || u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))
                .map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td><RoleBadge role={u.role} /></td>
                    <td style={{ color: '#fff' }}>{u.department}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.jobTitle || 'Team Member'}</td>
                    <td>
                      <span style={{ fontSize: '0.725rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: u.isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: u.isActive ? '#34d399' : '#f87171' }}>
                        {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.725rem', padding: '0.2rem 0.6rem' }}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: SLA Policies */}
      {activeTab === 'sla' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {policies.map((p) => (
            <div key={p._id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{p.name}</h3>
                    {p.isDefault && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
                        DEFAULT POLICY
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.description}</p>
                </div>
              </div>

              {/* Priority Targets Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                {['Critical', 'High', 'Medium', 'Low'].map((prio) => {
                  const target = p.targets?.[prio] || { responseMinutes: 120, resolutionMinutes: 1440 };
                  return (
                    <div
                      key={prio}
                      style={{
                        padding: '1rem',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid var(--border-color)',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: prio === 'Critical' ? '#f472b6' : prio === 'High' ? '#f87171' : prio === 'Medium' ? '#fbbf24' : '#60a5fa', marginBottom: '0.5rem' }}>
                        {prio} Priority
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        First Response SLA: <strong style={{ color: '#fff' }}>{target.responseMinutes} mins</strong> ({target.responseMinutes / 60}h)
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Resolution SLA: <strong style={{ color: '#fff' }}>{target.resolutionMinutes} mins</strong> ({(target.resolutionMinutes / 60).toFixed(1)}h)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Category Taxonomy */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {categories.map((c) => (
            <div key={c._id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff' }}>{c.name}</h4>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#818cf8', fontWeight: 700 }}>
                  [{c.code}]
                </span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{c.description}</p>

              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Subcategories:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {c.subcategories?.map((sub, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      padding: '0.25rem 0.6rem',
                      borderRadius: '6px',
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid var(--border-color)',
                      color: '#e2e8f0',
                    }}
                  >
                    {sub.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>System Audit Trail</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Performer</th>
                <th>Module</th>
                <th>Action</th>
                <th>Target</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log) => (
                <tr key={log._id}>
                  <td style={{ fontSize: '0.775rem', fontFamily: 'var(--font-mono)' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{log.performerName}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.performerRole}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                      {log.module}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#e2e8f0' }}>{log.action}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{log.targetType || 'System'}</td>
                  <td>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: log.status === 'SUCCESS' ? '#34d399' : '#f87171' }}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Create User */}
      <Modal isOpen={showCreateUserModal} onClose={() => setShowCreateUserModal(false)} title="Create New Enterprise User">
        <form onSubmit={handleCreateUser}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={newUserData.name}
              onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={newUserData.email}
              onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={newUserData.role}
                onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="technician">IT Technician</option>
                <option value="manager">IT Manager</option>
                <option value="asset_manager">Asset Manager</option>
                <option value="admin">System Admin</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={newUserData.department}
                onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
              >
                <option value="Engineering">Engineering</option>
                <option value="IT Support">IT Support</option>
                <option value="Finance">Finance</option>
                <option value="Human Resources">Human Resources</option>
                <option value="Sales">Sales</option>
                <option value="Executive">Executive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Job Title</label>
            <input
              type="text"
              className="form-input"
              value={newUserData.jobTitle}
              onChange={(e) => setNewUserData({ ...newUserData, jobTitle: e.target.value })}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" onClick={() => setShowCreateUserModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button type="submit" className="btn btn-primary btn-sm">Create Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
