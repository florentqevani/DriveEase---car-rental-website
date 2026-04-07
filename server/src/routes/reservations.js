const express = require('express');
const { getMyReservations, getAllReservations, getReservationById, createReservation, cancelReservation, adminCancelReservation, getBookedDates } = require('../controllers/reservationController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/booked/:carId', getBookedDates);
router.get('/mine', authenticate, getMyReservations);
router.get('/', authenticate, requireAdmin, getAllReservations);
router.get('/:id', authenticate, getReservationById);
router.post('/', authenticate, createReservation);
router.delete('/:id', authenticate, cancelReservation);
router.delete('/admin/:id', authenticate, requireAdmin, adminCancelReservation);

module.exports = router;
