const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

const { protect } = require('../middleware/auth');
const {
  getUserDashboard,
  getUserProfile,
  updateUserProfile,
  saveWithdrawalInfo,
  getWithdrawalInfo,
  createDeposit,
  createWithdrawal,
  getUserTransactions,
  getPlans,
  createInvestment,
  getUserInvestments,
  getUserActiveInvestment,
} = require('../controllers/users');

router.get('/dashboard', protect, getUserDashboard);
router.get('/profile', protect, getUserProfile);
router.patch('/profile', protect, updateUserProfile);
router.post('/withdrawal-info', protect, saveWithdrawalInfo);
router.get('/withdrawal-info', protect, getWithdrawalInfo);
router.post('/deposit', protect, upload.single('proof'), createDeposit);
router.post('/withdraw', protect, createWithdrawal);
router.get('/transactions', protect, getUserTransactions);
router.get('/plans', protect, getPlans);
router.post('/invest', protect, createInvestment);
router.get('/investments', protect, getUserInvestments);
router.get('/active-investments', protect, getUserActiveInvestment);

module.exports = router;