# CMIS Admin Portal

A modern, full-stack admin portal for the CMIS (Case Management Information System) built with Next.js 14, React, TypeScript, and PostgreSQL. This portal provides comprehensive management capabilities for students, events, mentors, judges, and analytics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality
- 🔐 **Authentication & Authorization** - JWT-based secure authentication
- 📊 **Analytics Dashboard** - Comprehensive data visualization and insights
- 👥 **Student Management** - Track and manage student information
- 📅 **Event Management** - Create, edit, and monitor events
- 👨‍🏫 **Mentor Management** - Handle mentor assignments and confirmations
- ⚖️ **Judge Management** - Manage judges for events
- 📧 **Email Integration** - N8n webhook integration for automated emails
- 🌓 **Dark Mode Support** - Theme switching with next-themes
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS

### Technical Features
- ⚡ Server-side rendering with Next.js 14
- 🎨 Modern UI with Radix UI components
- 🔄 React Query for efficient data fetching
- 📝 Form handling with React Hook Form & Zod validation
- 🗄️ PostgreSQL with AWS RDS
- ☁️ AWS S3 integration for file storage
- 🔒 SSL-secured database connections

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14.2.3 (App Router)
- **Language**: TypeScript
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 4.1.9
- **Component Library**: Radix UI
- **State Management**: TanStack React Query 5.90.11
- **Form Management**: React Hook Form 7.60.0
- **Validation**: Zod 3.25.76
- **Charts**: Recharts 3.5.1
- **Date Handling**: date-fns 4.1.0, dayjs 1.11.19

### Backend
- **Runtime**: Node.js
- **Database**: PostgreSQL (AWS RDS)
- **ORM/Database Client**: pg 8.16.3
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **Password Hashing**: bcryptjs 3.0.3
- **File Storage**: AWS S3 (@aws-sdk/client-s3)

### Development Tools
- **Package Manager**: yarn
- **TypeScript**: 5.x
- **Linting**: ESLint
- **CSS Processing**: PostCSS, Autoprefixer

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **yarn**: v2.0.0 or higher 
- **PostgreSQL**: Access to AWS RDS instance or local PostgreSQL
- **Git**: For version control

Install yarn globally (if not already installed):
```bash
npm install -g yarn
```

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/siddharthkabra-811/cmis-admin-portal.git
cd cmis-admin-portal
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Configuration

Create a `.env.local` file in the project root:

```bash
# Windows PowerShell
New-Item -Path .env.local -ItemType File

# macOS/Linux
touch .env.local
```

