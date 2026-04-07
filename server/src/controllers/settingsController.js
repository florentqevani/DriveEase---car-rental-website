const db = require('../config/db');
const nodemailer = require('nodemailer');

const EMAIL_KEYS = [
    'smtp_host',
    'smtp_port',
    'smtp_secure',
    'smtp_user',
    'smtp_pass',
    'smtp_from_name',
    'email_enabled',
];

async function getEmailSettings(_req, res) {
    try {
        const result = await db.query(
            'SELECT key, value FROM settings WHERE key = ANY($1)',
            [EMAIL_KEYS]
        );

        const settings = {};
        for (const row of result.rows) {
            settings[row.key] = row.value;
        }

        // Fill defaults from env for any missing keys
        const defaults = {
            smtp_host: process.env.SMTP_HOST || 'smtp.gmail.com',
            smtp_port: process.env.SMTP_PORT || '587',
            smtp_secure: process.env.SMTP_SECURE || 'false',
            smtp_user: process.env.SMTP_USER || '',
            smtp_pass: '',
            smtp_from_name: 'DriveEase',
            email_enabled: process.env.SMTP_USER ? 'true' : 'false',
        };

        for (const key of EMAIL_KEYS) {
            if (!(key in settings)) {
                settings[key] = defaults[key];
            }
        }

        // Never send the actual password to the client — send a placeholder if set
        if (settings.smtp_pass) {
            settings.smtp_pass_set = true;
            settings.smtp_pass = '';
        } else {
            settings.smtp_pass_set = false;
        }

        res.json(settings);
    } catch (err) {
        console.error('Get email settings error:', err);
        res.status(500).json({ error: 'Failed to fetch email settings' });
    }
}

async function updateEmailSettings(req, res) {
    try {
        const updates = {};
        for (const key of EMAIL_KEYS) {
            if (key in req.body) {
                updates[key] = String(req.body[key]);
            }
        }

        // If smtp_pass is empty and already set, don't overwrite it
        if (updates.smtp_pass === '') {
            delete updates.smtp_pass;
        }

        for (const [key, value] of Object.entries(updates)) {
            await db.query(
                `INSERT INTO settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
                [key, value]
            );
        }

        res.json({ message: 'Email settings saved' });
    } catch (err) {
        console.error('Update email settings error:', err);
        res.status(500).json({ error: 'Failed to save email settings' });
    }
}

async function testEmailSettings(req, res) {
    const { to } = req.body;
    if (!to) {
        return res.status(400).json({ error: 'Recipient email is required' });
    }

    try {
        // Load current settings from DB
        const result = await db.query(
            'SELECT key, value FROM settings WHERE key = ANY($1)',
            [EMAIL_KEYS]
        );
        const settings = {};
        for (const row of result.rows) {
            settings[row.key] = row.value;
        }

        const host = settings.smtp_host || process.env.SMTP_HOST || 'smtp.gmail.com';
        const port = parseInt(settings.smtp_port || process.env.SMTP_PORT || '587', 10);
        const secure = (settings.smtp_secure || process.env.SMTP_SECURE) === 'true';
        const user = settings.smtp_user || process.env.SMTP_USER;
        const pass = settings.smtp_pass || process.env.SMTP_PASS;
        const fromName = settings.smtp_from_name || 'DriveEase';

        if (!user || !pass) {
            return res.status(400).json({ error: 'SMTP user and password must be configured' });
        }

        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            auth: { user, pass },
        });

        await transporter.sendMail({
            from: `"${fromName}" <${user}>`,
            to,
            subject: `${fromName} — Test Email`,
            html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #6366f1;">Email Configuration Test</h2>
          <p>If you're reading this, your SMTP settings are working correctly!</p>
          <p style="color: #9ca3af; font-size: 13px;">Sent from ${fromName} admin panel.</p>
        </div>
      `,
        });

        res.json({ message: 'Test email sent successfully' });
    } catch (err) {
        console.error('Test email error:', err);
        res.status(400).json({ error: `Email test failed: ${err.message}` });
    }
}

module.exports = { getEmailSettings, updateEmailSettings, testEmailSettings };
