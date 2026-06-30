const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Investment = require('../models/Investment');
const Transaction = require('../models/Transaction');
const Plan = require('../models/Plan');
const PaymentMethod = require('../models/PaymentMethod')
const Kyc = require('../models/Kyc')
const { sendMail } = require('../utils/mailer')


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
    const allUsers = await User.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    if (!allUsers) {
      return res.status(404).json({ message: 'No users found' })
    }
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

// Login as user
const loginAsUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // generate a token as THAT user
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        impersonated: true
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // important for safety
    );

    return res.status(200).json({
      message: "Impersonation started",
      token,
      user
    });

  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// Update user details 
const updateUser = async (req, res) => {
  try {
    // pull out only the fields admin is allowed to update
    const { userName, fullName, email, phoneNumber, country } = req.body;

    // find the user first to make sure they exist
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // update only the fields that were actually sent
    // if a field wasn't sent, keep the existing value
    user.userName = userName ?? user.userName
    user.fullName = fullName ?? user.fullName;
    user.email = email ?? user.email;
    user.phoneNumber = phoneNumber ?? user.phoneNumber;
    user.country = country ?? user.country;

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

// Debit/Credit User
const creditDebitUser = async (req, res) => {
  try {
    const { amount, type, action } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const amt = Number(amount);

    // ─────────────────────────────
    // 1. DEPOSIT FLOW
    // ─────────────────────────────
    if (type === "deposit") {

      const deposit = await Transaction.create({
        user: user._id,
        type: "deposit",
        amount: amt,
        method: "admin",
        status: "approved",
        approvedBy: req.user._id
      });

      user.balance += amt;

      await user.save();

      return res.status(200).json({
        message: "Deposit processed successfully",
        deposit,
        user
      });
    }

    // ─────────────────────────────
    // 2. WALLET FLOW
    // ─────────────────────────────
    const allowedFields = ["balance", "totalEarnings", "referralBonus"];

    if (!allowedFields.includes(type)) {
      return res.status(400).json({
        message: "Invalid wallet field selected"
      });
    }

    if (!["credit", "debit"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action"
      });
    }

    // Credit wallet
    if (action === "credit") {
      user[type] += amt;
    }

    // Debit wallet
    if (action === "debit") {

      if (user[type] < amt) {
        return res.status(400).json({
          message: `Insufficient ${type}`
        });
      }

      user[type] -= amt;

      // Record admin withdrawal only when balance is debited
      if (type === "balance") {
        await Transaction.create({
          user: user._id,
          type: "withdrawal",
          amount: amt,
          method: "admin",
          status: "approved",
          approvedBy: req.user._id
        });
      }
    }

    await user.save();

    return res.status(200).json({
      message: `User ${type} ${action}ed successfully`,
      user
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// Reset user password
const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // hash default password (same pattern as register)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('user01234#', salt);

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      message: 'Password reset successfully to default password'
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id)

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.status(200).json({ message: "User deleted successfully", deletedUser })

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

// Delete deposit
const deleteDeposit = async (req, res) => {
  try {
    const deletedDeposit = await Transaction.findByIdAndDelete({
      _id: req.params.id,
      type: "deposit"
    })

    if (!deletedDeposit) {
      return res.status(404).json({ message: "deposit not found" })
    }

    res.status(200).json({ message: "Deposit deleted successfully", deletedDeposit })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }

}

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

const createPlan = async (req, res) => {
  try {
    const {
      name,
      price,
      minAmount,
      maxAmount,
      totalExpectedReturn,
      giftBonus,
      topUpInterval,
      topUpRate,
      duration,
      features
    } = req.body;

    // normalize percentage (admin sends 5 = 5%)
    const normalizedRate = Number(topUpRate) / 100;

    const plan = await Plan.create({
      name,
      price,
      minAmount,
      maxAmount,
      totalExpectedReturn,
      giftBonus,
      topUpInterval,
      topUpRate: normalizedRate, // store as decimal
      duration,
      features
    });

    return res.status(201).json({
      message: "Plan created successfully",
      data: plan
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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
      'topUpRate',
      'duration',
    ];

    // 2. Build safe update object
    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {

        // 🔥 Normalize topUpRate (percentage → decimal)
        // Example: 5 → 0.05
        if (field === 'topUpRate') {
          updates[field] = Number(req.body[field]) / 100;
        } else {
          updates[field] = req.body[field];
        }

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
        new: true,
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

//////////////// INVESTMENT SECTION  /////////////////
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

//////////////// KYC SECTION  /////////////////

// Get all KYC applications 
const kycApplications = async (req, res) => {
  try {
    const kyc = await Kyc.find()
      .populate('user', 'fullName')
      .sort({ createdAt: -1 });
    return res.status(200).json(kyc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get User application
const singleKycApplication = async (req, res) => {
  try {
    const kycApplication = await Kyc.findById(req.params.id).populate('user', 'email userName kycStatus');
    if (!kycApplication) {
      return res.status(404).json({ message: 'user application not found' });
    }
    res.status(200).json(kycApplication)
  } catch (err) {
    return res.status(500).json({ message: err.message })
  }
}

// Approve kyc without application
const verifyUserKyc = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    if (user.kycStatus === "verified") {
      return res.status(400).json({
        message: "User is already KYC verified."
      });
    }

    user.kycStatus = "verified";

    await user.save();

    return res.status(200).json({
      message: "User KYC verified successfully.",
      user
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// Review KYC application
const reviewKycApplication = async (req, res) => {
  try {
    const { applicationStatus, rejectionReason } = req.body;

    // Only approved or rejected are allowed
    const validStatuses = ["approved", "rejected"];

    if (!validStatuses.includes(applicationStatus)) {
      return res.status(400).json({
        message: "Invalid application status."
      });
    }

    // Find KYC application
    const kyc = await Kyc.findById(req.params.id);

    if (!kyc) {
      return res.status(404).json({
        message: "KYC application not found."
      });
    }

    // Prevent reviewing twice
    if (kyc.applicationStatus !== "pending") {
      return res.status(400).json({
        message: "This KYC application has already been reviewed."
      });
    }

    // Find associated user
    const user = await User.findById(kyc.user);

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    // Require rejection reason
    if (
      applicationStatus === "rejected" &&
      (!rejectionReason || !rejectionReason.trim())
    ) {
      return res.status(400).json({
        message: "Rejection reason is required."
      });
    }

    // -------------------------
    // Update KYC Application
    // -------------------------

    kyc.applicationStatus = applicationStatus;
    kyc.reviewedBy = req.user._id;
    kyc.reviewedAt = new Date();

    if (applicationStatus === "rejected") {
      kyc.rejectionReason = rejectionReason;
      user.kycStatus = "rejected";
    } else {
      kyc.rejectionReason = "";
      user.kycStatus = "verified";
    }

    await kyc.save();
    await user.save();

    return res.status(200).json({
      message: `KYC application ${applicationStatus}.`,
      kyc
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};


//////////////// PAYMENT METHOD SECTION  /////////////////
// create payment method
const createPaymentMethod = async (req, res) => {
  try {
    const {
      availableFor,
      minWithdrawal,
      maxWithdrawal
    } = req.body;

    // Uploaded QR code image
    const qrCode = req.file ? req.file.path : null;

    // Validate withdrawal limits
    if (
      (availableFor === "withdrawal" || availableFor === "both") &&
      Number(maxWithdrawal) < Number(minWithdrawal)
    ) {
      return res.status(400).json({
        message:
          "Maximum withdrawal amount must be greater than minimum withdrawal amount."
      });
    }

    const paymentMethod = await PaymentMethod.create({
      ...req.body,
      qrCode
    });

    return res.status(201).json({
      message: "Payment method created successfully",
      method: paymentMethod
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// update payment method
const editPaymentMethod = async (req, res) => {
  try {
    // If a new QR code was uploaded, add it to the update data
    if (req.file) {
      req.body.qrCode = req.file ? req.file.path : null;
    }

    const paymentMethod = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    if (!paymentMethod) {
      return res.status(404).json({
        message: "Payment method not found"
      });
    }

    return res.status(200).json({
      message: "Payment method updated successfully",
      method: paymentMethod
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// Get all payment methods
const getAllMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.find().sort({ createdAt: 1 })
    return res.status(200).json(paymentMethods)
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

// Get Single Payment Method
const getPaymentMethod = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
      return res.status(404).json({
        message: "Payment method not found"
      });
    }

    return res.status(200).json({
      method: paymentMethod
    });

  } catch (error) {
    return res.status(500).json({
      message: error.message
    });
  }
};

// Toggle Payment Method Status
const togglePaymentMethodStatus = async (req, res) => {
  try {
    const paymentMethod = await PaymentMethod.findById(req.params.id);

    if (!paymentMethod) {
      return res.status(404).json({
        message: "Payment method not found"
      });
    }

    // Toggle status
    paymentMethod.status = paymentMethod.status === "enabled" ? "disabled" : "enabled";

    await paymentMethod.save();

    return res.status(200).json({
      message: `Payment method ${paymentMethod.status === "enabled"
        ? "enabled"
        : "disabled"
        } successfully`,
      method: paymentMethod
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

// delete payment method
const deletePaymentMethod = async (req, res) => {
  try {
    const deletedMethod = await PaymentMethod.findByIdAndDelete(req.params.id)
    if (!deletedMethod) {
      return res.status(404).json({
        message: 'Payment method not found'
      })
    }

    return res.status(200).json({
      message: 'Payment method deleted succesfully'
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}



//////////////// EMAIL SECTION  /////////////////
// Send email
const sendEmail = async (req, res) => {
  try {
    const {
      category,
      selectedUsers,
      greeting,
      greetingTitle,
      subject,
      message,
    } = req.body;

    // Validation
    if (!category || !subject || !message) {
      return res.status(400).json({
        message: "Category, subject and message are required.",
      });
    }

    let users = [];

    switch (category) {
      // ==========================================================
      // ALL USERS
      // ==========================================================
      case "allUsers":
        users = await User.find({
          emailVerified: true,
          isActive: true,
        }).select("-password");
        break;

      // ==========================================================
      // USERS WITHOUT INVESTMENT
      // ==========================================================
      case "withoutInvestment":
        users = await User.find({
          totalInvested: 0,
          emailVerified: true,
          isActive: true,
        }).select("-password");
        break;

      // ==========================================================
      // USERS WITHOUT DEPOSIT
      // ==========================================================
      case "withoutDeposit":
        const depositedUsers = await Transaction.distinct("user", {
          type: "deposit",
        });

        users = await User.find({
          _id: { $nin: depositedUsers },
          emailVerified: true,
          isActive: true,
        }).select("-password");

        break;

      // ==========================================================
      // SELECTED USERS
      // ==========================================================
      case "chooseUser":
        if (!selectedUsers || !selectedUsers.length) {
          return res.status(400).json({
            message: "Please select at least one user.",
          });
        }

        users = await User.find({
          _id: { $in: selectedUsers },
          emailVerified: true,
          isActive: true,
        }).select("-password");

        break;

      default:
        return res.status(400).json({
          message: "Invalid category.",
        });
    }

    // No users found
    if (!users.length) {
      return res.status(404).json({
        message: "No users found.",
      });
    }

    // Send emails concurrently
    await Promise.all(
      users.map((user) => {
        const html = `
            <p>${greeting || "Hello"} ${greetingTitle || user.fullName
          },</p>

            ${message}

            <br><br>

            <p>
                Regards,<br>
                <strong>Cryptico Team</strong>
            </p>
        `;

        return sendMail({
          to: user.email,
          subject,
          html,
        });
      })
    );

    return res.status(200).json({
      success: true,
      message: `Email sent successfully to ${users.length} user(s).`,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email already verified"
      });
    }

    user.emailVerified = true;

    await user.save();

    return res.status(200).json({
      message: "Email verified successfully",
      user
    });

  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

//////////////// ADMIN SECTION  /////////////////
// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' })

    if (!admins) {
      return res.status(404).json({ message: 'No admin found' })
    }
    return res.status(200).json(admins);

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}



module.exports = {
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
  kycApplications,
  singleKycApplication,
  verifyUserKyc,
  reviewKycApplication,
  getAllTransactions,
  getSingleTransaction,
  getUserTransactions,
  sendEmail,
  verifyEmail,
  getAllAdmins,
  createPaymentMethod,
  editPaymentMethod,
  togglePaymentMethodStatus,
  getAllMethods,
  getPaymentMethod,
  deletePaymentMethod
};
