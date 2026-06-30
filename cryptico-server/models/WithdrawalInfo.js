const mongoose = require('mongoose');

const withdrawalInfoSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    unique: true
  },
  // bank details
  bankName:      { type: String },
  accountName:   { type: String },
  accountNumber: { type: String },

  // single flexible crypto field
  cryptoType:    { type: String },
  cryptoNetwork: { type: String},
  walletAddress: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('WithdrawalInfo', withdrawalInfoSchema);