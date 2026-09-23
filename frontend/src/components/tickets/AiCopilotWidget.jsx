import React, { useState, useEffect } from 'react';
import { ticketService } from '../../services/api';
import { Bot, Sparkles, Send, CheckCircle2, ChevronRight, Copy } from 'lucide-react';

export const AiCopilotWidget = ({ ticketId, onInsertCannedResponse }) => {
  const [copilotData, setCopilotData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCopilot = async () => {
      try {
        const res = await ticketService.getAiCopilot(ticketId);
        if (res.data.success) {
          setCopilotData(res.data);
        }
      } catch (err) {
        console.error('Failed to load AI copilot data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchCopilot();
    }
  }, [ticketId]);

  if (loading) {
    return (
      <div className="glass-card" style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        <Sparkles size={14} className="animate-spin inline mr-1" /> Generating AI diagnostic insights...
      </div>
    );
  }

  if (!copilotData) return null;

  const { copilot, relatedKnowledgeArticles } = copilotData;

  return (
    <div
      className="glass-card"
      style={{
        padding: '1.25rem',
        border: '1px solid rgba(99, 102, 241, 0.4)',
        background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.07) 0%, rgba(15, 23, 42, 0.8) 100%)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            background: 'linear-gradient(135deg, #6366f1, #ec4899)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bot size={16} color="#fff" />
        </div>
        <div>
          <h4 style={{ fontSize: '0.925rem', fontWeight: 700, color: '#fff' }}>Technician AI Copilot</h4>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Automated runbook & response generator</span>
        </div>
      </div>

      {/* Suggested Diagnostic Steps */}
      {copilot?.suggestedSteps && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            Recommended Triage Protocol:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {copilot.suggestedSteps.map((step, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '0.8rem',
                  color: 'var(--text-secondary)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                }}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Canned Response Generator */}
      {copilot?.cannedResponseDraft && (
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase' }}>
              Suggested Client Response:
            </span>
            <button
              onClick={() => onInsertCannedResponse && onInsertCannedResponse(copilot.cannedResponseDraft)}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', height: 'auto', background: 'rgba(6, 182, 212, 0.15)', borderColor: 'rgba(6, 182, 212, 0.4)', color: '#06b6d4' }}
            >
              <Copy size={12} /> Insert to Comment
            </button>
          </div>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: '6px',
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              fontSize: '0.775rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'pre-line',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {copilot.cannedResponseDraft}
          </div>
        </div>
      )}

      {/* Related KB Articles */}
      {relatedKnowledgeArticles && relatedKnowledgeArticles.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            Related KB Runbooks:
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {relatedKnowledgeArticles.map((kb) => (
              <a
                key={kb.articleId}
                href={`/knowledge/${kb.articleId}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--border-color)',
                  textDecoration: 'none',
                  color: '#93c5fd',
                  fontSize: '0.775rem',
                }}
              >
                <span>{kb.title}</span>
                <ChevronRight size={14} />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
