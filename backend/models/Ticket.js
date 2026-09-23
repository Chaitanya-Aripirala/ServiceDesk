const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a ticket title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a ticket description'],
    },
    type: {
      type: String,
      enum: ['Incident', 'Service Request', 'Access Request', 'Hardware Issue', 'Software Bug'],
      default: 'Incident',
    },
    category: {
      type: String,
      required: true,
      default: 'Hardware',
    },
    subcategory: {
      type: String,
      default: 'Laptop / Workstation',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    impact: {
      type: String,
      enum: ['Single User', 'Department', 'Multiple Departments', 'Entire Organization'],
      default: 'Single User',
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Open', 'Assigned', 'In-Progress', 'Pending-User', 'Resolved', 'Closed', 'Reopened', 'Escalated'],
      default: 'Open',
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: String,
      default: 'Engineering',
    },
    asset: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Asset',
      default: null,
    },
    slaPolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SLAPolicy',
    },
    slaResponseDeadline: {
      type: Date,
    },
    slaResolutionDeadline: {
      type: Date,
    },
    firstResponseAt: {
      type: Date,
      default: null,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    isSlaResponseBreached: {
      type: Boolean,
      default: false,
    },
    isSlaResolutionBreached: {
      type: Boolean,
      default: false,
    },
    escalationLevel: {
      type: Number,
      default: 0, // 0: Standard, 1: Level 1 Escalated, 2: Manager Escalation
    },
    escalationReason: {
      type: String,
      default: '',
    },
    resolutionSummary: {
      type: String,
      default: '',
    },
    rootCause: {
      type: String,
      default: '',
    },
    reopenedCount: {
      type: Number,
      default: 0,
    },
    reopenReason: {
      type: String,
      default: '',
    },
    aiClassification: {
      predictedCategory: { type: String, default: '' },
      predictedPriority: { type: String, default: '' },
      confidence: { type: Number, default: 0 },
      probableIssue: { type: String, default: '' },
      sentiment: { type: String, enum: ['Positive', 'Neutral', 'Frustrated', 'Urgent'], default: 'Neutral' },
      suggestedAction: { type: String, default: '' },
      analyzedAt: { type: Date, default: Date.now },
    },
    aiSuggestedSolutions: [
      {
        articleId: { type: mongoose.Schema.Types.ObjectId, ref: 'KnowledgeArticle' },
        title: { type: String, default: '' },
        relevanceScore: { type: Number, default: 0 },
        snippet: { type: String, default: '' },
      }
    ],
    satisfactionRating: {
      rating: { type: Number, min: 1, max: 5, default: null },
      feedback: { type: String, default: '' },
      ratedAt: { type: Date, default: null },
    },
    tags: [{ type: String }],
    attachments: [
      {
        filename: String,
        originalName: String,
        fileUrl: String,
        fileSize: Number,
        fileType: String,
        uploadedAt: { type: Date, default: Date.now },
      }
    ],
    activityTimeline: [
      {
        action: { type: String, required: true },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        performerName: { type: String, default: 'System' },
        details: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', ticketSchema);
