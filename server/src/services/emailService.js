const nodemailer = require('nodemailer');
const db = require('../config/db');

const EMAIL_KEYS = [
  'smtp_host',
  'smtp_port',
  'smtp_secure',
  'smtp_user',
  'smtp_pass',
  'smtp_from_name',
  'email_enabled',
];

async function getSmtpConfig() {
  try {
    const result = await db.query(
      'SELECT key, value FROM settings WHERE key = ANY($1)',
      [EMAIL_KEYS]
    );
    const s = {};
    for (const row of result.rows) {
      s[row.key] = row.value;
    }
    return {
      enabled: (s.email_enabled || (process.env.SMTP_USER ? 'true' : 'false')) === 'true',
      host: s.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(s.smtp_port || process.env.SMTP_PORT || '587', 10),
      secure: (s.smtp_secure || process.env.SMTP_SECURE || 'false') === 'true',
      user: s.smtp_user || process.env.SMTP_USER,
      pass: s.smtp_pass || process.env.SMTP_PASS,
      fromName: s.smtp_from_name || 'DriveEase',
    };
  } catch (err) {
    console.warn('[email] Failed to load DB settings, falling back to env:', err.message);
    return {
      enabled: !!process.env.SMTP_USER,
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      fromName: 'DriveEase',
    };
  }
}

async function sendInvoiceEmail({
  to,
  customerName,
  carName,
  pickupDate,
  returnDate,
  days,
  pricePerDay,
  totalPrice,
  reservationId,
}) {
  const config = await getSmtpConfig();

  if (!config.enabled || !config.user) {
    console.warn('[email] Email sending is disabled or SMTP not configured — skipping invoice email');
    return;
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">DriveEase</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0;">Rental Invoice</p>
      </div>

      <div style="padding: 32px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px; color: #374151;">Hi <strong>${customerName}</strong>,</p>
        <p style="font-size: 14px; color: #6b7280;">Thank you for your reservation! Here are your booking details:</p>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Reservation #</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; font-size: 14px;">${reservationId}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Vehicle</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-weight: 600; font-size: 14px;">${carName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Pickup Date</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 14px;">${pickupDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Return Date</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 14px;">${returnDate}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Duration</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 14px;">${days} day${days !== 1 ? 's' : ''}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; color: #6b7280; font-size: 14px;">Rate</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #f3f4f6; text-align: right; font-size: 14px;">$${pricePerDay.toFixed(2)} / day</td>
          </tr>
          <tr>
            <td style="padding: 16px 0 0; font-size: 18px; font-weight: 700; color: #111827;">Total</td>
            <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #6366f1;">$${totalPrice}</td>
          </tr>
        </table>

        <p style="font-size: 13px; color: #9ca3af; text-align: center; margin-top: 32px;">
          This is an automated invoice from DriveEase. Please keep it for your records.
        </p>
      </div>
    </div>
  `;

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });

  await transporter.sendMail({
    from: `"${config.fromName}" <${config.user}>`,
    to,
    subject: `${config.fromName} Invoice — Reservation #${reservationId}`,
    html,
  });

  console.log(`[email] Invoice sent to ${to} for reservation #${reservationId}`);
}

module.exports = { sendInvoiceEmail };
