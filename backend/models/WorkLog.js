const mongoose = require('mongoose');

const workLogSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    technician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    technicianName: {
      type: String,
      required: true,
    },
    timeSpentMinutes: {
      type: Number,
      required: [true, 'Please specify time spent in minutes'],
      min: 1,
    },
    activityType: {
      type: String,
      enum: ['Investigation', 'Remote Troubleshooting', 'On-Site Support', 'Hardware Replacement', 'Software Configuration', 'Vendor Escalation', 'User Training', 'Documentation'],
      default: 'Remote Troubleshooting',
    },
    description: {
      type: String,
      required: [true, 'Please describe work performed'],
      trim: true,
    },
    isBillable: {
      type: Boolean,
      default: true,
    },
    loggedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkLog', workLogSchema);
