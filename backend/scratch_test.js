const { pool } = require('./config/db');
(async () => {
    try {
        await pool.query('ALTER TABLE tasks ADD COLUMN IF NOT EXISTS file_url TEXT;');
        console.log('file_url column added to tasks successfully!');
    } catch(e) {
        console.error('Error:', e);
    } finally {
        pool.end();
    }
})();
