# Weight Loss Agent - Frontend

A comprehensive health tracking dashboard for weight loss programs with AI-powered insights.

## 🚀 Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🔧 Configuration

No environment variables needed! Configuration is handled in `client/src/config.ts`.

### For Development
The app automatically uses `http://localhost:8000` when running on localhost.

### For Production
Edit `client/src/config.ts` and update the production URL:
```typescript
// Change this line to your production backend URL
return 'https://your-backend-domain.com';
```

## 📦 Project Structure

```
wtl-main/
├── client/          # Frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── lib/         # Utilities and API clients
│   │   └── hooks/       # Custom React hooks
│   └── public/      # Static assets
├── server/          # Backend services
├── shared/          # Shared types and schemas
├── scripts/         # Development scripts
└── guide/           # Documentation
```

## 🌟 Features

- **Progress Tracking**: Visual charts comparing latest vs previous reports
- **InBody Reports**: Upload and analyze body composition reports
- **Health Indicators**: Track key health metrics
- **AI Chat**: Interactive AI health coach
- **Real-time Comparison**: Automatic calculation of progress between reports

## 📚 Documentation

All documentation is available in the `/guide` folder:
- Setup guides
- API integration
- Deployment instructions
- Feature documentation

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 📝 License

See LICENSE file for details.

---

For detailed documentation, see the `/guide` folder.

