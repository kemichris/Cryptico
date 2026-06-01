const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');

/*
|--------------------------------------------------------------------------
| INVESTMENT TOP-UP ENGINE (FIXED PAYOUT VERSION)
|--------------------------------------------------------------------------
| - Uses fixed topUpAmount per interval
| - Handles missed payouts safely
| - Prevents double payouts
| - Completes investment on expiry
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

      const lastTopUp = new Date(investment.lastTopUp || investment.startDate);
      const diffMs = now - lastTopUp;

      const diffMinutes = diffMs / (1000 * 60);
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

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
      | HANDLE EXPIRY FIRST
      |--------------------------------------------------------------------------
      */

      const isExpired = now >= new Date(investment.endDate);

      if (isExpired) {
        const remaining =
          investment.totalExpectedReturn - (investment.currentReturns || 0);

        if (remaining > 0) {
          await User.findByIdAndUpdate(investment.user, {
            $inc: {
              balance: remaining,
              totalEarnings: remaining,
            }
          });
        }

        investment.status = 'completed';
        investment.currentReturns += remaining;
        investment.lastTopUp = now;

        await investment.save();

        console.log(`✅ Investment completed: ${investment._id}`);
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | FIXED TOP-UP CALCULATION
      |--------------------------------------------------------------------------
      | One interval = fixed amount
      |--------------------------------------------------------------------------
      */

      const singleTopUp = plan.topUpAmount;
      const totalTopUp = singleTopUp * intervalsPassed;

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
      | CREDIT USER BALANCE
      |--------------------------------------------------------------------------
      */

      await User.findByIdAndUpdate(investment.user, {
        $inc: { balance: totalTopUp }
      });

      console.log(
        `💰 Paid ${totalTopUp} to investment ${investment._id}`
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
| Runs every 10 minutes (safe fallback system)
|--------------------------------------------------------------------------
*/

const startCronJobs = () => {
  cron.schedule('*/10 * * * *', runTopUp);
  console.log('⏰ Cron jobs started...');
};

module.exports = { startCronJobs };