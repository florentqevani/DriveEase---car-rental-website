const { Router } = require('express');
const multer = require('multer');
const { join, extname } = require('node:path');
const { randomUUID } = require('node:crypto');
const { getAllCars, getCarById, addCar, deleteCar, updateCar } = require('../controllers/carController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

const storage = multer.diskStorage({
  destination: join(__dirname, '..', '..', 'uploads'),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname);
    cb(null, `${randomUUID()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WebP and AVIF images are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', getAllCars);
router.get('/:id', getCarById);
router.post('/', authenticate, requireAdmin, upload.single('image'), addCar);
router.put('/:id', authenticate, requireAdmin, upload.single('image'), updateCar);
router.delete('/:id', authenticate, requireAdmin, deleteCar);

module.exports = router;
