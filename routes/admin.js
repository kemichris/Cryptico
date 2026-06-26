const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getDashboard,
  getAllUsers,
  getOneUser,
  loginAsUser,
  updateUser,
  toggleUserStatus,
  creditDebitUser,
  resetUserPassword,
  deleteUser,
  getAllDeposits,
  approveOrRejectDeposit,
  deleteDeposit,
  getAllWithdrawals,
  approveOrRejectWithdrawal,
  getPlans,
  createPlan,
  getSinglePlan,
  updatePlan,
  deletePlan,
  getAllInvestments,
  getActiveInvestments,
  getUserInvestments,
  cancelInvestment,
  completeInvestment,
  deleteInvestment,
  getPendingKyc,
  approveOrRejectKyc,
  getAllTransactions,
  getSingleTransaction,
  getUserTransactions,
  sendEmail,
  verifyEmail,
  getAllAdmins,
  createPaymentMethod,
  editPaymentMethod,
  getAllMethods,
  deletePaymentMethod
} = require('../controllers/admin');

const { register } = require('../controllers/auth');

// ─── REGISTER NEW USER ────────────────────────────────
router.post('/register', protect, adminOnly, register);

// ─── DASHBOARD ────────────────────────────────
router.get('/dashboard', protect, adminOnly, getDashboard);

// ─── USERS ───────────────────────────────────
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getOneUser);
router.post('/users/:id/impersonate', protect, adminOnly, loginAsUser);
router.patch('/users/:id', protect, adminOnly, updateUser);
router.patch('/users/:id/toggle-status', protect, adminOnly, toggleUserStatus);
router.post('/users/:id/credit-debit', protect, adminOnly, creditDebitUser);
router.patch('/users/:id/reset-password', protect, adminOnly, resetUserPassword);
router.delete('/users/:id', protect, adminOnly, deleteUser);

// ─── DEPOSITS ─────────────────────────────────
router.get('/deposits', protect, adminOnly, getAllDeposits);
router.put('/deposits/:id', protect, adminOnly, approveOrRejectDeposit);
router.delete('/deposits/:id/', protect, adminOnly, deleteDeposit);

// ─── WITHDRAWALS ──────────────────────────────
router.get('/withdrawals', protect, adminOnly, getAllWithdrawals);
router.put('/withdrawals/:id', protect, adminOnly, approveOrRejectWithdrawal);

// ─── PLANS ───────────────────────────────────
router.get('/plans', protect, adminOnly, getPlans);
router.get('/plans/:id', protect, adminOnly, getSinglePlan)
router.post('/plans', protect, adminOnly, createPlan);
router.patch('/plans/:id', protect, adminOnly, updatePlan);
router.delete('/plans/:id', protect, adminOnly, deletePlan);

// ─── INVESTMENTS ──────────────────────────────
router.get('/investments', protect, adminOnly, getAllInvestments);
router.get('/investments/active', protect, adminOnly, getActiveInvestments);
router.get('/users/:id/investments', protect, adminOnly, getUserInvestments);
router.put('/investments/:id/cancel', protect, adminOnly, cancelInvestment);
router.put('/investments/:id/complete', protect, adminOnly, completeInvestment);
router.delete('/investments/:id', protect, adminOnly, deleteInvestment);

// ─── TRANSACTIONS ─────────────────────────────
router.get('/transactions', protect, adminOnly, getAllTransactions);
router.get('/transactions/user/:id', protect, adminOnly, getUserTransactions);
router.get('/transactions/:id', protect, adminOnly, getSingleTransaction);

// ─── KYC ─────────────────────────────────────
router.get('/kyc', protect, adminOnly, getPendingKyc);
router.put('/kyc/:id', protect, adminOnly, approveOrRejectKyc);

// ─── PAYMENT METHOD ─────────────────────────────────────
router.post('/payment-methods', protect, adminOnly, createPaymentMethod);
router.get('/payment-methods', protect, adminOnly, getAllMethods);
router.patch('/payment-methods/:id', protect, adminOnly, editPaymentMethod);
router.delete('/payment-methods/:id', protect, adminOnly, deletePaymentMethod);

// ─── EMAIL ─────────────────────────────────────
router.post('/send-email', protect, adminOnly, sendEmail);
router.patch("/users/:id/verify-email", verifyEmail);

// ─── ADMIN ─────────────────────────────────────
router.get('/manage-admin', protect, adminOnly, getAllAdmins);


module.exports = router;