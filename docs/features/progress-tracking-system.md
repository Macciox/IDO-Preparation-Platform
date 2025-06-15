# Progress Tracking System

## Overview
Real-time completion percentage calculation system that tracks project progress across all form sections with field-level status monitoring.

## Features
- **25-Field IDO Metrics**: Complete tracking of all IDO preparation fields
- **10-Field Platform Content**: Content and media asset completion tracking
- **3-Field Marketing Assets**: Marketing material completion monitoring
- **FAQ & L2E Tracking**: Binary completion status for question sections
- **Real-time Updates**: Instant progress calculation on status changes

## Progress Calculation Logic

### Field Categories and Weights
- **IDO Metrics**: 25 fields (Important Dates, Token Economics, Project Details, Token Info)
- **Platform Content**: 10 fields (Project Information, Documentation, Visual Assets)
- **Marketing Assets**: 3 fields (Marketing materials and campaign content)
- **FAQs**: Binary (0% no FAQs, 100% has FAQs)
- **L2E Questions**: Binary (0% no questions, 100% has questions)

### Status Values
- **Confirmed**: Field data is final and verified (contributes to progress)
- **Not Confirmed**: Field needs completion or review (no progress contribution)
- **Might Change**: Field pending approval (no progress contribution)

### Calculation Formula
```typescript
const totalFields = idoMetricsFields + platformContentFields + marketingFields;
const confirmedFields = fields.filter(status => status === "confirmed").length;
const progressPercentage = (confirmedFields / totalFields) * 100;

// FAQ and L2E add binary completion
if (project.faqs.length > 0) progressPercentage += faqWeight;
if (project.quizQuestions.length > 0) progressPercentage += l2eWeight;
```

## Technical Implementation

### Progress Components
- Dashboard header progress bar
- Form tab progress indicators
- Admin overview statistics
- Individual field status tracking

### Real-time Updates
- Form status changes trigger immediate recalculation
- Progress synced between form and dashboard views
- Auto-save preserves progress state
- Visual feedback on completion milestones

## Database Integration
All status fields stored with enum constraints:
```sql
status_field VARCHAR CHECK (status_field IN ('confirmed', 'not_confirmed', 'might_change'))
```

## API Endpoints
- Progress calculated server-side for consistency
- Real-time updates through form submission endpoints
- Progress included in project data responses

## Usage Instructions

### For Project Teams
1. Complete form fields section by section
2. Set status to "Confirmed" for finalized data
3. Monitor progress in dashboard header
4. Use "Might Change" for tentative information
5. Track completion towards 100% target

### For Administrators
1. Monitor project progress in admin dashboard
2. View completion statistics across all projects
3. Identify projects needing attention
4. Track team productivity and deadlines

## Progress Milestones
- **0-25%**: Initial setup and basic information
- **26-50%**: Token economics and technical details
- **51-75%**: Platform content and marketing materials
- **76-99%**: Final review and confirmation
- **100%**: Complete project ready for launch