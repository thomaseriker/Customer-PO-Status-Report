const cron = require('node-cron');
const config = require('../config');
const { getSubscriptions } = require('./subscriptionService');
const { runDeliveryForSubscription } = require('./deliveryJobService');

function startScheduler() {
  if (!config.schedulerEnabled) {
    console.log('Scheduler disabled by configuration.');
    return null;
  }

  const task = cron.schedule(config.dailyCron, async () => {
    console.log(`Running scheduled delivery cycle at ${new Date().toISOString()}`);
    try {
      const subscriptions = await getSubscriptions();
      const activeEmailSubscriptions = subscriptions.filter(
        (subscription) =>
          subscription.active &&
          (subscription.cadence || 'daily') === 'daily' &&
          subscription.transport === 'email-excel'
      );

      for (const subscription of activeEmailSubscriptions) {
        try {
          const result = await runDeliveryForSubscription(subscription.id);
          console.log(
            `Delivery success for ${subscription.id}: ${result.delivery.receipt}`
          );
        } catch (err) {
          console.error(`Delivery failed for ${subscription.id}: ${err.message}`);
        }
      }
    } catch (err) {
      console.error(`Scheduled delivery cycle failed: ${err.message}`);
    }
  });

  console.log(`Scheduler started with cron '${config.dailyCron}'.`);
  return task;
}

module.exports = {
  startScheduler,
};
