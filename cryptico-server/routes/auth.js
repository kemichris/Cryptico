const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, registerAdmin, resendVerificationCode } = require('../controllers/auth');

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.post("/verify-email", verifyEmail);
router.post("/auth/resend-verification", resendVerificationCode);

module.exports = router;