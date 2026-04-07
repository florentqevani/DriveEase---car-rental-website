import { useEffect, useState } from 'react';
import api from '../../api/client';

export default function EmailSettings() {
    const [settings, setSettings] = useState({
        smtp_host: 'smtp.gmail.com',
        smtp_port: '587',
        smtp_secure: 'false',
        smtp_user: '',
        smtp_pass: '',
        smtp_from_name: 'DriveEase',
        email_enabled: 'false',
    });
    const [passSet, setPassSet] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testEmail, setTestEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        api.get('/settings/email')
            .then((data) => {
                const { smtp_pass_set, ...rest } = data;
                setSettings(rest);
                setPassSet(smtp_pass_set);
            })
            .catch((err) => setMessage({ type: 'error', text: err.message }))
            .finally(() => setLoading(false));
    }, []);

    function handleChange(key, value) {
        setSettings((prev) => ({ ...prev, [key]: value }));
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });
        try {
            await api.put('/settings/email', settings);
            setMessage({ type: 'success', text: 'Email settings saved successfully!' });
            if (settings.smtp_pass) setPassSet(true);
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setSaving(false);
        }
    }

    async function handleTest() {
        if (!testEmail) return;
        setTesting(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.post('/settings/email/test', { to: testEmail });
            setMessage({ type: 'success', text: res.message });
        } catch (err) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setTesting(false);
        }
    }

    if (loading) return <p>Loading email settings...</p>;

    return (
        <>
            <h2 style={{ marginBottom: 24 }}>Email &amp; Invoice Settings</h2>

            {message.text && (
                <div className={`alert alert-${message.type}`}>{message.text}</div>
            )}

            <form className="card" onSubmit={handleSave} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <label style={{ fontWeight: 600, margin: 0 }}>Enable Invoice Emails</label>
                    <button
                        type="button"
                        onClick={() => handleChange('email_enabled', settings.email_enabled === 'true' ? 'false' : 'true')}
                        style={{
                            width: 48,
                            height: 26,
                            borderRadius: 13,
                            border: 'none',
                            cursor: 'pointer',
                            background: settings.email_enabled === 'true' ? '#6366f1' : 'var(--color-bg-tertiary)',
                            position: 'relative',
                            transition: 'background 0.2s',
                        }}
                    >
                        <span style={{
                            position: 'absolute',
                            top: 3,
                            left: settings.email_enabled === 'true' ? 24 : 3,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: '#fff',
                            transition: 'left 0.2s',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        }} />
                    </button>
                </div>

                <h3 style={{ marginBottom: 20 }}>SMTP Configuration</h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                        <label>SMTP Host</label>
                        <input
                            type="text"
                            className="form-input"
                            value={settings.smtp_host}
                            onChange={(e) => handleChange('smtp_host', e.target.value)}
                            placeholder="smtp.gmail.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>SMTP Port</label>
                        <input
                            type="number"
                            className="form-input"
                            value={settings.smtp_port}
                            onChange={(e) => handleChange('smtp_port', e.target.value)}
                            placeholder="587"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                            type="checkbox"
                            checked={settings.smtp_secure === 'true'}
                            onChange={(e) => handleChange('smtp_secure', e.target.checked ? 'true' : 'false')}
                        />
                        Use SSL/TLS (port 465)
                    </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                        <label>SMTP Username / Email</label>
                        <input
                            type="text"
                            className="form-input"
                            value={settings.smtp_user}
                            onChange={(e) => handleChange('smtp_user', e.target.value)}
                            placeholder="you@gmail.com"
                        />
                    </div>
                    <div className="form-group">
                        <label>SMTP Password / App Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={settings.smtp_pass}
                            onChange={(e) => handleChange('smtp_pass', e.target.value)}
                            placeholder={passSet ? '••••••••  (already set)' : 'Enter password'}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>From Name</label>
                    <input
                        type="text"
                        className="form-input"
                        value={settings.smtp_from_name}
                        onChange={(e) => handleChange('smtp_from_name', e.target.value)}
                        placeholder="DriveEase"
                        style={{ maxWidth: 300 }}
                    />
                </div>

                <button type="submit" className="btn btn-accent" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Settings'}
                </button>
            </form>

            <div className="card">
                <h3 style={{ marginBottom: 16 }}>Send Test Email</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                    Save your settings first, then send a test email to verify everything works.
                </p>
                <div style={{ display: 'flex', gap: 12 }}>
                    <input
                        type="email"
                        className="form-input"
                        value={testEmail}
                        onChange={(e) => setTestEmail(e.target.value)}
                        placeholder="recipient@example.com"
                        style={{ flex: 1 }}
                    />
                    <button
                        type="button"
                        className="btn btn-accent"
                        onClick={handleTest}
                        disabled={testing || !testEmail}
                    >
                        {testing ? 'Sending...' : 'Send Test'}
                    </button>
                </div>
            </div>
        </>
    );
}
