const KnowledgeArticle = require('../models/KnowledgeArticle');
const { logAudit } = require('../middleware/auditMiddleware');

// @desc    Get all knowledge articles with search and filters
// @route   GET /api/kb
// @access  Private / Public
const getArticles = async (req, res) => {
  try {
    const { category, search, tag, status = 'Published', page = 1, limit = 20 } = req.query;
    let filter = {};

    // Only internal IT can see draft/archived
    if (req.user && ['technician', 'manager', 'admin'].includes(req.user.role)) {
      if (status) filter.status = status;
    } else {
      filter.status = 'Published';
      filter.isPublic = true;
    }

    if (category) filter.category = category;
    if (tag) filter.tags = tag;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await KnowledgeArticle.countDocuments(filter);
    const articles = await KnowledgeArticle.find(filter)
      .sort({ helpfulVotes: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      articles,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single KB article by ID or slug
// @route   GET /api/kb/:id
// @access  Private / Public
const getArticleById = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    // Increment view count
    article.viewCount += 1;
    await article.save();

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new knowledge article
// @route   POST /api/kb
// @access  Private (Technician, Manager, Admin)
const createArticle = async (req, res) => {
  try {
    const { title, category, subcategory, summary, content, tags = [], isPublic = true, status = 'Published' } = req.body;

    if (!title || !content || !summary) {
      return res.status(400).json({ success: false, message: 'Please provide title, summary and content' });
    }

    // Generate search keywords
    const keywords = (title + ' ' + summary + ' ' + tags.join(' '))
      .toLowerCase()
      .split(/\W+/)
      .filter(w => w.length > 3);

    const article = await KnowledgeArticle.create({
      title,
      category: category || 'Hardware',
      subcategory: subcategory || 'General',
      summary,
      content,
      tags: Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim()),
      keywords: [...new Set(keywords)],
      author: req.user._id,
      authorName: req.user.name,
      isPublic,
      status,
    });

    await logAudit({
      action: 'KB_ARTICLE_CREATED',
      module: 'KB',
      req,
      targetId: article._id,
      targetType: 'KnowledgeArticle',
      details: { title, category },
    });

    res.status(201).json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update knowledge article
// @route   PUT /api/kb/:id
// @access  Private (Technician, Manager, Admin)
const updateArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    const { title, category, subcategory, summary, content, tags, isPublic, status } = req.body;

    if (title) article.title = title;
    if (category) article.category = category;
    if (subcategory) article.subcategory = subcategory;
    if (summary) article.summary = summary;
    if (content) article.content = content;
    if (tags) article.tags = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim());
    if (isPublic !== undefined) article.isPublic = isPublic;
    if (status) article.status = status;

    await article.save();

    await logAudit({
      action: 'KB_ARTICLE_UPDATED',
      module: 'KB',
      req,
      targetId: article._id,
      targetType: 'KnowledgeArticle',
      details: { title: article.title },
    });

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Vote on article helpfulness
// @route   POST /api/kb/:id/vote
// @access  Private
const voteArticle = async (req, res) => {
  try {
    const { isHelpful } = req.body;
    const article = await KnowledgeArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    if (isHelpful) {
      article.helpfulVotes += 1;
    } else {
      article.unhelpfulVotes += 1;
    }

    await article.save();

    res.json({ success: true, article });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete knowledge article
// @route   DELETE /api/kb/:id
// @access  Private (Manager, Admin)
const deleteArticle = async (req, res) => {
  try {
    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    await logAudit({
      action: 'KB_ARTICLE_DELETED',
      module: 'KB',
      req,
      targetId: req.params.id,
      targetType: 'KnowledgeArticle',
      details: { title: article.title },
      status: 'WARNING',
    });

    res.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  voteArticle,
  deleteArticle,
};
