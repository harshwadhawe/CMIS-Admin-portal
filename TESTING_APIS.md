# How to Test the APIs

This guide shows you multiple ways to test your APIs.

## 🚀 Method 1: Using the Frontend (Easiest)

The frontend is already integrated with the APIs, so you can test them directly:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open your browser**: `http://localhost:3000`

3. **Test Login**:
   - Enter username: `admin`
   - Enter password: `admin123`
   - Click "Login"
   - You should be redirected to dashboard

4. **Test Events API**:
   - Go to `/events` page
   - Click "Add Event"
   - Fill in title and description
   - Click "Create Event"
   - The event should appear in the list

5. **Check Browser DevTools**:
   - Open DevTools (F12)
   - Go to "Network" tab
   - You'll see all API calls being made
   - Click on any request to see request/response details

---

## 🔧 Method 2: Using cURL (Command Line)

### Step 1: Get JWT Token (Login)

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "1",
      "username": "admin",
      "email": "admin@cmis.tamu.edu",
      "role": "admin"
    },
    "expiresIn": 36000
  },
  "message": "Login successful"
}
```

**Copy the token** from the response for the next steps.

### Step 2: Test Get Events

Replace `YOUR_TOKEN_HERE` with the actual token:

```bash
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Test Create Event

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Test Event\",\"description\":\"This is a test event\"}"
```

### Step 4: Test Get Event by ID

```bash
curl -X GET http://localhost:3000/api/events/EVENT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 5: Test Get Judges

```bash
# Get all judges
curl -X GET http://localhost:3000/api/judges \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get judges by event ID
curl -X GET "http://localhost:3000/api/judges?event_id=EVENT_ID_HERE" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Get judges by event description
curl -X GET "http://localhost:3000/api/judges?event_description=hackathon" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 6: Test N8n Email Trigger

```bash
curl -X POST http://localhost:3000/api/n8n/email-trigger \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d "{\"eventId\":\"EVENT_ID_HERE\",\"recipients\":[\"test@example.com\"]}"
```

---

## 🛠️ Method 3: Using Postman or Thunder Client

### Setup in Postman/Thunder Client:

1. **Create a Collection** called "CMIS APIs"

2. **Set Collection Variables**:
   - `base_url`: `http://localhost:3000`
   - `token`: (leave empty, will be set after login)

3. **Create Requests**:

#### Request 1: Login
- **Method**: POST
- **URL**: `{{base_url}}/api/auth/login`
- **Headers**: 
  - `Content-Type: application/json`
- **Body** (raw JSON):
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Tests** (Postman only - to save token):
  ```javascript
  if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.collectionVariables.set("token", jsonData.data.token);
  }
  ```

#### Request 2: Get Events
- **Method**: GET
- **URL**: `{{base_url}}/api/events`
- **Headers**: 
  - `Authorization: Bearer {{token}}`

#### Request 3: Create Event
- **Method**: POST
- **URL**: `{{base_url}}/api/events`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body** (raw JSON):
  ```json
  {
    "title": "New Event",
    "description": "Event description here"
  }
  ```

#### Request 4: Get Event by ID
- **Method**: GET
- **URL**: `{{base_url}}/api/events/:id`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Params**: 
  - `id`: (enter event ID)

#### Request 5: Get Judges
- **Method**: GET
- **URL**: `{{base_url}}/api/judges`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
- **Query Params** (optional):
  - `event_id`: (event ID)
  - `event_description`: (description text)

#### Request 6: N8n Email Trigger
- **Method**: POST
- **URL**: `{{base_url}}/api/n8n/email-trigger`
- **Headers**: 
  - `Authorization: Bearer {{token}}`
  - `Content-Type: application/json`
- **Body** (raw JSON):
  ```json
  {
    "eventId": "EVENT_ID",
    "recipients": ["email1@example.com", "email2@example.com"],
    "subject": "Test Email",
    "template": "default"
  }
  ```

---

## 🌐 Method 4: Using Browser DevTools

1. **Open your app**: `http://localhost:3000`

2. **Open DevTools** (F12)

3. **Go to Console tab** and run this code (copy and paste all at once):

```javascript
// Complete test function - run this all at once
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
      return;
    }
    
    // Save token
    window.token = loginData.data.token;
    console.log('✅ Token saved:', window.token.substring(0, 20) + '...');
    
    // Step 2: Get Events
    console.log('\n📋 Fetching events...');
    const eventsResponse = await fetch('/api/events', {
      headers: { 'Authorization': `Bearer ${window.token}` }
    });
    
    const eventsData = await eventsResponse.json();
    console.log('Events Response:', eventsData);
    
    if (eventsData.success) {
      console.log('✅ Events retrieved:', eventsData.data.length);
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
        title: 'Test Event ' + Date.now(),
        description: 'Test description from browser console'
      })
    });
    
    const createData = await createResponse.json();
    console.log('Create Response:', createData);
    
    if (createData.success) {
      console.log('✅ Event created:', createData.data.id);
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
        console.log('✅ Event retrieved:', getByIdData.data.title);
      }
    }
    
    console.log('\n✅ All tests completed!');
    console.log('💡 Your token is saved in window.token');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```

