const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['deposit', 'withdrawal'], 
    required: true 
  },
  amount:        { type: Number, required: true },
  method:        { type: String, required: true },
  walletAddress: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  proofImage:  { type: String },
  reference:   { type: String },
  note:        { type: String },
  approvedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);