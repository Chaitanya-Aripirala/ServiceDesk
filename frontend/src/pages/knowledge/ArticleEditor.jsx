import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { kbService } from '../../services/api';
import { ArrowLeft, BookOpen, Save } from 'lucide-react';

export const ArticleEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Hardware',
    subcategory: 'Laptop / Workstation',
    summary: '',
    content: '',
    tags: 'vpn, network, connectivity',
    isPublic: true,
    status: 'Published',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      kbService.getArticleById(id).then((res) => {
        if (res.data.success) {
          const a = res.data.article;
          setFormData({
            title: a.title,
            category: a.category,
            subcategory: a.subcategory,
            summary: a.summary,
            content: a.content,
            tags: (a.tags || []).join(', '),
            isPublic: a.isPublic,
            status: a.status,
          });
        }
      });
    }
  }, [id, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    setLoading(true);
    setError('');
    try {
      if (isEditing) {
        await kbService.updateArticle(id, formData);
        navigate(`/knowledge/${id}`);
      } else {
        const res = await kbService.createArticle(formData);
        if (res.data.success) {
          navigate(`/knowledge/${res.data.article._id}`);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save article');
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
              background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BookOpen size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {isEditing ? 'Edit Knowledge Base Article' : 'Write Knowledge Article'}
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Publish verified technical runbooks and solutions for AI deflection and self-service.
            </p>
          </div>
        </div>

        {error && (
          <div style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <div className="glass-card" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Article Title <span style={{ color: '#f87171' }}>*</span></label>
              <input
                type="text"
                placeholder="e.g. Cisco AnyConnect VPN Timeout Troubleshooting & DNS Refresh"
                className="form-input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={formData.category}
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
                <label className="form-label">Subcategory</label>
                <input
                  type="text"
                  placeholder="e.g. VPN & Remote Access"
                  className="form-input"
                  value={formData.subcategory}
                  onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Summary / Problem Description <span style={{ color: '#f87171' }}>*</span></label>
              <input
                type="text"
                placeholder="Brief summary shown in AI suggestions and search previews..."
                className="form-input"
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Solution & Runbook Content <span style={{ color: '#f87171' }}>*</span></label>
              <textarea
                rows={10}
                placeholder="Provide clear, step-by-step diagnostic and resolution instructions..."
                className="form-textarea"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Search Keywords / Tags (Comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. vpn, timeout, dns, cisco, remote"
                className="form-input"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button type="button" onClick={() => navigate(-1)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary btn-lg">
                <Save size={16} /> {loading ? 'Saving...' : 'Publish Article'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
