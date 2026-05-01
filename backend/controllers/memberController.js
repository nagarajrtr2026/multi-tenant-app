const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const addMember = async (req, res) => {
  const { tenantId, user } = req;
  const { userName, email, password } = req.body;

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can add members.' });
  }

  if (!userName || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const client = await pool.connect();
  try {
    const userExist = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists with this email.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userResult = await client.query(
      'INSERT INTO users (org_id, name, email, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, org_id, name, email, role',
      [tenantId, userName, email, hashedPassword, 'member']
    );

    res.status(201).json({ message: 'Member added successfully', member: userResult.rows[0] });
  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ error: 'Internal server error.' });
  } finally {
    client.release();
  }
};

const getMembers = async (req, res) => {
  const { tenantId, user } = req;
  
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can view members list.' });
  }

  try {
    const result = await pool.query(
      'SELECT id, name, email, role, created_at FROM users WHERE org_id = $1 ORDER BY created_at DESC', 
      [tenantId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ error: 'Server error fetching members.' });
  }
};

module.exports = { addMember, getMembers };
