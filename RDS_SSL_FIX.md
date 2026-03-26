# RDS SSL Connection Fix

## Problem
The error `no pg_hba.conf entry for host "...", no encryption` means your RDS instance requires SSL connections.

## Solution

### Option 1: Enable SSL in `.env.local` (Recommended)

Update your `.env.local` file:

```env
DB_HOST=cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=cmis-db
DB_USER=postgres
DB_PASSWORD=CMISTAMU2025
DB_SSL=true
JWT_SECRET=cmis-admin-portal-secret-key-change-in-production-2024
```

**Note**: The code has been updated to enable SSL by default. You can also set `DB_SSL=true` explicitly.

### Option 2: The code now defaults to SSL

I've updated `lib/db-connection.ts` to enable SSL by default (unless `DB_SSL=false` is explicitly set).

## Try Again

After updating `.env.local`:

```bash
npm run db:init
```

## What Changed

The connection now uses:
```javascript
ssl: { rejectUnauthorized: false }
```

This allows SSL connections without requiring certificate verification (common for RDS).

## Security Note

For production, consider:
- Using proper SSL certificates
- Setting up certificate validation
- Using AWS RDS CA certificates

But for development, `rejectUnauthorized: false` is acceptable.

