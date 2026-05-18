const cron = require('node-cron');
const Investment = require('../models/Investment');
const User = require('../models/User');

/*
|--------------------------------------------------------------------------
| MAIN TOP-UP FUNCTION
|--------------------------------------------------------------------------
| This function:
| 1. Finds all active investments
| 2. Checks how much time passed since last payout
| 3. Calculates how many payouts were MISSED
| 4. Pays all missed profits at once
| 5. Completes investment if expired
|
| This makes your system SAFE even if server stops for days.
|--------------------------------------------------------------------------
*/

const runTopUp = async () => {
  try {
    console.log('⏰ Running investment top-up job...');

    const now = new Date();

    // get all active investments + their plan info
    const investments = await Investment
      .find({ status: 'active' })
      .populate('plan');

    for (const investment of investments) {

      const plan = investment.plan;

      // last time this investment received profit
      const lastTopUp = new Date(investment.lastTopUp);

      /* ---------------------------------------------------------
         CALCULATE TIME DIFFERENCE
      --------------------------------------------------------- */

      const diffMs = now - lastTopUp;

      const diffMinutes = diffMs / (1000 * 60);
      const diffHours = diffMs / (1000 * 60 * 60);
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      /*
        intervalsPassed = number of profits user should receive
        Example:
        Server OFF 3 days → intervalsPassed = 3
      */
      let intervalsPassed = 0;

      if (plan.topUpInterval === '10 minutes')
        intervalsPassed = Math.floor(diffMinutes / 10);

      if (plan.topUpInterval === '30 minutes')
        intervalsPassed = Math.floor(diffMinutes / 30);

      if (plan.topUpInterval === 'hourly')
        intervalsPassed = Math.floor(diffHours);

      if (plan.topUpInterval === 'daily')
        intervalsPassed = Math.floor(diffDays);

      if (plan.topUpInterval === 'weekly')
        intervalsPassed = Math.floor(diffDays / 7);

      if (plan.topUpInterval === 'monthly')
        intervalsPassed = Math.floor(diffDays / 30);

      // nothing to pay yet
      if (intervalsPassed <= 0) continue;

      /* ---------------------------------------------------------
         CHECK IF INVESTMENT HAS EXPIRED
      --------------------------------------------------------- */

      if (now >= new Date(investment.endDate)) {

        // mark investment completed
        investment.status = 'completed';
        await investment.save();

        // pay remaining expected return
        await User.findByIdAndUpdate(investment.user, {
          $inc: {
            balance: investment.totalExpectedReturn,
            totalEarnings: investment.totalExpectedReturn,
          }
        });

        console.log(`✅ Investment ${investment._id} completed`);
        continue;
      }

      /* ---------------------------------------------------------
         CALCULATE TOTAL PROFIT TO ADD
      --------------------------------------------------------- */

      // profit for ONE interval
      const singleTopUp =
        (investment.amountInvested * plan.topUpAmount) / 100;

      // profit for ALL missed intervals
      const totalTopUp = singleTopUp * intervalsPassed;

      // add returns to investment
      investment.currentReturns += totalTopUp;

      /* ---------------------------------------------------------
         MOVE lastTopUp FORWARD CORRECTLY
         VERY IMPORTANT !!!
      --------------------------------------------------------- */

      const newLastTopUp = new Date(lastTopUp);

      if (plan.topUpInterval === '10 minutes')
        newLastTopUp.setMinutes(
          newLastTopUp.getMinutes() + intervalsPassed * 10
        );

      if (plan.topUpInterval === '30 minutes')
        newLastTopUp.setMinutes(
          newLastTopUp.getMinutes() + intervalsPassed * 30
        );

      if (plan.topUpInterval === 'hourly')
        newLastTopUp.setHours(
          newLastTopUp.getHours() + intervalsPassed
        );

      if (plan.topUpInterval === 'daily')
        newLastTopUp.setDate(
          newLastTopUp.getDate() + intervalsPassed
        );

      if (plan.topUpInterval === 'weekly')
        newLastTopUp.setDate(
          newLastTopUp.getDate() + intervalsPassed * 7
        );

      if (plan.topUpInterval === 'monthly')
        newLastTopUp.setDate(
          newLastTopUp.getDate() + intervalsPassed * 30
        );

      investment.lastTopUp = newLastTopUp;

      await investment.save();

      /* ---------------------------------------------------------
         ADD MONEY TO USER BALANCE
      --------------------------------------------------------- */

      await User.findByIdAndUpdate(investment.user, {
        $inc: { balance: totalTopUp }
      });

      console.log(
        `💰 Added ${totalTopUp} to investment ${investment._id}`
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
| Runs every 10 minutes.
|
| IMPORTANT:
| Cron timing DOES NOT control profit.
| Time difference calculation controls profit.
|--------------------------------------------------------------------------
*/

const startCronJobs = () => {
  cron.schedule('*/10 * * * *', runTopUp);

  console.log('⏰ Cron jobs started...');
};

module.exports = { startCronJobs };