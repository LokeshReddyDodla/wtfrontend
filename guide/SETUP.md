# Weight Loss Agent Frontend Setup

This frontend connects to the aihealth-server backend (FastAPI).

## Prerequisites

1. **Backend Server Running**: Make sure your aihealth-server is running on `http://localhost:8000`
2. **Test Enrollment**: You need a valid enrollment_id from the backend

## Environment Configuration

### Step 1: Create .env.local file

Create a file named `.env.local` in the root directory:

```bash
# Backend API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_ENROLLMENT_ID=your-enrollment-id-here
```

### Step 2: Get an Enrollment ID

#### Option A: Use existing enrollment
If you already have an enrollment_id, use that.

#### Option B: Create a new enrollment

```bash
curl -X POST "http://localhost:8000/weight-loss-agent/enroll" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "YOUR_PATIENT_ID",
    "program_goals": "Lose 10kg in 3 months through healthy diet and exercise",
    "target_weight_kg": 70.0,
    "target_bmi": 24.0,
    "enrolled_by_care_provider_id": "YOUR_CARE_PROVIDER_ID"
  }'
```

Copy the `enrollment_id` from the response and add it to your `.env.local` file.

## Installation & Running

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is busy).

## API Endpoints Used

- `GET /weight-loss-agent/enrollment/{id}/progress` - Get weight loss progress data
- `GET /weight-loss-agent/enrollment/{id}/inbody-reports` - Get InBody reports
- `GET /weight-loss-agent/enrollment/{id}/inbody-report/{report_id}/health-indicators` - Get health indicators
- `POST /weight-loss-agent/enrollment/{id}/inbody-report` - Upload InBody report
- `POST /weight-loss-agent/enrollment/{id}/chat` - Chat with AI agent

## Features

- **Dashboard Overview**: View weight, BMI, progress metrics
- **Progress Charts**: Visualize weight loss trends over time
- **InBody Reports**: Upload and view InBody scan reports
- **Health Indicators**: Track health metrics with AI insights
- **AI Chat Assistant**: Ask questions about your progress

## Troubleshooting

### "VITE_ENROLLMENT_ID not configured" error
- Make sure you've created `.env.local` file
- Check that VITE_ENROLLMENT_ID is set
- Restart the dev server after changing .env.local

### API Connection Errors
- Verify backend is running: `curl http://localhost:8000/health`
- Check VITE_API_BASE_URL is correct
- Check browser console for CORS errors

### No Data Showing
- Verify enrollment_id exists in database
- Upload some InBody reports via the UI
- Add some weight measurements via backend API

