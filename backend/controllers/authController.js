import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/connection.js';

const login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', email); 
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log('Wrong password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful:', email, '| Role:', user.role);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Database error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

const register = async (req, res) => {
  const { name, email, password, role } = req.body;
  console.log('Register attempt:', email);
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role || 'client']
    );

    console.log('User registered:', email, '| ID:', result.insertId, '| Role:', role || 'client');
    res.status(201).json({ message: 'User created', userId: result.insertId });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export { login, register };