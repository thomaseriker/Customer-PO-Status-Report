const express = require('express');
const cors = require('cors');
const config = require('./config');
const apiRouter = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json({ limit: `${config.jsonBodyLimitMb}mb` }));

app.use('/api', apiRouter);

app.get('/', (_req, res) => {
  res.json({
    name: 'customer-po-status-report',
    phase: 'phase-1-email-excel',
    docs: ['/api/health', '/api/subscriptions', '/api/subscriptions/:id/run'],
  });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;