See [Environment Setup](#environment-setup) section for required variables.

### 4. Initialize Database

```bash
yarn run db:init
```

This creates tables and a default admin user (username: `admin`, password: `admin123`).

### 5. Start Development Server

```bash
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔧 Environment Setup

Create a `.env.local` file in the project root with the following variables:

```env
# Database Configuration (Required for RDS)
DB_HOST=your-host-address
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=postgres
DB_PASSWORD=your-db-password
DB_SSL=true

# JWT Secret Key (Required for Authentication)
JWT_SECRET=cmis-admin-portal-secret-key-change-in-production-2024

# N8n Webhook URL (Optional - for email triggers)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/email-trigger

# AWS S3 Configuration (Optional - for file uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

**⚠️ Important**: 
- Never commit `.env.local` to version control (already in `.gitignore`)
- Change `JWT_SECRET` in production
- Ensure DB_SSL is `true` for AWS RDS connections

For detailed setup instructions, see [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md).

## 🗄 Database Setup

### Initial Setup

1. **Create Environment File** (see above)

2. **Initialize Database Tables**:
   ```bash
   yarn run db:init
   ```
   
   This creates:
   - `users` table with admin credentials
   - `events` table for event management
   - `judges` table for judge assignments
   - `students` table for student records
   - `mentors` table for mentor management
   - Necessary indexes and constraints

3. **Test Database Connection**:
   ```bash
   yarn run db:test
   ```

### Default Admin Credentials

After initialization, use these credentials to log in:
- **Username**: `admin`
- **Password**: `admin123`

**⚠️ Change these credentials immediately in production!**

For detailed database documentation, see:
- [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- [QUICK_DB_SETUP.md](./QUICK_DB_SETUP.md)
- [CHECK_RDS_SETUP.md](./CHECK_RDS_SETUP.md)

## 🏃 Running the Application

### Development Mode

```bash
yarn dev
```

Runs on [http://localhost:3000](http://localhost:3000) with hot-reload.

### Production Build

```bash
# Build the application
yarn build

# Start production server
yarn start
```

### Linting

```bash
yarn lint
```

## 📁 Project Structure

```
cmis-admin-portal/
├── app/                          # Next.js App Router
│   ├── (main)/                   # Main application routes
│   │   ├── analytics/            # Analytics dashboard
│   │   ├── dashboard/            # Main dashboard
│   │   ├── events/               # Event management
│   │   ├── settings/             # Application settings
│   │   └── students/             # Student management
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── events/               # Event CRUD operations
│   │   ├── judges/               # Judge management
│   │   ├── mentors/              # Mentor operations
│   │   ├── students/             # Student operations
│   │   ├── n8n/                  # Email webhook integration
│   │   └── init-db/              # Database initialization
│   ├── mentor/                   # Mentor-specific pages
│   │   └── confirm/              # Mentor confirmation page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # React components
│   ├── ui/                       # UI component library
│   ├── dashboard-layout.tsx      # Dashboard wrapper
│   ├── sidebar.tsx               # Navigation sidebar
│   ├── top-header.tsx            # Header component
│   └── theme-provider.tsx        # Theme context
├── hooks/                        # Custom React hooks
│   ├── use-mobile.ts             # Mobile detection
│   └── use-toast.ts              # Toast notifications
├── lib/                          # Utility libraries
│   ├── api-client.ts             # API client configuration
│   ├── apis.ts                   # API endpoint definitions
│   ├── auth.ts                   # Authentication utilities
│   ├── db.ts                     # Database queries
│   ├── db-connection.ts          # Database connection pool
│   ├── jwt.ts                    # JWT token handling
│   ├── s3.ts                     # AWS S3 utilities
│   ├── types.ts                  # TypeScript type definitions
│   └── utils.ts                  # General utilities
├── providers/                    # Context providers
│   └── QueryClientProvider.tsx   # React Query provider
├── public/                       # Static assets
├── scripts/                      # Utility scripts
│   └── init-db.ts                # Database initialization script
├── styles/                       # Additional styles
├── .env.local                    # Environment variables (not in git)
├── components.json               # Shadcn UI config
├── middleware.ts                 # Next.js middleware
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── yarn-lock.yaml                # Lock file
├── postcss.config.mjs            # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS config
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## 📚 API Documentation

### Authentication

#### POST `/api/auth/login`
Login with username and password.

**Request Body**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response**:
```json
{
  "user": {
    "id": 1,
    "username": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### Events

#### GET `/api/events`
Retrieve all events (requires authentication).

#### GET `/api/events/[id]`
Get a specific event by ID.

#### POST `/api/events`
Create a new event.

### Judges

#### GET `/api/judges`
Get judges list with optional filters.

**Query Parameters**:
- `eventDescription`: Filter by event description
- `eventId`: Filter by event ID

### Students

#### GET `/api/students`
Retrieve all students.

#### GET `/api/students/[id]`
Get student details by ID.

### Mentors

#### GET `/api/mentors`
Get mentor list.

#### POST `/api/mentors`
Add a new mentor.

### N8n Integration

#### POST `/api/n8n/email-trigger`
Trigger email workflow via N8n webhook.

For complete API documentation, see:
- [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- [API_SETUP.md](./API_SETUP.md)
- [FRONTEND_API_INTEGRATION.md](./FRONTEND_API_INTEGRATION.md)

## 📜 Available Scripts

```bash
# Development
yarn dev              # Start development server

# Building
yarn build            # Create production build
yarn start            # Start production server

# Code Quality
yarn lint             # Run ESLint

# Database
yarn run db:init      # Initialize database tables
yarn run db:test      # Test database connection

# Testing
yarn run test:api     # Run API tests
```

## 🧪 Testing

### API Testing

Test all API endpoints:
```bash
yarn run test:api
```

### Database Connection Testing

```bash
yarn run db:test
```

### Manual Testing

Use the provided test files:
- `test-apis.js` - API endpoint tests
- `test-rds-connection.js` - RDS connection verification
- `browser-console-test.js` - Browser-based API tests

For detailed testing instructions, see:
- [TESTING_APIS.md](./TESTING_APIS.md)
- [QUICK_TEST.md](./QUICK_TEST.md)

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

1. Build the application:
   ```bash
   yarn build
   ```

2. Start the production server:
   ```bash
   yarn start
   ```

3. Ensure all environment variables are set on your hosting platform

### Environment Variables for Production

Make sure to set these in your deployment platform:
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_SSL`
- `JWT_SECRET` (use a strong, unique secret)
- `N8N_WEBHOOK_URL` (if using email integration)

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "Add your descriptive commit message"
   ```

3. **Push to your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** to the `development` branch

### Code Standards

- Use TypeScript for type safety
- Follow existing code structure and naming conventions
- Write descriptive commit messages
- Test your changes before submitting
- Update documentation as needed

## 📄 License

This project is part of the TAMU CMIS system.


## 📞 Support

For issues and questions:
- Check existing documentation files
- Open an issue on GitHub
- Contact the development team

---

**Built with ❤️ for TAMU CMIS**
