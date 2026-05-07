const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');
const Plan = require('../models/Plan');

// GET /api/users/dashboard
router.get('/dashboard', protect, async (req, res) => {
  try {
    // req.user is already available from middleware
    const user = await User.findById(req.user._id).select('-password');

    // Get their active investments
    const activeInvestments = await Investment.find({ 
      user: req.user._id,
      status: 'active'
    }).populate('plan', 'name roiPercent duration');

    // Get recent transactions (last 5)
    const recentTransactions = await Transaction.find({ 
      user: req.user._id 
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.json({
      user,
      activeInvestments,
      recentTransactions,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, phoneNumber, country } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phoneNumber, country },
      { new: true }  // return the updated document
    ).select('-password');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/deposit
router.post('/deposit', protect, async (req, res) => {
  try {
    const { amount, method, reference, proofImage } = req.body;

    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'deposit',
      amount,
      method,
      reference,
      proofImage,
      status: 'pending',
    });

    res.status(201).json({ 
      message: 'Deposit request submitted, awaiting approval',
      transaction 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/withdraw
router.post('/withdraw', protect, async (req, res) => {
  try {
    const { amount, method, walletAddress } = req.body;

    // Check if user has enough balance
    if (req.user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      type: 'withdrawal',
      amount,
      method,
      walletAddress,
      status: 'pending',
    });

    res.status(201).json({ 
      message: 'Withdrawal request submitted, awaiting approval',
      transaction 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/transactions
router.get('/transactions', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/plans
router.get('/plans', protect, async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/users/invest
router.post('/invest', protect, async (req, res) => {
  try {
    const { planId, amount } = req.body;

    // Find the plan
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // Validate amount is within plan range
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return res.status(400).json({ 
        message: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` 
      });
    }

    // Check user balance
    if (req.user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // Calculate end date
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // Calculate total expected return
    const totalExpectedReturn = amount + (amount * plan.maxRoi / 100);

    // Create the investment
    const investment = await Investment.create({
      user: req.user._id,
      plan: planId,
      amountInvested: amount,
      totalExpectedReturn,
      endDate,
    });

    // Deduct amount from user balance and update stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        balance: -amount,           // deduct amount
        totalInvested: amount       // add to total invested
      }
    });

    res.status(201).json({ 
      message: 'Investment created successfully',
      investment 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/users/investments
router.get('/investments', protect, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id })
      .populate('plan', 'name minRoi maxRoi duration topUpInterval')
      .sort({ createdAt: -1 });

    res.json(investments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;