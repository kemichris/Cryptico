const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, checkVerification, registerAdmin, resendVerificationCode, forgotPassword, verifyResetCode, passwordReset } = require('../controllers/auth');

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.post("/verify-email", verifyEmail);
router.get('/check-verification/:email', checkVerification);
router.post("/resend-verification", resendVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", passwordReset);

module.exports = router;