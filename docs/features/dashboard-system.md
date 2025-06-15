# Dashboard System

## Overview
Dual-dashboard architecture providing role-specific interfaces for administrators and project users with comprehensive project management and monitoring capabilities.

## Features
- **Admin Dashboard**: Complete project oversight and management
- **Project Dashboard**: Individual project access and form completion
- **Role-based Access**: Automatic routing based on user permissions
- **Real-time Statistics**: Live project progress and completion metrics
- **Responsive Design**: Optimized for desktop and mobile access

## Admin Dashboard

### Core Functionality
- Project creation and management
- User whitelist administration
- Progress monitoring across all projects
- Access link generation and sharing
- Project statistics and analytics

### Key Components
- Project creation form with validation
- Project list with progress indicators
- Whitelist management interface
- Statistics overview panel
- Action buttons for project operations

### Project Management
```typescript
// Project creation with auto-generated tokens
const newProject = {
  name: string,
  description: string,
  slug: auto-generated,
  accessToken: secure-random,
  userId: currentUser.id
};
```

## Project Dashboard

### Core Functionality
- Access via project slug or access token
- Multi-tab form interface (IDO Metrics, Platform Content, Marketing, FAQs, L2E)
- Real-time progress tracking
- Auto-save functionality
- Status management per field

### Form Sections
1. **IDO Metrics**: 25 comprehensive fields for token launch preparation
2. **Platform Content**: 10 fields for project information and media
3. **Marketing Assets**: 3 fields for promotional materials
4. **FAQs**: Dynamic question-answer management
5. **L2E Questions**: Educational content creation

### Progress Visualization
- Header progress bar with percentage
- Section-specific completion indicators
- Field-level status badges
- Real-time updates on changes

## Technical Implementation

### Routing Logic
```typescript
// Role-based dashboard routing
if (isAuthenticated && user.role === 'admin') {
  return <AdminDashboard />;
} else if (isAuthenticated && hasProjectAccess) {
  return <ProjectDashboard />;
} else {
  return <Landing />;
}
```

### State Management
- React Query for server state
- Form state with react-hook-form
- Real-time progress calculation
- Optimistic updates for better UX

### Data Flow
1. User authentication verification
2. Role and access permission checks
3. Project data fetching
4. Form state initialization
5. Real-time progress updates

## Security Features

### Access Control
- JWT-based authentication
- Role-based route protection
- Project-specific access tokens
- Email whitelist validation

### Data Protection
- Input sanitization and validation
- XSS prevention in forms
- CSRF token protection
- Secure session management

## API Integration

### Admin Operations
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/stats` - Dashboard statistics

### Project Operations
- `GET /api/projects/by-token/:token` - Access by token
- `POST /api/projects/:id/ido-metrics` - Save IDO data
- `POST /api/projects/:id/platform-content` - Save content
- `POST /api/projects/:id/marketing-assets` - Save marketing data

## Usage Instructions

### For Administrators
1. Log in through landing page
2. Access admin dashboard automatically
3. Create projects with whitelist management
4. Monitor progress across all projects
5. Share access links with team members
6. Track completion statistics

### For Project Users
1. Access project via shared link
2. Verify email against whitelist
3. Complete forms section by section
4. Set field status appropriately
5. Monitor progress in real-time
6. Collaborate with team members

## Performance Optimizations
- Lazy loading of form sections
- Debounced auto-save functionality
- Optimistic UI updates
- Efficient re-rendering with React Query
- Progressive data loading

## Mobile Responsiveness
- Responsive grid layouts
- Touch-friendly form controls
- Optimized navigation for small screens
- Consistent experience across devices