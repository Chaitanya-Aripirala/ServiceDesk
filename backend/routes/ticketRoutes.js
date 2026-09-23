const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/ticketController');
const { protect, authorize } = require('../middleware/authMiddleware');

// AI Endpoints
router.post('/ai-classify', protect, previewAiClassification);
router.get('/:id/ai-copilot', protect, authorize('technician', 'manager', 'admin'), getAiCopilot);

// Core Ticket CRUD & Workflows
router.route('/')
  .get(protect, getTickets)
  .post(protect, createTicket);

router.route('/:id')
  .get(protect, getTicketById);

router.put('/:id/assign', protect, authorize('technician', 'manager', 'admin'), assignTicket);
router.put('/:id/status', protect, updateTicketStatus);
router.post('/:id/comments', protect, addComment);
router.post('/:id/worklogs', protect, authorize('technician', 'manager', 'admin'), addWorkLog);
router.post('/:id/escalate', protect, escalateTicket);
router.post('/:id/rate', protect, rateTicket);
router.post('/:id/reopen', protect, reopenTicket);

module.exports = router;
