# Marketing Assets Form System

## Overview
3-field marketing content management system for promotional materials and campaign assets with status tracking.

## Features
- **3 Marketing Fields**: Essential promotional content collection
- **Status Tracking**: Confirmed/Not Confirmed/Might Change per field
- **File Upload Support**: Asset management capabilities
- **Campaign Integration**: Marketing material organization
- **Progress Tracking**: Contributes to overall completion

## Field Structure

### Marketing Content (3 fields)
- Marketing Copy/Description
- Promotional Images/Graphics
- Campaign Materials/Assets

## Technical Implementation

### Form Schema
```typescript
const marketingAssetsSchema = z.object({
  marketingCopy: z.string().optional(),
  marketingCopyStatus: z.enum(["confirmed", "not_confirmed", "might_change"]),
  promotionalImages: z.string().optional(),
  promotionalImagesStatus: z.enum(["confirmed", "not_confirmed", "might_change"]),
  campaignMaterials: z.string().optional(),
  campaignMaterialsStatus: z.enum(["confirmed", "not_confirmed", "might_change"])
});
```

### Database Schema
```sql
CREATE TABLE marketing_assets (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id),
  marketing_copy TEXT,
  marketing_copy_status VARCHAR DEFAULT 'not_confirmed',
  promotional_images TEXT,
  promotional_images_status VARCHAR DEFAULT 'not_confirmed',
  campaign_materials TEXT,
  campaign_materials_status VARCHAR DEFAULT 'not_confirmed',
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Progress Contribution
- 3 fields contribute to overall project completion
- Each confirmed field adds 33.3% to marketing section
- Integrated with main progress calculation
- Real-time updates on status changes

## API Integration
- `POST /api/projects/:id/marketing-assets` - Save assets
- `GET /api/projects/:id/marketing-assets` - Retrieve assets
- Automatic upsert operations for updates

## Usage Instructions
1. Access Marketing tab in project form
2. Add marketing copy and descriptions
3. Upload or link promotional materials
4. Organize campaign assets
5. Set status for each asset type
6. Monitor completion progress