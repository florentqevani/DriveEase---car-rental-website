-- Car Rental PostgreSQL Schema

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE cars (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image VARCHAR(255)
);

CREATE TABLE reservations (
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

CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id INT,
    admin_id INT,
    role VARCHAR(10) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_reservations_car_id ON reservations(car_id);
CREATE INDEX idx_reservations_user_id ON reservations(user_id);

-- Seed admin (password: admin123 — hashed with bcrypt)
INSERT INTO admins (username, email, password)
VALUES ('admin', 'admin@gmail.com', '$2b$10$GoySzXSzn7dd0OWSAoGs8upUQGA7e43zaoRx1agALneKSqPYFMW2O');

-- Seed sample cars
INSERT INTO cars (name, description, price, image) VALUES
('Audi A6', 'Luxury sedan with premium interior and advanced tech features.', 89.99, 'audi.avif'),
('BMW 5 Series', 'The ultimate driving machine with sport-tuned suspension.', 99.99, 'bmw.avif'),
('Mercedes G-Wagon', 'Iconic SUV combining luxury with off-road capability.', 149.99, 'g-wagon.avif');
