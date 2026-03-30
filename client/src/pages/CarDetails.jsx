import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE = API_URL.replace('/api', '');

export default function CarDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, openLogin } = useAuth();
  const [car, setCar] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

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
  }, [id, navigate]);

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
              <div className="form-group">
                <label>Pickup Date</label>
                <input
                  type="date"
                  className="form-input"
                  min={today}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
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
                  onChange={(e) => setReturnDate(e.target.value)}
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
