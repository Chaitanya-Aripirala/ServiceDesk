const express = require('express');
const router = express.Router();
const {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  updateAssetLifecycle,
  addMaintenanceLog,
  deleteAsset,
} = require('../controllers/assetController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getAssets)
  .post(protect, authorize('asset_manager', 'admin', 'manager'), createAsset);

router.route('/:id')
  .get(protect, getAssetById)
  .put(protect, authorize('asset_manager', 'admin', 'manager'), updateAsset)
  .delete(protect, authorize('admin'), deleteAsset);

router.put('/:id/lifecycle', protect, authorize('asset_manager', 'admin', 'manager', 'technician'), updateAssetLifecycle);
router.post('/:id/maintenance', protect, authorize('asset_manager', 'admin', 'manager', 'technician'), addMaintenanceLog);

module.exports = router;
