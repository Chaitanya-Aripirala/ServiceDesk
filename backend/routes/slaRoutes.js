const express = require('express');
const router = express.Router();
const {
  getSLAPolicies,
  createOrUpdatePolicy,
  getCategories,
  createCategory,
} = require('../controllers/slaController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/policies', protect, getSLAPolicies);
router.post('/policies', protect, authorize('admin'), createOrUpdatePolicy);

router.get('/categories', protect, getCategories);
router.post('/categories', protect, authorize('admin'), createCategory);

module.exports = router;
