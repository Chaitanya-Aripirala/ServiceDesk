const express = require('express');
const router = express.Router();
const {
  getUsers,
  getTechnicians,
  createUser,
  updateUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getUsers);
router.get('/technicians', protect, getTechnicians);
router.post('/', protect, authorize('admin'), createUser);
router.put('/:id', protect, authorize('admin'), updateUser);

module.exports = router;
