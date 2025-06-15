# Authentication System

## Overview
Role-based authentication system with Replit OpenID Connect integration supporting admin and project user roles.

## Features
- **Replit OAuth Integration**: Single sign-on with Replit accounts
- **Role-based Access Control**: Admin and project user permissions
- **Session Management**: Secure session storage with PostgreSQL
- **Auto-refresh Tokens**: Automatic token renewal for seamless experience

## User Roles

### Admin Users
- Full project management capabilities
- Create, edit, delete projects
- Manage project whitelist
- Access admin dashboard with project statistics

### Project Users
- Access only whitelisted projects
- View and edit assigned project data
- Complete project forms and track progress

## Technical Implementation

### Authentication Flow
1. User navigates to `/api/login`
2. Redirected to Replit OAuth
3. Upon success, session created with user claims
4. Auto-redirect to originally requested page

### Session Storage
- PostgreSQL-based session store
- 7-day session lifetime
- Secure HTTP-only cookies
- CSRF protection enabled

### API Protection
Protected endpoints use `isAuthenticated` middleware that:
- Validates session existence
- Checks token expiration
- Auto-refreshes expired tokens
- Returns 401 for unauthorized requests

## Usage Instructions

### For Admins
1. Log in through the landing page
2. Access admin dashboard at root path
3. Create new projects with whitelist management
4. Monitor project completion progress

### For Project Users
1. Log in with whitelisted email
2. Access assigned projects only
3. Complete project forms section by section
4. Track completion progress in real-time

## Environment Variables
- `SESSION_SECRET`: Session encryption key
- `DATABASE_URL`: PostgreSQL connection string
- `REPLIT_DOMAINS`: Authorized domain list
- `ISSUER_URL`: OpenID Connect provider URL

## Error Handling
- Page-level: Automatic redirect to login with toast notification
- API-level: 401 responses with retry mechanism
- Session timeout: Graceful re-authentication flow