const express = require('express');
const pool = require('../db');
const productCategories = express.Router();

productCategories.get('/',async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories');
    res.json(result.rows);
  } catch (err) {
    console.error('Error querying DB:', err);
    res.status(500).send('Internal Server Error');
  }
});

module.exports = productCategories;