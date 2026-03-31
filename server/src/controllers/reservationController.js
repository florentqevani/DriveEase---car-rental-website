const { query } = require('../config/db').default;
const { sendInvoiceEmail } = require('../services/emailService');

async function getMyReservations(req, res) {
  try {
    const result = await query(
      `SELECT r.*, c.name AS car_name, c.image AS car_image
       FROM reservations r
       LEFT JOIN cars c ON r.car_id = c.id
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get my reservations error:', err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
}

async function getAllReservations(_req, res) {
  try {
    const result = await query(`
      SELECT r.*, c.name AS car_name, c.image AS car_image
      FROM reservations r
      LEFT JOIN cars c ON r.car_id = c.id
      ORDER BY r.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Get reservations error:', err);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
}

async function getReservationById(req, res) {
  try {
    const result = await query(
      `SELECT r.*, c.name AS car_name, c.image AS car_image, c.price AS car_price
       FROM reservations r
       LEFT JOIN cars c ON r.car_id = c.id
       WHERE r.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get reservation error:', err);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
}

async function createReservation(req, res) {
  const { car_id, pickup_date, return_date, customer_name, customer_email } = req.body;
  const user_id = req.user?.id || null;

  if (!car_id || !pickup_date || !return_date || !customer_name || !customer_email) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Calculate total price server-side
    const carResult = await query('SELECT price FROM cars WHERE id = $1', [car_id]);
    if (carResult.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }

    const pricePerDay = parseFloat(carResult.rows[0].price);
    const pickup = new Date(pickup_date);
    const returnD = new Date(return_date);
    const days = Math.max(1, Math.ceil((returnD - pickup) / (1000 * 60 * 60 * 24)));
    const total_price = (days * pricePerDay).toFixed(2);

    const result = await query(
      `INSERT INTO reservations (car_id, user_id, pickup_date, return_date, customer_name, customer_email, total_price)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [car_id, user_id, pickup_date, return_date, customer_name, customer_email, total_price]
    );

    const reservation = result.rows[0];

    // Fetch car name for the invoice email
    const carInfo = await query('SELECT name FROM cars WHERE id = $1', [car_id]);
    const carName = carInfo.rows[0]?.name || 'Vehicle';

    // Send invoice email (fire-and-forget, don't block response)
    sendInvoiceEmail({
      to: customer_email,
      customerName: customer_name,
      carName,
      pickupDate: pickup_date,
      returnDate: return_date,
      days,
      pricePerDay,
      totalPrice: total_price,
      reservationId: reservation.id,
    }).catch(err => console.error('Invoice email error:', err));

    res.status(201).json(reservation);
  } catch (err) {
    console.error('Create reservation error:', err);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
}

async function cancelReservation(req, res) {
  try {
    const result = await query(
      'DELETE FROM reservations WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ message: 'Reservation cancelled' });
  } catch (err) {
    console.error('Cancel reservation error:', err);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
}

async function adminCancelReservation(req, res) {
  try {
    const result = await query('DELETE FROM reservations WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    res.json({ message: 'Reservation cancelled' });
  } catch (err) {
    console.error('Admin cancel reservation error:', err);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
}

module.exports = { getMyReservations, getAllReservations, getReservationById, createReservation, cancelReservation, adminCancelReservation };
