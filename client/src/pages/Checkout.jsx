import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + ' / ' + digits.slice(2);
  return digits;
}

export default function Checkout() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const pickupDate = searchParams.get('pickup');
  const returnDate = searchParams.get('return');

  const { user } = useAuth();
  const [car, setCar] = useState(null);
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Payment
  const [payMethod, setPayMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');

  useEffect(() => {
    if (!pickupDate || !returnDate) {
      navigate(`/cars/${id}`);
      return;
    }
    api.get(`/cars/${id}`).then(setCar).catch(() => navigate('/'));
  }, [id, pickupDate, returnDate, navigate]);

  if (!car) return <div className="spinner" />;

  const days = Math.max(1, Math.ceil(
    (new Date(returnDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24)
  ));
  const total = (days * parseFloat(car.price)).toFixed(2);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const reservation = await api.post('/reservations', {
        car_id: car.id,
        pickup_date: pickupDate,
        return_date: returnDate,
        customer_name: name,
        customer_email: email,
      });
      navigate(`/confirmation/${reservation.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container page">
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24 }}>Checkout</h1>

        <div className="checkout-summary">
          <h3>{car.name}</h3>
          <div className="summary-row">
            <span>Pickup</span>
            <span>{pickupDate}</span>
          </div>
          <div className="summary-row">
            <span>Return</span>
            <span>{returnDate}</span>
          </div>
          <div className="summary-row">
            <span>Duration</span>
            <span>{days} day{days !== 1 ? 's' : ''}</span>
          </div>
          <div className="summary-row">
            <span>Rate</span>
            <span>${car.price} / day</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${total}</span>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="card" onSubmit={handleSubmit}>
          <h3 style={{ marginBottom: 20 }}>Your Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Payment Method */}
          <h3 style={{ marginBottom: 16, marginTop: 8 }}>Payment Method</h3>
          <div className="pay-methods">
            <button type="button" className={`pay-method-btn ${payMethod === 'card' ? 'active' : ''}`} onClick={() => setPayMethod('card')}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              Credit Card
            </button>
            <button type="button" className={`pay-method-btn ${payMethod === 'applepay' ? 'active' : ''}`} onClick={() => setPayMethod('applepay')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              Apple Pay
            </button>
            <button type="button" className={`pay-method-btn ${payMethod === 'paypal' ? 'active' : ''}`} onClick={() => setPayMethod('paypal')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.56a.641.641 0 0 1 .632-.537h6.012c2.656 0 4.56.957 5.2 3.13.18.61.24 1.276.156 2.012-.5 4.122-3.322 5.429-6.603 5.429H8.677a.79.79 0 0 0-.78.667l-.82 5.098v.001zM19.486 8.14c-.562 3.647-3.37 5.096-6.71 5.096H11.36a.79.79 0 0 0-.781.667L9.66 19.92a.476.476 0 0 0 .47.553h3.3a.641.641 0 0 0 .633-.543l.547-3.468a.79.79 0 0 1 .78-.667h.491c3.126 0 5.572-1.27 6.287-4.94.3-1.534.144-2.815-.683-3.716z"/></svg>
              PayPal
            </button>
          </div>

          {/* Credit Card Fields */}
          {payMethod === 'card' && (
            <div className="pay-panel">
              <div className="form-group">
                <label>Card Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  inputMode="numeric"
                  required
                />
              </div>
              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Name on card"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label>Expiry</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="MM / YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                    maxLength={7}
                    inputMode="numeric"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>CVC</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="123"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Apple Pay */}
          {payMethod === 'applepay' && (
            <div className="pay-panel pay-panel-centered">
              <div className="pay-brand-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="var(--color-text)"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
                Click the button below to complete payment with Apple Pay.
              </p>
              <p className="pay-note">You will be redirected to Apple Pay to authorize the payment of <strong>${total}</strong>.</p>
            </div>
          )}

          {/* PayPal */}
          {payMethod === 'paypal' && (
            <div className="pay-panel pay-panel-centered">
              <div className="pay-brand-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="#003087"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.56a.641.641 0 0 1 .632-.537h6.012c2.656 0 4.56.957 5.2 3.13.18.61.24 1.276.156 2.012-.5 4.122-3.322 5.429-6.603 5.429H8.677a.79.79 0 0 0-.78.667l-.82 5.098v.001zM19.486 8.14c-.562 3.647-3.37 5.096-6.71 5.096H11.36a.79.79 0 0 0-.781.667L9.66 19.92a.476.476 0 0 0 .47.553h3.3a.641.641 0 0 0 .633-.543l.547-3.468a.79.79 0 0 1 .78-.667h.491c3.126 0 5.572-1.27 6.287-4.94.3-1.534.144-2.815-.683-3.716z"/></svg>
              </div>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
                Click the button below to complete payment with PayPal.
              </p>
              <p className="pay-note">You will be redirected to PayPal to authorize the payment of <strong>${total}</strong>.</p>
            </div>
          )}

          <button
            type="submit"
            className={`btn ${payMethod === 'applepay' ? 'btn-apple-pay' : payMethod === 'paypal' ? 'btn-paypal' : 'btn-accent'}`}
            style={{ width: '100%', marginTop: 4 }}
            disabled={submitting}
          >
            {submitting
              ? 'Processing...'
              : payMethod === 'applepay'
                ? `Pay with Apple Pay — $${total}`
                : payMethod === 'paypal'
                  ? `Pay with PayPal — $${total}`
                  : `Confirm & Pay $${total}`}
          </button>
        </form>
      </div>
    </div>
  );
}
