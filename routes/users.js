const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const { protect } = require('../middleware/auth');
const {
  getUserDashboard,
  getUserProfile,
  updateUserProfile,
  createDeposit,
  createWithdrawal,
  getUserTransactions,
  getPlans,
  createInvestment,
  getUserInvestments,
} = require('../controllers/users');

router.get('/dashboard', protect, getUserDashboard);
router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, updateUserProfile);
router.post('/deposit', protect, upload.single('proof'), createDeposit);
router.post('/withdraw', protect, createWithdrawal);
router.get('/transactions', protect, getUserTransactions);
router.get('/plans', protect, getPlans);
router.post('/invest', protect, createInvestment);
router.get('/investments', protect, getUserInvestments);

module.exports = router;