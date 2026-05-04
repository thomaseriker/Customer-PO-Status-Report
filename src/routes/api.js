const express = require('express');
const { getSubscriptions } = require('../services/subscriptionService');
const { runDeliveryForSubscription } = require('../services/deliveryJobService');

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

router.get('/subscriptions', async (_req, res, next) => {
  try {
    const subscriptions = await getSubscriptions();
    res.json({ subscriptions });
  } catch (err) {
    next(err);
  }
});

router.post('/subscriptions/:id/run', async (req, res, next) => {
  try {
    const result = await runDeliveryForSubscription(req.params.id);
    res.json({ status: 'ok', result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
