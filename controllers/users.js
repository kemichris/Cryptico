const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Investment = require('../models/Investment');
const Plan = require('../models/Plan');
const WithdrawalInfo = require('../models/WithdrawalInfo')
const Kyc = require('../models/Kyc')

//////////////// USER SECTION  /////////////////
const getUserDashboard = async (req, res)=> {
  try {
    const user = await User.findById(req.user._id)
      .select('-password');

    const activeInvestments = await Investment.find({
      user: req.user._id,
      status: 'active'
    });

    const allInvestments = await Investment.find({
      user: req.user._id
    });

    const runningProfit = activeInvestments.reduce(
      (sum, inv) => sum + (inv.currentReturns || 0),
      0
    );

    res.status(200).json({
      user,
      totalProfit: user.totalEarnings,      // realized profit only
      runningProfit,                        // active investment profit
      totalPackages: allInvestments.length,
      activePackages: activeInvestments.length,
      totalInvestment: user.totalInvested,
      activeInvestments
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
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
    const { userName, phoneNumber } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { userName, phoneNumber },
      { returnDocument: 'after' }
    ).select('-password');
    res.status(200).json({
      message: 'profile updated successfully',
      user
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


//////////////// DEPOSIT AND WITHDRAWAL SECTION   /////////////////
const saveWithdrawalInfo = async (req, res) => {
  try {
    const { 
      bankName, accountName, accountNumber,
      cryptoType, cryptoNetwork, walletAddress  
    } = req.body;

    const withdrawalInfo = await WithdrawalInfo.findOneAndUpdate(
      { user: req.user._id },
      { bankName, accountName, accountNumber, cryptoType, cryptoNetwork, walletAddress },
      { new: true, upsert: true }
    );

    res.status(200).json({ 
      message: 'Withdrawal info saved successfully',
      withdrawalInfo 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getWithdrawalInfo = async (req, res) => {
  try {
    const withdrawalInfo = await WithdrawalInfo.findOne({user: req.user._id});

    if(!withdrawalInfo) {
      return res.status(404).json({message: 'No withdrawal information found'});
    }
    res.status(200).json({withdrawalInfo});

  } catch (err) {
    res.status(500).json({message: err.message})
  }
}

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

//////////////// PLAN SECTION  /////////////////
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ isActive: true }).sort({ price: 1 });
    res.status(200).json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createInvestment = async (req, res) => {
  try {
    const { planId, amount } = req.body;

    // 1. Get plan
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    // 2. Validate investment amount
    if (amount < plan.minAmount || amount > plan.maxAmount) {
      return res.status(400).json({
        message: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}`
      });
    }

    // 3. Check user balance
    if (req.user.balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    // -------------------------
    // 4. Convert interval to minutes
    // -------------------------
    let intervalMinutes = 0;

    switch (plan.topUpInterval) {
      case '10 minutes': intervalMinutes = 10; break;
      case '30 minutes': intervalMinutes = 30; break;
      case 'hourly': intervalMinutes = 60; break;
      case 'daily': intervalMinutes = 1440; break;
      case 'weekly': intervalMinutes = 10080; break;
      case 'monthly': intervalMinutes = 43200; break;
    }

    const totalMinutes = plan.duration * 1440; // duration in days
    const totalIntervals = Math.floor(totalMinutes / intervalMinutes);

    // -------------------------
    // 5. FIXED RETURN CALCULATION (percentage-based)
    // -------------------------

    const profitPerInterval = amount * plan.topUpRate;
    const totalProfit = profitPerInterval * totalIntervals;
    const totalExpectedReturn = totalProfit;

    // -------------------------
    // 6. Set investment end date
    // -------------------------
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration);

    // -------------------------
    // 7. Create investment
    // -------------------------
    const investment = await Investment.create({
      user: req.user._id,
      plan: planId,
      amountInvested: amount,
      totalExpectedReturn,
      endDate,
      lastTopUp: new Date()
    });

    // -------------------------
    // 8. Deduct user balance
    // -------------------------
    await User.findByIdAndUpdate(req.user._id, {
      $inc: {
        balance: -amount,
        totalInvested: amount
      }
    });

    // -------------------------
    // 9. Response
    // -------------------------
    return res.status(201).json({
      message: 'Investment created successfully',
      investment
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getUserInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user._id, status: 'completed' })
      .populate('plan', 'name duration')
      .sort({ createdAt: -1 });
    res.status(200).json(investments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserActiveInvestment = async (req, res) => {
  try {
    const investments = await Investment.find({user: req.user._id, status: 'active'})
    .populate('plan', 'name duration')
    .sort({createdAt: -1});

    if (!investments) return res.status(404).json({ message: 'no active investment found' });

    res.status(200).json(investments)

  } catch (err) {
    rest.status(500).json({message: err.message})
  }
}

//////////////// KYC SECTION  /////////////////
const kycApplication = async (req, res) => {
  try {
    const {
      fullName,
      dateOfBirth,
      country,
      idType,
      idNumber
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Already verified
    if (user.kycStatus === "verified") {
      return res.status(400).json({
        message: "Your account has already been verified."
      });
    }

    // Check for pending application
    const pendingApplication = await Kyc.findOne({
      user: user._id,
      applicationStatus: "pending"
    });

    if (pendingApplication) {
      return res.status(400).json({
        message: "You already have a pending KYC application."
      });
    }

    // Uploaded images
    const frontImage = req.files?.frontImage
      ? `/assets/uploads/${req.files.frontImage[0].filename}`
      : "";

    const backImage = req.files?.backImage
      ? `/assets/uploads/${req.files.backImage[0].filename}`
      : "";

    // Create application
    const application = await Kyc.create({
      user: user._id,
      fullName,
      dateOfBirth,
      country,
      idType,
      idNumber,
      frontImage,
      backImage,
      applicationStatus: "pending"
    });

    // Update user status
    user.kycStatus = "pending";
    await user.save();

    return res.status(201).json({
      message: "KYC application submitted successfully.",
      application
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


module.exports = {
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
  kycApplication
};