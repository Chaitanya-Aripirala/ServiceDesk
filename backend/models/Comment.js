const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
    },
    authorRole: {
      type: String,
      default: 'employee',
    },
    message: {
      type: String,
      required: [true, 'Message cannot be empty'],
      trim: true,
    },
    isInternal: {
      type: Boolean,
      default: false, // Internal technician notes vs public customer messages
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        fileUrl: String,
        fileSize: Number,
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
