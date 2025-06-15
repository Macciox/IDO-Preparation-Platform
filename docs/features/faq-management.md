# FAQ Management System

## Overview
Dynamic FAQ creation and management system allowing unlimited question-answer pairs with real-time addition and deletion capabilities.

## Features
- **Dynamic FAQ Creation**: Add unlimited question-answer pairs
- **Real-time Updates**: Immediate display after creation
- **Bulk Management**: Add multiple FAQs in sequence
- **Deletion Control**: Remove individual FAQ entries
- **Progress Tracking**: Contributes to overall completion percentage

## Technical Implementation

### Database Schema
```sql
CREATE TABLE faqs (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Form Structure
- Question input field (required)
- Answer textarea (required) 
- Add FAQ button for submission
- FAQ list with delete options

## User Interface

### FAQ Creation Dialog
- Modal dialog for new FAQ entry
- Question field with validation
- Expandable answer textarea
- Cancel/Save actions

### FAQ Display
- Accordion-style question list
- Expandable answers on click
- Delete button per FAQ entry
- Empty state messaging

## API Endpoints
- `POST /api/projects/:id/faqs` - Create new FAQ
- `GET /api/projects/:id/faqs` - List project FAQs
- `DELETE /api/faqs/:id` - Remove specific FAQ

## Progress Contribution
- Minimum 1 FAQ required for completion
- Each additional FAQ enhances project completeness
- Binary contribution: 0% (no FAQs) or 100% (has FAQs)

## Usage Instructions
1. Navigate to FAQs tab in project form
2. Click "Add FAQ" to open creation dialog
3. Enter question and detailed answer
4. Save to add to project FAQ list
5. Use delete button to remove entries
6. Progress updates automatically with first FAQ