const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.put('/notifications/read-all', protect, markAllNotificationsRead);

module.exports = router;
