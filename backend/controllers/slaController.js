const SLAPolicy = require('../models/SLAPolicy');
const Category = require('../models/Category');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all SLA policies
// @route   GET /api/sla/policies
// @access  Private
const getSLAPolicies = async (req, res) => {
  try {
    const policies = await SLAPolicy.find().sort({ isDefault: -1, name: 1 });
    res.json({ success: true, policies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create/Update SLA policy
// @route   POST /api/sla/policies
// @access  Private (Admin)
const createOrUpdatePolicy = async (req, res) => {
  try {
    const { id, name, description, isDefault, targets, businessHoursOnly, autoEscalate } = req.body;

    let policy;
    if (id) {
      policy = await SLAPolicy.findById(id);
      if (!policy) return res.status(404).json({ success: false, message: 'Policy not found' });
      policy.name = name || policy.name;
      policy.description = description !== undefined ? description : policy.description;
      policy.isDefault = isDefault !== undefined ? isDefault : policy.isDefault;
      if (targets) policy.targets = targets;
      if (businessHoursOnly !== undefined) policy.businessHoursOnly = businessHoursOnly;
      if (autoEscalate !== undefined) policy.autoEscalate = autoEscalate;
      await policy.save();
    } else {
      if (isDefault) {
        await SLAPolicy.updateMany({}, { isDefault: false });
      }
      policy = await SLAPolicy.create({
        name,
        description,
        isDefault: isDefault || false,
        targets,
        businessHoursOnly: businessHoursOnly || false,
        autoEscalate: autoEscalate !== undefined ? autoEscalate : true,
      });
    }

    await logAudit({
      action: id ? 'SLA_POLICY_UPDATED' : 'SLA_POLICY_CREATED',
      module: 'SLA',
      req,
      targetId: policy._id,
      targetType: 'SLAPolicy',
      details: { name: policy.name },
    });

    res.json({ success: true, policy });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all Categories & subcategories
// @route   GET /api/sla/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).populate('slaPolicy', 'name targets');
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create Category
// @route   POST /api/sla/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, code, description, icon, subcategories, slaPolicyId } = req.body;
    const category = await Category.create({
      name,
      code: code || name.toUpperCase().slice(0, 4),
      description,
      icon: icon || 'Layers',
      subcategories: subcategories || [],
      slaPolicy: slaPolicyId || null,
    });

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getSLAPolicies,
  createOrUpdatePolicy,
  getCategories,
  createCategory,
};
