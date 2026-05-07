// Test client-server connection
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testConnection() {
  try {
    console.log('Testing client-server connection...');
    
    // Test basic server health
    console.log('Testing server health...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/');
      console.log('Server health check passed:', healthResponse.status);
    } catch (error) {
      console.log('Server health check failed:', error.message);
    }
    
    // Test CORS by making a request with browser-like headers
    console.log('Testing CORS...');
    try {
      const corsResponse = await axios.get('http://localhost:5000/', {
        headers: {
          'Origin': 'http://localhost:5174',
          'Referer': 'http://localhost:5174/'
        }
      });
      console.log('CORS test passed:', corsResponse.status);
      console.log('CORS headers:', corsResponse.headers['access-control-allow-origin']);
    } catch (error) {
      console.log('CORS test failed:', error.message);
    }
    
    // Test login endpoint with proper headers
    console.log('Testing login endpoint...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'dev@gitpulse.ai',
        password: 'dev123456'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:5174'
        }
      });
      console.log('Login endpoint test passed:', loginResponse.status);
      console.log('Login response:', loginResponse.data);
    } catch (error) {
      console.log('Login endpoint test failed:', error.response?.data || error.message);
    }
    
    console.log('Connection test completed!');
    
  } catch (error) {
    console.error('Connection test failed:', error.message);
  }
}

testConnection();