**Or run commands one by one** (wait for each to complete):

```javascript
// 1. Login first
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'admin', password: 'admin123' })
});
const loginData = await loginRes.json();
console.log('Login:', loginData);
window.token = loginData.data?.token;
console.log('Token saved:', window.token);

// 2. Then get events (wait for step 1 to finish)
const eventsRes = await fetch('/api/events', {
  headers: { 'Authorization': `Bearer ${window.token}` }
});
const eventsData = await eventsRes.json();
console.log('Events:', eventsData);

// 3. Create event
const createRes = await fetch('/api/events', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${window.token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Test Event',
    description: 'Test description'
  })
});
const createData = await createRes.json();
console.log('Created:', createData);
```

---

## 📝 Method 5: Create a Test Script

Create a test script file:

```bash
# Create test script
touch test-apis.js
```

Add this content to `test-apis.js`:

```javascript
const BASE_URL = 'http://localhost:3000/api';

let token = '';

async function testLogin() {
  console.log('🔐 Testing Login...');
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
    return true;
  } else {
    console.error('❌ Login failed:', data.error);
    return false;
  }
}

async function testGetEvents() {
  console.log('\n📋 Testing Get Events...');
  const response = await fetch(`${BASE_URL}/events`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✅ Events retrieved:', data.data.length);
    return data.data;
  } else {
    console.error('❌ Failed:', data.error);
    return [];
  }
}

async function testCreateEvent() {
  console.log('\n➕ Testing Create Event...');
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
    console.log('✅ Event created:', data.data.id);
    return data.data;
  } else {
    console.error('❌ Failed:', data.error);
    return null;
  }
}

async function testGetEventById(eventId) {
  console.log('\n🔍 Testing Get Event by ID...');
  const response = await fetch(`${BASE_URL}/events/${eventId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  const data = await response.json();
  if (data.success) {
    console.log('✅ Event retrieved:', data.data.title);
    return data.data;
  } else {
    console.error('❌ Failed:', data.error);
    return null;
  }
}

async function testGetJudges() {
  console.log('\n👥 Testing Get Judges...');
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
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  const loggedIn = await testLogin();
  if (!loggedIn) {
    console.error('Cannot continue without login');
    return;
  }
  
  await testGetEvents();
  const newEvent = await testCreateEvent();
  
  if (newEvent) {
    await testGetEventById(newEvent.id);
  }
  
  await testGetJudges();
  
  console.log('\n✅ All tests completed!');
}

// Run if executed directly
if (typeof require !== 'undefined' && require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
```

Run the test script:

```bash
node test-apis.js
```

---

## ✅ Quick Test Checklist

- [ ] Server is running (`npm run dev`)
- [ ] Login API works (returns token)
- [ ] Get Events API works (with token)
- [ ] Create Event API works (with token)
- [ ] Get Event by ID works (with token)
- [ ] Get Judges API works (with token)
- [ ] Unauthorized requests return 401
- [ ] Invalid token returns 401

---

## 🐛 Common Issues

### "Invalid or expired token" / "401 Unauthorized"
**Most common issue!** This usually means:
1. **Login didn't complete** - The token wasn't saved because login failed or didn't finish
2. **Token is undefined** - The code tried to use the token before login completed
3. **Missing .env.local** - JWT_SECRET not set, causing token generation to fail

**Solution:**
- Make sure `.env.local` file exists with `JWT_SECRET` set
- Use the **async/await version** of the browser console code (see Method 4 above)
- Check the login response first - make sure `data.success === true`
- Wait for login to complete before making other API calls

### "Cannot connect to server"
- Make sure `npm run dev` is running
- Check if port 3000 is available
- Verify you're on `http://localhost:3000`

### "Network Error"
- Check if API routes exist in `app/api/`
- Check server console for errors
- Verify environment variables are set (create `.env.local` if missing)

### "CORS Error"
- Shouldn't happen since APIs are same-origin
- If it does, check `next.config.mjs`

### Browser Console: "Login: undefined" or empty response
- Make sure server is running
- Check Network tab in DevTools to see the actual response
- Verify credentials: `admin` / `admin123`
- Make sure you're on the correct URL (`http://localhost:3000`)

---

## 📊 Expected Response Format

All APIs return this format:

**Success**:
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

**Error**:
```json
{
  "success": false,
  "error": "Error message here"
}
```

---

## 🎯 Recommended Testing Flow

1. **Start with Login** - Get your token
2. **Test Get Events** - Verify authentication works
3. **Test Create Event** - Verify POST works
4. **Test Get Event by ID** - Use the ID from step 3
5. **Test Get Judges** - Verify filtering works
6. **Test Error Cases** - Invalid token, missing fields, etc.

Happy Testing! 🚀

