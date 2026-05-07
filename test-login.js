// Test login functionality
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testLogin() {
  try {
    console.log('Testing login functionality...');
    
    // First, create a test user if it doesn't exist
    console.log('Creating test user...');
    try {
      const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
        username: 'developer',
        email: 'dev@gitpulse.ai',
        password: 'dev123456'
      });
      console.log('Signup successful:', signupResponse.data);
    } catch (signupError) {
      console.log('Signup failed (user might already exist):', signupError.response?.data?.message || signupError.message);
    }
    
    // Now test login
    console.log('Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'dev@gitpulse.ai',
      password: 'dev123456'
    });
    console.log('Login successful:', loginResponse.data);
    
    console.log('Authentication test completed successfully!');
    
  } catch (error) {
    console.error('Authentication test failed:', error.response?.data || error.message);
  }
}

testLogin();
