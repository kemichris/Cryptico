const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');

/*
|--------------------------------------------------------------------------
| INVESTMENT TOP-UP ENGINE
|--------------------------------------------------------------------------
|
| amountInvested      => Principal
| totalExpectedReturn => Expected Profit ONLY
| currentReturns      => Running Profit
|
| Example:
|
| Principal = 1,000
| Profit    = 72,000
|
| Maturity payout:
|
| 1,000 + 72,000 = 73,000
|
|--------------------------------------------------------------------------
*/

const runTopUp = async () => {
  try {

    console.log('⏰ Running investment top-up job...');

    // current time
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
    | PROCESS EACH INVESTMENT
    |--------------------------------------------------------------------------
    */

    for (const investment of investments) {

      const plan = investment.plan;

      // skip broken investments
      if (!plan) continue;

      /*
      |--------------------------------------------------------------------------
      | DETERMINE LAST TOP-UP TIME
      |--------------------------------------------------------------------------
      */

      const lastTopUp = new Date(
        investment.lastTopUp || investment.startDate
      );

      /*
      |--------------------------------------------------------------------------
      | CHECK IF INVESTMENT EXPIRED
      |--------------------------------------------------------------------------
      */

      const isExpired =
        now >= new Date(investment.endDate);

      /*
      |--------------------------------------------------------------------------
      | MATURITY PROCESS
      |--------------------------------------------------------------------------
      */

      if (isExpired) {

        const principal =
          investment.amountInvested;

        const finalProfit =
          investment.totalExpectedReturn;

        /*
        |--------------------------------------------------------------------------
        | FORCE PROFIT TO EXPECTED VALUE
        |--------------------------------------------------------------------------
        |
        | Handles cases where the last cron
        | interval didn't run before expiry.
        |
        */

        investment.currentReturns = finalProfit;

        /*
        |--------------------------------------------------------------------------
        | TOTAL PAYOUT
        |--------------------------------------------------------------------------
        */

        const payout =
          principal + finalProfit;

        /*
        |--------------------------------------------------------------------------
        | CREDIT USER
        |--------------------------------------------------------------------------
        */

        await User.findByIdAndUpdate(
          investment.user,
          {
            $inc: {
              balance: payout,
              totalEarnings: finalProfit,
              totalInvested: -principal
            }
          }
        );

        /*
        |--------------------------------------------------------------------------
        | COMPLETE INVESTMENT
        |--------------------------------------------------------------------------
        */

        investment.status = 'completed';
        investment.lastTopUp = now;

        await investment.save();

        console.log(
          `✅ Completed ${investment._id} | Paid ${payout}`
        );

        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | CALCULATE TIME PASSED
      |--------------------------------------------------------------------------
      */

      const diffMs = now - lastTopUp;

      const diffMinutes =
        diffMs / (1000 * 60);

      const diffHours =
        diffMs / (1000 * 60 * 60);

      const diffDays =
        diffMs / (1000 * 60 * 60 * 24);

      /*
      |--------------------------------------------------------------------------
      | CALCULATE MISSED INTERVALS
      |--------------------------------------------------------------------------
      */

      let intervalsPassed = 0;

      switch (plan.topUpInterval) {

        case '10 minutes':
          intervalsPassed =
            Math.floor(diffMinutes / 10);
          break;

        case '30 minutes':
          intervalsPassed =
            Math.floor(diffMinutes / 30);
          break;

        case 'hourly':
          intervalsPassed =
            Math.floor(diffHours);
          break;

        case 'daily':
          intervalsPassed =
            Math.floor(diffDays);
          break;

        case 'weekly':
          intervalsPassed =
            Math.floor(diffDays / 7);
          break;

        case 'monthly':
          intervalsPassed =
            Math.floor(diffDays / 30);
          break;
      }

      if (intervalsPassed <= 0)
        continue;

      /*
      |--------------------------------------------------------------------------
      | REMAINING PROFIT
      |--------------------------------------------------------------------------
      */

      const remainingProfit =
        Math.max(
          0,
          investment.totalExpectedReturn -
          investment.currentReturns
        );

      /*
      |--------------------------------------------------------------------------
      | PROFIT FOR THIS RUN
      |--------------------------------------------------------------------------
      */

      const singleTopUp =
        plan.topUpAmount;

      let totalTopUp =
        singleTopUp * intervalsPassed;

      /*
      |--------------------------------------------------------------------------
      | PREVENT OVERPAYMENT
      |--------------------------------------------------------------------------
      */

      totalTopUp =
        Math.min(
          totalTopUp,
          remainingProfit
        );

      if (totalTopUp <= 0)
        continue;

      /*
      |--------------------------------------------------------------------------
      | UPDATE RUNNING PROFIT
      |--------------------------------------------------------------------------
      */

      investment.currentReturns += totalTopUp;

      /*
      |--------------------------------------------------------------------------
      | MOVE LAST TOPUP FORWARD
      |--------------------------------------------------------------------------
      */

      const newLastTopUp =
        new Date(lastTopUp);

      switch (plan.topUpInterval) {

        case '10 minutes':
          newLastTopUp.setMinutes(
            newLastTopUp.getMinutes() +
            (intervalsPassed * 10)
          );
          break;

        case '30 minutes':
          newLastTopUp.setMinutes(
            newLastTopUp.getMinutes() +
            (intervalsPassed * 30)
          );
          break;

        case 'hourly':
          newLastTopUp.setHours(
            newLastTopUp.getHours() +
            intervalsPassed
          );
          break;

        case 'daily':
          newLastTopUp.setDate(
            newLastTopUp.getDate() +
            intervalsPassed
          );
          break;

        case 'weekly':
          newLastTopUp.setDate(
            newLastTopUp.getDate() +
            (intervalsPassed * 7)
          );
          break;

        case 'monthly':
          newLastTopUp.setDate(
            newLastTopUp.getDate() +
            (intervalsPassed * 30)
          );
          break;
      }

      investment.lastTopUp =
        newLastTopUp;

      await investment.save();

      /*
      |--------------------------------------------------------------------------
      | NO BALANCE CREDIT HERE
      |--------------------------------------------------------------------------
      |
      | Profit remains unrealized
      | until maturity.
      |
      */

      console.log(
        `💰 Accrued ${totalTopUp} profit | Investment ${investment._id}`
      );
    }

  } catch (err) {

    console.error(
      '❌ Cron Job Error:',
      err.message
    );
  }
};

/*
|--------------------------------------------------------------------------
| START CRON JOBS
|--------------------------------------------------------------------------
*/

const startCronJobs = () => {

  // run immediately when server starts
  runTopUp();

  // run every 10 minutes
  cron.schedule(
    '*/10 * * * *',
    runTopUp
  );

  console.log(
    '⏰ Cron jobs started successfully'
  );
};

module.exports = {
  startCronJobs
};