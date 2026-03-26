// Copy and paste this entire code into your browser console (F12)
// Make sure you're on http://localhost:3000

(async function testAPIs() {
  try {
    // Step 1: Login
    console.log('🔐 Logging in...');
    const loginResponse = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);
    
    if (!loginData.success) {
      console.error('❌ Login failed:', loginData.error);
      console.error('Make sure:');
      console.error('  1. Server is running (npm run dev)');
      console.error('  2. Credentials are correct (admin/admin123)');
      return;
    }
    
    // Save token
    window.token = loginData.data.token;
    console.log('✅ Login successful!');
    console.log('✅ Token saved:', window.token.substring(0, 30) + '...');
    console.log('✅ User:', loginData.data.user.username);
    
    // Step 2: Get Events
    console.log('\n📋 Fetching events...');
    const eventsResponse = await fetch('/api/events', {
      headers: { 'Authorization': `Bearer ${window.token}` }
    });
    
    const eventsData = await eventsResponse.json();
    console.log('Events Response:', eventsData);
    
    if (eventsData.success) {
      console.log('✅ Events retrieved:', eventsData.data.length);
      if (eventsData.data.length > 0) {
        console.log('   First event:', eventsData.data[0].title);
      } else {
        console.log('   No events yet. Create one below!');
      }
    } else {
      console.error('❌ Failed to get events:', eventsData.error);
    }
    
    // Step 3: Create Event
    console.log('\n➕ Creating event...');
    const createResponse = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${window.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Event ' + new Date().toLocaleTimeString(),
        description: 'Test description from browser console'
      })
    });
    
    const createData = await createResponse.json();
    console.log('Create Response:', createData);
    
    if (createData.success) {
      console.log('✅ Event created!');
      console.log('   ID:', createData.data.id);
      console.log('   Title:', createData.data.title);
      window.lastEventId = createData.data.id;
    } else {
      console.error('❌ Failed to create event:', createData.error);
    }
    
    // Step 4: Get Event by ID (if we created one)
    if (window.lastEventId) {
      console.log('\n🔍 Fetching event by ID...');
      const getByIdResponse = await fetch(`/api/events/${window.lastEventId}`, {
        headers: { 'Authorization': `Bearer ${window.token}` }
      });
      
      const getByIdData = await getByIdResponse.json();
      console.log('Get by ID Response:', getByIdData);
      
      if (getByIdData.success) {
        console.log('✅ Event retrieved!');
        console.log('   Title:', getByIdData.data.title);
        console.log('   Description:', getByIdData.data.description);
      } else {
        console.error('❌ Failed to get event:', getByIdData.error);
      }
    }
    
    // Step 5: Get Judges
    console.log('\n👥 Fetching judges...');
    const judgesResponse = await fetch('/api/judges', {
      headers: { 'Authorization': `Bearer ${window.token}` }
    });
    
    const judgesData = await judgesResponse.json();
    console.log('Judges Response:', judgesData);
    
    if (judgesData.success) {
      console.log('✅ Judges retrieved:', judgesData.data.length);
    } else {
      console.error('❌ Failed to get judges:', judgesData.error);
    }
    
    console.log('\n✅ All tests completed!');
    console.log('💡 Your token is saved in window.token');
    console.log('💡 You can now use window.token for other API calls');
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Make sure:');
    console.error('  1. You are on http://localhost:3000');
    console.error('  2. Server is running (npm run dev)');
    console.error('  3. Check Network tab for detailed error info');
  }
})();

