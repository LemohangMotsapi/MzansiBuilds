const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Secure by Design: Hash the password before it ever touches the database
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        { username: username, email: email, password_hash: passwordHash }
      ])
      .select('id, username, email, created_at')
      .single(); 

    if (error) {
      console.error("Supabase Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    // 4. Generate the JSON Web Token (JWT)
    const token = jwt.sign(
      { id: newUser.id }, 
      process.env.JWT_SECRET || 'mzansi_super_secret', 
      { expiresIn: '1h' }
    );

    res.status(201).json({
      token: token,
      user: newUser 
    });

  } catch (err) {
    // 6. Catch any other unexpected server crashes
    console.error("Unexpected Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;