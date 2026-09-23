const mongoose = require('mongoose');

const slaPolicySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    targets: {
      Critical: {
        responseMinutes: { type: Number, default: 30 }, // 30 mins
        resolutionMinutes: { type: Number, default: 240 }, // 4 hours
        escalateAfterMinutes: { type: Number, default: 120 }
      },
      High: {
        responseMinutes: { type: Number, default: 60 }, // 1 hour
        resolutionMinutes: { type: Number, default: 480 }, // 8 hours
        escalateAfterMinutes: { type: Number, default: 240 }
      },
      Medium: {
        responseMinutes: { type: Number, default: 120 }, // 2 hours
        resolutionMinutes: { type: Number, default: 1440 }, // 24 hours
        escalateAfterMinutes: { type: Number, default: 720 }
      },
      Low: {
        responseMinutes: { type: Number, default: 240 }, // 4 hours
        resolutionMinutes: { type: Number, default: 2880 }, // 48 hours
        escalateAfterMinutes: { type: Number, default: 1440 }
      }
    },
    businessHoursOnly: {
      type: Boolean,
      default: false,
    },
    autoEscalate: {
      type: Boolean,
      default: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SLAPolicy', slaPolicySchema);
