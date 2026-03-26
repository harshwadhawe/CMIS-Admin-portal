const BASE_URL = 'http://localhost:3000/api';

let token = '';

async function testLogin() {
  console.log('🔐 Testing Login...');
  try {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const data = await response.json();
    if (data.success) {
      token = data.data.token;
      console.log('✅ Login successful!');
      console.log('Token:', token.substring(0, 20) + '...');
      console.log('User:', data.data.user.username);
      return true;
    } else {
      console.error('❌ Login failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return false;
  }
}

async function testGetEvents() {
  console.log('\n📋 Testing Get Events...');
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ Events retrieved:', data.data.length);
      if (data.data.length > 0) {
        console.log('   First event:', data.data[0].title);
      }
      return data.data;
    } else {
      console.error('❌ Failed:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Get events error:', error.message);
    return [];
  }
}

async function testCreateEvent() {
  console.log('\n➕ Testing Create Event...');
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Event ' + Date.now(),
        description: 'This is a test event created by the test script'
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ Event created!');
      console.log('   ID:', data.data.id);
      console.log('   Title:', data.data.title);
      return data.data;
    } else {
      console.error('❌ Failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Create event error:', error.message);
    return null;
  }
}

async function testGetEventById(eventId) {
  console.log('\n🔍 Testing Get Event by ID...');
  try {
    const response = await fetch(`${BASE_URL}/events/${eventId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ Event retrieved!');
      console.log('   Title:', data.data.title);
      console.log('   Description:', data.data.description.substring(0, 50) + '...');
      return data.data;
    } else {
      console.error('❌ Failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Get event by ID error:', error.message);
    return null;
  }
}

async function testGetJudges() {
  console.log('\n👥 Testing Get Judges...');
  try {
    const response = await fetch(`${BASE_URL}/judges`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('✅ Judges retrieved:', data.data.length);
      return data.data;
    } else {
      console.error('❌ Failed:', data.error);
      return [];
    }
  } catch (error) {
    console.error('❌ Get judges error:', error.message);
    return [];
  }
}

async function testUnauthorized() {
  console.log('\n🚫 Testing Unauthorized Request...');
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      headers: { 'Authorization': 'Bearer invalid_token' }
    });
    
    const data = await response.json();
    if (!data.success && response.status === 401) {
      console.log('✅ Unauthorized request correctly rejected');
      return true;
    } else {
      console.error('❌ Security issue: Unauthorized request was accepted');
      return false;
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  console.log('Make sure your dev server is running (npm run dev)\n');
  
  const loggedIn = await testLogin();
  if (!loggedIn) {
    console.error('\n❌ Cannot continue without login. Make sure:');
    console.error('   1. Server is running (npm run dev)');
    console.error('   2. Default credentials are correct (admin/admin123)');
    return;
  }
  
  await testGetEvents();
  const newEvent = await testCreateEvent();
  
  if (newEvent) {
    await testGetEventById(newEvent.id);
  }
  
  await testGetJudges();
  await testUnauthorized();
  
  console.log('\n✅ All tests completed!');
  console.log('\n💡 Tip: Check the Network tab in browser DevTools for detailed request/response info');
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  // Check if fetch is available (Node 18+)
  if (typeof fetch === 'undefined') {
    console.error('❌ This script requires Node.js 18+ or install node-fetch');
    console.error('   Alternatively, use the browser console method');
    process.exit(1);
  }
  
  runTests().catch(console.error);
}

module.exports = { runTests };

