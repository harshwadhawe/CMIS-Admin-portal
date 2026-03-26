# Environment Variables Setup Guide

## 📍 Where to Create `.env.local`

Create the `.env.local` file in the **project root directory** (same level as `package.json`):

```
cmis-admin-portal/
├── .env.local          ← CREATE THIS FILE HERE
├── package.json
├── next.config.mjs
├── app/
├── lib/
└── ...
```

## 🔧 Required Environment Variables

Create `.env.local` with these variables:

```env
# Database Configuration (Required for RDS)
DB_HOST=cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=cmis-db
DB_USER=postgres
DB_PASSWORD=CMISTAMU2025
DB_SSL=true

# JWT Secret Key (Required for Authentication)
JWT_SECRET=cmis-admin-portal-secret-key-change-in-production-2024

# N8n Webhook URL (Optional - only if using email triggers)
# N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/email-trigger
```

## 📝 Step-by-Step Setup

### Step 1: Create the File

**Windows (PowerShell):**
```powershell
# Navigate to project root
cd C:\Users\garvi\cmisProject\cmis-admin-portal

# Create .env.local file
New-Item -Path .env.local -ItemType File
```

**Or manually:**
1. Open your project in VS Code or any editor
2. In the root directory (where `package.json` is)
3. Create a new file named `.env.local`
4. Copy the content above into it

### Step 2: Add Your Variables

Open `.env.local` and paste:

```env
DB_HOST=cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=cmis-db
DB_USER=postgres
DB_PASSWORD=CMISTAMU2025
DB_SSL=true
JWT_SECRET=cmis-admin-portal-secret-key-change-in-production-2024
```

### Step 3: Verify File Location

The file should be here:
```
C:\Users\garvi\cmisProject\cmis-admin-portal\.env.local
```

**Check if it exists:**
```powershell
Test-Path .env.local
# Should return: True
```

## 🔍 How Environment Variables Are Used

### Backend (Server-Side) - Uses `.env.local`

These are used by:
- **Database connection** (`lib/db-connection.ts`)
- **JWT token generation** (`lib/jwt.ts`)
- **API routes** (`app/api/**/route.ts`)

### Frontend (Client-Side) - No Env Needed!

The frontend **doesn't need** separate environment variables because:
- ✅ Uses relative URLs (`/api`) - works automatically
- ✅ APIs are in the same Next.js app
- ✅ JWT tokens stored in `localStorage` (browser)
- ✅ No CORS issues (same origin)

The frontend API client (`lib/api-client.ts`) uses:
```typescript
const API_BASE_URL = '/api';  // Relative URL, no env needed
```

## ✅ Verification

### Check if `.env.local` exists:
```powershell
# PowerShell
Get-Content .env.local

# Or check if file exists
Test-Path .env.local
```

### Test if variables are loaded:
```bash
# Start server
npm run dev

# Check server console - should show:
# ✅ Connected to PostgreSQL database
```

### Test database connection:
```bash
npm run db:test
```

## 🚨 Important Notes

1. **`.env.local` is in `.gitignore`** - It won't be committed to git (secure!)
2. **Restart server** after creating/updating `.env.local`
3. **No quotes needed** - Don't wrap values in quotes unless they contain spaces
4. **Case sensitive** - Variable names are case-sensitive
5. **No spaces** - Don't put spaces around `=` sign

## 📋 Quick Checklist

- [ ] `.env.local` file exists in project root
- [ ] Contains `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- [ ] Contains `DB_SSL=true`
- [ ] Contains `JWT_SECRET` with a value
- [ ] File is in same directory as `package.json`
- [ ] Server restarted after creating file
- [ ] `npm run db:test` works

## 🔐 Security

**Never commit `.env.local` to git!**

It's already in `.gitignore`, but double-check:
```bash
# Check if it's ignored
git check-ignore .env.local
# Should show: .env.local
```

## 🐛 Troubleshooting

### "Cannot find .env.local"
- **Fix**: Make sure file is in project root (same folder as `package.json`)
- **Fix**: Check file name is exactly `.env.local` (not `.env.local.txt`)

### "Environment variables not loading"
- **Fix**: Restart the dev server (`npm run dev`)
- **Fix**: Check for typos in variable names
- **Fix**: Make sure no spaces around `=` sign

### "Database connection failed"
- **Fix**: Verify all DB_* variables are set
- **Fix**: Check `DB_SSL=true` is set
- **Fix**: Verify RDS credentials are correct

## 📚 Related Files

- **Database connection**: `lib/db-connection.ts` (uses DB_* vars)
- **JWT tokens**: `lib/jwt.ts` (uses JWT_SECRET)
- **API client**: `lib/api-client.ts` (no env needed - uses `/api`)
- **Frontend components**: Use `api` from `@/lib/api-client` (no env needed)

---

## 🎯 Summary

**For Frontend Integration:**
- ❌ **No separate env file needed** - Frontend uses relative URLs
- ✅ **Backend needs `.env.local`** - For database and JWT

**Location:**
- Create `.env.local` in: `C:\Users\garvi\cmisProject\cmis-admin-portal\.env.local`
- Same directory as `package.json`

**Required Variables:**
- Database: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_SSL`
- Authentication: `JWT_SECRET`
- Optional: `N8N_WEBHOOK_URL`

That's it! The frontend will automatically work once the backend has `.env.local` configured. 🚀

