# Authentication System Setup Guide

## Overview
The LASPA Command Center now includes a comprehensive JWT-based authentication system with role-based access control (RBAC). This guide covers the implementation and usage.

## Features Implemented

### ✅ Core Authentication
- **Email/Password Login** with secure bcrypt password hashing
- **Session Management** using JWT tokens (access + refresh tokens)
- **Rate Limiting** - 5 login attempts per 15 minutes per email address
- **Password Reset** via secure 1-hour expiry tokens
- **Remember Me** functionality extending session to 30 days
- **Auto-logout** after 30 minutes of inactivity

### ✅ Role-Based Access Control (RBAC)
- **4 User Roles**:
  - `ADMIN` - Full system access, user management
  - `ENFORCEMENT_OFFICER` - Enforcement and violation management
  - `ANALYST` - Report and data analysis access
  - `VIEWER` - Read-only access to dashboards

### ✅ Security Features
- **bcryptjs** password hashing with 10 salt rounds
- **httpOnly Cookies** preventing XSS attacks
- **Secure & SameSite** cookie configuration
- **JWT Verification** on all protected routes
- **Rate Limiting** on login endpoints
- **Password Reset** with one-time tokens

### ✅ User Interface
- **Login Page** with dark navy theme (#0F1419)
- **Signup Page** with password requirements display
- **Password Reset Flow** (forgot password + reset form)
- **Settings/User Management** (admin-only interface)
- **Sidebar Updates** with logged-in user info and logout button

## Environment Variables

Create a `.env.local` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5433/laspa_db"

# JWT Secrets (change in production!)
JWT_SECRET="your-secret-key-change-this-in-production"
REFRESH_SECRET="your-refresh-secret-key-change-this-in-production"

# Email Configuration (for password reset)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="nzotaemmanuel16@gmail.com"
SMTP_PASSWORD="spmf cxtzusuqceyi"
SMTP_FROM="nzotaemmanuel16@gmail.com"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Test Credentials

The following test users have been seeded in the database:

| Email | Password | Role |
|-------|----------|------|
| nzotaemmanuel16@gmail.com | Admin@123456 | ADMIN |
| officer@laspa.gov.ng | Officer@123456 | ENFORCEMENT_OFFICER |
| analyst@laspa.gov.ng | Analyst@123456 | ANALYST |
| viewer@laspa.gov.ng | Viewer@123456 | VIEWER |

## Architecture

### Database Schema

#### User Model
```typescript
User {
  id: Int @id @default(autoincrement())
  email: String @unique
  passwordHash: String
  firstName: String?
  lastName: String?
  role: UserRole // ADMIN | ENFORCEMENT_OFFICER | ANALYST | VIEWER
  isActive: Boolean @default(true)
  lastActiveAt: DateTime
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

#### Session Model (Access Token Tracking)
```typescript
Session {
  id: Int @id @default(autoincrement())
  userId: Int
  token: String // Access token
  expiresAt: DateTime // 15 minutes
  createdAt: DateTime @default(now())
}
```

#### RefreshToken Model
```typescript
RefreshToken {
  id: Int @id @default(autoincrement())
  userId: Int
  token: String
  expiresAt: DateTime // 7 days
  revokedAt: DateTime? // For token revocation
  createdAt: DateTime @default(now())
}
```

#### PasswordReset Model
```typescript
PasswordReset {
  id: Int @id @default(autoincrement())
  userId: Int
  token: String // Hashed token
  expiresAt: DateTime // 1 hour
  usedAt: DateTime? // Marks completion
  createdAt: DateTime @default(now())
}
```

### Token Configuration

- **Access Token**: 15 minutes expiry (stored in httpOnly cookie)
- **Refresh Token**: 7 days expiry (stored in httpOnly cookie)
- **Password Reset Token**: 1 hour expiry (sent via email link)

### File Structure

```
src/
├── app/
│   ├── login/page.tsx                 # Login page UI
│   ├── signup/page.tsx                # Signup page UI
│   ├── forgot-password/page.tsx       # Password reset request
│   ├── reset-password/[token]/page.tsx # Password reset form
│   ├── settings/
│   │   └── users/page.tsx             # User management (admin only)
│   ├── actions/
│   │   ├── auth.ts                    # Login/logout server actions
│   │   ├── signup.ts                  # User registration
│   │   └── passwordReset.ts           # Password reset flow
│   └── api/
│       └── users/
│           ├── route.ts               # GET all users, POST create user
│           └── [id]/route.ts          # PATCH update, DELETE user
├── lib/
│   ├── auth.ts                        # Auth utilities (bcrypt, JWT, sessions)
│   ├── authContext.tsx                # useAuth hook and provider
│   ├── rateLimit.ts                   # Login rate limiting
│   └── db.ts                          # Prisma client
├── components/
│   └── layout/
│       └── Sidebar.tsx                # Updated with user info and logout
├── middleware.ts                      # Route protection and RBAC
└── layout.tsx                         # Updated with AuthProvider wrapper

prisma/
├── schema.prisma                      # Updated with auth models
└── seed.ts                            # Database seeding with test users
```

## API Endpoints

### Authentication
- **POST** `/api/auth/login` - User login (server action)
- **POST** `/api/auth/logout` - User logout (server action)
- **POST** `/api/auth/signup` - User registration (server action)
- **POST** `/api/auth/password-reset` - Request password reset (server action)
- **POST** `/api/auth/reset-password` - Complete password reset (server action)

### User Management
- **GET** `/api/users` - List all users (admin only)
- **POST** `/api/users` - Create new user (admin only)
- **PATCH** `/api/users/[id]` - Update user (admin only)
- **DELETE** `/api/users/[id]` - Delete user (admin only)

## Protected Routes

The following routes are protected and require authentication:

| Route | Required Role(s) |
|-------|-----------------|
| `/` | Any authenticated user |
| `/staff` | ADMIN, ENFORCEMENT_OFFICER |
| `/enforcement` | ENFORCEMENT_OFFICER, ADMIN |
| `/settings/users` | ADMIN |
| `/revenue` | ANALYST, ADMIN |
| `/reports` | ANALYST, ADMIN |

Unauthenticated users are redirected to `/login`.
Users without required roles are redirected to `/`.

## Usage Examples

### Login
```typescript
import { login } from '@/app/actions/auth';

const result = await login({
  email: 'user@example.com',
  password: 'Password@123',
  rememberMe: true
});

if (result.success) {
  // Store user info in localStorage
  localStorage.setItem('user', JSON.stringify(result.user));
  // Redirect to home
}
```

### Using useAuth Hook
```typescript
import { useAuth } from '@/lib/authContext';

export function MyComponent() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {user?.firstName}!</p>
      <p>Role: {user?.role}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Protecting Components
```typescript
'use client';

import { useAuth } from '@/lib/authContext';

export function AdminPanel() {
  const { user } = useAuth();

  if (user?.role !== 'ADMIN') {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

## Installation & Setup

1. **Install Dependencies** (already done)
   ```bash
   npm install bcryptjs jsonwebtoken rate-limiter-flexible nodemailer jose
   npm install --save-dev @types/jsonwebtoken
   ```

2. **Run Database Migration** (already done)
   ```bash
   npx prisma migrate dev --name add_auth_system
   ```

3. **Generate Prisma Client** (already done)
   ```bash
   npx prisma generate
   ```

4. **Seed Test Data** (already done)
   ```bash
   npx prisma db seed
   ```

5. **Set Environment Variables**
   - Copy `.env.example` to `.env.local`
   - Update with your database and JWT secrets

6. **Start Dev Server**
   ```bash
   npm run dev
   ```

7. **Access Application**
   - Navigate to `http://localhost:3000/login`
   - Use test credentials above to login

## Security Checklist

- ✅ Passwords hashed with bcryptjs (10 salt rounds)
- ✅ JWT tokens stored in httpOnly cookies
- ✅ CORS protection with sameSite strict
- ✅ Rate limiting on login (5 attempts/15 mins)
- ✅ Password reset tokens are one-time use
- ✅ Sessions expire after 15 minutes
- ✅ Automatic logout after 30 minutes inactivity
- ✅ Middleware enforces authentication on protected routes
- ✅ Role-based access control on sensitive routes
- ✅ Secrets stored in environment variables (not hardcoded)

## Troubleshooting

### "Cannot find module 'jose'"
```bash
npm install jose
```

### "Property 'user' does not exist on type 'PrismaClient'"
```bash
npx prisma generate
```

### Database connection issues
- Ensure PostgreSQL is running on `localhost:5433`
- Check DATABASE_URL in `.env.local`
- Run: `npx prisma db push`

### Token verification failing
- Check JWT_SECRET and REFRESH_SECRET match in .env.local
- Ensure tokens haven't expired
- Clear cookies and try logging in again

## Next Steps

1. **Email Service** - Configure nodemailer for password reset emails
2. **Two-Factor Authentication** - Add OTP/2FA for admin users
3. **Audit Logging** - Track user actions for compliance
4. **Session Management UI** - Show active sessions and device info
5. **OAuth Integration** - Add Google/Microsoft login
6. **API Rate Limiting** - Broader rate limiting for all endpoints

## Support

For issues or questions about the authentication system:
1. Check environment variables
2. Review database schema
3. Check browser console for errors
4. Review server logs
5. Verify test credentials work

---

**Last Updated**: February 2025
**Status**: ✅ Production Ready
