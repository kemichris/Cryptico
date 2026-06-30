const cron = require('node-cron');
const Investment = require('../cryptico-server/models/Investment');
const User = require('../cryptico-server/models/User');

const intervalMap = {
  '10 minutes': 10,
  '30 minutes': 30,
  'hourly': 60,
  'daily': 1440,
  'weekly': 10080,
  'monthly': 43200
};

const runTopUp = async () => {
  try {
    console.log('⏰ Running investment engine...');

    const now = new Date();

    const investments = await Investment
      .find({ status: 'active' })
      .populate('plan');

    for (const investment of investments) {

      const plan = investment.plan;
      if (!plan) continue;

      // -------------------------
      // VALIDATION GUARDS
      // -------------------------
      if (
        typeof plan.topUpRate !== 'number' ||
        Number.isNaN(plan.topUpRate)
      ) continue;

      const intervalMinutes = intervalMap[plan.topUpInterval];
      if (!intervalMinutes) continue;

      const amount = Number(investment.amountInvested || 0);

      if (!amount || amount <= 0) continue;

      // -------------------------
      // TOTAL POSSIBLE INTERVALS (FIXED)
      // -------------------------
      const totalMinutes = plan.duration * 1440;
      const totalIntervals = Math.floor(totalMinutes / intervalMinutes);

      // -------------------------
      // CALCULATE CURRENT INTERVAL POSITION (SOURCE OF TRUTH)
      // -------------------------
      const startTime = new Date(investment.startDate || investment.createdAt);
      const elapsedMinutes = (now - startTime) / (1000 * 60);

      const shouldHaveProcessed = Math.floor(elapsedMinutes / intervalMinutes);

      // -------------------------
      // FIND MISSED INTERVALS
      // -------------------------
      let intervalsToProcess =
        shouldHaveProcessed - (investment.processedIntervals || 0);

      if (intervalsToProcess <= 0) continue;

      // cap to avoid overflow
      const remaining = totalIntervals - (investment.processedIntervals || 0);
      intervalsToProcess = Math.min(intervalsToProcess, remaining);

      if (intervalsToProcess <= 0) continue;

      // -------------------------
      // PROFIT CALCULATION
      // -------------------------
      const singleTopUp = amount * plan.topUpRate;
      const totalProfit = singleTopUp * intervalsToProcess;

      if (Number.isNaN(totalProfit)) continue;

      // -------------------------
      // UPDATE INVESTMENT
      // -------------------------
      investment.currentReturns =
        (investment.currentReturns || 0) + totalProfit;

      investment.processedIntervals =
        (investment.processedIntervals || 0) + intervalsToProcess;

      // -------------------------
      // CHECK MATURITY
      // -------------------------
      if (investment.processedIntervals >= totalIntervals) {

        const principal = amount;
        const accrued = investment.currentReturns || 0;

        const payout = principal + accrued;

        await User.findByIdAndUpdate(investment.user, {
          $inc: {
            balance: payout,
            totalEarnings: accrued
          }
        });

        investment.status = 'completed';

        console.log(
          `✅ MATURED ${investment._id} | Paid ${payout}`
        );
      }

      await investment.save();

      console.log(
        `💰 Processed ${intervalsToProcess} intervals | ${investment._id}`
      );
    }

  } catch (err) {
    console.error('❌Cron Error:', err);
  }
};

const startCronJobs = () => {
  runTopUp();
  cron.schedule('*/10 * * * *', runTopUp);

  console.log('🚀cron system started');
};

module.exports = { startCronJobs };