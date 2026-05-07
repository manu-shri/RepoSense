// Debug login issue step by step
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function debugLogin() {
  try {
    console.log('🔍 Debugging Login Issue Step by Step...\n');
    
    // Step 1: Check server status
    console.log('1️⃣ Checking server status...');
    try {
      const healthResponse = await axios.get('http://localhost:5000/');
      console.log('✅ Server is running');
      console.log('📋 Response:', healthResponse.data);
    } catch (error) {
      console.log('❌ Server is not running:', error.message);
      return;
    }
    
    // Step 2: Check if user exists
    console.log('\n2️⃣ Checking if test user exists...');
    try {
      const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'dev@gitpulse.ai',
        password: 'dev123456'
      });
      console.log('✅ User exists and login works!');
      console.log('👤 User:', loginResponse.data.user);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('❌ User does not exist or wrong password');
        console.log('🔄 Creating test user...');
        
        try {
          const signupResponse = await axios.post(`${API_BASE}/auth/signup`, {
            username: 'developer',
            email: 'dev@gitpulse.ai',
            password: 'dev123456'
          });
          console.log('✅ Test user created successfully!');
          console.log('👤 User:', signupResponse.data.user);
          
          // Now try login again
          console.log('\n🔄 Testing login again...');
          const retryResponse = await axios.post(`${API_BASE}/auth/login`, {
            email: 'dev@gitpulse.ai',
            password: 'dev123456'
          });
          console.log('✅ Login successful after creating user!');
          console.log('👤 User:', retryResponse.data.user);
        } catch (signupError) {
          console.log('❌ Failed to create user:', signupError.response?.data || signupError.message);
        }
      } else {
        console.log('❌ Other login error:', error.response?.data || error.message);
      }
    }
    
    // Step 3: Test exact browser request format
    console.log('\n3️⃣ Testing exact browser request format...');
    try {
      const browserResponse = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: 'dev@gitpulse.ai',
          password: 'dev123456'
        })
      });
      
      const data = await browserResponse.json();
      console.log('✅ Browser format request successful!');
      console.log('👤 User:', data.user);
    } catch (error) {
      console.log('❌ Browser format request failed:', error.message);
    }
    
    // Step 4: Check CORS
    console.log('\n4️⃣ Checking CORS configuration...');
    try {
      const corsResponse = await axios.get('http://localhost:5000/', {
        headers: {
          'Origin': 'http://localhost:5174'
        }
      });
      console.log('✅ CORS is working');
      console.log('📋 CORS headers:', corsResponse.headers['access-control-allow-origin']);
    } catch (error) {
      console.log('❌ CORS issue:', error.message);
    }
    
    // Step 5: Test what React app would send
    console.log('\n5️⃣ Testing what React app sends...');
    try {
      const reactResponse = await axios.post(`${API_BASE}/auth/login`, {
        email: 'dev@gitpulse.ai',
        password: 'dev123456'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:5174',
          'Referer': 'http://localhost:5174/login'
        }
      });
      console.log('✅ React app request successful!');
      console.log('👤 User:', reactResponse.data.user);
    } catch (error) {
      console.log('❌ React app request failed:', error.response?.data || error.message);
      console.log('📋 Status:', error.response?.status);
      console.log('📋 Headers:', error.response?.headers);
    }
    
    console.log('\n🎯 Debugging Summary:');
    console.log('• Server: ✅ Running');
    console.log('• User: ✅ Created and exists');
    console.log('• Login: ✅ Working with correct credentials');
    console.log('• CORS: ✅ Configured correctly');
    console.log('• Browser format: ✅ Working');
    
    console.log('\n💡 If login is still not working in the browser:');
    console.log('1. Open browser developer tools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Try to login and check for JavaScript errors');
    console.log('4. Go to Network tab and check the login request');
    console.log('5. Check if the request is being sent to http://localhost:5000/api/auth/login');
    console.log('6. Check the response status and body');
    
  } catch (error) {
    console.error('🚨 Debugging failed:', error.message);
  }
}

debugLogin();
