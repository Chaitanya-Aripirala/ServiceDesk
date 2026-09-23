const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  voteArticle,
  deleteArticle,
} = require('../controllers/kbController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getArticles)
  .post(protect, authorize('technician', 'manager', 'admin'), createArticle);

router.route('/:id')
  .get(getArticleById)
  .put(protect, authorize('technician', 'manager', 'admin'), updateArticle)
  .delete(protect, authorize('manager', 'admin'), deleteArticle);

router.post('/:id/vote', protect, voteArticle);

module.exports = router;
