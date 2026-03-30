import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reservations/mine')
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className="container page">
      <h1 style={{ marginBottom: 24 }}>My Reservations</h1>

      {reservations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
            You haven't made any reservations yet.
          </p>
          <Link to="/" className="btn btn-accent">Browse Cars</Link>
        </div>
      ) : (
        <div className="reservations-grid">
          {reservations.map((r) => {
            const pickup = r.pickup_date?.split('T')[0];
            const returnD = r.return_date?.split('T')[0];
            return (
              <div className="reservation-card card" key={r.id}>
                {r.car_image && (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/uploads/${r.car_image}`}
                    alt={r.car_name}
                    className="reservation-card-img"
                  />
                )}
                <div className="reservation-card-body">
                  <div className="reservation-card-header">
                    <h3>{r.car_name || 'Vehicle'}</h3>
                    <span className="reservation-id">#{r.id}</span>
                  </div>
                  <div className="reservation-dates">
                    <div>
                      <span className="reservation-label">Pickup</span>
                      <span>{pickup}</span>
                    </div>
                    <div className="reservation-arrow">→</div>
                    <div>
                      <span className="reservation-label">Return</span>
                      <span>{returnD}</span>
                    </div>
                  </div>
                  <div className="reservation-footer">
                    <span className="reservation-total">${r.total_price}</span>
                    <span className="reservation-booked">
                      Booked {new Date(r.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="btn"
                    style={{ width: '100%', marginTop: 12, background: 'var(--color-error)', color: '#fff' }}
                    onClick={async () => {
                      if (!window.confirm('Cancel this reservation?')) return;
                      try {
                        await api.delete(`/reservations/${r.id}`);
                        setReservations((prev) => prev.filter((res) => res.id !== r.id));
                      } catch (err) {
                        alert(err.message);
                      }
                    }}
                  >
                    Cancel Reservation
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
