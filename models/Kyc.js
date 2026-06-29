const mongoose = require("mongoose");

const kycSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    fullName: String,

    dateOfBirth: Date,

    country: String,

    idType: {
        type: String,
        enum: [
            "passport",
            "driversLicense",
            "nationalId"
        ]
    },

    idNumber: String,

    frontImage: String,

    backImage: String,

    selfieImage: String,

    applicationStatus: {
        type: String,
        enum: [
            "pending",
            "approved",
            "rejected"
        ],
        default: "pending"
    },

    reviewComment: {
        type: String,
        default: ""
    },

    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    reviewedAt: Date
},
    {
        timestamps: true
    }
);

module.exports = mongoose.model("KYC", kycSchema);