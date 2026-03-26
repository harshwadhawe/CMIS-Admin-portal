# How to Check RDS Setup

## ✅ Quick Verification Methods

### Method 1: Run Database Initialization

The easiest way to check if RDS is connected:

```bash
npm run db:init
```

**Expected Output:**
```
🚀 Initializing database...
✅ Connected to PostgreSQL database
✅ Database connection successful
✅ Users table created/verified
✅ Events table created/verified
✅ Judges table created/verified
✅ Default admin user created (username: admin, password: admin123)
✅ Database tables initialized successfully
```

**If you see errors:**
- Check `.env.local` file exists and has correct credentials
- Verify `DB_SSL=true` is set
- Check RDS security group allows your IP

---

### Method 2: Test Connection via API

Start your server and test the login API:

```bash
# Terminal 1: Start server
npm run dev

# Terminal 2: Test login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Expected Response:**
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

If login works, RDS is connected and working!

---

### Method 3: Direct PostgreSQL Connection

Connect directly to RDS using `psql` or any PostgreSQL client:

#### Using psql (if installed):

```bash
psql -h cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com \
     -U postgres \
     -d cmis-db \
     -p 5432
```

When prompted, enter password: `CMISTAMU2025`

#### Using pgAdmin or DBeaver:

1. **Host**: `cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com`
2. **Port**: `5432`
3. **Database**: `cmis-db`
4. **Username**: `postgres`
5. **Password**: `CMISTAMU2025`
6. **SSL**: Enable (required)

#### Once Connected, Check Tables:

```sql
-- List all tables
\dt

-- Or using SQL
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check users table
SELECT * FROM users;

-- Check events table
SELECT * FROM events;

-- Check judges table
SELECT * FROM judges;
```

---

### Method 4: Create a Test Script

Create a file `test-rds-connection.js`:

```javascript
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST || 'cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cmis-db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'CMISTAMU2025',
  ssl: process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : false,
});

async function testConnection() {
  try {
    console.log('🔍 Testing RDS connection...');
    
    // Test 1: Basic connection
    const client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Test 2: Query current time
    const timeResult = await client.query('SELECT NOW()');
    console.log('✅ Database time:', timeResult.rows[0].now);
    
    // Test 3: Check if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tables found:');
    if (tablesResult.rows.length === 0) {
      console.log('   ⚠️  No tables found. Run: npm run db:init');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}`);
      });
    }
    
    // Test 4: Check users table
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Users in database: ${usersResult.rows[0].count}`);
    
    // Test 5: Check events table
    const eventsResult = await client.query('SELECT COUNT(*) as count FROM events');
    console.log(`📅 Events in database: ${eventsResult.rows[0].count}`);
    
    // Test 6: Check judges table
    const judgesResult = await client.query('SELECT COUNT(*) as count FROM judges');
    console.log(`⚖️  Judges in database: ${judgesResult.rows[0].count}`);
    
    client.release();
    console.log('\n✅ All tests passed! RDS is properly configured.');
    
    await pool.end();
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('  1. Check .env.local file exists');
    console.error('  2. Verify DB_SSL=true');
    console.error('  3. Check RDS security group allows your IP');
    console.error('  4. Verify credentials are correct');
    process.exit(1);
  }
}

testConnection();
```

Run it:
```bash
node test-rds-connection.js
```

---

### Method 5: Check Server Logs

When you start your Next.js server, check the console output:

```bash
npm run dev
```

**Look for:**
- `✅ Connected to PostgreSQL database` - Connection successful
- Any database query logs - Shows queries are executing
- Error messages - Will show connection issues

---

### Method 6: Test Through Frontend

1. Start server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Login with `admin` / `admin123`
4. Go to Events page
5. Create a new event
6. Refresh page - event should persist (stored in RDS)

If events persist after refresh, RDS is working!

---

## 🔍 Detailed Checks

### Check 1: Environment Variables

Verify `.env.local` exists and has:

```env
DB_HOST=cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=cmis-db
DB_USER=postgres
DB_PASSWORD=CMISTAMU2025
DB_SSL=true
JWT_SECRET=your-secret-key
```

### Check 2: Network Connectivity

Test if you can reach RDS:

```bash
# Windows PowerShell
Test-NetConnection -ComputerName cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com -Port 5432

# Or using telnet (if available)
telnet cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com 5432
```

### Check 3: Database Tables Structure

Once connected, verify table structure:

```sql
-- Check users table structure
\d users

-- Check events table structure
\d events

-- Check judges table structure
\d judges

-- Check foreign keys
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

---

## ✅ Success Checklist

- [ ] `npm run db:init` completes without errors
- [ ] Can login via API (`/api/auth/login`)
- [ ] Can create events via API (`/api/events`)
- [ ] Events persist after server restart
- [ ] Can connect directly with psql/pgAdmin
- [ ] Tables exist: `users`, `events`, `judges`
- [ ] Admin user exists in `users` table
- [ ] Server logs show database connections

---

## 🐛 Common Issues

### "Connection refused"
- **Fix**: Check RDS security group allows your IP address
- **Fix**: Verify host/port are correct

### "SSL required"
- **Fix**: Set `DB_SSL=true` in `.env.local`

### "Authentication failed"
- **Fix**: Verify username and password in `.env.local`
- **Fix**: Check RDS instance is running

### "Table does not exist"
- **Fix**: Run `npm run db:init` to create tables

### "No tables found"
- **Fix**: Run `npm run db:init` to initialize database

---

## 🚀 Quick Test Command

Run this one-liner to test everything:

```bash
npm run db:init && npm run dev
```

Then in another terminal:
```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

If you get a token back, everything is working! 🎉

