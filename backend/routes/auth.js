const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //Hash the password before it ever touches the database
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

    // Generate the JSON Web Token (JWT)
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
    //Catch any other unexpected server crashes
    console.error("Unexpected Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();


    if (error || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id }, 
      process.env.JWT_SECRET || 'mzansi_super_secret', 
      { expiresIn: '1h' }
    );

    delete user.password_hash;

    res.status(200).json({
      token: token,
      user: user
    });

  } catch (err) {
    console.error("Login Server Error:", err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router;