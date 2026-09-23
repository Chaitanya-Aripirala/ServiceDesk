const cron = require('node-cron');
const SLAPolicy = require('../models/SLAPolicy');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

/**
 * Calculate Response & Resolution SLA Deadlines based on policy & priority
 */
const calculateDeadlines = async (priority = 'Medium', slaPolicyId = null) => {
  let policy;
  if (slaPolicyId) {
    policy = await SLAPolicy.findById(slaPolicyId);
  }
  if (!policy) {
    policy = await SLAPolicy.findOne({ isDefault: true }) || await SLAPolicy.findOne();
  }

  // Fallback defaults if no policy in DB
  const defaultTargets = {
    Critical: { responseMinutes: 30, resolutionMinutes: 240 },
    High: { responseMinutes: 60, resolutionMinutes: 480 },
    Medium: { responseMinutes: 120, resolutionMinutes: 1440 },
    Low: { responseMinutes: 240, resolutionMinutes: 2880 },
  };

  const targets = policy && policy.targets && policy.targets[priority]
    ? policy.targets[priority]
    : defaultTargets[priority] || defaultTargets.Medium;

  const now = new Date();
  const responseDeadline = new Date(now.getTime() + (targets.responseMinutes || 120) * 60 * 1000);
  const resolutionDeadline = new Date(now.getTime() + (targets.resolutionMinutes || 1440) * 60 * 1000);

  return {
    policyId: policy ? policy._id : null,
    responseDeadline,
    resolutionDeadline,
  };
};

/**
 * SLA Escalation and Breach Monitor Daemon
 * Runs periodically to flag breached tickets and escalate to IT Managers
 */
const runSlaCheck = async () => {
  try {
    const now = new Date();
    const activeTickets = await Ticket.find({
      status: { $in: ['Open', 'Assigned', 'In-Progress', 'Pending-User', 'Reopened', 'Escalated'] }
    }).populate('assignedTo', 'name email').populate('requester', 'name email');

    // Find IT Managers for notifications
    const itManagers = await User.find({ role: 'manager', isActive: true });

    for (const ticket of activeTickets) {
      let updated = false;

      // 1. Check Response SLA
      if (!ticket.firstResponseAt && ticket.slaResponseDeadline) {
        if (now > ticket.slaResponseDeadline && !ticket.isSlaResponseBreached) {
          ticket.isSlaResponseBreached = true;
          updated = true;

          // Add timeline entry
          ticket.activityTimeline.push({
            action: 'SLA_RESPONSE_BREACHED',
            performerName: 'SLA Daemon',
            details: `Response SLA deadline exceeded (${ticket.slaResponseDeadline.toLocaleTimeString()})`,
            timestamp: now,
          });

          // Create notification for assigned technician
          if (ticket.assignedTo) {
            await Notification.create({
              recipient: ticket.assignedTo._id,
              title: `⚠️ Response SLA Breached: ${ticket.ticketNumber}`,
              message: `Ticket "${ticket.title}" has breached its initial response SLA window.`,
              type: 'SLA_BREACH',
              link: `/tickets/${ticket._id}`,
            });
          }
        }
      }

      // 2. Check Resolution SLA & Auto Escalation
      if (ticket.slaResolutionDeadline) {
        if (now > ticket.slaResolutionDeadline && !ticket.isSlaResolutionBreached) {
          ticket.isSlaResolutionBreached = true;
          ticket.escalationLevel = Math.max(ticket.escalationLevel || 0, 1);
          ticket.status = 'Escalated';
          ticket.escalationReason = 'Automated SLA Resolution Breach - Escalated to IT Management';
          updated = true;

          ticket.activityTimeline.push({
            action: 'SLA_RESOLUTION_BREACHED_ESCALATED',
            performerName: 'SLA Daemon',
            details: `Resolution SLA deadline breached. Ticket automatically escalated to Level 1.`,
            timestamp: now,
          });

          // Notify all IT Managers of SLA Escalation
          for (const mgr of itManagers) {
            await Notification.create({
              recipient: mgr._id,
              title: `🚨 Escalation Alert: ${ticket.ticketNumber}`,
              message: `Ticket "${ticket.title}" (${ticket.priority} priority) has breached resolution SLA and is escalated.`,
              type: 'ESCALATION',
              link: `/tickets/${ticket._id}`,
            });
          }

          // Log Audit event
          await AuditLog.create({
            action: 'TICKET_AUTO_ESCALATED',
            module: 'SLA',
            performerName: 'SLA Background Daemon',
            performerRole: 'system',
            targetId: String(ticket._id),
            targetType: 'Ticket',
            details: { ticketNumber: ticket.ticketNumber, priority: ticket.priority },
            status: 'WARNING',
          });
        }
      }

      if (updated) {
        await ticket.save();
      }
    }
  } catch (error) {
    console.error(`[SLA Daemon Error]: ${error.message}`);
  }
};

/**
 * Initialize Background SLA Scheduler
 */
const initSlaScheduler = () => {
  // Run every 2 minutes
  cron.schedule('*/2 * * * *', () => {
    runSlaCheck();
  });
  console.log('[SLA Daemon] Background SLA monitor initialized (checks every 2 mins).');
};

module.exports = {
  calculateDeadlines,
  runSlaCheck,
  initSlaScheduler,
};
