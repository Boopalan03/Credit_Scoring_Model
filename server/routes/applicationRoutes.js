const express = require('express');
const router = express.Router();
const { 
  submitApplication, 
  getMyApplications, 
  getApplicationById,
  verifyBankAccountDemo 
} = require('../controllers/applicationController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.post('/apply', protect, submitApplication);
router.get('/my-applications', protect, getMyApplications);
router.get('/:id', protect, getApplicationById);
router.post('/verify-bank', protect, verifyBankAccountDemo);

module.exports = router;
