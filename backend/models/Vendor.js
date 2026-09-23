const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contactPerson: String,
    email: String,
    phone: String,
    website: String,
    address: String,
    contractType: {
      type: String,
      enum: ['Hardware Supply', 'Software Licensing', 'Cloud Services', 'Maintenance Support', 'IT Consulting'],
      default: 'Hardware Supply',
    },
    status: {
      type: String,
      enum: ['Active', 'Under-Review', 'Inactive'],
      default: 'Active',
    },
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);
