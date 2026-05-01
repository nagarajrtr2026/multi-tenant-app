const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const register = async (req, res) => {
  const { orgName, userName, email, password } = req.body;
  if (!orgName || !userName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Check if user already exists
    const userExist = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    // Create Organization
    const orgResult = await client.query(
      'INSERT INTO organizations (name) VALUES ($1) RETURNING id, name',
      [orgName]
    );
    const orgId = orgResult.rows[0].id;
    const createdOrgName = orgResult.rows[0].name;

    // Hash password & Create first user as Admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userResult = await client.query(
      'INSERT INTO users (org_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, org_id, name, email, role',
      [orgId, userName, email, hashedPassword, 'admin']
    );

    await client.query('COMMIT');
    
    const user = userResult.rows[0];
    const payload = { id: user.id, name: user.name, org_id: user.org_id, org_name: createdOrgName, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.status(201).json({ message: 'Registration successful', token, user: { ...user, org_name: createdOrgName } });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const userResult = await pool.query(`
      SELECT u.*, o.name as org_name 
      FROM users u 
      JOIN organizations o ON u.org_id = o.id 
      WHERE u.email = $1
    `, [email]);
    
    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials.' });
    }

    const payload = { id: user.id, name: user.name, org_id: user.org_id, org_name: user.org_name, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, org_id: user.org_id, org_name: user.org_name, name: user.name, role: user.role, email: user.email }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = { register, login };
