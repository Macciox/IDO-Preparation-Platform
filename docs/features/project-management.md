# Project Management System

## Overview
Comprehensive project lifecycle management for IDO preparation with admin controls and project tracking.

## Features
- **Project Creation**: Admin-initiated project setup with auto-generated access tokens
- **Access Control**: Email-based whitelist system for project access
- **Project Sharing**: Secure access link generation for project stakeholders
- **Status Tracking**: Real-time completion progress monitoring

## Core Functionality

### Project Creation (Admin)
- Project name and description setup
- Automatic slug generation for URLs
- Unique access token creation
- Initial project owner assignment

### Whitelist Management
- Email-based access control
- Add/remove project collaborators
- Role-based permissions
- Access validation on project entry

### Project Access
- Direct access via project slug
- Token-based authentication
- Email verification against whitelist
- Automatic user redirection

## Data Structure

### Project Entity
```typescript
{
  id: number
  name: string
  description: string
  slug: string (auto-generated)
  accessToken: string (secure)
  userId: string (creator)
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Project Relations
- IDO Metrics (1:1)
- Platform Content (1:1)
- FAQs (1:many)
- Quiz Questions (1:many)
- Marketing Assets (1:1)
- Whitelist Entries (1:many)

## API Endpoints

### Admin Operations
- `POST /api/projects` - Create new project
- `GET /api/projects` - List all projects
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### User Operations
- `GET /api/projects/by-token/:token` - Access by token
- `GET /api/projects/slug/:slug` - Access by slug
- `GET /api/projects/user` - User's accessible projects

### Whitelist Management
- `POST /api/projects/:id/whitelist` - Add user to whitelist
- `DELETE /api/projects/:id/whitelist/:email` - Remove user
- `GET /api/projects/:id/whitelist` - List whitelist

## Security Features

### Access Control
- Token-based project access
- Email whitelist validation
- Role-based operation restrictions
- Secure slug generation

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention
- XSS protection in forms
- CSRF token validation

## Usage Instructions

### For Admins
1. Navigate to admin dashboard
2. Click "Create New Project"
3. Fill project details form
4. Add collaborator emails to whitelist
5. Share generated access link
6. Monitor progress in project list

### For Project Users
1. Access project via shared link
2. Verify email is whitelisted
3. Complete project forms
4. Track completion progress
5. Collaborate with team members

## Error Handling
- Invalid access tokens return 404
- Non-whitelisted emails redirect to unauthorized page
- Form validation errors with clear messaging
- Database constraint violations handled gracefully