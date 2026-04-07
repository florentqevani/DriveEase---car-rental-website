import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE = API_URL.replace('/api', '');

function getDatesInRange(start, end) {
  const dates = [];
  const d = new Date(start);
  const last = new Date(end);
  while (d < last) {
    dates.push(d.toISOString().split('T')[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();
  const [car, setCar] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [bookedRanges, setBookedRanges] = useState([]);
  const [dateError, setDateError] = useState('');

  // Admin edit state
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editImage, setEditImage] = useState(null);
  const [editMsg, setEditMsg] = useState('');
  const [editErr, setEditErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get(`/cars/${id}`).then((data) => {
      setCar(data);
      setEditName(data.name);
      setEditDesc(data.description || '');
      setEditPrice(data.price);
    }).catch(() => navigate('/'));
    api.get(`/reservations/booked/${id}`).then(setBookedRanges).catch(() => { });
  }, [id, navigate]);

  const blockedDates = useMemo(() => {
    const set = new Set();
    for (const r of bookedRanges) {
      for (const d of getDatesInRange(r.pickup_date, r.return_date)) {
        set.add(d);
      }
    }
    return set;
  }, [bookedRanges]);

  function isDateBlocked(dateStr) {
    return blockedDates.has(dateStr);
  }

  function hasOverlap(pickup, returnD) {
    if (!pickup || !returnD) return false;
    return bookedRanges.some(
      (r) => pickup < r.return_date.split('T')[0] && returnD > r.pickup_date.split('T')[0]
    );
  }

  function handlePickupChange(val) {
    setPickupDate(val);
    setDateError('');
    if (returnDate && val >= returnDate) setReturnDate('');
    if (isDateBlocked(val)) {
      setDateError('This date is already booked');
      setPickupDate('');
    }
  }

  function handleReturnChange(val) {
    setReturnDate(val);
    setDateError('');
    if (isDateBlocked(val)) {
      setDateError('This date is already booked');
      setReturnDate('');
      return;
    }
    if (pickupDate && hasOverlap(pickupDate, val)) {
      setDateError('Your selected range overlaps with an existing reservation');
      setReturnDate('');
    }
  }

  if (!car) return <div className="spinner" />;

  const isAdmin = user?.role === 'admin';

  const imageSrc = car.image
    ? `${BASE}/uploads/${car.image}`
    : `https://placehold.co/600x400/1a1a2e/e94560?text=${encodeURIComponent(car.name)}`;

  const today = new Date().toISOString().split('T')[0];

  function handleSubmit(e) {
    e.preventDefault();
    if (!pickupDate || !returnDate) return;
    const target = `/checkout/${car.id}?pickup=${pickupDate}&return=${returnDate}`;
    if (!user) {
      openLogin(target);
      return;
    }
    navigate(target);
  }

  async function handleEditSubmit(e) {
    e.preventDefault();
    setEditMsg('');
    setEditErr('');
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('description', editDesc);
      formData.append('price', editPrice);
      if (editImage) formData.append('image', editImage);

      const updated = await api.put(`/cars/${car.id}`, formData);
      setCar(updated);
      setEditImage(null);
      setEditMsg('Car updated successfully');
      setTimeout(() => setEditMsg(''), 3000);
    } catch (err) {
      setEditErr(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container page">
      <div className="detail-grid">
        <img className="detail-img" src={imageSrc} alt={car.name} />
        <div className="detail-info">
          <h1>{car.name}</h1>
          <div className="detail-price">${car.price} / day</div>
          <p className="detail-desc">
            {car.description || 'Experience the thrill of driving this premium vehicle. Fully insured and maintained to the highest standards.'}
          </p>

          {isAdmin ? (
            <form onSubmit={handleEditSubmit}>
              <h3 style={{ marginBottom: 16 }}>Edit Car Details</h3>
              {editMsg && <div className="alert alert-success">{editMsg}</div>}
              {editErr && <div className="alert alert-error">{editErr}</div>}
              <div className="form-group">
                <label>Name</label>
                <input type="text" className="form-input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows={3} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Price per Day ($)</label>
                <input type="number" step="0.01" min="0" className="form-input" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Replace Image</label>
                <input type="file" className="form-input" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(e) => setEditImage(e.target.files[0])} />
              </div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%' }} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit}>
              {bookedRanges.length > 0 && (
                <div style={{
                  background: 'var(--color-bg-secondary)',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 16,
                  fontSize: '0.85rem',
                }}>
                  <strong style={{ display: 'block', marginBottom: 6 }}>Unavailable dates:</strong>
                  {bookedRanges.map((r, i) => (
                    <div key={i} style={{ color: 'var(--color-error)', padding: '2px 0' }}>
                      {new Date(r.pickup_date).toLocaleDateString()} — {new Date(r.return_date).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              )}

              {dateError && <div className="alert alert-error">{dateError}</div>}

              <div className="form-group">
                <label>Pickup Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => handlePickupChange(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Return Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={pickupDate || today}
                  value={returnDate}
                  onChange={(e) => handleReturnChange(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-accent" style={{ width: '100%' }}>
                Proceed to Checkout
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
