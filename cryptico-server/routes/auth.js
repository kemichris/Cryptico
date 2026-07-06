const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
    register,
    login,
    verifyEmail,
    checkVerification,
    registerAdmin,
    resendVerificationCode,
    forgotPassword,
    passwordReset,
    verifyResetCode,
    changePassword
} = require('../controllers/auth');

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.post("/verify-email", verifyEmail);
router.get('/check-verification/:email', checkVerification);
router.post("/resend-verification", resendVerificationCode);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", passwordReset);
router.put("/change-password", protect, changePassword);

module.exports = router;