const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    minAmount: { type: Number, required: true },
    maxAmount: { type: Number, required: true },
    giftBonus: { type: Number, default: 0 },
    topUpInterval: {
        type: String,
        enum: ['monthly', 'weekly', 'daily', 'hourly', '30 minutes', '10 minutes'],
        required: true
    },
    topUpAmount: { type: Number, required: true },
    duration: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);