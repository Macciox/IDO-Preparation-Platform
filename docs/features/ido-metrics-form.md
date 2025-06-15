# IDO Metrics Form System

## Overview
Comprehensive 22-field form system for IDO (Initial DEX Offering) preparation with status tracking and progress calculation.

## Features
- **22 Required Fields**: Complete IDO metrics collection
- **Status Tracking**: Confirmed/Not Confirmed/Might Change per field
- **Progress Calculation**: Real-time completion percentage
- **Auto-save**: Automatic form data persistence
- **Validation**: Zod schema validation for all inputs

## Field Categories

### Important Dates (4 fields)
- Whitelisting Date/Time
- Placing/IDO on Decubate Date/Time
- Claiming on Decubate Date/Time
- Initial DEX/CEX Listing Date

### Token Economics (8 fields)
- IDO Price
- Tokens for Sale
- Total Allocation ($)
- Token Price for Event
- Total Allocation (Native Token)
- Available at TGE (%)
- Cliff/Lock Period
- Vesting Duration

### Project Details (6 fields)
- Token Ticker
- Network
- Grace Period (Investment Protection)
- Minimum Tier
- Token Transfer TX-ID
- Token Contract Address

### Token Info (4 fields)
- Initial Market Cap (Ex. liquidity) ($)
- Initial Market Cap ($)
- Fully Diluted Market Cap ($)
- Circulating Supply TGE
- Total Supply

## Technical Implementation

### Form Schema
```typescript
const idoMetricsSchema = z.object({
  // Each field has value + status
  whitelistingDate: z.string().optional(),
  whitelistingDateStatus: z.enum(["confirmed", "not_confirmed", "might_change"]),
  // ... 21 more field pairs
});
```

### Status Options
- **Confirmed**: Field data is final and verified
- **Not Confirmed**: Field needs review or completion
- **Might Change**: Field may require updates

### Progress Calculation
- Total fields: 22 (IDO Metrics only)
- Confirmed fields / 22 * 100 = Progress percentage
- Real-time updates on status changes
- Synced between form and dashboard header

## Data Persistence

### Database Schema
```sql
CREATE TABLE ido_metrics (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  whitelisting_date VARCHAR,
  whitelisting_date_status VARCHAR DEFAULT 'not_confirmed',
  -- ... all 22 field pairs
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints
- `POST /api/projects/:id/ido-metrics` - Save/update metrics
- `GET /api/projects/:id/ido-metrics` - Retrieve metrics

## Form Sections

### Section 1: Important Dates
Grid layout with date inputs and status selectors for critical timeline events.

### Section 2: Token Economics
Financial and tokenomics data including pricing, allocation, and vesting details.

### Section 3: Additional Details
Network configuration, tiers, and technical specifications.

### Section 4: Token Information
Market cap calculations and supply metrics for launch planning.

## Usage Instructions

### For Project Teams
1. Access project via whitelist
2. Navigate to IDO Metrics tab
3. Complete fields section by section
4. Set status for each field appropriately
5. Monitor progress in header
6. Save changes automatically

### Status Management
- Start with "Not Confirmed" for all fields
- Update to "Confirmed" when data is final
- Use "Might Change" for tentative information
- Progress updates immediately on status change

## Validation Rules
- Date fields accept flexible string formats
- Numeric fields for percentages and amounts
- Required network selection from predefined list
- Token addresses validated for format
- Status selection mandatory for progress tracking

## Integration Points
- Dashboard progress display
- Project completion tracking
- Admin overview statistics
- Export capabilities for reporting