// Test browser login simulation
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testBrowserLogin() {
  try {
    console.log('🌐 Testing Browser Login Simulation...\n');
    
    // Simulate exactly what the browser sends
    console.log('1️⃣ Simulating browser login request...');
    
    try {
      // This is exactly what the browser sends when you click login
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'dev@gitpulse.ai',
        password: 'dev123456'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:5174',
          'Referer': 'http://localhost:5174/login',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      console.log('✅ Browser login successful!');
      console.log('🎫 Token received:', loginResponse.data.token ? 'Yes' : 'No');
      console.log('👤 User data:', loginResponse.data.user);
      
      // Test storing in localStorage (simulate browser)
      console.log('\n2️⃣ Simulating localStorage storage...');
      localStorage.setItem('token', loginResponse.data.token);
      localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      console.log('✅ Data stored in localStorage');
      
      // Test navigation to home page
      console.log('\n3️⃣ Simulating navigation to /home...');
      console.log('✅ Would navigate to /home page');
      
      // Test what happens when accessing protected route
      console.log('\n4️⃣ Testing protected route access...');
      try {
        const meResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:5174'
          }
        });
        console.log('✅ Protected route accessible');
        console.log('👤 User verified:', meResponse.data.user);
      } catch (error) {
        console.log('❌ Protected route failed:', error.response?.data || error.message);
      }
      
    } catch (loginError) {
      console.log('❌ Browser login failed:');
      console.log('📋 Status:', loginError.response?.status);
      console.log('📋 Error:', loginError.response?.data || loginError.message);
      
      // Check if it's a network error
      if (loginError.code === 'ECONNREFUSED') {
        console.log('🔌 Network connection refused - server might be down');
      } else if (loginError.code === 'ECONNRESET') {
        console.log('🔌 Connection reset - server crashed');
      } else if (loginError.message.includes('Network Error')) {
        console.log('🔌 Network error - CORS or connectivity issue');
      }
    }
    
    // Test CORS specifically
    console.log('\n5️⃣ Testing CORS preflight...');
    try {
      const corsResponse = await axios.options(`${API_BASE}/auth/login`, {
        headers: {
          'Origin': 'http://localhost:5174',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type,Authorization'
        }
      });
      console.log('✅ CORS preflight successful');
      console.log('📋 CORS headers:', {
        'Access-Control-Allow-Origin': corsResponse.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': corsResponse.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': corsResponse.headers['access-control-allow-headers']
      });
    } catch (corsError) {
      console.log('❌ CORS preflight failed:', corsError.message);
    }
    
    console.log('\n🎉 Browser login simulation completed!');
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

testBrowserLogin();
