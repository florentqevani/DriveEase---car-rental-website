import { useEffect, useState } from 'react';
import api from '../../api/client';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE = API_URL.replace('/api', '');

export default function ManageCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  function loadCars() {
    api.get('/cars')
      .then(setCars)
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(loadCars, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    if (image) formData.append('image', image);

    try {
      await api.post('/cars', formData);
      setMessage({ type: 'success', text: 'Car added successfully!' });
      setName('');
      setDescription('');
      setPrice('');
      setImage(null);
      loadCars();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(carId) {
    if (!confirm('Delete this car?')) return;
    try {
      await api.delete(`/cars/${carId}`);
      setCars((prev) => prev.filter((c) => c.id !== carId));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <>
      <h2 style={{ marginBottom: 24 }}>Manage Cars</h2>

      {/* Add Car Form */}
      <div className="card" style={{ marginBottom: 32 }}>
        <h3 style={{ marginBottom: 20 }}>Add New Car</h3>

        {message.text && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Name</label>
              <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Price per Day ($)</label>
              <input type="number" className="form-input" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-input" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Image</label>
            <input type="file" className="form-input" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
          </div>
          <button type="submit" className="btn btn-accent" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Car'}
          </button>
        </form>
      </div>

      {/* Car List */}
      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price/Day</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car) => (
                <tr key={car.id}>
                  <td>
                    {car.image ? (
                      <img
                        src={`${BASE}/uploads/${car.image}`}
                        alt={car.name}
                        style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }}
                      />
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 500 }}>{car.name}</td>
                  <td>${car.price}</td>
                  <td>
                    <button className="btn btn-ghost" onClick={() => handleDelete(car.id)} style={{ color: 'var(--color-error)' }}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
