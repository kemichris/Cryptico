const User = require('../models/User');
const Transaction = require('../models/Transaction');


// Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const allTransactions = await Transaction.find()
            .populate('user', 'fullName email')
            .sort({ createdAt: -1 })
        return res.status(200).json({ allTransactions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Get singel transaction
const getSingleTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id)
        .populate('user', 'fullName email');

        if(!transaction) {
            return res.status(404).json({ message: 'transaction not found'})
        }

        return res.status(200).json({ transaction })
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
}

// Get user transaction
const getUserTransactions = async (req, res) => {
    try {
        const userTransaction = await Transaction.find({ user: req.params.id })
        .populate('user', 'fullName email')
        .sort({createdAt: -1});
        // if(!userTransaction) {
        //     return res.status(404).json({ message: 'no transaction found'})
        // }

        return res.status(200).json({ userTransaction})
    } catch (err) {
        res.status(500).json({ message: err.message})
    }
}


module.exports = {
    getAllTransactions,
    getSingleTransaction,
    getUserTransactions
}