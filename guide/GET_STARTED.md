# 🚀 Get Started with Weight Loss Agent Frontend

**Complete Integration Checklist** - Follow these steps in order.

## ✅ Pre-flight Checklist

Before you begin, make sure you have:

- [ ] **Node.js v18+** installed (`node --version`)
- [ ] **npm** installed (`npm --version`)
- [ ] **aihealth-server** repository cloned at `/Users/lokeshreddydodla/aihealth-server`
- [ ] **Backend running** on `http://localhost:8000`

---

## Step 1: Install Dependencies (2-5 min)

```bash
cd /Users/lokeshreddydodla/Desktop/wtl-main
npm install
```

Expected output: `added XXX packages`

---

## Step 2: Verify Backend is Running (30 sec)

```bash
# Check if backend is healthy
npm run backend:check

# OR manually:
curl http://localhost:8000/health
```

✅ Should return: `{"status": "healthy"}` or similar

❌ If fails: Start your aihealth-server first!

---

## Step 3: Create Enrollment ID (1-2 min)

You need a valid enrollment ID to use the dashboard.

### Option A: Use Web Interface (Easiest) ⭐

1. **Open `enroll.html` in your browser:**
   ```bash
   open enroll.html
   # or just double-click the file
   ```

2. **Fill in the form:**
   - Patient ID (UUID from database)
   - Doctor ID (care provider UUID)
   - Target weight and goals
   
3. **Click "Create Enrollment"**
   - The enrollment ID will be displayed
   - Click "Copy to Clipboard"
   - Follow the next steps shown on screen

### Option B: Use Helper Script

```bash
# Replace YOUR_PATIENT_ID with actual patient UUID
npm run enroll YOUR_PATIENT_ID

# Example:
# npm run enroll a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

The script will:
1. Create enrollment in backend
2. Show you the enrollment_id
3. Automatically update `.env.local` (if it exists)

### Option C: Manual curl Method

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

Copy the `enrollment_id` from the response.

---

## Step 4: Configure Environment (1 min)

Create `.env.local` file:

```bash
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:8000
VITE_ENROLLMENT_ID=paste-your-enrollment-id-here
EOF
```

Or manually create `.env.local` with:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_ENROLLMENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

Replace `a1b2c3d4-e5f6-7890-abcd-ef1234567890` with your actual enrollment ID!

---

## Step 5: Start Development Server (30 sec)

```bash
npm run dev
```

Expected output:
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## Step 6: Open in Browser (10 sec)

Visit: **http://localhost:5173**

You should see:
- ✅ Weight Loss Dashboard header
- ✅ Three tabs: Overview, Reports, Health
- ✅ Metrics cards (may show `--` if no data yet)
- ✅ Progress charts
- ✅ Floating chat button (bottom right)

---

## Step 7: Upload Your First Report (1 min)

1. Click **"Reports"** tab
2. Drag & drop an InBody PDF/image, or click "Browse Files"
3. Wait for upload and AI processing (10-30 sec)
4. See the report appear with AI summary!

---

## Step 8: Explore Features (5 min)

### Overview Tab
- View weight, BMI, progress metrics
- See progress charts
- Change time ranges (7D, 30D, 90D, All)

### Reports Tab
- Upload InBody scans
- View AI summaries
- Check processing status
- See abnormal indicator counts

### Health Tab
- View detailed health metrics
- See normal ranges
- Read AI analysis
- Get personalized recommendations

### AI Chat
- Click chat button (bottom right)
- Ask: "What's my current progress?"
- Ask: "Give me nutrition tips"
- Ask: "Analyze my latest report"

---

## 🎉 Success! What's Next?

### Immediate Actions
- [ ] Upload a few InBody reports to see trends
- [ ] Try the AI chat assistant
- [ ] Explore health indicators
- [ ] Check the progress charts

### Learning More
- Read **README.md** for architecture overview
- Check **API_INTEGRATION.md** for API details
- See **DEPLOYMENT.md** when ready to deploy

### Optional Enhancements
- Add more patient data via backend
- Upload historical InBody reports
- Experiment with different time ranges
- Try different chat questions

---

## 🐛 Troubleshooting

### "VITE_ENROLLMENT_ID not configured" error

**Solution:**
```bash
# Check .env.local exists and has content
cat .env.local

# Should see:
# VITE_API_BASE_URL=http://localhost:8000
# VITE_ENROLLMENT_ID=xxx-xxx-xxx-xxx

# After fixing, restart dev server:
# Ctrl+C to stop, then:
npm run dev
```

### "Failed to connect to backend" error

**Solution:**
```bash
# Verify backend is running
curl http://localhost:8000/health

# If not running, start it:
cd /Users/lokeshreddydodla/aihealth-server
# Run your backend startup command
```

### No data showing in dashboard

**Causes & Solutions:**
1. **No progress data yet**
   - Upload InBody reports via UI
   - Add weight measurements via backend

2. **Wrong enrollment ID**
   ```bash
   # Verify enrollment exists:
   curl http://localhost:8000/weight-loss-agent/enrollment/YOUR_ID/progress
   ```

3. **Backend not returning data**
   - Check backend logs for errors
   - Verify enrollment has associated data

### CORS errors in browser console

**Solution:**  
Backend CORS must allow `http://localhost:5173`

Check `/Users/lokeshreddydodla/aihealth-server/app/middlewares.py`:
```python
allow_origins=[
    "http://localhost:5173",  # ← Must include this
    "http://localhost:8000",
]
```

### Port 5173 already in use

**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or Vite will auto-select next port (5174, 5175, etc.)
```

---

## 📋 Quick Reference Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Check backend health
npm run backend:check

# Create enrollment
npm run enroll PATIENT_ID

# Build for production
npm run build

# Type check
npm run check
```

---

## 📚 Documentation Index

| Document | Purpose |
|----------|---------|
| **GET_STARTED.md** (this file) | Step-by-step setup |
| **QUICKSTART.md** | 5-minute TL;DR version |
| **README.md** | Project overview |
| **SETUP.md** | Detailed setup guide |
| **API_INTEGRATION.md** | API details for developers |
| **DEPLOYMENT.md** | Production deployment |
| **INTEGRATION_SUMMARY.md** | What was integrated |

---

## 🆘 Still Stuck?

1. **Read error messages carefully** - they often tell you what's wrong
2. **Check browser DevTools** (F12) → Console tab for errors
3. **Check Network tab** to see API calls and responses
4. **Run backend health check**: `npm run backend:check`
5. **Verify .env.local** has correct values
6. **Try clean install**:
   ```bash
   rm -rf node_modules dist
   npm install
   npm run dev
   ```

---

## ✨ Tips for Best Experience

1. **Use real InBody reports** for best AI analysis
2. **Upload reports chronologically** to see trends
3. **Ask specific questions** in chat for better answers
4. **Check Health tab** after each new report upload
5. **Use time range filters** on charts to zoom in/out

---

## 🎯 Expected Workflow

```
1. Start backend (aihealth-server)
   ↓
2. Start frontend (this app)
   ↓
3. Dashboard loads with enrollment data
   ↓
4. Upload InBody reports
   ↓
5. View health indicators
   ↓
6. Track progress over time
   ↓
7. Chat with AI for insights
```

---

**Status**: 🟢 Ready to Use  
**Time to Setup**: ~10 minutes (including enrollment creation)  
**Support**: See troubleshooting above or check documentation  

**Happy tracking! 🎉**

