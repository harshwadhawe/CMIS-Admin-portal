# API Setup Summary

## ✅ Completed API Endpoints

All API endpoints have been successfully created for the CMIS Admin Portal:

### 1. **User Login** - `POST /api/auth/login`
   - JWT token authentication
   - 10-hour token expiry
   - Returns user info and token

### 2. **Get Event List** - `GET /api/events`
   - Retrieves all events
   - Requires authentication

### 3. **Get Event by ID** - `GET /api/events/[id]`
   - Retrieves a specific event
   - Requires authentication

### 4. **Add New Event** - `POST /api/events`
   - Creates a new event
   - Requires authentication

### 5. **Get Judges** - `GET /api/judges`
   - Can filter by event description or event ID
   - Returns judges with event descriptions
   - Requires authentication

### 6. **N8n Email Trigger** - `POST /api/n8n/email-trigger`
   - Triggers N8n webhook for email sending
   - Requires authentication
   - Requires `N8N_WEBHOOK_URL` environment variable

## 📁 File Structure

```
app/api/
├── auth/
│   └── login/
│       └── route.ts          # Login endpoint
├── events/
│   ├── route.ts              # GET all events, POST new event
│   └── [id]/
│       └── route.ts          # GET event by ID
├── judges/
│   └── route.ts              # GET judges (with filters)
└── n8n/
    └── email-trigger/
        └── route.ts          # N8n webhook trigger

lib/
├── types.ts                  # TypeScript type definitions
├── jwt.ts                    # JWT token utilities
├── auth.ts                   # Authentication helpers
└── db.ts                     # In-memory database (replace with real DB)
```

## 🔧 Setup Instructions

1. **Install Dependencies** (already done)
   ```bash
   npm install jsonwebtoken bcryptjs
   npm install --save-dev @types/jsonwebtoken @types/bcryptjs
   ```

2. **Create Environment File**
   Create `.env.local` in the root directory:
   ```env
   JWT_SECRET=your-secret-key-change-in-production
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/email-trigger
   ```

3. **Generate JWT Secret** (for production)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🧪 Testing the APIs

### Test Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Get Events (replace TOKEN with actual token)
```bash
curl -X GET http://localhost:3000/api/events \
  -H "Authorization: Bearer TOKEN"
```

## 📝 Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these in production!**

## 🔐 Authentication

All endpoints (except login) require JWT authentication:
```
Authorization: Bearer <your-jwt-token>
```

Tokens are valid for **10 hours**.

## 📚 Full Documentation

See `API_DOCUMENTATION.md` for complete API documentation with all endpoints, request/response examples, and error codes.

## ⚠️ Important Notes

1. **Database**: Currently using in-memory storage. Replace `lib/db.ts` with actual database in production.

2. **Security**: 
   - Change default admin password
   - Use strong JWT_SECRET in production
   - Implement rate limiting
   - Add input validation/sanitization

3. **N8n Integration**: Set up your N8n webhook and configure `N8N_WEBHOOK_URL` environment variable.

4. **CORS**: If accessing from different origins, configure CORS in Next.js middleware.

## 🚀 Next Steps

1. Replace in-memory database with actual database (MongoDB, PostgreSQL, etc.)
2. Add input validation using Zod (already in dependencies)
3. Implement file upload for PDFs (S3 integration ready)
4. Add rate limiting
5. Set up proper error logging
6. Add API tests

