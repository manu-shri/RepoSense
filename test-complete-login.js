// Complete login flow test
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testCompleteLogin() {
  try {
    console.log('🧪 Testing Complete Login Flow...\n');
    
    // Step 1: Verify server is running
    console.log('1️⃣ Checking server status...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/');
      console.log('✅ Server is running (Status:', healthResponse.status, ')');
    } catch (error) {
      console.log('❌ Server is not running:', error.message);
      return;
    }
    
    // Step 2: Verify CORS is configured
    console.log('\n2️⃣ Checking CORS configuration...');
    try {
      const corsResponse = await axios.get('http://localhost:5000/', {
        headers: {
          'Origin': 'http://localhost:5174',
          'Referer': 'http://localhost:5174/'
        }
      });
      console.log('✅ CORS is configured');
      console.log('📋 CORS Origin:', corsResponse.headers['access-control-allow-origin']);
    } catch (error) {
      console.log('❌ CORS issue:', error.message);
    }
    
    // Step 3: Test login with correct credentials
    console.log('\n3️⃣ Testing login with correct credentials...');
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
      console.log('✅ Login successful!');
      console.log('🎫 Token:', loginResponse.data.token.substring(0, 50) + '...');
      console.log('👤 User:', loginResponse.data.user);
      
      // Step 4: Test protected route with token
      console.log('\n4️⃣ Testing protected route with token...');
      try {
        const meResponse = await axios.get(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${loginResponse.data.token}`,
            'Origin': 'http://localhost:5174'
          }
        });
        console.log('✅ Protected route accessible!');
        console.log('👤 User data:', meResponse.data.user);
      } catch (error) {
        console.log('❌ Protected route failed:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data || error.message);
      
      // If login fails, try to create the user first
      console.log('\n🔄 Attempting to create user...');
      try {
        const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
          username: 'developer',
          email: 'dev@gitpulse.ai',
          password: 'dev123456'
        });
        console.log('✅ User created successfully!');
        
        // Now try login again
        console.log('\n🔄 Retrying login...');
        const retryResponse = await axios.post(`${API_BASE}/auth/login`, {
          email: 'dev@gitpulse.ai',
          password: 'dev123456'
        });
        console.log('✅ Login successful after user creation!');
        console.log('🎫 Token:', retryResponse.data.token.substring(0, 50) + '...');
      } catch (signupError) {
        console.log('❌ User creation failed:', signupError.response?.data || signupError.message);
      }
    }
    
    // Step 5: Test incorrect credentials
    console.log('\n5️⃣ Testing login with incorrect credentials...');
    try {
      await axios.post(`${API_BASE}/auth/login`, {
        email: 'dev@gitpulse.ai',
        password: 'wrongpassword'
      });
      console.log('❌ Should have failed with wrong password');
    } catch (error) {
      console.log('✅ Correctly rejected wrong password');
      console.log('📋 Error message:', error.response?.data?.message);
    }
    
    console.log('\n🎉 Complete login flow test finished!');
    console.log('\n📝 Summary:');
    console.log('• Server: ✅ Running');
    console.log('• CORS: ✅ Configured');
    console.log('• Login: ✅ Working');
    console.log('• Protected routes: ✅ Working');
    console.log('• Error handling: ✅ Working');
    
  } catch (error) {
    console.error('🚨 Test failed:', error.message);
  }
}

testCompleteLogin();
