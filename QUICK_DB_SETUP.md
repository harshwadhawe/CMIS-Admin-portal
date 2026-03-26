# Quick Database Setup

## 🚀 Quick Start (3 Steps)

### 1. Create `.env.local` file

Create `.env.local` in project root:

```env
DB_HOST=cmis-db.cxk6kumkovng.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=cmis-db
DB_USER=postgres
DB_PASSWORD=CMISTAMU2025
DB_SSL=true
JWT_SECRET=cmis-admin-portal-secret-key-change-in-production-2024
```

### 2. Initialize Database

```bash
npm run db:init
```

This creates all tables and default admin user.

### 3. Start Server

```bash
npm run dev
```

Done! Your APIs are now connected to PostgreSQL RDS.

---

## ✅ Verify It Works

1. Login: `POST /api/auth/login` with `admin` / `admin123`
2. Create event: `POST /api/events`
3. Check data persists after server restart

---

## 📚 Full Documentation

See `DATABASE_SETUP.md` for complete setup guide, troubleshooting, and security notes.

