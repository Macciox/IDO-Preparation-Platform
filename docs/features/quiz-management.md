# Quiz Management System (L2E)

## Overview
Learn-to-Earn (L2E) quiz question management system for educational content creation with dynamic question-answer handling.

## Features
- **Dynamic Question Creation**: Add unlimited quiz questions
- **Multiple Choice Support**: Question with answer options
- **Real-time Management**: Immediate updates and deletion
- **Educational Integration**: Learn-to-Earn functionality
- **Progress Tracking**: Contributes to completion metrics

## Technical Implementation

### Database Schema
```sql
CREATE TABLE quiz_questions (
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
- Answer input field (required)
- Add Question button
- Questions list with management controls

## User Interface

### Question Creation
- Modal dialog for new question entry
- Question text input with validation
- Answer field for correct response
- Save/Cancel actions

### Question Display
- List view of all questions
- Question text with associated answer
- Individual delete controls
- Empty state for no questions

## API Endpoints
- `POST /api/projects/:id/quiz-questions` - Create question
- `GET /api/projects/:id/quiz-questions` - List questions  
- `DELETE /api/quiz-questions/:id` - Remove question

## Progress Contribution
- Minimum 1 question required for L2E completion
- Binary contribution: 0% (no questions) or 100% (has questions)
- Integrates with overall project completion tracking

## Usage Instructions
1. Access L2E tab in project form
2. Click "Add Question" for new entry
3. Enter educational question text
4. Provide correct answer
5. Save to add to question bank
6. Delete questions as needed for content curation