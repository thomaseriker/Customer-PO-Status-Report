const path = require('path');
require('dotenv').config();

function parseBoolean(value, fallback = false) {
  if (value == null || value === '') return fallback;
  return ['1', 'true', 'yes', 'y', 'on'].includes(String(value).toLowerCase());
}

function parseNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const outputDir = path.resolve(
  process.cwd(),
  process.env.OUTPUT_DIR || 'output'
);

module.exports = {
  port: parseNumber(process.env.PORT, 3100),
  jsonBodyLimitMb: parseNumber(process.env.JSON_BODY_LIMIT_MB, 5),
  schedulerEnabled: parseBoolean(process.env.SCHEDULER_ENABLED, true),
  dailyCron: process.env.DAILY_CRON || '0 6 * * *',
  reportTimezone: process.env.REPORT_TIMEZONE || 'UTC',
  outputDir,
  email: {
    host: process.env.SMTP_HOST || '',
    port: parseNumber(process.env.SMTP_PORT, 587),
    secure: parseBoolean(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'po-status@company.com',
  },
};
