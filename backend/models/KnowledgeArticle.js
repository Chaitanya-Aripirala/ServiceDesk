const mongoose = require('mongoose');

const knowledgeArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      default: 'Hardware',
    },
    subcategory: {
      type: String,
      default: 'General',
    },
    summary: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tags: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    authorName: {
      type: String,
      default: 'IT Knowledge Team',
    },
    isPublic: {
      type: Boolean,
      default: true, // Visible to employees or internal IT only
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
    },
    unhelpfulVotes: {
      type: Number,
      default: 0,
    },
    suggestedResolutionCount: {
      type: Number,
      default: 0, // times AI recommended this
    },
    resolvedTicketCount: {
      type: Number,
      default: 0, // times it helped close a ticket
    },
    keywords: [{ type: String }],
    status: {
      type: String,
      enum: ['Draft', 'Published', 'Archived'],
      default: 'Published',
    }
  },
  { timestamps: true }
);

knowledgeArticleSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w ]+/g, '')
      .replace(/ +/g, '-') + '-' + Math.floor(1000 + Math.random() * 9000);
  }
  next();
});

module.exports = mongoose.model('KnowledgeArticle', knowledgeArticleSchema);
