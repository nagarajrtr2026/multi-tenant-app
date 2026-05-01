const { pool } = require('./config/db');

(async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      'INSERT INTO tasks (org_id, user_id, title, description, file_url, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [1, 1, 'Test Title', 'Test Description', null, 'pending']
    );
    const newTask = result.rows[0];

    await client.query(
      'INSERT INTO audit_logs (org_id, user_id, action, target_type, target_id, details) VALUES ($1, $2, $3, $4, $5, $6)',
      [1, 1, 'CREATE_TASK', 'TASK', newTask.id, JSON.stringify(newTask)]
    );
    await client.query('COMMIT');
    console.log('Task successfully created:', newTask);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating task:', error);
  } finally {
    client.release();
    pool.end();
  }
})();
