import { Pool } from 'pg';

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'cmis-db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'CMISTAMU2025',
  // RDS requires SSL - enable it by default
  ssl: process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : false,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Handle pool errors gracefully (don't crash the server)
pool.on('error', (err) => {
  console.error('❌ Database pool error:', err);
  // Don't call process.exit() - let the application handle errors gracefully
  // The pool will automatically try to reconnect
});

// Helper function to execute queries
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function to get a client from the pool
export function getClient() {
  return pool.connect();
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    // Test connection first
    await query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Ensure we're using the public schema
    await query('SET search_path TO public');
    
    // Create users table with explicit schema reference
    await query(`
      CREATE TABLE IF NOT EXISTS public.users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255),
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created/verified');

    // Create events table with explicit schema reference
    await query(`
      CREATE TABLE IF NOT EXISTS public.events (
        event_id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        event_date DATE,
        start_time TIME,
        end_time TIME,
        location_type VARCHAR(255),
        file_name VARCHAR(1000),
        event_summary TEXT,
        event_embedding TEXT,
        file_key VARCHAR(1000),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Events table created/verified');

    // Create external_stakeholders table
    await query(`
      CREATE TABLE IF NOT EXISTS external_stakeholders (
        es_id SERIAL PRIMARY KEY,
        es_type VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        organization VARCHAR(500),
        title VARCHAR(255),
        location VARCHAR(255),
        graduation_year INTEGER,
        linkedin_url VARCHAR(1000),
        bio_text TEXT,
        bio_embedding TEXT
      )
    `);
    console.log('✅ External stakeholders table created/verified');

    // Create outreach_emails table
    await query(`
      CREATE TABLE IF NOT EXISTS outreach_emails (
        outreach_id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL,
        es_id INTEGER NOT NULL,
        subject VARCHAR(500),
        body TEXT,
        status VARCHAR(50) DEFAULT 'draft',
        scheduled_send_at TIMESTAMP,
        sent_at TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_outreach_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
        CONSTRAINT fk_outreach_stakeholder FOREIGN KEY (es_id) REFERENCES external_stakeholders(es_id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Outreach emails table created/verified');

    // Create indexes for better performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_events_event_date ON events(event_date)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_external_stakeholders_es_type ON external_stakeholders(es_type)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_external_stakeholders_email ON external_stakeholders(email)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_outreach_emails_event_id ON outreach_emails(event_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_outreach_emails_es_id ON outreach_emails(es_id)
    `);
    await query(`
      CREATE INDEX IF NOT EXISTS idx_outreach_emails_status ON outreach_emails(status)
    `);

    // Check if admin user exists, if not create it
    const adminCheck = await query('SELECT id FROM public.users WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      await query(
        'INSERT INTO public.users (username, email, password, role) VALUES ($1, $2, $3, $4)',
        ['admin', 'admin@cmis.tamu.edu', hashedPassword, 'admin']
      );
      console.log('✅ Default admin user created (username: admin, password: admin123)');
    }

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

export default pool;

