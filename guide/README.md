# Weight Loss Agent Frontend

A modern, React-based dashboard for tracking weight loss progress, analyzing InBody reports, and getting AI-powered health insights.

## 🚀 Features

- **Real-time Dashboard**: View current weight, BMI, and progress metrics
- **Progress Visualization**: Interactive charts showing weight loss trends
- **InBody Report Management**: Upload, view, and analyze InBody scan reports
- **Health Indicators**: Track detailed health metrics with AI insights
- **AI Chat Assistant**: Get personalized advice and answers about your health journey
- **Responsive Design**: Beautiful UI that works on all devices

## 🏗️ Architecture

This frontend is built with:
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful UI components
- **Recharts** for data visualization
- **React Query** for data fetching (optional)

### Backend Integration

This frontend connects to the **aihealth-server** backend (FastAPI/Python):
- Located at: `/Users/lokeshreddydodla/aihealth-server`
- API Base URL: `http://localhost:8000` (configurable)
- Uses REST API endpoints under `/weight-loss-agent`

## 📋 Prerequisites

1. **Node.js** v18+ and npm
2. **aihealth-server** running on port 8000
3. **Valid enrollment ID** from the backend

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_ENROLLMENT_ID=your-enrollment-id-here
```

**Getting an Enrollment ID:**

You need to create a patient enrollment in the backend first.

**Easiest way - Use the web interface:**
```bash
# Open enroll.html in your browser
open enroll.html
```

**Or use helper script:**
```bash
npm run enroll YOUR_PATIENT_ID
```

**Or manual curl:**
```bash
curl -X POST "http://localhost:8000/weight-loss-agent/enroll" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "YOUR_PATIENT_ID",
    "program_goals": "Lose 10kg in 3 months",
    "target_weight_kg": 70.0,
    "target_bmi": 24.0,
    "enrolled_by_care_provider_id": "YOUR_DOCTOR_ID"
  }'
```

Copy the `enrollment_id` from the response and add it to `.env.local`.

See [SETUP.md](./SETUP.md) for detailed enrollment instructions.

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
wtl-main/
├── client/                    # Frontend code
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Dashboard.tsx      # Main dashboard
│   │   │   ├── ChatInterface.tsx  # AI chat
│   │   │   ├── ProgressCharts.tsx # Charts
│   │   │   ├── InBodyReports.tsx  # Report management
│   │   │   ├── HealthIndicators.tsx # Health metrics
│   │   │   └── ui/               # shadcn UI components
│   │   ├── lib/
│   │   │   ├── api.ts            # Backend API client
│   │   │   └── utils.ts          # Utilities
│   │   ├── hooks/               # React hooks
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Entry point
│   └── index.html
├── server/                    # Backend (optional - not used with aihealth-server)
├── SETUP.md                   # Detailed setup guide
└── README.md                  # This file
```

## 🔌 API Integration

The frontend uses the following backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/weight-loss-agent/enrollment/{id}/progress` | GET | Get progress data |
| `/weight-loss-agent/enrollment/{id}/inbody-reports` | GET | List InBody reports |
| `/weight-loss-agent/enrollment/{id}/inbody-report/{report_id}/health-indicators` | GET | Get health indicators |
| `/weight-loss-agent/enrollment/{id}/inbody-report` | POST | Upload InBody report |
| `/weight-loss-agent/enrollment/{id}/chat` | POST | Chat with AI agent |

All API calls are handled through `/client/src/lib/api.ts`.

## 🎨 UI Components

This project uses **shadcn/ui** components. Available components:

- Cards, Buttons, Tabs
- Charts (via Recharts)
- Dialogs, Dropdowns, Tooltips
- Forms, Inputs, Textareas
- And many more...

To add new components:

```bash
npx shadcn-ui@latest add component-name
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run check        # Type check
```

### Hot Reload

The dev server supports hot module replacement (HMR) for instant updates.

### TypeScript

This project is fully typed with TypeScript. API types are defined in `client/src/lib/api.ts`.

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates a production build in `dist/public/`.

### Deployment Options

1. **Static Hosting** (Vercel, Netlify, etc.)
   - Deploy the `dist/public` folder
   - Set environment variables in hosting platform

2. **Docker** (if needed)
   - Use the existing Dockerfile in `deployment/` folder

3. **Integrate with Backend**
   - The backend can serve this frontend as static files

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_ENROLLMENT_ID` | Patient enrollment ID | (required) |

### Vite Config

Edit `vite.config.ts` to customize:
- Path aliases
- Build options
- Plugins
- Proxy settings

## 🐛 Troubleshooting

### "VITE_ENROLLMENT_ID not configured"

- Create `.env.local` file with `VITE_ENROLLMENT_ID`
- Restart dev server after changing env vars

### CORS Errors

- Ensure backend allows `http://localhost:5173` origin
- Check backend CORS configuration

### No Data Loading

- Verify backend is running: `curl http://localhost:8000/health`
- Check enrollment ID exists in database
- Open browser DevTools to see network requests

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)

## 🤝 Contributing

This is an internal project. For questions, contact the development team.

## 📝 License

See [LICENSE](./LICENSE) file.

---

**Backend Repository**: `/Users/lokeshreddydodla/aihealth-server`

