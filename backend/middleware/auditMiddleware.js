const AuditLog = require('../models/AuditLog');

const logAudit = async ({
  action,
  module,
  req,
  targetId = '',
  targetType = '',
  details = {},
  status = 'SUCCESS',
}) => {
  try {
    const performedBy = req && req.user ? req.user._id : null;
    const performerName = req && req.user ? req.user.name : 'System';
    const performerRole = req && req.user ? req.user.role : 'system';
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1') : '127.0.0.1';

    await AuditLog.create({
      action,
      module,
      performedBy,
      performerName,
      performerRole,
      targetId: String(targetId),
      targetType,
      details,
      ipAddress,
      status,
    });
  } catch (error) {
    console.error(`[Audit Log Failed]: ${error.message}`);
  }
};

module.exports = { logAudit };
