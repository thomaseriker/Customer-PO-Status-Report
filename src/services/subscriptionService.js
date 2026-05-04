const fs = require('fs/promises');
const path = require('path');

const subscriptionsPath = path.join(__dirname, '..', 'data', 'subscriptions.json');

async function getSubscriptions() {
  const raw = await fs.readFile(subscriptionsPath, 'utf8');
  return JSON.parse(raw);
}

async function getSubscriptionById(id) {
  const subscriptions = await getSubscriptions();
  return subscriptions.find((s) => s.id === id) || null;
}

module.exports = {
  getSubscriptions,
  getSubscriptionById,
};
