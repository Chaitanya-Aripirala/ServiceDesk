import React from 'react';
import { Sparkles, ArrowRight, Lightbulb, CheckCircle, ShieldCheck } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export const AiSuggestionDrawer = ({ classification, suggestedSolutions, onSelectSolution }) => {
  if (!classification && (!suggestedSolutions || suggestedSolutions.length === 0)) {
    return null;
  }

  return (
    <div
      className="glass-card fade-in"
      style={{
        padding: '1.25rem',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)',
        marginBottom: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#fff' }}>
              ServiceDesk AI Assistant
            </h4>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
              Real-time classification & solution deflection
            </span>
          </div>
        </div>

        {classification && (
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: '#06b6d4',
              border: '1px solid rgba(6, 182, 212, 0.3)',
            }}
          >
            {classification.confidence}% Confidence
          </span>
        )}
      </div>

      {/* Predicted metadata tags */}
      {classification && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.65rem',
            padding: '0.75rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.6)',
            marginBottom: '1rem',
            border: '1px solid var(--border-color)',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Predicted Category: <strong style={{ color: '#fff' }}>{classification.predictedCategory}</strong>
          </div>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Subcategory: <strong style={{ color: '#fff' }}>{classification.predictedSubcategory}</strong>
          </div>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Urgency: <PriorityBadge priority={classification.predictedPriority} />
          </div>
          <span style={{ color: 'var(--border-color)' }}>•</span>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Sentiment: <strong style={{ color: classification.sentiment === 'Frustrated' ? '#f87171' : classification.sentiment === 'Urgent' ? '#fbbf24' : '#34d399' }}>{classification.sentiment}</strong>
          </div>
        </div>
      )}

      {classification?.probableIssue && (
        <div style={{ marginBottom: '1rem', padding: '0.65rem 0.85rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Probable Root Cause:
          </div>
          <div style={{ fontSize: '0.825rem', color: '#e2e8f0' }}>{classification.probableIssue}</div>
        </div>
      )}

      {/* Suggested Knowledge Solutions */}
      {suggestedSolutions && suggestedSolutions.length > 0 && (
        <div>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lightbulb size={14} color="#f59e0b" />
            Can these verified Knowledge Articles resolve your issue immediately?
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {suggestedSolutions.map((sol) => (
              <div
                key={sol.articleId}
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '6px',
                  background: 'rgba(30, 41, 59, 0.6)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onClick={() => onSelectSolution && onSelectSolution(sol)}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(99, 102, 241, 0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)')}
              >
                <div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#fff' }}>{sol.title}</div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{sol.snippet}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.725rem', color: '#34d399', fontWeight: 700 }}>
                    {sol.relevanceScore}% Match
                  </span>
                  <ArrowRight size={14} color="#818cf8" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
