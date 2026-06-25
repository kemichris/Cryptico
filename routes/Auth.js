const express = require('express');
const router = express.Router();
const { register, login, verifyEmail, registerAdmin } = require('../controllers/auth');

router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.post("/verify-email", verifyEmail);

module.exports = router;