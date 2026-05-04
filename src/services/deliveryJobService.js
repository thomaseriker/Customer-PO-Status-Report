const { getSubscriptionById } = require('./subscriptionService');
const { getReportRowsForSubscription } = require('./reportDataService');
const { buildExcelReport } = require('./excelReportService');
const { sendExcelReportEmail } = require('./emailDeliveryService');

async function runDeliveryForSubscription(subscriptionId, options = {}) {
  const subscription = await getSubscriptionById(subscriptionId);
  if (!subscription) {
    const err = new Error(`Subscription '${subscriptionId}' not found.`);
    err.status = 404;
    throw err;
  }

  if (!subscription.active) {
    const err = new Error(`Subscription '${subscriptionId}' is inactive.`);
    err.status = 400;
    throw err;
  }

  if (subscription.transport !== 'email-excel') {
    const err = new Error(`Unsupported transport '${subscription.transport}' for MVP run.`);
    err.status = 400;
    throw err;
  }

  const rows = await getReportRowsForSubscription(subscription);
  const reportResult = await buildExcelReport({
    subscription,
    rows,
    reportDate: options.reportDate || new Date(),
  });

  const deliveryResult = await sendExcelReportEmail({
    subscription,
    reportResult,
  });

  return {
    subscriptionId: subscription.id,
    customer: subscription.name,
    transport: subscription.transport,
    rowCount: reportResult.rowCount,
    reportDate: reportResult.reportDate,
    generatedAt: reportResult.generatedAt,
    filePath: reportResult.filePath,
    delivery: deliveryResult,
  };
}

module.exports = {
  runDeliveryForSubscription,
};
