# IDO Preparation Platform - Technical Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Data Structure](#data-structure)
4. [Features Documentation](#features-documentation)
5. [Usage Instructions](#usage-instructions)
6. [Technical Implementation](#technical-implementation)
7. [API Reference](#api-reference)
8. [Database Schema](#database-schema)

---

## System Overview

The IDO Preparation Platform is a comprehensive Web3 project management system designed for Initial DEX Offering (IDO) preparation. It provides role-based access control, real-time progress tracking, and collaborative tools for managing complex IDO launches.

### Core Components
- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth integration
- **UI Framework**: shadcn/ui components

---

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React/Vite)  │◄──►│   (Express.js)  │◄──►│   (PostgreSQL)  │
│                 │    │                 │    │                 │
│ - Admin Panel   │    │ - API Routes    │    │ - User Data     │
│ - Project Forms │    │ - Auth Middleware│   │ - Project Data  │
│ - Progress UI   │    │ - Data Validation│   │ - Form Data     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. **User Authentication**: Replit OAuth → Session Management
2. **Role Assignment**: Admin vs Project User access levels
3. **Data Operations**: CRUD operations with real-time updates
4. **Progress Calculation**: Dynamic completion percentage tracking

---

## Data Structure

### Core Entities

#### User
```typescript
interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Project
```typescript
interface Project {
  id: number;
  name: string;
  email: string;
  accessToken: string;
  slug: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### ProjectWithData (Complete Project View)
```typescript
interface ProjectWithData extends Project {
  idoMetrics?: IdoMetrics;
  platformContent?: PlatformContent;
  faqs: Faq[];
  quizQuestions: QuizQuestion[];
  marketingAssets?: MarketingAssets;
  whitelist?: ProjectWhitelist[];
  user: User;
}
```

---

## Features Documentation

### 1. Role-Based Access Control

#### Overview
Two-tier access system with distinct user roles and permissions.

#### User Roles
- **Admin Users**: Full access to all projects, user management, analytics
- **Project Users**: Access only to assigned projects via whitelist system

#### Implementation
```typescript
// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Token validation and session management
};

// Demo user bypass for development
const isAuthenticatedOrDemo: RequestHandler = async (req: any, res, next) => {
  // Special handling for demo users
};
```

#### Usage
- Admin access: Direct login with admin credentials
- Project access: Whitelist-based email verification or demo mode
- Automatic role detection based on user credentials

---

### 2. IDO Metrics Management

#### Overview
Comprehensive form system for collecting 22 essential IDO parameters.

#### Required Fields (22 total)
1. **Timeline Fields**: Whitelisting Date, IDO Date, Claiming Date, DEX Listing Date
2. **Financial Fields**: IDO Price, Tokens for Sale, Total Allocation, Token Price
3. **Vesting Fields**: Vesting Period, Cliff Period, TGE Percentage, Available at TGE
4. **Technical Fields**: Network, Contract Address, Minimum Tier, Grace Period
5. **Token Economics**: Initial Market Cap, Fully Diluted Market Cap, Circulating Supply, Total Supply
6. **Additional Fields**: Cliff Lock, Total Allocation Native Token

#### Optional Fields
- Transaction ID (not counted in progress calculation)

#### Status Options
- **Confirmed**: Final verified data
- **Not Confirmed**: Preliminary or unverified data
- **Might Change**: Subject to potential updates

#### Technical Implementation
```typescript
interface IdoMetrics {
  // Each field has corresponding status field
  whitelistingDate?: string;
  whitelistingDateStatus: StatusType;
  // ... 21 more field pairs
}
```

---

### 3. Platform Content Management

#### Overview
Social media and marketing content coordination system.

#### Required Fields (10 total)
1. **Basic Content**: Tagline, Description
2. **Social Media**: Twitter, Telegram, Discord URLs
3. **Media Channels**: YouTube, LinkedIn URLs  
4. **Documentation**: Roadmap, Team Page, Tokenomics URLs

#### Validation
- URL format validation for all link fields
- Required field enforcement with status tracking
- Real-time progress calculation

---

### 4. FAQ System

#### Overview
Frequently Asked Questions management with collaborative editing.

#### Features
- **Question Limit**: Maximum 5 FAQ entries per project
- **CRUD Operations**: Create, Read, Update, Delete functionality
- **Status Tracking**: Individual confirmation status per FAQ
- **Real-time Updates**: Instant synchronization across user roles

#### Data Structure
```typescript
interface Faq {
  id: number;
  projectId: number;
  order: number;
  question: string;
  answer: string;
  status: StatusType;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Usage Instructions
1. Click "Add FAQ" button (disabled at 5-question limit)
2. Enter question and detailed answer
3. Save to add to project FAQ list
4. Edit status using dropdown (Confirmed/Not Confirmed/Might Change)
5. Delete using trash icon if needed

---

### 5. Learn-to-Earn Quiz System

#### Overview
Interactive quiz system for community education and engagement.

#### Features
- **Question Format**: Multiple choice with 4 options (A, B, C, D)
- **Answer Validation**: Mandatory correct answer selection
- **Question Limit**: Maximum 5 quiz questions per project
- **Status Management**: Individual tracking per question

#### Data Structure
```typescript
interface QuizQuestion {
  id: number;
  projectId: number;
  order: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string; // 'a', 'b', 'c', or 'd'
  status: StatusType;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Usage Instructions
1. Click "Add Question" button
2. Enter question text
3. Fill all 4 options (A, B, C, D)
4. Select correct answer from dropdown
5. Save to add to quiz pool
6. Manage status and delete as needed

---

### 6. Marketing Assets Management

#### Overview
Digital asset coordination for marketing campaigns.

#### Required Fields (3 total)
1. **Logo**: Project logo file or URL
2. **Hero Banner**: Main promotional banner
3. **Drive Folder**: Shared folder with all marketing materials

#### Future Enhancements
- Direct file upload functionality
- Asset preview capabilities
- Version control for updated materials

---

### 7. Progress Tracking System

#### Overview
Real-time completion percentage calculation across all form sections.

#### Calculation Method
```typescript
// Total elements: 37
// IDO Metrics: 22 fields
// Platform Content: 10 fields
// Marketing Assets: 3 fields
// FAQ & L2E: 2 sections

const progress = Math.round((completedElements / totalElements) * 100);
```

#### Progress Display
- **Header Progress**: Overall completion percentage
- **Section Progress**: Individual section completion rates
- **Visual Indicators**: Color-coded progress bars and status indicators

---

### 8. Whitelist Management

#### Overview
Project-specific email access control system.

#### Features
- **Email-based Access**: Restrict project access to authorized emails
- **Admin Management**: Admins can add/remove whitelist entries
- **Demo Override**: Demo users bypass whitelist restrictions
- **Real-time Validation**: Instant access verification

#### Data Structure
```typescript
interface ProjectWhitelist {
  id: number;
  projectId: number;
  email: string;
  addedBy: string;
  createdAt: Date;
}
```

---

## Usage Instructions

### For Admin Users

#### Getting Started
1. Login with admin credentials
2. Access admin dashboard at root URL
3. View all projects and their progress
4. Create new projects using the form

#### Project Management
1. **Create Project**: Fill project name and assigned email
2. **Monitor Progress**: View completion percentages in project list
3. **Access Projects**: Click project name to view detailed forms
4. **Copy Access Links**: Share secure access tokens with project teams

#### Whitelist Management
1. Navigate to project details
2. Add authorized email addresses
3. Remove access when needed
4. Monitor access logs

### For Project Users

#### Getting Started
1. Receive access link from admin
2. Login via provided authentication
3. Access assigned project dashboard
4. Complete required form sections

#### Form Completion
1. **IDO Metrics**: Complete 22 required fields with appropriate status
2. **Platform Content**: Add all social media and documentation links
3. **FAQ**: Create up to 5 frequently asked questions
4. **L2E Quiz**: Develop up to 5 multiple-choice questions
5. **Marketing Assets**: Provide logo, banner, and shared folder links

#### Progress Monitoring
- Check overall completion percentage in header
- Monitor section-specific progress in dashboard
- Update field statuses as information is confirmed

---

## Technical Implementation

### Frontend Components

#### Page Structure
```
client/src/pages/
├── admin-dashboard.tsx     # Admin project overview
├── project-dashboard.tsx   # Project user interface
├── landing.tsx            # Public landing page
└── not-found.tsx          # 404 error page
```

#### Key Components
```
client/src/components/
├── project-form-tabs-fixed.tsx  # Main form interface
└── ui/                          # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── form.tsx
    └── ...
```

### Backend Architecture

#### Route Structure
```
server/
├── routes.ts              # API endpoint definitions
├── storage.ts             # Database operations
├── db.ts                  # Database connection
└── replitAuth.ts          # Authentication middleware
```

#### API Endpoints
```typescript
// Project Management
GET    /api/projects              # List all projects
GET    /api/projects/:id          # Get specific project
POST   /api/projects              # Create new project
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project

// Form Data
PUT    /api/projects/:id/ido-metrics        # Update IDO metrics
PUT    /api/projects/:id/platform-content   # Update platform content
PUT    /api/projects/:id/marketing-assets   # Update marketing assets

// FAQ Management
GET    /api/projects/:id/faqs               # List FAQs
POST   /api/projects/:id/faqs               # Create FAQ
PUT    /api/projects/:id/faqs/:faqId        # Update FAQ
DELETE /api/projects/:id/faqs/:faqId        # Delete FAQ

// Quiz Management
GET    /api/projects/:id/quiz-questions     # List quiz questions
POST   /api/projects/:id/quiz-questions     # Create quiz question
PUT    /api/projects/:id/quiz-questions/:qId # Update quiz question
DELETE /api/projects/:id/quiz-questions/:qId # Delete quiz question

// Whitelist Management
GET    /api/projects/:id/whitelist          # List whitelist
POST   /api/projects/:id/whitelist          # Add to whitelist
DELETE /api/projects/:id/whitelist          # Remove from whitelist
```

### Database Schema

#### Core Tables
```sql
-- User authentication and profiles
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE,
  first_name VARCHAR,
  last_name VARCHAR,
  profile_image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project definitions
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  access_token VARCHAR UNIQUE NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  user_id VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- IDO metrics with status tracking
CREATE TABLE ido_metrics (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  -- 22 data fields + 22 status fields
  whitelisting_date VARCHAR,
  whitelisting_date_status VARCHAR DEFAULT 'not_confirmed',
  -- ... additional fields
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Platform content management
CREATE TABLE platform_content (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  -- 10 content fields + 10 status fields
  tagline TEXT,
  tagline_status VARCHAR DEFAULT 'not_confirmed',
  -- ... additional fields
  updated_at TIMESTAMP DEFAULT NOW()
);

-- FAQ system
CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  order_num INTEGER NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  status VARCHAR DEFAULT 'not_confirmed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quiz questions for Learn-to-Earn
CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  order_num INTEGER NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL,
  status VARCHAR DEFAULT 'not_confirmed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Marketing assets tracking
CREATE TABLE marketing_assets (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  -- 3 asset fields + 3 status fields
  logo VARCHAR,
  logo_status VARCHAR DEFAULT 'not_confirmed',
  hero_banner VARCHAR,
  hero_banner_status VARCHAR DEFAULT 'not_confirmed',
  drive_folder VARCHAR,
  drive_folder_status VARCHAR DEFAULT 'not_confirmed',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project access whitelist
CREATE TABLE project_whitelist (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  email VARCHAR NOT NULL,
  added_by VARCHAR REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, email)
);

-- Session management for authentication
CREATE TABLE sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
```

### Error Handling

#### Frontend Error Management
```typescript
// Unauthorized error detection
export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

// Error handling in mutations
onError: (error) => {
  if (isUnauthorizedError(error)) {
    // Redirect to login
    window.location.href = "/api/login";
  } else {
    // Show error toast
    toast({ title: "Error", description: error.message });
  }
}
```

#### Backend Error Responses
```typescript
// Standard error format
{
  message: string;
  status: number;
  details?: any;
}
```

### Performance Optimizations

#### Frontend Optimizations
- React Query for efficient data fetching and caching
- Lazy loading for large form components
- Debounced input handling for real-time updates
- Optimistic updates for better user experience

#### Backend Optimizations
- Database connection pooling
- Query optimization with proper indexing
- Efficient data serialization
- Caching for frequently accessed data

---

## Development Environment

### Prerequisites
- Node.js 18+
- PostgreSQL 13+
- Replit account for authentication

### Local Setup
```bash
# Install dependencies
npm install

# Database setup
npm run db:push

# Start development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL=postgresql://...
SESSION_SECRET=your_session_secret
REPLIT_DOMAINS=your_domain.replit.app
ISSUER_URL=https://replit.com/oidc
REPL_ID=your_repl_id
```

---

## Security Considerations

### Authentication Security
- OAuth 2.0 integration with Replit
- Secure session management with database storage
- CSRF protection via SameSite cookies
- Automatic token refresh handling

### Data Protection
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries
- XSS protection through React's built-in escaping
- Role-based access control enforcement

### Privacy Compliance
- User data encryption in transit (HTTPS)
- Secure session storage
- Minimal data collection principles
- GDPR-compliant data handling

---

*Documentation last updated: June 15, 2025*
*Version: 1.4.0*