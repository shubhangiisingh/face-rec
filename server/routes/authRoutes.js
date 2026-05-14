const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  verifyFaceLogin,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-face', verifyFaceLogin);
router.get('/me', protect, getMe);

module.exports = router;
