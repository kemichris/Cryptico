const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { 
  getDashboard,
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
  getAllDeposits,
  approveOrRejectDeposit,
  getAllWithdrawals,
  approveOrRejectWithdrawal,
  getPlans,
  createPlan,
  getSinglePlan,
  updatePlan,
  deletePlan,
  getAllInvestments,
  cancelInvestment,
  completeInvestment,
  getPendingKyc,
  approveOrRejectKyc,
  getAllTransactions,
  getSingleTransaction,
  getUserTransactions,
} = require('../controllers/admin');

// ─── DASHBOARD ────────────────────────────────
router.get('/dashboard', protect, adminOnly, getDashboard);

// ─── USERS ───────────────────────────────────
router.get('/users',        protect, adminOnly, getAllUsers);
router.get('/users/:id',    protect, adminOnly, getOneUser);
router.put('/users/:id',    protect, adminOnly, updateUser);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// ─── DEPOSITS ─────────────────────────────────
router.get('/deposits',        protect, adminOnly, getAllDeposits);
router.put('/deposits/:id',    protect, adminOnly, approveOrRejectDeposit);

// ─── WITHDRAWALS ──────────────────────────────
router.get('/withdrawals',     protect, adminOnly, getAllWithdrawals);
router.put('/withdrawals/:id', protect, adminOnly, approveOrRejectWithdrawal);

// ─── PLANS ───────────────────────────────────
router.get('/plans',        protect, adminOnly, getPlans);
router.get('/plans/:id', protect, adminOnly, getSinglePlan)
router.post('/plans',       protect, adminOnly, createPlan);
router.patch('/plans/:id',    protect, adminOnly, updatePlan);
router.delete('/plans/:id', protect, adminOnly, deletePlan);

// ─── INVESTMENTS ──────────────────────────────
router.get('/investments',              protect, adminOnly, getAllInvestments);
router.put('/investments/:id/cancel',   protect, adminOnly, cancelInvestment);
router.put('/investments/:id/complete', protect, adminOnly, completeInvestment);

// ─── TRANSACTIONS ─────────────────────────────
router.get('/transactions',            protect, adminOnly, getAllTransactions);
router.get('/transactions/user/:id',   protect, adminOnly, getUserTransactions);
router.get('/transactions/:id',        protect, adminOnly, getSingleTransaction);

// ─── KYC ─────────────────────────────────────
router.get('/kyc',          protect, adminOnly, getPendingKyc);
router.put('/kyc/:id',      protect, adminOnly, approveOrRejectKyc);

module.exports = router;