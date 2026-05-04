const app = require('./app');
const config = require('./config');
const { startScheduler } = require('./services/schedulerService');

app.listen(config.port, () => {
  console.log(`Customer PO Status service running on http://localhost:${config.port}`);
  startScheduler();
});
