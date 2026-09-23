import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ticketService, userService } from '../../services/api';
import {
  ArrowLeft,
  Clock,
  User,
  HardDrive,
  MessageSquare,
  History,
  Send,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Star,
  Bot,
  Sparkles,
  RotateCcw,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { PriorityBadge, StatusBadge, RoleBadge } from '../../components/common/Badge';
import { SLAProgress } from '../../components/common/SLAProgress';
import { AiCopilotWidget } from '../../components/tickets/AiCopilotWidget';
import { Modal } from '../../components/common/Modal';

export const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTechnician, isManager, isAdmin, isEmployee } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [workLogs, setWorkLogs] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'comments', 'timeline', 'worklogs'
  const [activeTab, setActiveTab] = useState('comments');

  // Comment Box State
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTech, setSelectedTech] = useState('');
  
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [rootCause, setRootCause] = useState('');

  const [showWorkLogModal, setShowWorkLogModal] = useState(false);
  const [workMinutes, setWorkMinutes] = useState(30);
  const [workType, setWorkType] = useState('Remote Troubleshooting');
  const [workDesc, setWorkDesc] = useState('');

  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');

  const [showRateModal, setShowRateModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');

  const fetchTicketDetails = async () => {
    try {
      const res = await ticketService.getTicketById(id);
      if (res.data.success) {
        setTicket(res.data.ticket);
        setComments(res.data.comments || []);
        setWorkLogs(res.data.workLogs || []);
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
    if (isTechnician || isManager || isAdmin) {
      userService.getTechnicians().then((res) => {
        if (res.data.success) setTechnicians(res.data.technicians);
      });
    }
  }, [id]);

  const handleSendComment = async (e) => {
    e?.preventDefault();
    if (!message.trim()) return;

    setSubmittingComment(true);
    try {
      const res = await ticketService.addComment(id, {
        message,
        isInternal,
      });
      if (res.data.success) {
        setComments([...comments, res.data.comment]);
        setMessage('');
        fetchTicketDetails();
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleAssign = async () => {
    try {
      await ticketService.assignTicket(id, selectedTech);
      setShowAssignModal(false);
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async () => {
    try {
      await ticketService.updateStatus(id, {
        status: newStatus,
        resolutionSummary,
        rootCause,
      });
      setShowStatusModal(false);
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddWorkLog = async () => {
    try {
      await ticketService.addWorkLog(id, {
        timeSpentMinutes: workMinutes,
        activityType: workType,
        description: workDesc,
      });
      setShowWorkLogModal(false);
      setWorkDesc('');
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEscalate = async () => {
    try {
      await ticketService.escalateTicket(id, {
        escalationReason,
        level: (ticket.escalationLevel || 0) + 1,
      });
      setShowEscalateModal(false);
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRate = async () => {
    try {
      await ticketService.rateTicket(id, { rating, feedback });
      setShowRateModal(false);
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReopen = async () => {
    try {
      await ticketService.reopenTicket(id, { reopenReason });
      setShowReopenModal(false);
      fetchTicketDetails();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Sparkles size={28} className="animate-spin inline" color="#6366f1" />
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Loading ticket #{id}...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="page-wrapper" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h2>Ticket Not Found</h2>
        <button onClick={() => navigate('/tickets')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Tickets
        </button>
      </div>
    );
  }

  const isResolved = ['Resolved', 'Closed'].includes(ticket.status);

  return (
    <div className="page-wrapper fade-in">
      {/* Top Breadcrumb & Action Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <button onClick={() => navigate('/tickets')} className="btn btn-secondary btn-sm">
          <ArrowLeft size={14} /> Back to Tickets
        </button>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(isTechnician || isManager || isAdmin) && (
            <>
              <button
                onClick={() => {
                  setSelectedTech(ticket.assignedTo?._id || '');
                  setShowAssignModal(true);
                }}
                className="btn btn-secondary btn-sm"
              >
                <User size={14} /> Reassign Tech
              </button>

              <button
                onClick={() => setShowWorkLogModal(true)}
                className="btn btn-secondary btn-sm"
              >
                <Clock size={14} /> Log Work Hours
              </button>

              <button
                onClick={() => setShowEscalateModal(true)}
                className="btn btn-danger btn-sm"
              >
                <AlertTriangle size={14} /> Escalate
              </button>
            </>
          )}

          {/* Status Change Button */}
          <button
            onClick={() => {
              setNewStatus(ticket.status);
              setShowStatusModal(true);
            }}
            className="btn btn-primary btn-sm"
          >
            Update Status ({ticket.status})
          </button>

          {isResolved && isEmployee && !ticket.satisfactionRating?.rating && (
            <button onClick={() => setShowRateModal(true)} className="btn btn-success btn-sm">
              <Star size={14} /> Rate Support
            </button>
          )}

          {isResolved && (
            <button onClick={() => setShowReopenModal(true)} className="btn btn-secondary btn-sm">
              <RotateCcw size={14} /> Reopen Ticket
            </button>
          )}
        </div>
      </div>

      {/* Ticket Header Card */}
      <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#818cf8' }}>
                {ticket.ticketNumber}
              </span>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              {ticket.escalationLevel > 0 && (
                <span className="badge badge-escalated">
                  <ShieldAlert size={12} className="inline mr-1" /> Level {ticket.escalationLevel} Escalated
                </span>
              )}
            </div>

            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1.3 }}>
              {ticket.title}
            </h1>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', minWidth: '320px' }}>
            <div style={{ flex: 1 }}>
              <SLAProgress
                deadline={ticket.slaResponseDeadline}
                createdAt={ticket.createdAt}
                isBreached={ticket.isSlaResponseBreached}
                isCompleted={!!ticket.firstResponseAt}
                completedAt={ticket.firstResponseAt}
                label="First Response SLA"
              />
            </div>
            <div style={{ flex: 1 }}>
              <SLAProgress
                deadline={ticket.slaResolutionDeadline}
                createdAt={ticket.createdAt}
                isBreached={ticket.isSlaResolutionBreached}
                isCompleted={isResolved}
                completedAt={ticket.resolvedAt}
                label="Resolution SLA"
              />
            </div>
          </div>
        </div>

        {/* Ticket Description */}
        <div
          style={{
            padding: '1.15rem',
            borderRadius: '8px',
            background: 'rgba(15, 23, 42, 0.7)',
            border: '1px solid var(--border-color)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            color: 'var(--text-secondary)',
            whiteSpace: 'pre-line',
          }}
        >
          {ticket.description}
        </div>

        {/* Resolution details banner if resolved */}
        {ticket.resolutionSummary && (
          <div
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={16} /> Resolution Summary:
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>{ticket.resolutionSummary}</div>
            {ticket.rootCause && (
              <div style={{ fontSize: '0.775rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                <strong>Root Cause:</strong> {ticket.rootCause}
              </div>
            )}
          </div>
        )}

        {/* Requester Rating Card */}
        {ticket.satisfactionRating?.rating && (
          <div
            style={{
              marginTop: '1rem',
              padding: '0.85rem 1rem',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fbbf24' }}>
                Customer Satisfaction Score (CSAT): {ticket.satisfactionRating.rating} / 5 Stars
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                "{ticket.satisfactionRating.feedback || 'Great service'}"
              </div>
            </div>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(ticket.satisfactionRating.rating)].map((_, i) => (
                <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Split: Content & Conversation Left, Sidebar Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left Column: Conversation, Worklogs, Timeline Tabs */}
        <div>
          {/* Tabs header */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
            <button
              onClick={() => setActiveTab('comments')}
              className={`btn btn-sm ${activeTab === 'comments' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <MessageSquare size={14} /> Messages & Notes ({comments.length})
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`btn btn-sm ${activeTab === 'timeline' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <History size={14} /> Activity Timeline ({ticket.activityTimeline?.length || 0})
            </button>
            {(isTechnician || isManager || isAdmin) && (
              <button
                onClick={() => setActiveTab('worklogs')}
                className={`btn btn-sm ${activeTab === 'worklogs' ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Clock size={14} /> Work Logs ({workLogs.length})
              </button>
            )}
          </div>

          {/* TAB 1: Comments */}
          {activeTab === 'comments' && (
            <div>
              {/* Comments Feed */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '1.25rem' }}>
                {comments.length === 0 ? (
                  <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No comments on this ticket yet. Send a reply below.
                  </div>
                ) : (
                  comments.map((c) => (
                    <div
                      key={c._id}
                      className="glass-card"
                      style={{
                        padding: '1rem 1.25rem',
                        borderLeft: c.isInternal ? '4px solid #f59e0b' : '4px solid #6366f1',
                        background: c.isInternal ? 'rgba(245, 158, 11, 0.05)' : 'var(--bg-card)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{c.authorName}</span>
                          <RoleBadge role={c.authorRole} />
                          {c.isInternal && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              INTERNAL NOTE
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                        {c.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Reply Box */}
              <div className="glass-card" style={{ padding: '1.25rem' }}>
                <form onSubmit={handleSendComment}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>
                      Post Reply / Response
                    </label>

                    {(isTechnician || isManager || isAdmin) && (
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.775rem', color: isInternal ? '#fbbf24' : 'var(--text-muted)', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                        />
                        <Lock size={12} /> Make Internal Note (Hidden from employee)
                      </label>
                    )}
                  </div>

                  <textarea
                    rows={3}
                    placeholder={isInternal ? 'Add private technician troubleshooting notes...' : 'Type message to requester...'}
                    className="form-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  />

                  <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={submittingComment || !message.trim()}
                      className={`btn ${isInternal ? 'btn-secondary' : 'btn-primary'}`}
                      style={{ background: isInternal ? '#f59e0b' : undefined, color: isInternal ? '#000' : undefined }}
                    >
                      <Send size={14} /> {isInternal ? 'Post Internal Note' : 'Send Reply'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: Timeline */}
          {activeTab === 'timeline' && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Lifecycle Audit Trail</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1.25rem', marginLeft: '0.5rem' }}>
                {ticket.activityTimeline?.map((item, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '-1.65rem',
                        top: '4px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#6366f1',
                      }}
                    />
                    <div style={{ fontSize: '0.825rem', fontWeight: 700, color: '#fff' }}>
                      {item.action.replace(/_/g, ' ')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      By {item.performerName} • {new Date(item.timestamp).toLocaleString()}
                    </div>
                    {item.details && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                        {item.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Work Logs */}
          {activeTab === 'worklogs' && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Technician Work & Time Logs</h3>
                <button onClick={() => setShowWorkLogModal(true)} className="btn btn-primary btn-sm">
                  <Plus size={14} /> Log Minutes
                </button>
              </div>

              {workLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No work logs recorded yet.
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Technician</th>
                      <th>Activity</th>
                      <th>Duration</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workLogs.map((w) => (
                      <tr key={w._id}>
                        <td>{new Date(w.loggedDate).toLocaleDateString()}</td>
                        <td style={{ fontWeight: 600, color: '#fff' }}>{w.technicianName}</td>
                        <td>
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                            {w.activityType}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                          {w.timeSpentMinutes} mins
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>{w.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI Copilot, Requester Card, Linked Asset */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* AI Copilot for Technicians */}
          {(isTechnician || isManager || isAdmin) && (
            <AiCopilotWidget
              ticketId={ticket._id}
              onInsertCannedResponse={(text) => {
                setMessage(text);
                setIsInternal(false);
                setActiveTab('comments');
              }}
            />
          )}

          {/* Ticket Metadata Card */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Ticket Metadata
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.825rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{ticket.category}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subcategory:</span>
                <span style={{ color: '#fff' }}>{ticket.subcategory}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Impact Scope:</span>
                <span style={{ color: '#fff' }}>{ticket.impact}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Assigned Tech:</span>
                <span style={{ color: ticket.assignedTo ? '#38bdf8' : '#f87171', fontWeight: 600 }}>
                  {ticket.assignedTo?.name || 'Unassigned'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Created At:</span>
                <span style={{ color: '#94a3b8' }}>{new Date(ticket.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Requester Info Card */}
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Requester Profile
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <img
                src={ticket.requester?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                alt={ticket.requester?.name}
                style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>{ticket.requester?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.requester?.email}</div>
              </div>
            </div>
            <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              <div>🏢 Department: <strong>{ticket.requester?.department}</strong></div>
              <div>📍 Location: <strong>{ticket.requester?.location || 'HQ Campus'}</strong></div>
              <div>📞 Phone: <strong>{ticket.requester?.phone || 'N/A'}</strong></div>
            </div>
          </div>

          {/* Linked IT Asset Card */}
          {ticket.asset && (
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <HardDrive size={16} color="#fbbf24" />
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#fff' }}>Linked IT Asset</h4>
              </div>
              <div style={{ fontSize: '0.825rem' }}>
                <div style={{ fontWeight: 700, color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
                  {ticket.asset.assetTag}
                </div>
                <div style={{ fontWeight: 600, color: '#fff', margin: '0.2rem 0' }}>
                  {ticket.asset.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Serial: {ticket.asset.serialNumber} • {ticket.asset.model}
                </div>
                <Link
                  to={`/assets/${ticket.asset._id}`}
                  style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.75rem', color: '#06b6d4', textDecoration: 'none' }}
                >
                  View Full Asset Specs & History →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Assign Technician */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Support Technician">
        <div>
          <div className="form-group">
            <label className="form-label">Select Assignee</label>
            <select
              className="form-select"
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
            >
              <option value="">-- Unassigned --</option>
              {technicians.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name} ({t.jobTitle}) - {t.assignedTicketCount || 0} active tickets
                </option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setShowAssignModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={handleAssign} className="btn btn-primary btn-sm">Confirm Assignment</button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Update Status & Resolution */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title="Update Ticket Status">
        <div>
          <div className="form-group">
            <label className="form-label">Target Status</label>
            <select
              className="form-select"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="Open">Open</option>
              <option value="Assigned">Assigned</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Pending-User">Pending User Response</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {newStatus === 'Resolved' && (
            <>
              <div className="form-group">
                <label className="form-label">Resolution Summary & Steps Taken</label>
                <textarea
                  className="form-textarea"
                  placeholder="Explain how the issue was fixed..."
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Root Cause Category</label>
                <input
                  type="text"
                  placeholder="e.g. DNS cache desync / expired credential token / physical hardware failure"
                  className="form-input"
                  value={rootCause}
                  onChange={(e) => setRootCause(e.target.value)}
                />
              </div>
            </>
          )}

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setShowStatusModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={handleUpdateStatus} className="btn btn-primary btn-sm">Save Status</button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Add WorkLog */}
      <Modal isOpen={showWorkLogModal} onClose={() => setShowWorkLogModal(false)} title="Log Technician Work Time">
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Minutes Spent</label>
              <input
                type="number"
                className="form-input"
                min="5"
                step="5"
                value={workMinutes}
                onChange={(e) => setWorkMinutes(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Activity Type</label>
              <select
                className="form-select"
                value={workType}
                onChange={(e) => setWorkType(e.target.value)}
              >
                <option value="Investigation">Investigation</option>
                <option value="Remote Troubleshooting">Remote Troubleshooting</option>
                <option value="On-Site Support">On-Site Support</option>
                <option value="Hardware Replacement">Hardware Replacement</option>
                <option value="Software Configuration">Software Configuration</option>
                <option value="Vendor Escalation">Vendor Escalation</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Work Description</label>
            <textarea
              className="form-textarea"
              placeholder="What technical actions were performed..."
              value={workDesc}
              onChange={(e) => setWorkDesc(e.target.value)}
              required
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setShowWorkLogModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={handleAddWorkLog} className="btn btn-primary btn-sm">Save Work Log</button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Escalate */}
      <Modal isOpen={showEscalateModal} onClose={() => setShowEscalateModal(false)} title="Escalate Ticket to Management">
        <div>
          <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontSize: '0.8rem', marginBottom: '1rem' }}>
            ⚠️ Escalating this ticket will flag it with high priority and alert IT Service Delivery Managers.
          </div>
          <div className="form-group">
            <label className="form-label">Escalation Reason</label>
            <textarea
              className="form-textarea"
              placeholder="Why is higher-tier management intervention required?..."
              value={escalationReason}
              onChange={(e) => setEscalationReason(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setShowEscalateModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={handleEscalate} className="btn btn-danger btn-sm">Confirm Escalation</button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Rate Support CSAT */}
      <Modal isOpen={showRateModal} onClose={() => setShowRateModal(false)} title="Rate Your Support Experience">
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            How satisfied are you with the resolution provided for this incident?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                <Star
                  size={32}
                  fill={star <= rating ? '#fbbf24' : 'transparent'}
                  color={star <= rating ? '#fbbf24' : '#64748b'}
                />
              </button>
            ))}
          </div>

          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label">Additional Feedback (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Any compliments or suggestions for the IT team..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setShowRateModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={handleRate} className="btn btn-primary btn-sm">Submit CSAT Survey</button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Reopen */}
      <Modal isOpen={showReopenModal} onClose={() => setShowReopenModal(false)} title="Reopen Resolved Ticket">
        <div>
          <div className="form-group">
            <label className="form-label">Reason for Reopening</label>
            <textarea
              className="form-textarea"
              placeholder="Explain why the issue is still active..."
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              required
            />
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button onClick={() => setShowReopenModal(false)} className="btn btn-secondary btn-sm">Cancel</button>
            <button onClick={handleReopen} className="btn btn-primary btn-sm">Reopen Ticket</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
