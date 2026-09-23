const Asset = require('../models/Asset');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Vendor = require('../models/Vendor');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all assets with filtering
// @route   GET /api/assets
// @access  Private
const getAssets = async (req, res) => {
  try {
    const {
      status,
      category,
      type,
      department,
      assignedTo,
      search,
      warrantyExpiring,
      page = 1,
      limit = 50,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (type) filter.type = type;
    if (department) filter.department = department;
    if (assignedTo) filter.assignedTo = assignedTo;

    if (warrantyExpiring === 'true') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      filter.warrantyExpiry = { $lte: thirtyDaysFromNow, $gte: new Date() };
    }

    if (search) {
      filter.$or = [
        { assetTag: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const total = await Asset.countDocuments(filter);
    const assets = await Asset.find(filter)
      .populate('assignedTo', 'name email department avatar')
      .populate('vendor', 'name contactPerson')
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    // Update real-time calculated depreciated values
    const enrichedAssets = assets.map(a => {
      const assetObj = a.toObject();
      assetObj.currentValue = a.calculateCurrentValue();
      return assetObj;
    });

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      assets: enrichedAssets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single asset by ID with linked tickets and history
// @route   GET /api/assets/:id
// @access  Private
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id)
      .populate('assignedTo', 'name email department phone location avatar')
      .populate('vendor', 'name contactPerson email phone')
      .populate('lifecycleHistory.performedBy', 'name email');

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Find all tickets related to this asset
    const relatedTickets = await Ticket.find({ asset: asset._id })
      .populate('requester', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    const assetData = asset.toObject();
    assetData.currentValue = asset.calculateCurrentValue();

    res.json({
      success: true,
      asset: assetData,
      relatedTickets,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new IT asset
// @route   POST /api/assets
// @access  Private (Asset Manager, Admin)
const createAsset = async (req, res) => {
  try {
    const {
      name,
      type = 'Hardware',
      category = 'Laptop',
      manufacturer,
      model,
      serialNumber,
      status = 'In-Stock',
      assignedTo,
      department,
      location,
      purchaseDate,
      purchaseCost,
      depreciationRateAnnual = 20,
      warrantyExpiry,
      vendorName,
      specs = {},
      notes = '',
    } = req.body;

    if (!name || !serialNumber) {
      return res.status(400).json({ success: false, message: 'Please provide asset name and serial number' });
    }

    // Check duplicate serial
    const existingSerial = await Asset.findOne({ serialNumber });
    if (existingSerial) {
      return res.status(400).json({ success: false, message: 'An asset with this serial number already exists' });
    }

    // Generate unique Asset Tag
    const count = await Asset.countDocuments();
    const year = new Date().getFullYear();
    const assetTag = `AST-${year}-${String(count + 1).padStart(4, '0')}`;

    const newAsset = new Asset({
      assetTag,
      name,
      type,
      category,
      manufacturer: manufacturer || 'Standard OEM',
      model: model || 'Standard Spec',
      serialNumber,
      status,
      assignedTo: assignedTo || null,
      department: department || 'IT Support',
      location: location || 'HQ IT Depot',
      purchaseDate: purchaseDate || new Date(),
      purchaseCost: Number(purchaseCost) || 1200,
      currentValue: Number(purchaseCost) || 1200,
      depreciationRateAnnual: Number(depreciationRateAnnual) || 20,
      warrantyExpiry: warrantyExpiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 3),
      vendorName: vendorName || 'Enterprise Tech Supplies',
      specs,
      notes,
      lifecycleHistory: [
        {
          action: 'PROCURED_AND_CATALOGED',
          performedBy: req.user._id,
          performerName: req.user.name,
          notes: `Asset entered into inventory with status: ${status}`,
          timestamp: new Date(),
        }
      ]
    });

    if (assignedTo) {
      const user = await User.findById(assignedTo);
      if (user) {
        newAsset.lifecycleHistory.push({
          action: 'ASSIGNED_TO_USER',
          performedBy: req.user._id,
          performerName: req.user.name,
          assignedToUser: user.name,
          notes: `Assigned on procurement to ${user.name} (${user.department})`,
          timestamp: new Date(),
        });
      }
    }

    await newAsset.save();

    await logAudit({
      action: 'ASSET_CREATED',
      module: 'ASSETS',
      req,
      targetId: newAsset._id,
      targetType: 'Asset',
      details: { assetTag, name, serialNumber, status },
    });

    res.status(201).json({ success: true, asset: newAsset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update asset details
// @route   PUT /api/assets/:id
// @access  Private (Asset Manager, Admin)
const updateAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const {
      name,
      type,
      category,
      manufacturer,
      model,
      serialNumber,
      department,
      location,
      purchaseCost,
      depreciationRateAnnual,
      warrantyExpiry,
      vendorName,
      specs,
      notes,
    } = req.body;

    if (name) asset.name = name;
    if (type) asset.type = type;
    if (category) asset.category = category;
    if (manufacturer) asset.manufacturer = manufacturer;
    if (model) asset.model = model;
    if (serialNumber) asset.serialNumber = serialNumber;
    if (department) asset.department = department;
    if (location) asset.location = location;
    if (purchaseCost !== undefined) asset.purchaseCost = Number(purchaseCost);
    if (depreciationRateAnnual !== undefined) asset.depreciationRateAnnual = Number(depreciationRateAnnual);
    if (warrantyExpiry) asset.warrantyExpiry = warrantyExpiry;
    if (vendorName) asset.vendorName = vendorName;
    if (specs) asset.specs = { ...asset.specs, ...specs };
    if (notes !== undefined) asset.notes = notes;

    await asset.save();

    await logAudit({
      action: 'ASSET_UPDATED',
      module: 'ASSETS',
      req,
      targetId: asset._id,
      targetType: 'Asset',
      details: { assetTag: asset.assetTag, name: asset.name },
    });

    res.json({ success: true, asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change asset status / Lifecycle transition (Assign, Repair, Retire, etc.)
// @route   PUT /api/assets/:id/lifecycle
// @access  Private (Asset Manager, Admin, Technician)
const updateAssetLifecycle = async (req, res) => {
  try {
    const { status, assignedTo, department, location, notes } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const oldStatus = asset.status;
    let actionDesc = `Status transitioned from ${oldStatus} to ${status}`;
    let assignedUserName = '';

    if (assignedTo !== undefined) {
      if (assignedTo) {
        const user = await User.findById(assignedTo);
        if (user) {
          asset.assignedTo = user._id;
          asset.department = user.department;
          assignedUserName = user.name;
          actionDesc = `Asset assigned to ${user.name} (${user.department})`;
        }
      } else {
        asset.assignedTo = null;
        actionDesc = `Asset unassigned and returned to stock`;
      }
    }

    if (status) asset.status = status;
    if (department) asset.department = department;
    if (location) asset.location = location;

    asset.lifecycleHistory.push({
      action: actionDesc,
      performedBy: req.user._id,
      performerName: req.user.name,
      assignedToUser: assignedUserName,
      notes: notes || '',
      timestamp: new Date(),
    });

    await asset.save();

    await logAudit({
      action: 'ASSET_LIFECYCLE_CHANGED',
      module: 'ASSETS',
      req,
      targetId: asset._id,
      targetType: 'Asset',
      details: { assetTag: asset.assetTag, oldStatus, newStatus: status, actionDesc },
    });

    const updated = await Asset.findById(asset._id).populate('assignedTo', 'name email department');
    res.json({ success: true, asset: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add maintenance record to asset
// @route   POST /api/assets/:id/maintenance
// @access  Private (Technician, Asset Manager, Admin)
const addMaintenanceLog = async (req, res) => {
  try {
    const { type, cost, notes } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    asset.maintenanceLogs.push({
      type: type || 'Scheduled Inspection',
      cost: Number(cost) || 0,
      performedBy: req.user.name,
      notes: notes || '',
      date: new Date(),
    });

    asset.lifecycleHistory.push({
      action: `MAINTENANCE_PERFORMED: ${type}`,
      performedBy: req.user._id,
      performerName: req.user.name,
      notes: `Cost: $${cost || 0} - ${notes}`,
      timestamp: new Date(),
    });

    await asset.save();

    res.json({ success: true, asset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete asset
// @route   DELETE /api/assets/:id
// @access  Private (Admin only)
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findById(req.params.id);
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    await Asset.findByIdAndDelete(req.params.id);

    await logAudit({
      action: 'ASSET_DELETED',
      module: 'ASSETS',
      req,
      targetId: req.params.id,
      targetType: 'Asset',
      details: { assetTag: asset.assetTag, name: asset.name },
      status: 'WARNING',
    });

    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  updateAssetLifecycle,
  addMaintenanceLog,
  deleteAsset,
};
