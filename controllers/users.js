const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');
const Plan = require('../models/Plan');

const getUserDashboard = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    const activeInvestments = await Investment.find({ 
      user: req.user._id,
      status: 'active'
    }).populate('plan', 'name minRoi maxRoi duration topUpInterval topUpAmount');

    const recentTransactions = await Transaction.find({ 
      user: req.user._id 
    }).sort({ createdAt: -1 }).limit(5);

    // calculate live profit from all active investments
    const liveProfit = activeInvestments.reduce((sum, inv) => {
      return sum + inv.currentReturns;
    }, 0);

    // total profit = live returns + completed investment earnings
    const totalProfit = liveProfit + user.totalEarnings;

    res.status(200).json({ 
      user, 
      activeInvestments, 
      recentTransactions,
      liveProfit,
      totalProfit,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { fullName, phoneNumber, country } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fullName, phoneNumber, country },
      { new: true }
    ).select('-password');
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createDeposit = async (req, res) => {
  try {
    const { amount, method, reference } = req.body;

    // get file path from multer — req.file is set by upload.single('proof')
    const proofImage = req.file ? `/assets/uploads/${req.file.filename}` : null;

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
};

const createWithdrawal = async (req, res) => {
  try {
    const { amount, method, walletAddress } = req.body;
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
};

const getUserTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createInvestment = async (req, res) => {
  try {
    const { planId, amount } = req.body;

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return res.status(400).json({ 
        message: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` 
      });
    }

    if (req.user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    const totalExpectedReturn = amount + (amount * plan.maxRoi / 100);

    const investment = await Investment.create({
      user: req.user._id,
      plan: planId,
      amountInvested: amount,
      totalExpectedReturn,
      endDate,
    });

    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 
        balance: -amount,
        totalInvested: amount
      }
    });

    res.status(201).json({ 
      message: 'Investment created successfully',
      investment 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id })
      .populate('plan', 'name minRoi maxRoi duration topUpInterval')
      .sort({ createdAt: -1 });
    res.status(200).json(investments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getUserDashboard,
  getUserProfile,
  updateUserProfile,
  createDeposit,
  createWithdrawal,
  getUserTransactions,
  getPlans,
  createInvestment,
  getUserInvestments,
};