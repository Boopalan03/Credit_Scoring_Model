const express = require('express');
const router = express.Router();
const { chatWithFinAssist } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// Chat endpoint is protected so it has access to the user's details and application context
router.post('/', protect, chatWithFinAssist);

module.exports = router;
