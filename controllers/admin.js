const User = require('../models/User');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');
const { response } = require('express');

// Dashboard stats
const getDashboard = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalInvestments = await Investment.countDocuments();
    const totalTransactions = await Transaction.countDocuments();

    const totalInvested = await Investment.aggregate([
      { $group: { _id: null, total: { $sum: '$amountInvested' } } }
    ]);

    res.status(200).json({
      totalUsers,
      totalInvestments,
      totalTransactions,
      totalAmountInvested: totalInvested[0]?.total || 0,
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
    const { fullName, phoneNumber, country, role, isActive, balance, kycStatus } = req.body;

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
    user.isActive = isActive ?? user.isActive;
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

// Delete User
const deleteUser = async (req, res) => {
  try {
    const del = await User.findByIdAndDelete(req.params.id)

    if (!del) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ message: "User deleted successfully" })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

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
    // step 1 — find the transaction
    const deposit = await Transaction.findById(req.params.id);

    // step 2 — check if it exists
    if (!deposit) {
      return res.status(404).json({ message: 'Deposit not found' });
    }

    // step 3 — check if already processed
    if (deposit.status === 'approved' || deposit.status === 'rejected') {
      return res.status(400).json({ message: 'Deposit already processed' });
    }

    // step 4 — get status from request body
    const { status } = req.body;

    // step 5 — if approved, add amount to user balance
    if (status === 'approved') {
      await User.findByIdAndUpdate(deposit.user, {
        $inc: { balance: deposit.amount }
      });
    }

    // step 6 — update the transaction
    deposit.status = status;
    deposit.approvedBy = req.user._id;
    await deposit.save();

    return res.status(200).json({ 
      message: `Deposit ${status} successfully`,
      deposit 
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all Withdrawals 
const getAllWithdrawals = async (req, res) => {
  try {
    const allWithdrawals = await Transaction.find({type: 'withdrawal'})
  .populate('user', 'fullName email')
  .sort({createdAt: -1});

  res.status(200).json({ allWithdrawals });
  } catch (err) {
    res.status(500).json({message: err.message})
  }
}

// Approve or reject Withdrawals
const approveOrRejectWithdrawal = async (req, res) => {
  try {
    const withdrawal = await Transaction.findById(req.params.id);

    if(!withdrawal) {
      return res.status(404).json({message: "Withdrawal not found"})
    }

    if(withdrawal.status === 'approved' || withdrawal.status === 'rejected') {
      return res.status(400).json({ message: 'Withdrawal already processed'})
    }

    const { status } = req.body

    if(status === 'approved') {
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
    res.status(500).json({message: err.message})
  }
}



module.exports = {
  getDashboard,
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
  getAllDeposits,
  approveOrRejectDeposit
}

