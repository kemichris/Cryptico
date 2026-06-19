const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');

/*
|--------------------------------------------------------------------------
| INVESTMENT TOP-UP ENGINE (PURE DYNAMIC MODEL)
|--------------------------------------------------------------------------
|
| CORE IDEA:
| ❌ No stored totalExpectedReturn
| ❌ No pre-calculated profit
|
| EVERYTHING is derived from:
|   - amountInvested
|   - plan.topUpRate
|   - plan.topUpInterval
|   - investment.duration
|
| Profit is computed in real-time logic.
|
*/

const runTopUp = async () => {
  try {
    console.log('⏰ Running investment top-up job...');

    const now = new Date();

    /*
    |--------------------------------------------------------------------------
    | FETCH ACTIVE INVESTMENTS
    |--------------------------------------------------------------------------
    */

    const investments = await Investment
      .find({ status: 'active' })
      .populate('plan');

    /*
    |--------------------------------------------------------------------------
    | LOOP THROUGH INVESTMENTS
    |--------------------------------------------------------------------------
    */

    for (const investment of investments) {

      const plan = investment.plan;
      if (!plan) continue;

      /*
      |--------------------------------------------------------------------------
      | LAST TOP-UP TRACKING
      |--------------------------------------------------------------------------
      */

      const lastTopUp = new Date(
        investment.lastTopUp || investment.startDate
      );

      /*
      |--------------------------------------------------------------------------
      | CHECK IF INVESTMENT HAS EXPIRED
      |--------------------------------------------------------------------------
      | Duration controls total lifecycle
      |--------------------------------------------------------------------------
      */

      const isExpired =
        now >= new Date(investment.endDate);

      /*
      |--------------------------------------------------------------------------
      | MATURITY LOGIC (FINAL PAYOUT)
      |--------------------------------------------------------------------------
      */

      if (isExpired) {

        const principal = investment.amountInvested;

        /*
        |--------------------------------------------------------------------------
        | TOTAL CYCLES FOR FULL DURATION
        |--------------------------------------------------------------------------
        | Convert duration + interval into total cycles
        |--------------------------------------------------------------------------
        */

        let totalCycles = 0;

        switch (plan.topUpInterval) {

          case '10 minutes':
            totalCycles = Math.floor((investment.duration * 24 * 60) / 10);
            break;

          case '30 minutes':
            totalCycles = Math.floor((investment.duration * 24 * 60) / 30);
            break;

          case 'hourly':
            totalCycles = investment.duration * 24;
            break;

          case 'daily':
            totalCycles = investment.duration;
            break;

          case 'weekly':
            totalCycles = Math.floor(investment.duration / 7);
            break;

          case 'monthly':
            totalCycles = Math.floor(investment.duration / 30);
            break;
        }

        /*
        |--------------------------------------------------------------------------
        | FINAL PROFIT CALCULATION
        |--------------------------------------------------------------------------
        | profit = amount × rate × total cycles
        |--------------------------------------------------------------------------
        */

        const singleTopUp =
          investment.amountInvested * plan.topUpRate;

        const finalProfit =
          singleTopUp * totalCycles;

        /*
        |--------------------------------------------------------------------------
        | CREDIT USER WALLET
        |--------------------------------------------------------------------------
        */

        await User.findByIdAndUpdate(
          investment.user,
          {
            $inc: {
              balance: principal + finalProfit,
              totalEarnings: finalProfit,
              totalInvested: -principal
            }
          }
        );

        /*
        |--------------------------------------------------------------------------
        | MARK INVESTMENT COMPLETED
        |--------------------------------------------------------------------------
        */

        investment.status = 'completed';
        investment.lastTopUp = now;

        await investment.save();

        console.log(
          `✅ Completed ${investment._id} | Paid ${principal + finalProfit}`
        );

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | TOP-UP PROCESS (RUNNING PROFIT)
      |--------------------------------------------------------------------------
      */

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

      if (intervalsPassed <= 0) continue;

      /*
      |--------------------------------------------------------------------------
      | PROFIT CALCULATION (PURE RATE SYSTEM)
      |--------------------------------------------------------------------------
      */

      const singleTopUp =
        investment.amountInvested * plan.topUpRate;

      let totalTopUp =
        singleTopUp * intervalsPassed;

      /*
      |--------------------------------------------------------------------------
      | UPDATE RUNNING PROFIT
      |--------------------------------------------------------------------------
      */

      investment.currentReturns += totalTopUp;

      /*
      |--------------------------------------------------------------------------
      | MOVE LAST TOP-UP FORWARD
      |--------------------------------------------------------------------------
      */

      const newLastTopUp = new Date(lastTopUp);

      switch (plan.topUpInterval) {

        case '10 minutes':
          newLastTopUp.setMinutes(
            newLastTopUp.getMinutes() + (intervalsPassed * 10)
          );
          break;

        case '30 minutes':
          newLastTopUp.setMinutes(
            newLastTopUp.getMinutes() + (intervalsPassed * 30)
          );
          break;

        case 'hourly':
          newLastTopUp.setHours(
            newLastTopUp.getHours() + intervalsPassed
          );
          break;

        case 'daily':
          newLastTopUp.setDate(
            newLastTopUp.getDate() + intervalsPassed
          );
          break;

        case 'weekly':
          newLastTopUp.setDate(
            newLastTopUp.getDate() + (intervalsPassed * 7)
          );
          break;

        case 'monthly':
          newLastTopUp.setDate(
            newLastTopUp.getDate() + (intervalsPassed * 30)
          );
          break;
      }

      investment.lastTopUp = newLastTopUp;

      await investment.save();

      console.log(
        `💰 Accrued ${totalTopUp.toFixed(2)} profit | Investment ${investment._id}`
      );
    }

  } catch (err) {
    console.error('❌ Cron Job Error:', err.message);
  }
};

/*
|--------------------------------------------------------------------------
| START CRON JOBS
|--------------------------------------------------------------------------
*/

const startCronJobs = () => {

  // run once on startup
  runTopUp();

  // run every 10 minutes
  cron.schedule('*/10 * * * *', runTopUp);

  console.log('⏰ Cron jobs started successfully');
};

module.exports = {
  startCronJobs
};