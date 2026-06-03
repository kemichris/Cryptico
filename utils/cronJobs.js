const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');

/*
|--------------------------------------------------------------------------
| INVESTMENT TOP-UP ENGINE (FINANCIAL-GRADE FIXED VERSION)
|--------------------------------------------------------------------------
| RULES:
| - amountInvested = principal (returned ONLY at maturity)
| - currentReturns = running profit (NOT paid to user yet)
| - totalExpectedReturn = total profit expected
|--------------------------------------------------------------------------
*/

const runTopUp = async () => {
  try {
    console.log('⏰ Running investment top-up job...');

    const now = new Date();

    const investments = await Investment
      .find({ status: 'active' })
      .populate('plan');

    for (const investment of investments) {
      const plan = investment.plan;

      if (!plan) continue;

      /*
      |--------------------------------------------------------------------------
      | SAFE TIME BASE
      |--------------------------------------------------------------------------
      */
      const lastTopUp = new Date(
        investment.lastTopUp || investment.startDate
      );

      const diffMs = now - lastTopUp;

      const diffMinutes = diffMs / (1000 * 60);
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      /*
      |--------------------------------------------------------------------------
      | CHECK EXPIRY FIRST (IMPORTANT FIX)
      |--------------------------------------------------------------------------
      */
      const isExpired = now >= new Date(investment.endDate);

      if (isExpired) {
        const principal = investment.amountInvested;

        const totalProfit = investment.totalExpectedReturn || 0;
        const earnedSoFar = investment.currentReturns || 0;

        const remainingProfit = Math.max(0, totalProfit - earnedSoFar);

        const payout = principal + remainingProfit;

        await User.findByIdAndUpdate(investment.user, {
          $inc: {
            balance: payout,
            totalEarnings: totalProfit
          }
        });

        investment.status = 'completed';
        investment.currentReturns = totalProfit;
        investment.lastTopUp = now;

        await investment.save();

        console.log(`✅ Completed: ${investment._id} | Paid: ${payout}`);
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | CALCULATE MISSED INTERVALS
      |--------------------------------------------------------------------------
      */
      let intervalsPassed = 0;

      switch (plan.topUpInterval) {
        case '10 minutes':
          intervalsPassed = Math.floor(diffMinutes / 10);
          break;

        case '30 minutes':
          intervalsPassed = Math.floor(diffMinutes / 30);
          break;

        case 'hourly':
          intervalsPassed = Math.floor(diffHours);
          break;

        case 'daily':
          intervalsPassed = Math.floor(diffDays);
          break;

        case 'weekly':
          intervalsPassed = Math.floor(diffDays / 7);
          break;

        case 'monthly':
          intervalsPassed = Math.floor(diffDays / 30);
          break;
      }

      intervalsPassed = Math.max(0, intervalsPassed);

      if (intervalsPassed <= 0) continue;

      /*
      |--------------------------------------------------------------------------
      | PROFIT CALCULATION (RUNNING ONLY)
      |--------------------------------------------------------------------------
      */
      const remainingProfit = Math.max(
        0,
        investment.totalExpectedReturn - (investment.currentReturns || 0)
      );

      const singleTopUp = plan.topUpAmount;

      let totalTopUp = singleTopUp * intervalsPassed;

      totalTopUp = Math.min(totalTopUp, remainingProfit);

      if (totalTopUp <= 0) continue;

      investment.currentReturns =
        (investment.currentReturns || 0) + totalTopUp;

      /*
      |--------------------------------------------------------------------------
      | UPDATE LAST TOPUP TIME
      |--------------------------------------------------------------------------
      */
      const newLastTopUp = new Date(lastTopUp);

      switch (plan.topUpInterval) {
        case '10 minutes':
          newLastTopUp.setMinutes(newLastTopUp.getMinutes() + intervalsPassed * 10);
          break;

        case '30 minutes':
          newLastTopUp.setMinutes(newLastTopUp.getMinutes() + intervalsPassed * 30);
          break;

        case 'hourly':
          newLastTopUp.setHours(newLastTopUp.getHours() + intervalsPassed);
          break;

        case 'daily':
          newLastTopUp.setDate(newLastTopUp.getDate() + intervalsPassed);
          break;

        case 'weekly':
          newLastTopUp.setDate(newLastTopUp.getDate() + intervalsPassed * 7);
          break;

        case 'monthly':
          newLastTopUp.setDate(newLastTopUp.getDate() + intervalsPassed * 30);
          break;
      }

      investment.lastTopUp = newLastTopUp;

      await investment.save();

      /*
      |--------------------------------------------------------------------------
      | NO BALANCE UPDATE HERE (IMPORTANT FIX)
      |--------------------------------------------------------------------------
      | Profit stays "unrealized" until maturity
      |--------------------------------------------------------------------------
      */

      console.log(
        `💰 Accrued ${totalTopUp} (unpaid) | Investment: ${investment._id}`
      );
    }

  } catch (err) {
    console.error('❌ Cron job error:', err.message);
  }
};

/*
|--------------------------------------------------------------------------
| START CRON JOB
|--------------------------------------------------------------------------
*/
const startCronJobs = () => {
  runTopUp(); // immediate run on startup
  cron.schedule('*/10 * * * *', runTopUp);

  console.log('⏰ Cron jobs started...');
};

module.exports = { startCronJobs };