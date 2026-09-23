const AuditLog = require('../models/AuditLog');

// @desc    Get system audit logs with filters & pagination
// @route   GET /api/audit
// @access  Private (Admin, IT Manager)
const getAuditLogs = async (req, res) => {
  try {
    const { module, status, search, page = 1, limit = 50 } = req.query;
    let filter = {};

    if (module) filter.module = module;
    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { performerName: { $regex: search, $options: 'i' } },
        { targetType: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await AuditLog.countDocuments(filter);
    const logs = await AuditLog.find(filter)
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      logs,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAuditLogs,
};
