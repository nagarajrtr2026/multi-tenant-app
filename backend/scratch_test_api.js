const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

(async () => {
  try {
    // We need a valid token. We can query the DB for user ID 1 and generate a token manually.
    const jwt = require('jsonwebtoken');
    require('dotenv').config();
    
    const payload = { id: 1, org_id: 1, org_name: 'Test Org', role: 'admin' };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const form = new FormData();
    form.append('title', 'API Test Task');
    form.append('description', 'Testing upload');
    form.append('status', 'pending');
    
    const response = await axios.post('http://localhost:5000/api/tasks', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
  }
})();
