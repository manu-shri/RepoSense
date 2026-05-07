// Create test user for login
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function createTestUser() {
  try {
    console.log('👤 Creating test user...');
    
    try {
      const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
        username: 'developer',
        email: 'dev@gitpulse.ai',
        password: 'dev123456'
      });
      console.log('✅ Test user created successfully!');
      console.log('👤 User:', signupResponse.data.user);
      console.log('🎫 Token:', signupResponse.data.token.substring(0, 50) + '...');
    } catch (signupError) {
      if (signupError.response?.status === 409) {
        console.log('ℹ️ Test user already exists');
      } else {
        console.log('❌ Failed to create test user:', signupError.response?.data || signupError.message);
        return;
      }
    }
    
    // Now test login
    console.log('\n🔑 Testing login...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'dev@gitpulse.ai',
        password: 'dev123456'
      });
      console.log('✅ Login successful!');
      console.log('👤 User:', loginResponse.data.user);
      console.log('🎫 Token:', loginResponse.data.token.substring(0, 50) + '...');
    } catch (loginError) {
      console.log('❌ Login failed:', loginError.response?.data || loginError.message);
    }
    
  } catch (error) {
    console.error('🚨 Error:', error.message);
  }
}

createTestUser();
