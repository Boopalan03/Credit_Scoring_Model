const express = require('express');
const router = express.Router();
const { getAdminStats, getAllApplicants } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');

// All routes require authentication and admin role
router.get('/stats', protect, adminOnly, getAdminStats);
router.get('/applicants', protect, adminOnly, getAllApplicants);

module.exports = router;
