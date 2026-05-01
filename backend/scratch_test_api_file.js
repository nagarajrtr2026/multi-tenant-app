const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

(async () => {
  try {
    const token = jwt.sign({ id: 1, org_id: 1, org_name: 'Test', role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const form = new FormData();
    form.append('title', 'API Test Task With File');
    form.append('description', 'Testing upload');
    form.append('status', 'pending');
    form.append('file', Buffer.from('hello world'), 'test.txt');
    const response = await axios.post('http://localhost:5000/api/tasks', form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` }
    });
    console.log('Success:', response.data);
  } catch (error) {
    if (error.response && error.response.status === 500 && error.response.headers['content-type'].includes('text/html')) {
      console.error('Error HTML:', error.response.data);
    } else {
      console.error('Error:', error.response ? error.response.data : error.message);
    }
  }
})();
