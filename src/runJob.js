const { runDeliveryForSubscription } = require('./services/deliveryJobService');

async function main() {
  const subscriptionId = process.argv[2] || 'customer-a';
  const result = await runDeliveryForSubscription(subscriptionId);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
