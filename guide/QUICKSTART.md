# Quick Start Guide

Get up and running with the Weight Loss Agent Frontend in 5 minutes!

## 🚀 Quick Setup (TL;DR)

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local file
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local
echo "VITE_ENROLLMENT_ID=YOUR_ENROLLMENT_ID" >> .env.local

# 3. Start dev server
npm run dev
```

## Step-by-Step Guide

### Step 1: Check Prerequisites ✅

Make sure you have:
- [ ] Node.js v18+ installed (`node --version`)
- [ ] Backend server running (`curl http://localhost:8000/health`)
- [ ] Patient enrollment ID ready

### Step 2: Install Dependencies 📦

```bash
cd /Users/lokeshreddydodla/Desktop/wtl-main
npm install
```

This will install all required packages (~5 minutes first time).

### Step 3: Configure Environment 🔧

Create `.env.local` file in project root:

```bash
# Create .env.local
cat > .env.local << 'EOF'
VITE_API_BASE_URL=http://localhost:8000
VITE_ENROLLMENT_ID=
EOF
```

**Get your enrollment ID:**

**Option A - Web Interface (Easiest):**
```bash
# Just open the enrollment page
open enroll.html
# Fill the form and create enrollment
```

**Option B - Helper Script:**
```bash
npm run enroll YOUR_PATIENT_ID
```

**Option C - Manual curl:**
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

Copy the `enrollment_id` from response and add it to `.env.local`:
```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_ENROLLMENT_ID=a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

### Step 4: Start Development Server 🎬

```bash
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 5: Open in Browser 🌐

Visit: http://localhost:5173

You should see the Weight Loss Dashboard!

## 🎉 Success!

If everything worked, you'll see:
- ✅ Dashboard loads without errors
- ✅ Progress charts show data (if available)
- ✅ You can upload InBody reports
- ✅ AI chat assistant responds

## 🐛 Common Issues

### Issue: "VITE_ENROLLMENT_ID not configured"

**Solution:**
1. Check `.env.local` exists in project root
2. Verify `VITE_ENROLLMENT_ID=` has a value
3. Restart dev server: `Ctrl+C` then `npm run dev`

### Issue: "Failed to connect to backend"

**Solution:**
```bash
# Check backend is running
curl http://localhost:8000/health

# If not running, start backend
cd /Users/lokeshreddydodla/aihealth-server
# Follow backend startup instructions
```

### Issue: "No data showing"

**Solution:**
1. Verify enrollment exists:
   ```bash
   curl http://localhost:8000/weight-loss-agent/enrollment/YOUR_ID/progress
   ```
2. Upload an InBody report via the UI
3. Add some weight measurements via backend

### Issue: CORS errors in browser console

**Solution:**
The backend needs to allow `http://localhost:5173` origin.

Check backend CORS settings in:
`/Users/lokeshreddydodla/aihealth-server/app/middlewares.py`

Should include:
```python
allow_origins=["http://localhost:5173", "http://localhost:8000"]
```

### Issue: Port 5173 already in use

**Solution:**
```bash
# Vite will automatically try the next available port
# Or kill the process using port 5173
lsof -ti:5173 | xargs kill -9
```

## 🎯 Next Steps

Once running:

1. **Upload InBody Reports**
   - Click "Reports" tab
   - Drag & drop or browse for InBody PDF/images
   - Wait for AI analysis

2. **View Health Indicators**
   - Click "Health" tab
   - See detailed metrics with AI insights
   - Check for abnormal indicators

3. **Chat with AI Assistant**
   - Click chat button (bottom right)
   - Ask about your progress, nutrition, workouts
   - Get personalized recommendations

4. **Track Progress**
   - "Overview" tab shows charts
   - Change time ranges (7D, 30D, 90D, All)
   - Monitor weight, BMI, body fat trends

## 📚 More Information

- Full setup guide: [SETUP.md](./SETUP.md)
- API documentation: [README.md](./README.md)
- Backend repository: `/Users/lokeshreddydodla/aihealth-server`

## 💡 Tips

- **Hot Reload**: Changes to code auto-reload the page
- **DevTools**: Press F12 to see console logs and network requests
- **Type Safety**: TypeScript will catch errors before runtime
- **UI Components**: Use shadcn/ui for consistent design

## 🆘 Still Having Issues?

Check:
1. Node version: `node --version` (should be 18+)
2. Backend health: `curl http://localhost:8000/health`
3. Environment variables: `cat .env.local`
4. Browser console (F12) for error messages
5. Terminal logs from `npm run dev`

If all else fails, try:
```bash
# Nuclear option: clean and reinstall
rm -rf node_modules dist .vite
npm install
npm run dev
```

