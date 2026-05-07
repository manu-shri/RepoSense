// Test authentication endpoints
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('Testing authentication...');
    
    // First, try to create a test user
    console.log('Creating test user...');
    const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Signup successful:', signupResponse.data);
    
    // Now test login with the created user
    console.log('Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    console.log('Login successful:', loginResponse.data);
    
    // Test with the pre-filled email from login form
    console.log('Creating dev@gitpulse.ai user...');
    const devSignupResponse = await axios.post(`${API_BASE}/auth/signup`, {
      username: 'developer',
      email: 'dev@gitpulse.ai',
      password: 'dev123456'
    });
    console.log('Dev user created:', devSignupResponse.data);
    
    console.log('Authentication test completed successfully!');
    
  } catch (error) {
    console.error('Authentication test failed:', error.response?.data || error.message);
  }
}

testAuth();
