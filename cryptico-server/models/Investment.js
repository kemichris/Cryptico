const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    plan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Plan',
        required: true
    },
    amountInvested: { type: Number, required: true },
    currentReturns: { type: Number, default: 0 },
    totalExpectedReturn: { type: Number, required: true },
    status: {
        type: String,
        enum: ['active', 'completed', 'cancelled'],
        default: 'active'
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    lastTopUp: { type: Date, default: Date.now },
    processedIntervals: {
        type: Number,
        default: 0
    },
}, { timestamps: true });

module.exports = mongoose.model('Investment', investmentSchema);