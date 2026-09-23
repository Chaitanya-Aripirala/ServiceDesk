import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { kbService } from '../../services/api';
import {
  ArrowLeft,
  BookOpen,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Edit,
  Sparkles,
  Tag,
  CheckCircle2
} from 'lucide-react';

export const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTechnician, isManager, isAdmin } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);

  const fetchArticle = async () => {
    try {
      const res = await kbService.getArticleById(id);
      if (res.data.success) {
        setArticle(res.data.article);
      }
    } catch (err) {
      console.error('Failed to load KB article:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticle();
  }, [id]);

  const handleVote = async (isHelpful) => {
    if (voted) return;
    try {
      const res = await kbService.voteArticle(id, isHelpful);
      if (res.data.success) {
        setArticle(res.data.article);
        setVoted(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Sparkles size={28} className="animate-spin inline" color="#6366f1" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Article Not Found</h2>
        <button onClick={() => navigate('/knowledge')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Knowledge Base
        </button>
      </div>
    );
  }

  return (
    <div className="page-wrapper fade-in">
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button onClick={() => navigate('/knowledge')} className="btn btn-secondary btn-sm">
            <ArrowLeft size={14} /> Back to Help Center
          </button>

          {(isTechnician || isManager || isAdmin) && (
            <Link to={`/knowledge/${article._id}/edit`} className="btn btn-secondary btn-sm">
              <Edit size={14} /> Edit Article
            </Link>
          )}
        </div>

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', textTransform: 'uppercase' }}>
              {article.category}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{article.subcategory}</span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: 1.3 }}>
            {article.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
            <span>Author: <strong style={{ color: '#fff' }}>{article.authorName}</strong></span>
            <span>•</span>
            <span>Views: {article.viewCount}</span>
            <span>•</span>
            <span>Published: {new Date(article.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Article Summary Quote */}
          <div
            style={{
              padding: '1rem 1.25rem',
              borderRadius: '8px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderLeft: '4px solid #6366f1',
              color: '#e2e8f0',
              fontSize: '0.925rem',
              fontStyle: 'italic',
              marginBottom: '1.75rem',
            }}
          >
            {article.summary}
          </div>

          {/* Full Markdown/Text Content */}
          <div
            style={{
              fontSize: '0.925rem',
              lineHeight: 1.7,
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-line',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {article.content}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div style={{ marginTop: '2rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {article.tags.map((t, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: '0.75rem',
                    color: '#818cf8',
                    background: 'rgba(99, 102, 241, 0.12)',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>
          )}

          {/* Helpfulness Survey Box */}
          <div
            style={{
              marginTop: '2.5rem',
              padding: '1.5rem',
              borderRadius: '10px',
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid var(--border-color)',
              textAlign: 'center',
            }}
          >
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: '0.4rem' }}>
              Did this article resolve your problem?
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Your feedback helps our AI model recommend better solutions.
            </p>

            {voted ? (
              <div style={{ color: '#34d399', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Thank you for your feedback!
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
                <button
                  onClick={() => handleVote(true)}
                  className="btn btn-secondary"
                  style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                >
                  <ThumbsUp size={16} /> Yes, it helped ({article.helpfulVotes || 0})
                </button>
                <button
                  onClick={() => handleVote(false)}
                  className="btn btn-secondary"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <ThumbsDown size={16} /> No, I still need help ({article.unhelpfulVotes || 0})
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
