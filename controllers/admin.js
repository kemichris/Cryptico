const User = require('../models/User');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');



//////////////// USER SECTION  /////////////////

// Dashboard stats
const getDashboard = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('userName');
    const adminName = admin?.userName;
    const totalUsers = await User.countDocuments();
    const activeSubscribers = await Investment.countDocuments({ status: 'active' });
    const withdrawals = await Transaction.aggregate([
      {
        $match: {
          type: 'withdrawal',
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const totalWithdrawals = withdrawals[0]?.total || 0;

    const deposits = await Transaction.aggregate([
      {
        $match: {
          type: 'deposit',
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    const totalDeposits = deposits[0]?.total || 0;
    const blockedUsers = await User.countDocuments({ isActive: false });
    const activeUsers = await User.countDocuments({ isActive: true });
    const pendingWithdrawals = await Transaction.countDocuments({ type: 'withdrawal', status: 'pending' });
    const pendingDeposits = await Transaction.countDocuments({ type: 'deposit', status: 'pending' });
    const recentUsers = await User.find().select('fullName email').sort({ createdAt: -1 }).limit(5)


    const totalInvested = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: '$amountInvested' } } }
    ]);

    res.status(200).json({
      adminName,
      totalUsers,
      activeSubscribers,
      totalWithdrawals,
      totalDeposits,
      blockedUsers,
      activeUsers,
      pendingWithdrawals,
      pendingDeposits,
      recentUsers
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ allUsers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single user 
const getOneUser = async (req, res) => {
  try {
    const oneUser = await User.findById(req.params.id).select('-password')

    if (!oneUser) {
      return res.status(404).json({ message: "User not found" })
    }

    return res.status(200).json({
      oneUser
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Update user details 
const updateUser = async (req, res) => {
  try {
    // pull out only the fields admin is allowed to update
    const { fullName, phoneNumber, country, role, balance, kycStatus } = req.body;

    // find the user first to make sure they exist
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // update only the fields that were actually sent
    // if a field wasn't sent, keep the existing value
    user.fullName = fullName ?? user.fullName;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.country = country ?? user.country;
    user.role = role ?? user.role;
    user.balance = balance ?? user.balance;
    user.kycStatus = kycStatus ?? user.kycStatus;

    // save the updated user
    const updatedUser = await user.save();

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle user Status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // TOGGLE HAPPENS HERE (backend owns logic)
    user.isActive = !user.isActive;

    const updatedUser = await user.save();

    return res.status(200).json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id)

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ message: "User deleted successfully" })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


//////////////// DEPOSIT AND WITHDRAWAL SECTION   /////////////////

// Get all deposits
const getAllDeposits = async (req, res) => {
  try {
    const allDeposits = await Transaction.find({ type: 'deposit' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ allDeposits })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Approve or reject Deposit
const approveOrRejectDeposit = async (req, res) => {
  try {
    const deposit = await Transaction.findById(req.params.id);

    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    if (deposit.status === 'approved' || deposit.status === 'rejected') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    const { status } = req.body;

    // validate input
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // ✅ APPROVE FLOW
    if (status === 'approved') {
      await User.findByIdAndUpdate(deposit.user, {
        $inc: { balance: deposit.amount }
      });
    }

    // ❌ REJECT FLOW
    if (status === 'rejected') {
      // optional: you can log reason, refund nothing, etc.
      console.log(`Deposit ${deposit._id} was rejected`);
    }

    // update transaction status for BOTH cases
    deposit.status = status;
    deposit.approvedBy = req.user._id;

    await deposit.save();

    return res.status(200).json({
      message: `Deposit ${status} successfully`,
      deposit
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get all Withdrawals 
const getAllWithdrawals = async (req, res) => {
  try {
    const allWithdrawals = await Transaction.find({ type: 'withdrawal' })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ allWithdrawals });
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Approve or reject Withdrawals
const approveOrRejectWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Transaction.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" })
    }

    if (withdrawal.status === 'approved' || withdrawal.status === 'rejected') {
      return res.status(400).json({ message: 'Withdrawal already processed' })
    }

    const { status } = req.body

    if (status === 'approved') {
      await User.findByIdAndUpdate(withdrawal.user, {
        $inc: { balance: -withdrawal.amount }
      })
    }

    withdrawal.status = status;
    withdrawal.approvedBy = req.user._id;
    await withdrawal.save();

    return res.status(200).json({
      message: `Withdrawal ${status} successfully`,
      withdrawal
    });



  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


//////////////// PLAN SECTION  /////////////////

// Get plans
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 })
    return res.status(200).json({ plans })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Create Plan
const createPlan = async (req, res) => {
  try {
    const {
      name, price, minAmount, maxAmount, totalExpectedReturn, giftBonus, topUpInterval, topUpAmount, duration, features
    } = req.body;

    const plan = await Plan.create({
      name, price, minAmount, maxAmount, totalExpectedReturn, giftBonus, topUpInterval, topUpAmount, duration, features
    });
    return res.status(201).json({ message: "Plan created successfully", data: plan });

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get single plan (for edit page)
const getSinglePlan = async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    // if no plan exists with that ID
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    res.status(200).json({ plan });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// update plan
const updatePlan = async (req, res) => {
  try {
    // 1. Whitelist allowed fields (prevents malicious updates)
    const allowedUpdates = [
      'name',
      'price',
      'minAmount',
      'maxAmount',
      'totalExpectedReturn',
      'giftBonus',
      'topUpInterval',
      'topUpAmount',
      'duration',
    ];

    // 2. Build safe update object
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // 3. If no valid fields were sent
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: 'No valid fields provided for update',
      });
    }

    // 4. Update document safely in one DB operation
    const updatedPlan = await Plan.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,          // return updated document
        runValidators: true // enforce schema rules
      }
    );

    // 5. Handle not found
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // 6. Success response
    return res.status(200).json({
      message: 'Plan updated successfully',
      plan: updatedPlan,
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

// Delete plan
const deletePlan = async (req, res) => {
  try {
    const delPlan = await Plan.findByIdAndDelete(req.params.id);

    if (!delPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.status(200).json({ message: "Plan deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}


//////////////// TRANSACTION SECTION  /////////////////

// Get all transactions
const getAllTransactions = async (req, res) => {
  try {
    const allTransactions = await Transaction.find()
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });
    return res.status(200).json({ allTransactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single transaction
const getSingleTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'fullName email');

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.status(200).json({ transaction });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all transactions for a specific user
const getUserTransactions = async (req, res) => {
  try {
    const userTransactions = await Transaction.find({ user: req.params.id })
      .populate('user', 'fullName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ userTransactions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//////////////// CANCEL AND COMPLETE INVESTMENT  /////////////////
// Get all investments
const getAllInvestments = async (req, res) => {
  try {
    const allInvestments = await Investment.find()
      .populate('user', 'fullName email')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 });
    return res.status(200).json({ allInvestments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get active investments 
const getActiveInvestments = async (req, res) => {
  try {
    const investments = await Investment.find({ status: 'active' })
      .populate('user', 'fullName')
      .populate('plan', 'name duration')
      .sort({ createdAt: -1 });

    // shape data exactly for frontend table
    const investmentsData = investments.map(inv => ({
      id: inv._id,
      clientName: inv.user?.fullName,
      planName: inv.plan?.name,
      amountInvested: inv.amountInvested,
      duration: inv.plan?.duration,
      roi: inv.currentReturns,
      startDate: inv.startDate,
      endDate: inv.endDate
    }));

    return res.status(200).json({ activeInvestments: investmentsData });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Get investments for a specific user
const getUserInvestments = async (req, res) => {
  try {
    const userInvestments = await Investment.find({ user: req.params.id })
      .populate('plan', 'name price duration')
      .sort({ createdAt: -1 });
    const user = await User.findById(req.params.id).select('userName');
    return res.status(200).json({ userInvestments, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Cancel investment
const cancelInvestment = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);

    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    if (investment.status === 'cancelled' || investment.status === 'completed') {
      return res.status(400).json({ message: 'Investment already processed' });
    }

    investment.status = 'cancelled';
    await investment.save();

    await User.findByIdAndUpdate(investment.user, {
      $inc: {
        balance: investment.amountInvested,
        totalInvested: -investment.amountInvested
      }
    });

    return res.status(200).json({
      message: 'Investment cancelled and amount refunded successfully',
      investment
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Complete investment
const completeInvestment = async (req, res) => {
  try {
    const investment = await Investment.findOneAndUpdate(
      {
        _id: req.params.id,
        status: { $nin: ['completed', 'cancelled'] }
      },
      { status: 'completed' },
      { new: true }
    );

    if (!investment) {
      return res.status(400).json({ message: 'Investment already processed or not found' });
    }

    await User.findByIdAndUpdate(investment.user, {
      $inc: {
        balance: investment.totalExpectedReturn,
        totalEarnings: investment.totalExpectedReturn
      }
    });

    return res.status(200).json({
      message: 'Investment completed successfully',
      investment
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user investment (for cleanup of cancelled or completed investments)
const deleteInvestment = async (req, res) => {
  try {
    const delInv = await Investment.findByIdAndDelete(req.params.id);

    if (!delInv) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    res.status(200).json({ message: "Investment deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
};

//////////////// INV AND KYC SECTION  /////////////////

// Get all pending kyc
const getPendingKyc = async (req, res) => {
  try {
    const pendingKyc = await User.find({ kycStatus: 'pending' })
      .select('-password')
      .sort({ createdAt: -1 });
    return res.status(200).json({ pendingKyc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve or reject kyc
const approveOrRejectKyc = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { kycStatus } = req.body;

    // Validate status
    const validStatuses = ['verified', 'rejected'];

    if (!validStatuses.includes(kycStatus)) {
      return res.status(400).json({
        message: 'Invalid KYC status. Must be either verified or rejected.'
      });
    }

    if (user.kycStatus === kycStatus) {
      return res.status(400).json({
        message: `User KYC is already ${kycStatus}`
      });
    }

    user.kycStatus = kycStatus;
    await user.save();

    return res.status(200).json({
      message: `KYC ${kycStatus} successfully`,
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getDashboard,
  getAllUsers,
  getOneUser,
  updateUser,
  toggleUserStatus,
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
};
