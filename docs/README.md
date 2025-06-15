# IDO Preparation Platform - Feature Documentation

## Overview
Complete documentation for the Web3 IDO preparation platform with role-based access control and comprehensive project management capabilities.

## Project Structure
```
docs/
├── features/           # Individual feature documentation
│   ├── authentication-system.md
│   ├── project-management.md
│   ├── ido-metrics-form.md
│   ├── platform-content-form.md
│   ├── marketing-assets-form.md
│   ├── faq-management.md
│   ├── quiz-management.md
│   ├── progress-tracking-system.md
│   └── dashboard-system.md
└── README.md          # This file
```

## Core Features

### 🔐 Authentication & Authorization
**File:** `authentication-system.md`
- Replit OAuth integration
- Role-based access control (Admin/Project User)
- Secure session management
- Auto-refresh token handling

### 📋 Project Management
**File:** `project-management.md`
- Project lifecycle management
- Email-based whitelist system
- Access token generation
- Project sharing capabilities

### 📊 IDO Metrics Form (25 Fields)
**File:** `ido-metrics-form.md`
- Comprehensive 25-field IDO preparation form
- Status tracking per field (Confirmed/Not Confirmed/Might Change)
- Categories: Important Dates, Token Economics, Project Details, Token Info
- Real-time progress calculation

### 🎨 Platform Content Management
**File:** `platform-content-form.md`
- 10-field content management system
- Project information and media assets
- URL validation and rich text support
- Social media and documentation links

### 📈 Marketing Assets
**File:** `marketing-assets-form.md`
- 3-field marketing content system
- Promotional materials management
- Campaign asset organization
- Marketing copy and graphics handling

### ❓ FAQ Management
**File:** `faq-management.md`
- Dynamic FAQ creation system
- Unlimited question-answer pairs
- Real-time updates and deletion
- Progress contribution tracking

### 🎓 Quiz Management (L2E)
**File:** `quiz-management.md`
- Learn-to-Earn quiz question system
- Educational content creation
- Multiple choice support
- Dynamic question management

### 📈 Progress Tracking
**File:** `progress-tracking-system.md`
- Real-time completion percentage calculation
- Field-level status monitoring
- Multi-section progress aggregation
- Visual progress indicators

### 🖥️ Dashboard System
**File:** `dashboard-system.md`
- Dual-dashboard architecture
- Role-based interface routing
- Real-time statistics and monitoring
- Responsive design implementation

## Field Alignment Summary

### IDO Metrics (25 Fields Total)
✅ **Important Dates (4 fields)**
- Whitelisting opens date/time
- Placing/IDO on Decubate date/time
- Claiming on Decubate date/time
- Initial DEX/CEX listing date

✅ **Token Economics (10 fields)**
- IDO Price
- Tokens for Sale
- Total allocation in $
- Token price for an event
- Token Price
- Total allocation in native token
- Available at TGE (%)
- Cliff/Lock
- Vesting Period
- Vesting Duration

✅ **Project Details (6 fields)**
- Token Ticker
- Network
- Grace Period (investment protection)
- Minimum tier
- Token Transfer TX-ID
- Token Contract address

✅ **Token Info (5 fields)**
- Initial Market Cap (Ex. liquidity) in $
- Initial Market Cap in $
- Fully diluted market cap in $
- Circulating supply TGE
- Circulating supply TGE %
- Total supply

### Platform Content (10 Fields)
- Project tagline, description, website, social links
- Documentation URLs (whitepaper, pitch deck, resources)
- Visual assets (logo, banner, video URLs)

### Marketing Assets (3 Fields)
- Marketing copy/description
- Promotional images/graphics  
- Campaign materials/assets

### Dynamic Sections
- **FAQs**: Unlimited question-answer pairs
- **L2E Questions**: Educational quiz content

## Technical Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect
- **State Management**: TanStack React Query
- **Form Handling**: React Hook Form + Zod validation

## Progress Calculation
- **Total Fields**: 40 status fields (25 IDO + 10 Platform + 3 Marketing + 2 binary sections)
- **Progress Formula**: (Confirmed fields / Total fields) × 100
- **Real-time Updates**: Instant recalculation on status changes

## Security Features
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- XSS and CSRF protection
- Secure session storage

## Getting Started
1. Review individual feature documentation in `/features/` directory
2. Each file contains technical implementation details, usage instructions, and API specifications
3. Features are designed as independent modules with clear interfaces
4. All documentation includes code examples and integration guidelines

## Deployment Ready
The platform is production-ready with:
- Comprehensive error handling
- Real-time data synchronization
- Mobile-responsive design
- Performance optimizations
- Security best practices