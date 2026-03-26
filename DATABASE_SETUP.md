# Database Setup Guide

## PostgreSQL RDS Connection

Your APIs are now configured to use PostgreSQL RDS database.

## 🔧 Environment Variables

Add these to your `.env.local` file:

```env
# Database Configuration
DB_HOST=cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=cmis-db
DB_USER=postgres
DB_PASSWORD=CMISTAMU2025
DB_SSL=true
# Note: RDS requires SSL. Set to false only if your RDS doesn't require SSL.

# JWT Secret Key
JWT_SECRET=cmis-admin-portal-secret-key-change-in-production-2024

# N8n Webhook URL (optional)
# N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/email-trigger
```

**Important**: The `.env.local` file is already in `.gitignore` and won't be committed to git.

## 🚀 Initial Setup

### Step 1: Create `.env.local` file

Create a file named `.env.local` in the project root with the environment variables above.

### Step 2: Initialize Database Tables

Run the initialization script:

```bash
npm run db:init
```

This will:
- Create `users` table
- Create `events` table
- Create `judges` table
- Create necessary indexes
- Create default admin user (username: `admin`, password: `admin123`)

**Or** call the API endpoint:

```bash
curl -X POST http://localhost:3000/api/init-db
```

### Step 3: Start the Server

```bash
npm run dev
```

The database will automatically connect when the server starts.

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Events Table
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  pdf_url VARCHAR(1000),
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Judges Table
```sql
CREATE TABLE judges (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ✅ Verification

After setup, test the connection:

1. **Start the server**: `npm run dev`
2. **Test login**: Use the login API with `admin` / `admin123`
3. **Create an event**: Use the create event API
4. **Check database**: Connect to your RDS instance and verify data

## 🔍 Troubleshooting

### "Connection refused" or "Cannot connect"
- Verify RDS security group allows connections from your IP
- Check if the host, port, database name, user, and password are correct
- Ensure RDS instance is running and accessible

### "SSL connection required"
- Set `DB_SSL=true` in `.env.local`
- Or configure SSL certificate in connection settings

### "Table does not exist"
- Run `npm run db:init` to create tables
- Or call `POST /api/init-db` endpoint

### "Password authentication failed"
- Double-check `DB_PASSWORD` in `.env.local`
- Verify the password matches your RDS instance

### Connection Pool Errors
- The connection pool is configured for 20 max connections
- If you see pool errors, you may need to increase RDS instance size
- Or reduce the `max` value in `lib/db-connection.ts`

## 🔐 Security Notes

1. **Never commit `.env.local`** - It's already in `.gitignore`
2. **Change default admin password** - After first login, update the admin password
3. **Use environment variables** - Don't hardcode credentials
4. **Enable SSL** - For production, set `DB_SSL=true` and configure proper certificates
5. **Restrict RDS access** - Only allow connections from your application servers

## 📝 Default Credentials

After initialization:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Change these immediately in production!**

## 🔄 Migration from In-Memory to PostgreSQL

The database layer has been updated to use PostgreSQL. All existing API endpoints will now:
- Store data in PostgreSQL instead of memory
- Persist data across server restarts
- Support concurrent connections
- Scale better with connection pooling

No changes needed to your API calls - they work the same way!

## 🛠️ Manual Database Access

You can connect to your RDS database using any PostgreSQL client:

```bash
psql -h cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d cmis-db
```

Or use tools like:
- pgAdmin
- DBeaver
- TablePlus
- VS Code PostgreSQL extension

## 📚 Next Steps

1. ✅ Create `.env.local` with database credentials
2. ✅ Run `npm run db:init` to create tables
3. ✅ Start server: `npm run dev`
4. ✅ Test APIs to verify connection
5. ⚠️ Change default admin password
6. 🔒 Configure SSL for production
7. 📊 Set up database backups

---

**Need help?** Check the server console logs for detailed error messages.

