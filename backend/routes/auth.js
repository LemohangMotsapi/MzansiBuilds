const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); 

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Secure by Design: Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 2. Save the user to the Supabase database
    const newUser = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, created_at',
      [username, email, passwordHash]
    );

    // 3. Generate the JSON Web Token (JWT)
    const token = jwt.sign(
      { id: newUser.rows[0].id }, 
      process.env.JWT_SECRET || 'mzansi_super_secret', 
      { expiresIn: '1h' }
    );

    // 4. Send the successful response (This is exactly what our test is looking for!)
    res.status(201).json({
      token: token,
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server Error. User may already exist.' });
  }
});

module.exports = router;