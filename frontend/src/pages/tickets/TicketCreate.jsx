import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ticketService, assetService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Sparkles,
  Layers,
  AlertTriangle,
  HardDrive,
  FileText,
  CheckCircle,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';
import { AiSuggestionDrawer } from '../../components/tickets/AiSuggestionDrawer';
import { Modal } from '../../components/common/Modal';

export const TicketCreate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Incident',
    category: '',
    subcategory: '',
    priority: '',
    impact: 'Single User',
    urgency: 'Medium',
    assetId: '',
  });

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiClassification, setAiClassification] = useState(null);
  const [suggestedSolutions, setSuggestedSolutions] = useState([]);
  const [aiTypingTimeout, setAiTypingTimeout] = useState(null);
  const [selectedSolutionModal, setSelectedSolutionModal] = useState(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await assetService.getAssets({ limit: 100 });
        if (res.data.success) {
          setAssets(res.data.assets);
        }
      } catch (err) {
        console.error('Failed to load assets:', err);
      }
    };
    fetchAssets();
  }, []);

  // Live debounced AI analysis when title or description changes
  const handleTextChange = (field, value) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);

    if (aiTypingTimeout) clearTimeout(aiTypingTimeout);

    if ((updated.title && updated.title.length > 5) || (updated.description && updated.description.length > 10)) {
      const timeout = setTimeout(async () => {
        try {
          const res = await ticketService.previewAiClassification({
            title: updated.title,
            description: updated.description,
          });
          if (res.data.success) {
            setAiClassification(res.data.classification);
            setSuggestedSolutions(res.data.suggestedSolutions || []);

            // Auto populate category and priority if empty
            if (!formData.category && res.data.classification.predictedCategory) {
              setFormData(prev => ({
                ...prev,
                category: res.data.classification.predictedCategory,
                subcategory: res.data.classification.predictedSubcategory,
                priority: prev.priority || res.data.classification.predictedPriority,
              }));
            }
          }
        } catch (err) {
          console.error('AI preview failed:', err);
        }
      }, 400);

      setAiTypingTimeout(timeout);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    setLoading(true);
    try {
      const res = await ticketService.createTicket(formData);
      if (res.data.success) {
        navigate(`/tickets/${res.data.ticket._id}`);
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper fade-in">
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.25rem' }}
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PlusCircle size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Create New Support Ticket</h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Describe your issue or request — our AI assistant will analyze and route it immediately.
            </p>
          </div>
        </div>

        {/* Live AI Drawer */}
        <AiSuggestionDrawer
          classification={aiClassification}
          suggestedSolutions={suggestedSolutions}
          onSelectSolution={(sol) => setSelectedSolutionModal(sol)}
        />

        {/* Main Ticket Form */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Ticket Type</label>
              <select
                className="form-select"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <option value="Incident">Incident (Something is broken or disrupted)</option>
                <option value="Service Request">Service Request (New hardware, access, software)</option>
                <option value="Access Request">Access Request (Permissions, credentials)</option>
                <option value="Hardware Issue">Hardware Issue (Physical device failure)</option>
                <option value="Software Bug">Software Bug (Application glitch)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Subject / Summary <span style={{ color: '#f87171' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. MacBook kernel panic on wake from sleep or VPN connection timeout"
                className="form-input"
                value={formData.title}
                onChange={(e) => handleTextChange('title', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Detailed Description & Error Messages <span style={{ color: '#f87171' }}>*</span>
              </label>
              <textarea
                placeholder="Please describe what happened, steps to reproduce, error codes, and what you were trying to do..."
                className="form-textarea"
                style={{ minHeight: '130px' }}
                value={formData.description}
                onChange={(e) => handleTextChange('description', e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category || 'Hardware'}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Hardware">Hardware</option>
                  <option value="Software">Software</option>
                  <option value="Network & Connectivity">Network & Connectivity</option>
                  <option value="Access & Security">Access & Security</option>
                  <option value="Email & Collaboration">Email & Collaboration</option>
                  <option value="Cloud & Infrastructure">Cloud & Infrastructure</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  className="form-select"
                  value={formData.priority || 'Medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low (Minor inconvenience / inquiry)</option>
                  <option value="Medium">Medium (Affects single user work)</option>
                  <option value="High">High (Impacting team / urgent deadline)</option>
                  <option value="Critical">Critical (Complete blocker / organization outage)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Impact Scope</label>
                <select
                  className="form-select"
                  value={formData.impact}
                  onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                >
                  <option value="Single User">Single User</option>
                  <option value="Department">Entire Department</option>
                  <option value="Multiple Departments">Multiple Departments</option>
                  <option value="Entire Organization">Entire Organization</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Related IT Asset (Optional)</label>
                <select
                  className="form-select"
                  value={formData.assetId}
                  onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                >
                  <option value="">-- None / General Request --</option>
                  {assets.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.assetTag} - {a.name} ({a.model})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
                {loading ? 'Submitting & Routing...' : 'Submit Support Ticket'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Suggested Solution Modal for Quick Deflection */}
      <Modal
        isOpen={!!selectedSolutionModal}
        onClose={() => setSelectedSolutionModal(null)}
        title={selectedSolutionModal?.title || 'Knowledge Base Solution'}
      >
        <div>
          <div style={{ padding: '0.5rem', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600, marginBottom: '1rem' }}>
            ⚡ AI Recommended Resolution ({selectedSolutionModal?.relevanceScore}% Match)
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {selectedSolutionModal?.snippet}
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setSelectedSolutionModal(null)} className="btn btn-secondary btn-sm">
              Close
            </button>
            <a
              href={`/knowledge/${selectedSolutionModal?.articleId}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-sm"
            >
              Open Full Article
            </a>
          </div>
        </div>
      </Modal>
    </div>
  );
};
