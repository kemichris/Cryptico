const mongoose = require("mongoose");

const paymentMethodSchema = new mongoose.Schema({
    // BTC, ETH, Bank Transfer, USDT TRC20...
    name: {
        type: String,
        required: true,
        trim: true
    },

    // bitcoin, ethereum, bank...
    network: {
        type: String,
        required: true,
    },

    // crypto | bank
    type: {
        type: String,
        enum: ["crypto", "currency"],
        required: true
    },

    // Wallet address or bank account number
    paymentAddress: {
        type: String,
        required: true,
        trim: true
    },

    // Optional account holder
    accountName: {
        type: String,
        default: ""
    },

    // Optional bank name
    bankName: {
        type: String,
        default: ""
    },

    // Used for displaying logo
    icon: {
        type: String,
        default: ""
    },

    qrCode: {
        type: String,
    },

    availableFor: {
        type: String,
        enum: ["deposit", "withdrawal", "both"],
        default: "both"
    },

    // Whether users can currently use it
    status: {
        type: String,
        enum: ['enabled', 'disabled'],
        default: 'enabled'
    },

    instructions: {
        type: String,
        default: ""
    },
}, { timestamps: true }
);

module.exports = mongoose.model("PaymentMethod", paymentMethodSchema);