# API Integration Guide

This document explains how the frontend integrates with the aihealth-server backend.

## API Client

The API client is located at: `client/src/lib/api.ts`

### Architecture

```
Dashboard.tsx
    ↓ (uses)
api.ts (API Client)
    ↓ (calls)
aihealth-server (FastAPI Backend)
    ↓ (stores data in)
MongoDB + PostgreSQL
```

## API Functions

### 1. Progress Data

```typescript
import * as api from '@/lib/api';

const progress = await api.getWeightLossProgress(
  enrollmentId,  // optional, uses env var if not provided
  startDate,     // optional, ISO format
  endDate        // optional, ISO format
);

// Returns:
// - enrollment_id
// - patient_id
// - progress_data: Array<{date, weight, bmi, bodyFat}>
// - current_weight_kg
// - target_weight_kg
// - weight_lost_kg
// - progress_percentage
// - current_bmi
```

**Backend Endpoint:** `GET /weight-loss-agent/enrollment/{id}/progress`

**Usage in Dashboard:**
- Loads on component mount
- Powers the metrics cards (weight, BMI, progress %)
- Provides data for progress charts

### 2. InBody Reports

```typescript
// Get all reports
const reports = await api.getInBodyReports(enrollmentId);

// Upload new report
await api.uploadInBodyReport(enrollmentId, file);

// Returns:
// Array of InBodyReport objects with:
// - report_id
// - report_date
// - processed (boolean)
// - extraction_confidence
// - abnormal_indicators_count
// - measurements_count
// - ai_summary
// - original_filename
```

**Backend Endpoints:**
- `GET /weight-loss-agent/enrollment/{id}/inbody-reports`
- `POST /weight-loss-agent/enrollment/{id}/inbody-report`

**Usage in Dashboard:**
- Displays in "Reports" tab
- Upload via drag-and-drop or file picker
- Shows processing status and AI summary

### 3. Health Indicators

```typescript
const indicators = await api.getHealthIndicators(
  enrollmentId,
  reportId
);

// Returns:
// Array of HealthIndicator objects with:
// - indicator_id
// - indicator_name
// - indicator_type
// - value
// - unit
// - is_abnormal
// - abnormality_level
// - normal_range_min
// - normal_range_max
// - analysis_explanation
// - recommendations
```

**Backend Endpoint:** `GET /weight-loss-agent/enrollment/{id}/inbody-report/{report_id}/health-indicators`

**Usage in Dashboard:**
- Displays in "Health" tab
- Gets indicators from latest report
- Shows abnormal indicators with severity badges
- Displays recommendations

### 4. AI Chat

```typescript
const response = await api.chatWithAgent(
  enrollmentId,
  question,
  conversationId  // optional, for conversation continuity
);

// Returns:
// - response (string)
// - conversation_id
// - timestamp
```

**Backend Endpoint:** `POST /weight-loss-agent/enrollment/{id}/chat`

**Request Body:**
```json
{
  "question": "What's my current progress?",
  "conversation_id": "chat_123456"
}
```

**Usage in Dashboard:**
- Floating chat interface
- Maintains conversation context via conversationId
- Displays user and assistant messages

## Data Flow

### On Dashboard Load

```
1. Dashboard.tsx mounts
   ↓
2. useEffect calls loadData()
   ↓
3. Parallel API calls:
   - getWeightLossProgress()
   - getInBodyReports()
   ↓
4. If reports exist:
   - getHealthIndicators(latest report)
   ↓
5. State updated, UI renders
```

### On Report Upload

```
1. User selects file
   ↓
2. handleUploadReport(file)
   ↓
3. api.uploadInBodyReport()
   ↓
4. Backend processes file (AI analysis)
   ↓
5. Success: reload reports
   ↓
6. Display toast notification
```

### On Chat Message

```
1. User types message
   ↓
2. handleSendMessage(message)
   ↓
3. Add user message to UI immediately
   ↓
4. api.chatWithAgent()
   ↓
5. Backend generates AI response
   ↓
6. Add assistant message to UI
```

## Error Handling

All API functions use a centralized error handler:

```typescript
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    const result: APIResponse<T> = await response.json();
    return result.data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}
```

**Error Display:**
- Dashboard shows toast notifications
- Loading states prevent duplicate requests
- Console logs for debugging

## Response Format

All backend responses follow this structure:

```typescript
interface APIResponse<T> {
  status: string;        // "success" or "error"
  message: string;       // Human-readable message
  data: T;              // Actual response data
}
```

The API client automatically extracts the `data` field.

## Environment Configuration

```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000
VITE_ENROLLMENT_ID=your-enrollment-id-here
```

**Access in code:**
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENROLLMENT_ID = import.meta.env.VITE_ENROLLMENT_ID;
```

## Type Safety

All API types are defined in `client/src/lib/api.ts`:

- `ProgressDataPoint`
- `WeightLossProgressReport`
- `InBodyReport`
- `HealthIndicator`
- `ChatMessage`
- `ChatResponse`
- `WeightLossEnrollment`

TypeScript ensures type safety across the entire application.

## CORS Configuration

The backend must allow requests from the frontend origin.

**Backend CORS settings** (`aihealth-server/app/middlewares.py`):

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:8000",  # Backend
        # Add production URLs here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Authentication (Future)

Currently, authentication is disabled for development. In production:

1. Add auth tokens to API client
2. Use cookies or JWT tokens
3. Update fetchAPI to include auth headers

```typescript
// Future implementation
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken(); // Get from store/cookie
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options?.headers,
    },
  });
}
```

## Testing API Integration

### 1. Test Backend Connection

```bash
curl http://localhost:8000/health
```

### 2. Test Enrollment Endpoint

```bash
curl http://localhost:8000/weight-loss-agent/enrollment/YOUR_ID/progress
```

### 3. Test from Frontend

Open browser DevTools (F12) → Network tab to see:
- API requests
- Response data
- Error messages

### 4. Console Logs

The API client logs all errors:
```javascript
console.error(`API Error (${endpoint}):`, error);
```

## Debugging Tips

1. **Check Network Tab**: See actual API calls and responses
2. **Check Console**: See error logs from API client
3. **Check Backend Logs**: See server-side errors
4. **Verify Enrollment ID**: Make sure it exists in database
5. **Check CORS**: Ensure backend allows frontend origin

## Adding New API Endpoints

To add a new endpoint:

1. **Define types** in `api.ts`:
```typescript
export interface NewDataType {
  id: string;
  name: string;
}
```

2. **Create API function**:
```typescript
export async function getNewData(id: string): Promise<NewDataType> {
  return fetchAPI<NewDataType>(`/weight-loss-agent/new-endpoint/${id}`);
}
```

3. **Use in component**:
```typescript
import * as api from '@/lib/api';

const data = await api.getNewData(id);
```

## Performance Optimization

### Current Approach
- Load all data on mount
- Reload specific data after mutations (e.g., after upload)

### Future Improvements
- Use React Query for caching
- Implement pagination for reports
- Add optimistic updates
- Use WebSockets for real-time chat

## Related Files

- API Client: `client/src/lib/api.ts`
- Dashboard: `client/src/components/Dashboard.tsx`
- Chat: `client/src/components/ChatInterface.tsx`
- Backend Router: `aihealth-server/rest_server/weight_loss_agent/router.py`
- Backend Service: `aihealth-server/lib/services/weight_loss_agent_service.py`

