import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const API_URL = import.meta.env.VITE_API_URL || '/api';
const BASE = API_URL.replace('/api', '');

function getCarImage(car) {
  if (car.image) return `${BASE}/uploads/${car.image}`;
  return `https://placehold.co/600x400/1a1a2e/e94560?text=${encodeURIComponent(car.name)}`;
}

export default function Home() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cars')
      .then(setCars)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <h1>Drive Your Dream Car Today</h1>
          <p>
            Premium vehicles at transparent prices. Pick up from anywhere, drop off
            when you're done. No hidden fees, no hassle.
          </p>
          <a href="#fleet" className="btn btn-accent">Browse Fleet</a>
        </div>
      </section>

      {/* Features */}
      <div className="container">
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">🚘</div>
            <h3>Modern Fleet</h3>
            <p>Latest models from top brands, meticulously maintained and always ready to go.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📍</div>
            <h3>Flexible Pickup</h3>
            <p>Nationwide locations for convenient pickup and drop-off wherever you need.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Transparent Pricing</h3>
            <p>No surprises. What you see is what you pay — all taxes and fees included.</p>
          </div>
        </div>
      </div>

      {/* Fleet */}
      <section id="fleet" className="container page">
        <div className="section-header">
          <h2>Our Fleet</h2>
          <p>Choose from our selection of premium vehicles</p>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : (
          <div className="car-grid">
            {cars.map((car) => (
              <div key={car.id} className="car-card">
                <img
                  className="car-card-img"
                  src={getCarImage(car)}
                  alt={car.name}
                />
                <div className="car-card-body">
                  <h3>{car.name}</h3>
                  <div className="car-card-price">${car.price} / day</div>
                  <Link to={`/cars/${car.id}`} className="btn btn-primary">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
            {cars.length === 0 && !loading && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', gridColumn: '1 / -1' }}>
                No cars available at the moment.
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}
