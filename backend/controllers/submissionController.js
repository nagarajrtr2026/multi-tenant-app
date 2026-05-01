const { pool } = require('../config/db');

const createSubmission = async (req, res) => {
  const { tenantId, user } = req;
  const { taskId, text_submission } = req.body;
  
  if (!taskId) {
    return res.status(400).json({ error: 'Task ID is required.' });
  }

  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const client = await pool.connect();
  try {
    // Verify task exists in the same org
    const taskResult = await client.query('SELECT * FROM tasks WHERE id = $1 AND org_id = $2', [taskId, tenantId]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found within this organization.' });
    }

    const result = await client.query(
      'INSERT INTO submissions (task_id, user_id, org_id, text_submission, file_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [taskId, user.id, tenantId, text_submission, fileUrl, 'submitted']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating submission:', error);
    res.status(500).json({ error: 'Server error creating submission.' });
  } finally {
    client.release();
  }
};

const getSubmissions = async (req, res) => {
  const { tenantId, user } = req;

  try {
    let result;
    if (user.role === 'admin') {
      result = await pool.query(`
        SELECT s.*, t.title as task_title, u.name as user_name 
        FROM submissions s
        JOIN tasks t ON s.task_id = t.id
        JOIN users u ON s.user_id = u.id
        WHERE s.org_id = $1
        ORDER BY s.created_at DESC
      `, [tenantId]);
    } else {
      result = await pool.query(`
        SELECT s.*, t.title as task_title 
        FROM submissions s
        JOIN tasks t ON s.task_id = t.id
        WHERE s.user_id = $1 AND s.org_id = $2
        ORDER BY s.created_at DESC
      `, [user.id, tenantId]);
    }
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Server error fetching submissions.' });
  }
};

const updateSubmissionStatus = async (req, res) => {
  const { tenantId, user } = req;
  const { id } = req.params;
  const { status, feedback } = req.body;

  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can evaluate submissions.' });
  }

  try {
    const subResult = await pool.query('SELECT id FROM submissions WHERE id = $1 AND org_id = $2', [id, tenantId]);
    if (subResult.rows.length === 0) {
      return res.status(404).json({ error: 'Submission not found.' });
    }

    const result = await pool.query(
      'UPDATE submissions SET status = $1, feedback = $2 WHERE id = $3 RETURNING *',
      [status, feedback, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({ error: 'Server error updating submission.' });
  }
};

module.exports = { createSubmission, getSubmissions, updateSubmissionStatus };
