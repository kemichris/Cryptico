const User = require('../models/User');
const Investment = require('../models/Investment');


// Get all investment for single user
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

// Cancel invesment 
const cancelInvestment = async (req, res) => {
    try {
        const investment = await Investment.findById(req.params.id);

        if (!investment) {
            return res.status(404).json({ message: 'Investment not found' });
        }

        // check if already cancelled or completed
        if (investment.status === 'cancelled' || investment.status === 'completed') {
            return res.status(400).json({ message: 'Investment already processed' });
        }

        // update status to cancelled
        investment.status = 'cancelled';
        await investment.save();

        // refund amount back to user balance
        await User.findByIdAndUpdate(investment.user, {
            $inc: {
                balance: investment.amountInvested,       // refund to balance
                totalInvested: -investment.amountInvested // deduct from totalInvested
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
            return res.status(400).json({
                message: 'Investment already processed or not found'
            });
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

module.exports = {
    getAllInvestments,
    cancelInvestment,
    completeInvestment
}