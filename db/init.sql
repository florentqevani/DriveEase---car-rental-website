-- Car Rental PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS cars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image VARCHAR(255),
    image_data BYTEA,
    image_type VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    car_id INT REFERENCES cars(id) ON DELETE SET NULL,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id INT,
    admin_id INT,
    role VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pending_users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_pending_users_email ON pending_users(email);
CREATE INDEX IF NOT EXISTS idx_reservations_car_id ON reservations(car_id);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_cars_name ON cars(name);

-- Add image persistence columns (idempotent for existing DBs)
DO $$ BEGIN
  ALTER TABLE cars ADD COLUMN image_data BYTEA;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE cars ADD COLUMN image_type VARCHAR(50);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Seed admin (password: admin123 — hashed with bcrypt)
INSERT INTO admins (username, email, password)
VALUES ('admin', 'admin@gmail.com', '$2b$10$GoySzXSzn7dd0OWSAoGs8upUQGA7e43zaoRx1agALneKSqPYFMW2O')
ON CONFLICT (username) DO NOTHING;

-- Seed sample cars
INSERT INTO cars (name, description, price, image) VALUES
('Audi A6', 'Luxury sedan with premium interior and advanced tech features.', 89.99, 'audi.avif'),
('BMW 5 Series', 'The ultimate driving machine with sport-tuned suspension.', 99.99, 'bmw.avif'),
('Mercedes G-Wagon', 'Iconic SUV combining luxury with off-road capability.', 149.99, 'g-wagon.avif')
ON CONFLICT (name) DO NOTHING;
