const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
    },

    fullName: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },

    referredBy: {
        type: String,
    },

    role: { 
        type: String, 
        enum: ['user', 'admin'], 
        default: 'user' 
    },
    balance: { 
        type: Number, 
        default: 0 
    },
    totalInvested: { 
        type: Number, 
        default: 0 
    },
    totalEarnings: { 
        type: Number, 
        default: 0 
    },
    kycStatus: { 
        type: String, 
        enum: ['pending', 'verified', 'rejected'], 
        default: 'pending' 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);