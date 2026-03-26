# Frontend API Integration Guide

## ✅ Yes, the APIs will work from the frontend!

Since your APIs are Next.js API routes in the same application, they work seamlessly with the frontend. No CORS configuration is needed because they're on the same origin.

## 🔧 What I've Set Up

### 1. **API Client Utility** (`lib/api-client.ts`)
   - Handles all API requests
   - Automatically adds JWT tokens to requests
   - Manages token storage in localStorage
   - Handles errors and unauthorized responses

### 2. **Updated Frontend Components**
   - ✅ **Login Page** - Now calls the real login API
   - ✅ **Events Page** - Fetches events from API
   - ✅ **Add Event Dialog** - Creates events via API
   - ✅ **Dashboard Layout** - Checks for JWT token
   - ✅ **Top Header** - Logout uses API client

## 📝 How It Works

### Authentication Flow

1. **Login** (`app/page.tsx`):
   ```typescript
   const response = await api.login(username, password)
   if (response.success) {
     // Token is automatically stored in localStorage
     router.push("/dashboard")
   }
   ```

2. **Protected Routes**:
   - All API requests automatically include the JWT token
   - If token is invalid/expired, user is redirected to login

3. **Logout**:
   ```typescript
   api.logout() // Clears token from localStorage
   ```

### Making API Calls

**Example: Fetch Events**
```typescript
import { api } from "@/lib/api-client"

const response = await api.getEvents()
if (response.success) {
  console.log(response.data) // Array of events
} else {
  console.error(response.error) // Error message
}
```

**Example: Create Event**
```typescript
const response = await api.createEvent({
  title: "New Event",
  description: "Event description",
  pdfUrl: "https://example.com/file.pdf" // Optional
})
```

**Example: Get Judges**
```typescript
// Get all judges
const allJudges = await api.getJudges()

// Get judges for specific event
const eventJudges = await api.getJudges({ eventId: "123" })

// Get judges by event description
const filteredJudges = await api.getJudges({ 
  eventDescription: "hackathon" 
})
```

## 🔐 Token Management

The JWT token is stored in localStorage with this structure:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "username": "admin",
    "email": "admin@cmis.tamu.edu",
    "role": "admin"
  },
  "timestamp": 1234567890
}
```

**Token Expiry**: 10 hours (36000 seconds)

## 🚀 Testing the Integration

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test Login**:
   - Go to `http://localhost:3000`
   - Login with:
     - Username: `admin`
     - Password: `admin123`
   - You should be redirected to dashboard

3. **Test Events**:
   - Go to `/events` page
   - Events should load from API (initially empty)
   - Click "Add Event" to create a new event
   - Event should appear in the list

## 📋 Available API Methods

All methods are available via `api` object from `@/lib/api-client`:

```typescript
// Authentication
api.login(username, password)
api.logout()

// Events
api.getEvents()
api.getEventById(id)
api.createEvent({ title, description, pdfUrl? })

// Judges
api.getJudges(filters?)

// N8n
api.triggerEmail({ eventId, recipients, ... })
```

## ⚠️ Important Notes

### 1. **Same-Origin Requests**
   - Since APIs are in the same Next.js app, no CORS issues
   - Requests go to `/api/*` which is handled by Next.js

### 2. **Server-Side Rendering (SSR)**
   - The API client checks for `window` to avoid SSR issues
   - Token is only accessed on client-side

### 3. **Error Handling**
   - All API methods return `ApiResponse<T>` type
   - Check `response.success` before accessing `response.data`
   - Errors are automatically logged to console

### 4. **Automatic Redirect**
   - If API returns 401 (Unauthorized), user is automatically redirected to login
   - Token is cleared from localStorage

## 🔄 Next Steps

1. **Update Other Pages**:
   - Update `/students` page to use API if needed
   - Update `/events/[id]` page to fetch event details
   - Add judges management UI

2. **Add Error Handling UI**:
   - Replace `alert()` calls with toast notifications
   - Add loading states for better UX

3. **File Upload**:
   - Implement PDF upload functionality
   - Add S3 integration for file storage

4. **Real-time Updates**:
   - Consider adding WebSocket or polling for live updates
   - Refresh events list after creating new event

## 🐛 Troubleshooting

### "Unauthorized" Errors
- Check if token exists in localStorage
- Verify token hasn't expired (10 hours)
- Make sure login was successful

### "Network Error"
- Check if dev server is running
- Verify API routes are accessible
- Check browser console for detailed errors

### Events Not Loading
- Check browser Network tab for API calls
- Verify authentication token is valid
- Check server console for errors

## 📚 Example: Complete Component

```typescript
"use client"

import { useState, useEffect } from "react"
import { api } from "@/lib/api-client"

export default function MyComponent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.getEvents()
        
        if (response.success) {
          setData(response.data)
        } else {
          setError(response.error || "Failed to fetch data")
        }
      } catch (err) {
        setError("An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  return <div>{/* Render data */}</div>
}
```

---

**All APIs are ready to use from the frontend!** 🎉

