import { useEffect, useState, useMemo, useCallback } from 'react';
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

function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

/* ── Mini Calendar Component ─────────────────────────────── */
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function MiniCalendar({ blockedDates, selectedStart, selectedEnd, onSelect, minDate }) {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const cells = useMemo(() => {
    const first = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0).getDate();
    let startDay = first.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const result = [];
    for (let i = 0; i < startDay; i++) result.push(null);
    for (let d = 1; d <= lastDay; d++) result.push(new Date(year, month, d));
    return result;
  }, [year, month]);

  function prev() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function next() {
    setViewDate(new Date(year, month + 1, 1));
  }

  const calStyle = {
    background: 'var(--color-bg-secondary)',
    borderRadius: 12,
    padding: 16,
    userSelect: 'none',
  };
  const headerStyle = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
  };
  const navBtn = {
    background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer',
    fontSize: 18, padding: '4px 8px', borderRadius: 6,
  };
  const gridStyle = {
    display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center',
  };
  const dayHeaderStyle = {
    fontSize: '0.75rem', color: 'var(--color-text-muted)', padding: '4px 0', fontWeight: 600,
  };

  return (
    <div style={calStyle}>
      <div style={headerStyle}>
        <button type="button" style={navBtn} onClick={prev}>‹</button>
        <strong style={{ fontSize: '0.95rem' }}>{monthName}</strong>
        <button type="button" style={navBtn} onClick={next}>›</button>
      </div>
      <div style={gridStyle}>
        {DAYS.map((d) => <div key={d} style={dayHeaderStyle}>{d}</div>)}
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const ds = toDateStr(date);
          const blocked = blockedDates.has(ds);
          const past = ds < minDate;
          const disabled = blocked || past;
          const isStart = ds === selectedStart;
          const isEnd = ds === selectedEnd;
          const inRange = selectedStart && selectedEnd && ds > selectedStart && ds < selectedEnd;

          let bg = 'transparent';
          let color = 'var(--color-text)';
          let fontWeight = 'normal';
          let cursor = 'pointer';
          let opacity = 1;
          let border = '2px solid transparent';

          if (blocked) {
            bg = 'rgba(239, 68, 68, 0.15)';
            color = '#ef4444';
            fontWeight = '700';
            cursor = 'not-allowed';
          } else if (past) {
            opacity = 0.3;
            cursor = 'default';
          } else if (isStart || isEnd) {
            bg = '#6366f1';
            color = '#fff';
            fontWeight = '600';
          } else if (inRange) {
            bg = 'rgba(99, 102, 241, 0.15)';
            color = '#6366f1';
            fontWeight = '500';
          }

          return (
            <button
              type="button"
              key={ds}
              disabled={disabled}
              onClick={() => !disabled && onSelect(ds)}
              style={{
                width: '100%',
                aspectRatio: '1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: bg,
                color,
                fontWeight,
                cursor,
                opacity,
                border,
                fontSize: '0.85rem',
                transition: 'all 0.15s',
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          Booked
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6366f1', display: 'inline-block' }} />
          Selected
        </span>
      </div>
    </div>
  );
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
  }

  function handleReturnChange(val) {
    setReturnDate(val);
    setDateError('');
    if (pickupDate && hasOverlap(pickupDate, val)) {
      setDateError('Your selected range overlaps with an existing reservation');
      setReturnDate('');
    }
  }

  const handleCalendarSelect = useCallback((dateStr) => {
    setDateError('');
    if (!pickupDate || (pickupDate && returnDate)) {
      // Start new selection
      setPickupDate(dateStr);
      setReturnDate('');
    } else {
      // Selecting return date
      if (dateStr <= pickupDate) {
        // Clicked before pickup — restart
        setPickupDate(dateStr);
        setReturnDate('');
      } else {
        if (hasOverlap(pickupDate, dateStr)) {
          setDateError('Your selected range overlaps with an existing reservation');
        } else {
          setReturnDate(dateStr);
        }
      }
    }
  }, [pickupDate, returnDate, bookedRanges]);

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
              {dateError && <div className="alert alert-error">{dateError}</div>}

              <MiniCalendar
                blockedDates={blockedDates}
                selectedStart={pickupDate}
                selectedEnd={returnDate}
                onSelect={handleCalendarSelect}
                minDate={today}
              />

              <div style={{ display: 'flex', gap: 12, margin: '16px 0' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>Pickup</label>
                  <div className="form-input" style={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
                    {pickupDate || <span style={{ color: 'var(--color-text-muted)' }}>Select date</span>}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 4, display: 'block' }}>Return</label>
                  <div className="form-input" style={{ minHeight: 40, display: 'flex', alignItems: 'center' }}>
                    {returnDate || <span style={{ color: 'var(--color-text-muted)' }}>Select date</span>}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-accent"
                style={{ width: '100%' }}
                disabled={!pickupDate || !returnDate}
              >
                Proceed to Checkout
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
