const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Comment = require('../models/Comment');
const WorkLog = require('../models/WorkLog');
const Notification = require('../models/Notification');
const { classifyTicket, suggestSolutions, generateTechnicianCopilot } = require('../services/aiService');
const { calculateDeadlines } = require('../services/slaService');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Live AI classification preview
// @route   POST /api/tickets/ai-classify
// @access  Private
const previewAiClassification = async (req, res) => {
  try {
    const { title, description } = req.body;
    const aiResult = classifyTicket(title || '', description || '');
    const suggestedKBs = await suggestSolutions(title || '', description || '', aiResult.predictedCategory, 3);

    res.json({
      success: true,
      classification: aiResult,
      suggestedSolutions: suggestedKBs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get AI Copilot suggestions for a ticket
// @route   GET /api/tickets/:id/ai-copilot
// @access  Private (Technician, Manager, Admin)
const getAiCopilot = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('requester', 'name email department');
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const copilotData = generateTechnicianCopilot(ticket);
    const relatedArticles = await suggestSolutions(ticket.title, ticket.description, ticket.category, 4);

    res.json({
      success: true,
      copilot: copilotData,
      relatedKnowledgeArticles: relatedArticles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all tickets with rich filtering & role-based restrictions
// @route   GET /api/tickets
// @access  Private
const getTickets = async (req, res) => {
  try {
    const {
      status,
      priority,
      category,
      department,
      assignedTo,
      requester,
      breached,
      escalated,
      search,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    let filter = {};

    // Role-based visibility
    if (req.user.role === 'employee') {
      // Employees only see their own tickets
      filter.requester = req.user._id;
    } else if (req.user.role === 'technician') {
      // Technicians see assigned to them or unassigned in their department/all queue
      if (req.query.myQueue === 'true') {
        filter.assignedTo = req.user._id;
      }
    }

    // Apply explicit query filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (department) filter.department = department;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (requester && req.user.role !== 'employee') filter.requester = requester;
    if (breached === 'true') {
      filter.$or = [{ isSlaResponseBreached: true }, { isSlaResolutionBreached: true }];
    }
    if (escalated === 'true') {
      filter.escalationLevel = { $gt: 0 };
    }

    if (search) {
      filter.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortOrder };

    const total = await Ticket.countDocuments(filter);
    const tickets = await Ticket.find(filter)
      .populate('requester', 'name email department avatar')
      .populate('assignedTo', 'name email department avatar')
      .populate('asset', 'assetTag name model serialNumber status')
      .sort(sortObj)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      tickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new ticket
// @route   POST /api/tickets
// @access  Private
const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      type = 'Incident',
      category,
      subcategory,
      priority,
      impact = 'Single User',
      urgency,
      assetId,
      attachments = [],
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Please provide ticket title and description' });
    }

    // Run AI classification
    const aiResult = classifyTicket(title, description);
    const chosenCategory = category || aiResult.predictedCategory;
    const chosenSubcategory = subcategory || aiResult.predictedSubcategory;
    const chosenPriority = priority || aiResult.predictedPriority;
    const chosenUrgency = urgency || aiResult.urgency;

    // AI Knowledge base matching
    const suggestedKBs = await suggestSolutions(title, description, chosenCategory, 3);

    // Calculate SLA Targets
    const { policyId, responseDeadline, resolutionDeadline } = await calculateDeadlines(chosenPriority);

    // Generate unique Ticket ID
    const count = await Ticket.countDocuments();
    const prefix = type === 'Service Request' ? 'SRV' : 'INC';
    const ticketNumber = `${prefix}-${1000 + count + 1}`;

    const newTicket = new Ticket({
      ticketNumber,
      title,
      description,
      type,
      category: chosenCategory,
      subcategory: chosenSubcategory,
      priority: chosenPriority,
      impact,
      urgency: chosenUrgency,
      requester: req.user._id,
      department: req.user.department || 'Engineering',
      asset: assetId || null,
      slaPolicy: policyId,
      slaResponseDeadline: responseDeadline,
      slaResolutionDeadline: resolutionDeadline,
      aiClassification: {
        predictedCategory: aiResult.predictedCategory,
        predictedPriority: aiResult.predictedPriority,
        confidence: aiResult.confidence,
        probableIssue: aiResult.probableIssue,
        sentiment: aiResult.sentiment,
        suggestedAction: aiResult.suggestedAction,
        analyzedAt: new Date(),
      },
      aiSuggestedSolutions: suggestedKBs,
      attachments,
      activityTimeline: [
        {
          action: 'TICKET_CREATED',
          performedBy: req.user._id,
          performerName: req.user.name,
          details: `Ticket created with ${chosenPriority} priority and initial SLA resolution window.`,
          timestamp: new Date(),
        }
      ],
    });

    await newTicket.save();

    // Auto notify IT Managers on high/critical tickets
    if (chosenPriority === 'Critical' || chosenPriority === 'High') {
      const managers = await User.find({ role: { $in: ['manager', 'admin'] }, isActive: true });
      for (const mgr of managers) {
        await Notification.create({
          recipient: mgr._id,
          title: `🔥 High Priority Ticket Created: ${ticketNumber}`,
          message: `Ticket "${title}" requires immediate technician assignment.`,
          type: 'TICKET_UPDATED',
          link: `/tickets/${newTicket._id}`,
        });
      }
    }

    await logAudit({
      action: 'TICKET_CREATED',
      module: 'TICKETS',
      req,
      targetId: newTicket._id,
      targetType: 'Ticket',
      details: { ticketNumber, priority: chosenPriority, category: chosenCategory },
    });

    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('requester', 'name email department')
      .populate('asset', 'assetTag name model serialNumber');

    res.status(201).json({ success: true, ticket: populatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single ticket by ID
// @route   GET /api/tickets/:id
// @access  Private
const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('requester', 'name email department phone location avatar')
      .populate('assignedTo', 'name email department phone jobTitle avatar')
      .populate('asset', 'assetTag name type category model manufacturer serialNumber status location warrantyExpiry specs')
      .populate('slaPolicy');

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Role check: Employee can only see their own tickets
    if (req.user.role === 'employee' && String(ticket.requester._id) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Access denied to this ticket' });
    }

    // Fetch comments (if employee, filter out internal comments)
    let commentQuery = { ticket: ticket._id };
    if (req.user.role === 'employee') {
      commentQuery.isInternal = false;
    }
    const comments = await Comment.find(commentQuery)
      .populate('author', 'name email role avatar')
      .sort({ createdAt: 1 });

    // Fetch worklogs (only for technician, manager, admin)
    let workLogs = [];
    if (['technician', 'manager', 'admin'].includes(req.user.role)) {
      workLogs = await WorkLog.find({ ticket: ticket._id })
        .populate('technician', 'name email')
        .sort({ loggedDate: -1 });
    }

    res.json({
      success: true,
      ticket,
      comments,
      workLogs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign technician to ticket
// @route   PUT /api/tickets/:id/assign
// @access  Private (Manager, Admin, Technician self-assign)
const assignTicket = async (req, res) => {
  try {
    const { technicianId } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    let techUser = null;
    if (technicianId) {
      techUser = await User.findById(technicianId);
      if (!techUser || !['technician', 'manager', 'admin'].includes(techUser.role)) {
        return res.status(400).json({ success: false, message: 'Invalid technician assigned' });
      }
    }

    const previousAssignee = ticket.assignedTo;
    ticket.assignedTo = techUser ? techUser._id : null;
    
    if (ticket.status === 'Open' && techUser) {
      ticket.status = 'Assigned';
    }

    ticket.activityTimeline.push({
      action: 'TICKET_ASSIGNED',
      performedBy: req.user._id,
      performerName: req.user.name,
      details: techUser ? `Assigned to ${techUser.name} (${techUser.jobTitle || 'Technician'})` : 'Unassigned',
      timestamp: new Date(),
    });

    await ticket.save();

    // Update workload counters
    if (previousAssignee) {
      await User.findByIdAndUpdate(previousAssignee, { $inc: { assignedTicketCount: -1 } });
    }
    if (techUser) {
      await User.findByIdAndUpdate(techUser._id, { $inc: { assignedTicketCount: 1 } });
      
      // Notify technician
      await Notification.create({
        recipient: techUser._id,
        title: `📥 Assigned to Ticket: ${ticket.ticketNumber}`,
        message: `${req.user.name} assigned you ticket "${ticket.title}" (${ticket.priority} priority).`,
        type: 'TICKET_ASSIGNED',
        link: `/tickets/${ticket._id}`,
      });
    }

    await logAudit({
      action: 'TICKET_ASSIGNED',
      module: 'TICKETS',
      req,
      targetId: ticket._id,
      targetType: 'Ticket',
      details: { ticketNumber: ticket.ticketNumber, technician: techUser ? techUser.name : 'Unassigned' },
    });

    const updated = await Ticket.findById(ticket._id)
      .populate('requester', 'name email department')
      .populate('assignedTo', 'name email department avatar');

    res.json({ success: true, ticket: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update ticket status and resolution details
// @route   PUT /api/tickets/:id/status
// @access  Private
const updateTicketStatus = async (req, res) => {
  try {
    const { status, resolutionSummary, rootCause } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    ticket.status = status;

    const now = new Date();

    // Check First Response timestamp
    if (!ticket.firstResponseAt && ['In-Progress', 'Pending-User', 'Resolved', 'Closed'].includes(status)) {
      ticket.firstResponseAt = now;
      if (ticket.slaResponseDeadline && now > ticket.slaResponseDeadline) {
        ticket.isSlaResponseBreached = true;
      }
    }

    if (status === 'Resolved') {
      ticket.resolvedAt = now;
      ticket.resolutionSummary = resolutionSummary || 'Resolved by IT Support Team';
      ticket.rootCause = rootCause || 'Standard operational resolution';
      
      if (ticket.slaResolutionDeadline && now > ticket.slaResolutionDeadline) {
        ticket.isSlaResolutionBreached = true;
      }

      // Notify Requester to confirm and rate
      await Notification.create({
        recipient: ticket.requester,
        title: `✅ Ticket Resolved: ${ticket.ticketNumber}`,
        message: `Your ticket "${ticket.title}" has been marked as resolved. Please review and provide your rating.`,
        type: 'TICKET_UPDATED',
        link: `/tickets/${ticket._id}`,
      });
    } else if (status === 'Closed') {
      ticket.closedAt = now;
    }

    ticket.activityTimeline.push({
      action: 'STATUS_CHANGED',
      performedBy: req.user._id,
      performerName: req.user.name,
      details: `Status transitioned from ${oldStatus} to ${status}. ${resolutionSummary ? `Summary: ${resolutionSummary}` : ''}`,
      timestamp: now,
    });

    await ticket.save();

    await logAudit({
      action: 'TICKET_STATUS_UPDATED',
      module: 'TICKETS',
      req,
      targetId: ticket._id,
      targetType: 'Ticket',
      details: { ticketNumber: ticket.ticketNumber, oldStatus, newStatus: status },
    });

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/tickets/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { message, isInternal = false, attachments = [] } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    // Only tech/manager/admin can write internal notes
    const finalIsInternal = req.user.role === 'employee' ? false : isInternal;

    const comment = await Comment.create({
      ticket: ticket._id,
      author: req.user._id,
      authorName: req.user.name,
      authorRole: req.user.role,
      message,
      isInternal: finalIsInternal,
      attachments,
    });

    // If technician responded for the first time, record firstResponseAt
    if (!ticket.firstResponseAt && ['technician', 'manager', 'admin'].includes(req.user.role)) {
      ticket.firstResponseAt = new Date();
      if (ticket.status === 'Assigned' || ticket.status === 'Open') {
        ticket.status = 'In-Progress';
      }
    }

    ticket.activityTimeline.push({
      action: finalIsInternal ? 'INTERNAL_NOTE_ADDED' : 'COMMENT_ADDED',
      performedBy: req.user._id,
      performerName: req.user.name,
      details: `${finalIsInternal ? '[Internal Note]' : 'Comment'}: ${message.slice(0, 100)}...`,
      timestamp: new Date(),
    });

    await ticket.save();

    // Notify the other party if not internal
    if (!finalIsInternal) {
      const recipientId = String(req.user._id) === String(ticket.requester)
        ? ticket.assignedTo
        : ticket.requester;

      if (recipientId) {
        await Notification.create({
          recipient: recipientId,
          title: `💬 New reply on ${ticket.ticketNumber}`,
          message: `${req.user.name}: "${message.slice(0, 80)}..."`,
          type: 'TICKET_UPDATED',
          link: `/tickets/${ticket._id}`,
        });
      }
    }

    const populatedComment = await Comment.findById(comment._id).populate('author', 'name email role avatar');

    res.status(201).json({ success: true, comment: populatedComment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add work log
// @route   POST /api/tickets/:id/worklogs
// @access  Private (Technician, Manager, Admin)
const addWorkLog = async (req, res) => {
  try {
    const { timeSpentMinutes, activityType, description, isBillable = true } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const workLog = await WorkLog.create({
      ticket: ticket._id,
      technician: req.user._id,
      technicianName: req.user.name,
      timeSpentMinutes: Number(timeSpentMinutes),
      activityType: activityType || 'Remote Troubleshooting',
      description,
      isBillable,
    });

    ticket.activityTimeline.push({
      action: 'WORK_LOGGED',
      performedBy: req.user._id,
      performerName: req.user.name,
      details: `Logged ${timeSpentMinutes} mins (${activityType}): ${description}`,
      timestamp: new Date(),
    });

    await ticket.save();

    const populated = await WorkLog.findById(workLog._id).populate('technician', 'name email');
    res.status(201).json({ success: true, workLog: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Escalate ticket
// @route   POST /api/tickets/:id/escalate
// @access  Private
const escalateTicket = async (req, res) => {
  try {
    const { escalationReason, level = 1 } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = 'Escalated';
    ticket.escalationLevel = level;
    ticket.escalationReason = escalationReason || 'Manual escalation requested';

    ticket.activityTimeline.push({
      action: 'TICKET_ESCALATED',
      performedBy: req.user._id,
      performerName: req.user.name,
      details: `Ticket escalated to Level ${level}. Reason: ${ticket.escalationReason}`,
      timestamp: new Date(),
    });

    await ticket.save();

    // Alert IT Managers
    const managers = await User.find({ role: { $in: ['manager', 'admin'] } });
    for (const mgr of managers) {
      await Notification.create({
        recipient: mgr._id,
        title: `🚨 Escalation Level ${level}: ${ticket.ticketNumber}`,
        message: `${req.user.name} escalated "${ticket.title}". Reason: ${ticket.escalationReason}`,
        type: 'ESCALATION',
        link: `/tickets/${ticket._id}`,
      });
    }

    await logAudit({
      action: 'TICKET_ESCALATED',
      module: 'TICKETS',
      req,
      targetId: ticket._id,
      targetType: 'Ticket',
      details: { ticketNumber: ticket.ticketNumber, level, reason: ticket.escalationReason },
      status: 'WARNING',
    });

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit satisfaction rating (CSAT)
// @route   POST /api/tickets/:id/rate
// @access  Private (Requester / Employee)
const rateTicket = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.satisfactionRating = {
      rating: Number(rating),
      feedback: feedback || '',
      ratedAt: new Date(),
    };

    ticket.activityTimeline.push({
      action: 'CSAT_RATING_SUBMITTED',
      performedBy: req.user._id,
      performerName: req.user.name,
      details: `Requester rated service ${rating}/5 stars. Feedback: "${feedback || 'No written comment'}"`,
      timestamp: new Date(),
    });

    await ticket.save();

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reopen a resolved/closed ticket
// @route   POST /api/tickets/:id/reopen
// @access  Private
const reopenTicket = async (req, res) => {
  try {
    const { reopenReason } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    ticket.status = 'Reopened';
    ticket.reopenedCount += 1;
    ticket.reopenReason = reopenReason || 'Issue persists after initial resolution';

    ticket.activityTimeline.push({
      action: 'TICKET_REOPENED',
      performedBy: req.user._id,
      performerName: req.user.name,
      details: `Ticket reopened by ${req.user.name}. Reason: ${ticket.reopenReason}`,
      timestamp: new Date(),
    });

    await ticket.save();

    // Alert assigned technician or managers
    if (ticket.assignedTo) {
      await Notification.create({
        recipient: ticket.assignedTo,
        title: `🔄 Ticket Reopened: ${ticket.ticketNumber}`,
        message: `${req.user.name} reopened "${ticket.title}". Reason: ${ticket.reopenReason}`,
        type: 'TICKET_UPDATED',
        link: `/tickets/${ticket._id}`,
      });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  previewAiClassification,
  getAiCopilot,
  getTickets,
  createTicket,
  getTicketById,
  assignTicket,
  updateTicketStatus,
  addComment,
  addWorkLog,
  escalateTicket,
  rateTicket,
  reopenTicket,
};
