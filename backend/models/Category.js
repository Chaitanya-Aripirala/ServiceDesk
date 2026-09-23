const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: 'Layers',
    },
    subcategories: [{
      name: { type: String, required: true },
      description: { type: String, default: '' },
      defaultPriority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Critical'],
        default: 'Medium',
      }
    }],
    defaultAssigneeRole: {
      type: String,
      default: 'technician',
    },
    slaPolicy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SLAPolicy',
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
