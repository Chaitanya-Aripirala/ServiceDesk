import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { kbService } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Search,
  PlusCircle,
  ThumbsUp,
  ThumbsDown,
  Eye,
  ChevronRight,
  Sparkles,
  Tag,
  Layers
} from 'lucide-react';

export const KnowledgeBase = () => {
  const { user, isTechnician, isManager, isAdmin } = useAuth();
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (categoryFilter) params.category = categoryFilter;

      const res = await kbService.getArticles(params);
      if (res.data.success) {
        setArticles(res.data.articles);
      }
    } catch (err) {
      console.error('Failed to fetch KB articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [categoryFilter]);

  const handleVote = async (e, articleId, isHelpful) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await kbService.voteArticle(articleId, isHelpful);
      if (res.data.success) {
        setArticles(articles.map(a => a._id === articleId ? res.data.article : a));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    { name: 'Hardware', desc: 'Laptops, peripherals, power docks and monitor setup' },
    { name: 'Software', desc: 'Operating systems, Office 365, developer tools' },
    { name: 'Network & Connectivity', desc: 'VPN connections, Wi-Fi authentication, DNS' },
    { name: 'Access & Security', desc: 'Password resets, Okta MFA tokens, SSO logins' },
    { name: 'Email & Collaboration', desc: 'Outlook sync, Microsoft Teams, Slack channels' },
  ];

  return (
    <div className="page-wrapper fade-in">
      {/* Hero Search Header */}
      <div
        className="glass-card"
        style={{
          padding: '2.5rem 2rem',
          textAlign: 'center',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
          }}
        >
          <BookOpen size={24} color="#fff" />
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          IT Knowledge Base & Self-Service Portal
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          Find immediate solutions, troubleshooting runbooks, and self-help guides verified by IT engineering.
        </p>

        {/* Big Search Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchArticles();
          }}
          style={{ maxWidth: '650px', margin: '0 auto', display: 'flex', gap: '0.75rem' }}
        >
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              placeholder="Search guides e.g. VPN drop, MFA reset, Outlook cache..."
              className="form-input"
              style={{ paddingLeft: '2.75rem', paddingRight: '1rem', height: '46px', fontSize: '0.95rem' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', height: '46px' }}>
            Search
          </button>
        </form>
      </div>

      {/* Category Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div
          className="glass-card glass-card-interactive"
          style={{
            padding: '1rem',
            borderRadius: '10px',
            border: categoryFilter === '' ? '1px solid #6366f1' : '1px solid var(--border-color)',
            background: categoryFilter === '' ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
          }}
          onClick={() => setCategoryFilter('')}
        >
          <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>All Categories</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Browse all articles</div>
        </div>

        {categories.map((c) => (
          <div
            key={c.name}
            className="glass-card glass-card-interactive"
            style={{
              padding: '1rem',
              borderRadius: '10px',
              border: categoryFilter === c.name ? '1px solid #6366f1' : '1px solid var(--border-color)',
              background: categoryFilter === c.name ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-card)',
            }}
            onClick={() => setCategoryFilter(c.name)}
          >
            <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{c.name}</div>
            <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{c.desc}</div>
          </div>
        ))}
      </div>

      {/* Articles Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
          {categoryFilter ? `${categoryFilter} Guides` : 'Recommended Solutions'} ({articles.length})
        </h3>

        {(isTechnician || isManager || isAdmin) && (
          <Link to="/knowledge/new" className="btn btn-primary btn-sm">
            <PlusCircle size={15} /> Write New Article
          </Link>
        )}
      </div>

      {/* Articles Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <Sparkles size={24} className="animate-spin inline mr-2" /> Loading knowledge repository...
        </div>
      ) : articles.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No knowledge articles found.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {articles.map((art) => (
            <Link
              key={art._id}
              to={`/knowledge/${art._id}`}
              className="glass-card glass-card-interactive"
              style={{
                padding: '1.25rem',
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', textTransform: 'uppercase' }}>
                    {art.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                      <Eye size={13} /> {art.viewCount || 0}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#34d399' }}>
                      <ThumbsUp size={13} /> {art.helpfulVotes || 0}
                    </span>
                  </div>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem', lineHeight: 1.4 }}>
                  {art.title}
                </h4>

                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '0.85rem' }}>
                  {art.summary}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {art.tags?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.04)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Helpful voting buttons */}
                <div style={{ display: 'flex', gap: '0.35rem' }}>
                  <button
                    onClick={(e) => handleVote(e, art._id, true)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                    title="Mark helpful"
                  >
                    <ThumbsUp size={12} /> Yes
                  </button>
                  <button
                    onClick={(e) => handleVote(e, art._id, false)}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                    title="Mark unhelpful"
                  >
                    <ThumbsDown size={12} /> No
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
