import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';

export default function Confirmation() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);

  useEffect(() => {
    api.get(`/reservations/${id}`).then(setReservation).catch(console.error);
  }, [id]);

  if (!reservation) return <div className="spinner" />;

  return (
    <div className="container page">
      <div className="confirmation-card card">
        <div className="confirmation-icon">✓</div>
        <h1 style={{ marginBottom: 8 }}>Reservation Confirmed!</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 32 }}>
          Reservation #{reservation.id} has been booked successfully.
        </p>

        <div className="checkout-summary" style={{ textAlign: 'left' }}>
          <h3>{reservation.car_name}</h3>
          <div className="summary-row">
            <span>Customer</span>
            <span>{reservation.customer_name}</span>
          </div>
          <div className="summary-row">
            <span>Email</span>
            <span>{reservation.customer_email}</span>
          </div>
          <div className="summary-row">
            <span>Pickup</span>
            <span>{reservation.pickup_date?.split('T')[0]}</span>
          </div>
          <div className="summary-row">
            <span>Return</span>
            <span>{reservation.return_date?.split('T')[0]}</span>
          </div>
          <div className="summary-row total">
            <span>Total Paid</span>
            <span>${reservation.total_price}</span>
          </div>
        </div>

        <Link to="/" className="btn btn-primary" style={{ marginTop: 24 }}>
          Back to Home
        </Link>
      </div>
    </div>
  );
}
