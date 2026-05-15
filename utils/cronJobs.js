const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');

const runTopUp = async () => {
  try {
    console.log('⏰ Running top up job...');

    const now = new Date();

    // get all active investments
    const investments = await Investment.find({ status: 'active' }).populate('plan');

    for (const investment of investments) {
      const plan = investment.plan;
      const lastTopUp = new Date(investment.lastTopUp);

      // calculate how much time has passed since last top up
      const diffMs = now - lastTopUp;
      const diffMins = diffMs / (1000 * 60);
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      // check if enough time has passed based on plan interval
      let shouldTopUp = false;

      if (plan.topUpInterval === 'hourly' && diffHours >= 1) shouldTopUp = true;
      if (plan.topUpInterval === 'daily' && diffDays >= 1) shouldTopUp = true;
      if (plan.topUpInterval === 'weekly' && diffDays >= 7) shouldTopUp = true;
      if (plan.topUpInterval === 'monthly' && diffDays >= 30) shouldTopUp = true;
      if (plan.topUpInterval === '30 minutes' && diffMins >= 30) shouldTopUp = true;
      if (plan.topUpInterval === '10 minutes' && diffMins >= 10) shouldTopUp = true;

      if (!shouldTopUp) continue;

      // check if investment has expired
      if (now >= new Date(investment.endDate)) {
        // complete the investment
        investment.status = 'completed';
        await investment.save();

        // add total expected return to user balance
        await User.findByIdAndUpdate(investment.user, {
          $inc: {
            balance: investment.totalExpectedReturn,
            totalEarnings: investment.totalExpectedReturn,
          }
        });

        console.log(`✅ Investment ${investment._id} completed`);
        continue;
      }

      // calculate top up amount
      const topUpAmount = (investment.amountInvested * plan.topUpAmount) / 100;

      // add to current returns
      investment.currentReturns += topUpAmount;
      investment.lastTopUp = now;
      await investment.save();

      // add to user balance
      await User.findByIdAndUpdate(investment.user, {
        $inc: { balance: topUpAmount }
      });

      console.log(`💰 Added $${topUpAmount} to investment ${investment._id}`);
    }

  } catch (err) {
    console.error('❌ Cron job error:', err.message);
  }
};

// run every 10 minutes — checks all investments
// '*/10 * * * *' means every 10 minutes
const startCronJobs = () => {
  cron.schedule('*/10 * * * *', runTopUp);
  console.log('⏰ Cron jobs started');
};

module.exports = { startCronJobs };