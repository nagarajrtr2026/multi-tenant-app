const { pool } = require('../config/db');

// Helper to log audit actions
const logAudit = async (client, orgId, userId, action, targetType, targetId, details) => {
  await client.query(
    'INSERT INTO audit_logs (org_id, user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
    [orgId, userId, action, targetType, targetId, JSON.stringify(details)]
  );
};

const getTasks = async (req, res) => {
  const { tenantId, user } = req;
  const { role, id } = user;

  try {
    // Both Admins and Members see all tasks within their organization
    const result = await pool.query('SELECT * FROM tasks WHERE org_id = $1 ORDER BY created_at DESC', [tenantId]);
    const tasks = result.rows;
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Server error fetching tasks.' });
  }
};

const createTask = async (req, res) => {
  const { tenantId, user } = req;
  const { title, description, status } = req.body;
  const assignedUserId = req.body.user_id || user.id; // Allow admin to assign to others if needed, else self

  if (!title) {
    return res.status(400).json({ error: 'Title is required.' });
  }

  const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO tasks (org_id, user_id, title, description, file_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [tenantId, assignedUserId, title, description, fileUrl, status || 'pending']
    );
    const newTask = result.rows[0];

    await logAudit(client, tenantId, user.id, 'CREATE_TASK', 'TASK', newTask.id, newTask);
    await client.query('COMMIT');
    
    console.log('Task successfully created:', newTask);
    res.status(201).json({ success: true, task: newTask });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Server error creating task.' });
  } finally {
    client.release();
  }
};

const updateTask = async (req, res) => {
  const { tenantId, user } = req;
  const taskId = req.params.id;
  const { title, description, status } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Fetch the task to ensure it belongs to the tenant and check permissions
    const taskResult = await client.query('SELECT * FROM tasks WHERE id = $1 AND org_id = $2', [taskId, tenantId]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    const task = taskResult.rows[0];

    if (user.role !== 'admin' && task.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only edit your own tasks.' });
    }

    const fileUrl = req.file ? `/uploads/${req.file.filename}` : task.file_url;

    const result = await client.query(
      'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status), file_url = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 AND org_id = $6 RETURNING *',
      [title, description, status, fileUrl, taskId, tenantId]
    );
    const updatedTask = result.rows[0];

    await logAudit(client, tenantId, user.id, 'UPDATE_TASK', 'TASK', taskId, { before: task, after: updatedTask });
    await client.query('COMMIT');

    res.json(updatedTask);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Server error updating task.' });
  } finally {
    client.release();
  }
};

const deleteTask = async (req, res) => {
  const { tenantId, user } = req;
  const taskId = req.params.id;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const taskResult = await client.query('SELECT * FROM tasks WHERE id = $1 AND org_id = $2', [taskId, tenantId]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }
    const task = taskResult.rows[0];

    if (user.role !== 'admin' && task.user_id !== user.id) {
      return res.status(403).json({ error: 'Forbidden: You can only delete your own tasks.' });
    }

    await client.query('DELETE FROM tasks WHERE id = $1 AND org_id = $2', [taskId, tenantId]);
    await logAudit(client, tenantId, user.id, 'DELETE_TASK', 'TASK', taskId, task);
    
    await client.query('COMMIT');
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Server error deleting task.' });
  } finally {
    client.release();
  }
};

module.exports = { getTasks, createTask, updateTask, deleteTask };
