const db = require('../config/db').default;

async function getAllCars(_req, res) {
  try {
    const result = await db.query('SELECT * FROM cars ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Get cars error:', err);
    res.status(500).json({ error: 'Failed to fetch cars' });
  }
}

async function getCarById(req, res) {
  try {
    const result = await db.query('SELECT * FROM cars WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Get car error:', err);
    res.status(500).json({ error: 'Failed to fetch car' });
  }
}

async function addCar(req, res) {
  const { name, description, price } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  try {
    const result = await db.query(
      'INSERT INTO cars (name, description, price, image) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description || null, price, image]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Add car error:', err);
    res.status(500).json({ error: 'Failed to add car' });
  }
}

async function deleteCar(req, res) {
  try {
    const result = await db.query('DELETE FROM cars WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json({ message: 'Car deleted' });
  } catch (err) {
    console.error('Delete car error:', err);
    res.status(500).json({ error: 'Failed to delete car' });
  }
}

async function updateCar(req, res) {
  const { name, description, price } = req.body;
  const image = req.file ? req.file.filename : undefined;

  if (!name || !price) {
    return res.status(400).json({ error: 'Name and price are required' });
  }

  try {
    const updates = ['name = $1', 'description = $2', 'price = $3'];
    const values = [name, description || null, price];

    if (image) {
      updates.push(`image = $${values.length + 1}`);
      values.push(image);
    }

    values.push(req.params.id);
    const result = await db.query(
      `UPDATE cars SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Update car error:', err);
    res.status(500).json({ error: 'Failed to update car' });
  }
}

module.exports = { getAllCars, getCarById, addCar, deleteCar, updateCar };
