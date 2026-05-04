const fs = require('fs/promises');
const path = require('path');

const sampleOrdersPath = path.join(__dirname, '..', 'data', 'sampleOrders.json');

async function getReportRowsForSubscription(_subscription) {
  // Placeholder: replace with SAP / PS Data Hub adapter reads.
  const raw = await fs.readFile(sampleOrdersPath, 'utf8');
  const rows = JSON.parse(raw);
  return rows;
}

module.exports = {
  getReportRowsForSubscription,
};
