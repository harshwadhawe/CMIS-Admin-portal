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
  let client;
  try {
    console.log('🔍 Testing RDS connection...');
    console.log(`📍 Host: ${process.env.DB_HOST || 'cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com'}`);
    console.log(`📦 Database: ${process.env.DB_NAME || 'cmis-db'}`);
    console.log(`👤 User: ${process.env.DB_USER || 'postgres'}`);
    console.log(`🔒 SSL: ${process.env.DB_SSL !== 'false' ? 'Enabled' : 'Disabled'}\n`);
    
    // Test 1: Basic connection
    client = await pool.connect();
    console.log('✅ Connected to database');
    
    // Test 2: Query current time
    const timeResult = await client.query('SELECT NOW()');
    console.log('✅ Database time:', timeResult.rows[0].now);
    
    // Test 3: Check PostgreSQL version
    const versionResult = await client.query('SELECT version()');
    console.log('✅ PostgreSQL version:', versionResult.rows[0].version.split(',')[0]);
    
    // Test 4: Check if tables exist
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
    
    // Test 5: Check users table
    if (tablesResult.rows.some(r => r.table_name === 'users')) {
      const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
      const adminCheck = await client.query("SELECT username, role FROM users WHERE username = 'admin'");
      console.log(`\n👥 Users in database: ${usersResult.rows[0].count}`);
      if (adminCheck.rows.length > 0) {
        console.log(`   ✅ Admin user exists: ${adminCheck.rows[0].username} (${adminCheck.rows[0].role})`);
      } else {
        console.log('   ⚠️  Admin user not found');
      }
    }
    
    // Test 6: Check events table
    if (tablesResult.rows.some(r => r.table_name === 'events')) {
      const eventsResult = await client.query('SELECT COUNT(*) as count FROM events');
      console.log(`📅 Events in database: ${eventsResult.rows[0].count}`);
    }
    
    // Test 7: Check judges table
    if (tablesResult.rows.some(r => r.table_name === 'judges')) {
      const judgesResult = await client.query('SELECT COUNT(*) as count FROM judges');
      console.log(`⚖️  Judges in database: ${judgesResult.rows[0].count}`);
    }
    
    // Test 8: Check foreign keys
    const fkResult = await client.query(`
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
      WHERE tc.constraint_type = 'FOREIGN KEY'
      ORDER BY tc.table_name
    `);
    
    if (fkResult.rows.length > 0) {
      console.log('\n🔗 Foreign Keys:');
      fkResult.rows.forEach(row => {
        console.log(`   ✅ ${row.table_name}.${row.column_name} → ${row.foreign_table_name}.${row.foreign_column_name}`);
      });
    }
    
    client.release();
    console.log('\n✅ All tests passed! RDS is properly configured.');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    if (client) client.release();
    console.error('\n❌ Connection test failed!');
    console.error('Error:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('  1. Check .env.local file exists in project root');
    console.error('  2. Verify DB_SSL=true in .env.local');
    console.error('  3. Check RDS security group allows your IP address');
    console.error('  4. Verify credentials are correct');
    console.error('  5. Ensure RDS instance is running');
    console.error('\n💡 Run: npm run db:init (if tables are missing)');
    await pool.end();
    process.exit(1);
  }
}

testConnection();

