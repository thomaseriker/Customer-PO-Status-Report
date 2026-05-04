const fs = require('fs/promises');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('../config');

function hasSmtpConfig() {
  return Boolean(config.email.host && config.email.user && config.email.pass);
}

async function sendExcelReportEmail({ subscription, reportResult }) {
  const subject = `[PO Status] ${subscription.name || subscription.id} - ${reportResult.reportDate}`;

  if (!hasSmtpConfig()) {
    const dryRunLogPath = path.join(
      config.outputDir,
      `dry-run-email-${subscription.id}-${Date.now()}.json`
    );

    const payload = {
      mode: 'dry-run',
      to: subscription.recipients || [],
      from: config.email.from,
      subject,
      attachment: reportResult.filePath,
      generatedAt: reportResult.generatedAt,
    };

    await fs.writeFile(dryRunLogPath, JSON.stringify(payload, null, 2), 'utf8');

    return {
      transport: 'email-excel',
      mode: 'dry-run',
      to: payload.to,
      subject,
      receipt: dryRunLogPath,
    };
  }

  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });

  const info = await transporter.sendMail({
    from: config.email.from,
    to: subscription.recipients || [],
    subject,
    text: `Attached is your PO status full refresh for ${reportResult.reportDate}.`,
    attachments: [
      {
        filename: path.basename(reportResult.filePath),
        path: reportResult.filePath,
      },
    ],
  });

  return {
    transport: 'email-excel',
    mode: 'smtp',
    to: subscription.recipients || [],
    subject,
    receipt: info.messageId,
  };
}

module.exports = {
  sendExcelReportEmail,
};
