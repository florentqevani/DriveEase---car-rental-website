# DriveEase — Car Rental App

Full-stack car rental application built with React, Express, PostgreSQL, and Docker.

## Features

- **Browse & Reserve** — View available cars, pick dates, and complete checkout with credit card, Apple Pay, or PayPal
- **User Accounts** — Register / login with email or Google OAuth, manage profile in Settings, delete account
- **My Reservations** — Users can view and cancel their own reservations
- **Email Invoices** — Automatic HTML invoice sent to the customer's email on booking (via SMTP/Nodemailer)
- **Admin Dashboard** — Manage cars (add/edit/delete), view all reservations (with cancel), manage users (with delete)
- **Unified Login** — Single floating login modal for both users and admins
- **Security** — JWT access/refresh token rotation, bcrypt hashing, Helmet, CORS whitelist, rate limiting, MIME-validated uploads

## Tech Stack

| Layer    | Technology                                    |
| -------- | --------------------------------------------- |
| Frontend | React 18, Vite, React Router 6               |
| Backend  | Express 4, Node.js 20                         |
| Database | PostgreSQL 16                                 |
| Auth     | JWT (access + refresh tokens), Google OAuth   |
| Email    | Nodemailer                                    |
| Infra    | Docker Compose (3 services), Nginx            |

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### 1. Clone & configure

```bash
git clone <repo-url> && cd Car_Rental
```

Copy or edit the `.env` file at the project root:

```env
POSTGRES_PASSWORD=Xk9mP2vL7wQr4tN8jF6hZcA
JWT_SECRET=<random-64-char-hex>

# Optional — Google OAuth
GOOGLE_CLIENT_ID=

# Optional — Email invoices
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
```

### 2. Build & run

```bash
docker compose up --build -d
```

### 3. Open

- **App**: [http://localhost:3000](http://localhost:3000)
- **API**: [http://localhost:4000/api/health](http://localhost:4000/api/health)

### Default Admin

| Field    | Value              |
| -------- | ------------------ |
| Email    | `admin@gmail.com`  |
| Password | `admin123`         |

Login from the main Login modal — admin is automatically redirected to the Dashboard.

## Project Structure

```
├── client/                # React + Vite frontend
│   ├── src/
│   │   ├── api/           # HTTP client with auto-refresh
│   │   ├── components/    # Navbar, Footer, LoginModal, ProtectedRoute
│   │   ├── context/       # AuthContext (JWT + Google OAuth)
│   │   └── pages/         # Home, CarDetails, Checkout, Confirmation,
│   │                      # MyReservations, Settings, admin/*
│   ├── Dockerfile         # Multi-stage: Vite build → Nginx
│   └── nginx.conf
├── server/                # Express API
│   ├── src/
│   │   ├── controllers/   # auth, car, reservation, user
│   │   ├── middleware/     # JWT auth, admin guard
│   │   ├── routes/        # REST endpoints
│   │   ├── services/      # emailService (Nodemailer)
│   │   └── config/        # PostgreSQL pool
│   └── Dockerfile
├── db/
│   └── init.sql           # Schema, indexes, seed data
├── docker-compose.yml
└── .env
```

## API Endpoints

| Method | Path                       | Auth    | Description                  |
| ------ | -------------------------- | ------- | ---------------------------- |
| POST   | `/api/auth/register`       | —       | Register user                |
| POST   | `/api/auth/login`          | —       | Login (user or admin)        |
| POST   | `/api/auth/google`         | —       | Google OAuth login           |
| POST   | `/api/auth/refresh`        | —       | Refresh access token         |
| POST   | `/api/auth/logout`         | —       | Revoke refresh token         |
| GET    | `/api/auth/me`             | User    | Get current profile          |
| PUT    | `/api/auth/me`             | User    | Update profile / password    |
| DELETE | `/api/auth/me`             | User    | Delete account               |
| GET    | `/api/cars`                | —       | List all cars                |
| GET    | `/api/cars/:id`            | —       | Car details                  |
| POST   | `/api/cars`                | Admin   | Add car (multipart/form)     |
| PUT    | `/api/cars/:id`            | Admin   | Update car (multipart/form)  |
| DELETE | `/api/cars/:id`            | Admin   | Delete car                   |
| GET    | `/api/reservations/mine`   | User    | User's reservations          |
| GET    | `/api/reservations`        | Admin   | All reservations             |
| GET    | `/api/reservations/:id`    | User    | Single reservation           |
| POST   | `/api/reservations`        | User    | Create reservation           |
| DELETE | `/api/reservations/:id`    | User    | Cancel own reservation       |
| DELETE | `/api/reservations/admin/:id` | Admin | Cancel any reservation      |
| GET    | `/api/users`               | Admin   | List users                   |
| DELETE | `/api/users/:id`           | Admin   | Delete user + reservations   |

## Rebuilding

```bash
# Full rebuild (resets DB)
docker compose down -v && docker compose up --build -d

# Rebuild server only (keeps DB)
docker compose up --build server -d

# Rebuild client only
docker compose up --build client -d
```
