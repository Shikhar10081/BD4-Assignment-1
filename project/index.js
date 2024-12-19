const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
let cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());

let db;
(async () => {
  try {
    db = await open({
      filename: path.resolve(__dirname, './database.sqlite'),
      driver: sqlite3.Database,
    });
    console.log('Database connection established.');
  } catch (error) {
    console.error('Failed to connect to the database:', error.message);
  }
})();

/// functions //////////////////
async function fetchAllResto() {
  let query = 'SELECT * FROM restaurants';
  let result = db.all(query);
  return result;
}

app.get('/restaurants', async (req, res) => {
  try {
    let result = await fetchAllResto();
    if (!result || result.length === 0) {
      return res.status(404).json({ message: 'No restaurants found' });
    }
    res.status(200).json({ restaurants: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function GetRestaurantbyID(id) {
  const query = 'SELECT * FROM restaurants WHERE id = ?';
  const result = await db.get(query, [id]);
  return result;
}

app.get('/restaurants/details/:id', async (req, res) => {
  let id = parseInt(req.params.id);
  try {
    let result = await GetRestaurantbyID(id);
    if (!result) {
      return res.status(404).json({ message: 'No restaurant found' });
    }
    res.status(200).json({ restaurant: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  const { cuisine } = req.params;
  try {
    const query = 'SELECT * FROM restaurants WHERE cuisine = ?';
    const result = await db.all(query, [cuisine]);
    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ message: 'No restaurants found for this cuisine' });
    }
    res.status(200).json({ restaurants: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function GetRestaurantFilter(isVeg, hasOutdoorSeating, isLuxury) {
  const query =
    'SELECT * FROM restaurants WHERE isVeg = ? AND hasOutdoorSeating = ? AND isLuxury =? ';
  const result = await db.all(query, [isVeg, hasOutdoorSeating, isLuxury]);
  return result;
}
app.get('/restaurants/filter', async (req, res) => {
  const isVeg = req.query.isVeg.toString();
  const hasOutdoorSeating = req.query.hasOutdoorSeating.toString();
  const isLuxury = req.query.isLuxury.toString();

  try {
    let result = await GetRestaurantFilter(isVeg, hasOutdoorSeating, isLuxury);
    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ message: 'No restaurants match the given filters' });
    }
    res.status(200).json({ restaurants: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    const query = 'SELECT * FROM restaurants ORDER BY rating DESC';
    const result = await db.all(query);
    res.status(200).json({ restaurants: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/dishes', async (req, res) => {
  try {
    const query = 'SELECT * FROM dishes';
    const result = await db.all(query);
    res.status(200).json({ dishes: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/dishes/details/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: 'Invalid dish ID' });
  }
  try {
    const query = 'SELECT * FROM dishes WHERE id = ?';
    const result = await db.get(query, [id]);
    if (!result) {
      return res.status(404).json({ message: 'Dish not found' });
    }
    res.status(200).json({ dish: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/dishes/filter', async (req, res) => {
  const { isVeg } = req.query;
  try {
    const query = 'SELECT * FROM dishes WHERE ? IS NULL OR isVeg = ?';
    const result = await db.all(query, [isVeg, isVeg]);
    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ message: 'No dishes match the given filter' });
    }
    res.status(200).json({ dishes: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/dishes/sort-by-price', async (req, res) => {
  try {
    const query = 'SELECT * FROM dishes ORDER BY price ASC';
    const result = await db.all(query);
    res.status(200).json({ dishes: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
