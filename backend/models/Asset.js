const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema(
  {
    assetTag: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Hardware', 'Software', 'Cloud', 'Network', 'Peripheral', 'Mobile'],
      default: 'Hardware',
    },
    category: {
      type: String,
      enum: ['Laptop', 'Desktop', 'Server', 'Monitor', 'Switch/Router', 'Access Point', 'Software License', 'Cloud Instance', 'Smartphone', 'Printer', 'Other'],
      default: 'Laptop',
    },
    manufacturer: {
      type: String,
      default: 'Dell',
    },
    model: {
      type: String,
      default: 'Latitude 7420',
    },
    serialNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['In-Stock', 'Assigned', 'Under-Repair', 'Retired', 'Maintenance', 'Lost'],
      default: 'In-Stock',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    department: {
      type: String,
      default: 'IT Support',
    },
    location: {
      type: String,
      default: 'HQ - Floor 2 - IT Storage',
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    purchaseCost: {
      type: Number,
      default: 1200,
    },
    currentValue: {
      type: Number,
      default: 1200,
    },
    depreciationRateAnnual: {
      type: Number,
      default: 20, // 20% per year
    },
    warrantyExpiry: {
      type: Date,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    vendorName: {
      type: String,
      default: 'Dell Technologies',
    },
    specs: {
      cpu: { type: String, default: 'Intel Core i7-12700H' },
      ram: { type: String, default: '32 GB DDR5' },
      storage: { type: String, default: '1 TB NVMe SSD' },
      os: { type: String, default: 'Windows 11 Pro' },
      ipAddress: { type: String, default: '' },
      macAddress: { type: String, default: '' },
      licenseKey: { type: String, default: '' },
    },
    lifecycleHistory: [
      {
        action: { type: String, required: true },
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        performerName: { type: String, default: 'System' },
        assignedToUser: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now },
        notes: { type: String, default: '' },
      }
    ],
    maintenanceLogs: [
      {
        date: { type: Date, default: Date.now },
        type: { type: String, enum: ['Scheduled Inspection', 'Hardware Repair', 'Battery Replacement', 'OS Reinstallation', 'Upgrade'], default: 'Scheduled Inspection' },
        cost: { type: Number, default: 0 },
        performedBy: { type: String, default: 'IT Technician' },
        notes: { type: String, default: '' },
      }
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Calculate real-time depreciation before retrieval if needed
assetSchema.methods.calculateCurrentValue = function () {
  if (!this.purchaseCost || !this.purchaseDate) return this.purchaseCost || 0;
  const now = new Date();
  const diffYears = (now - new Date(this.purchaseDate)) / (1000 * 60 * 60 * 24 * 365.25);
  const depreciationFactor = Math.max(0, 1 - (this.depreciationRateAnnual / 100) * diffYears);
  return Math.round(this.purchaseCost * depreciationFactor);
};

module.exports = mongoose.model('Asset', assetSchema);
