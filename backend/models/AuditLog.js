const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    module: {
      type: String,
      enum: ['AUTH', 'TICKETS', 'ASSETS', 'SLA', 'USERS', 'CATEGORIES', 'KB', 'SYSTEM'],
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    performerName: {
      type: String,
      default: 'System',
    },
    performerRole: {
      type: String,
      default: 'system',
    },
    targetId: {
      type: String,
      default: '',
    },
    targetType: {
      type: String,
      default: '',
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'WARNING', 'FAILURE'],
      default: 'SUCCESS',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
