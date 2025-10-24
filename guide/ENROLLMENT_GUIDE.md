# 📋 Enrollment Creation Guide

This guide explains how to create patient enrollments for the Weight Loss Agent.

## 🌟 Method 1: Web Interface (Recommended)

The easiest way to create enrollments!

### Steps:

1. **Open the enrollment page**
   ```bash
   # From project root
   open enroll.html
   
   # Or double-click the file in Finder
   ```

2. **Check backend status**
   - The page will show if backend is online (green) or offline (red)
   - If offline, start your aihealth-server first

3. **Fill in the form**
   - **Backend API URL**: Usually `http://localhost:8000`
   - **Patient ID**: UUID of the patient from your database
   - **Doctor/Care Provider ID**: UUID of the enrolling doctor
   - **Program Goals**: Description of patient goals
   - **Target Weight**: Goal weight in kg
   - **Target BMI**: Optional goal BMI

4. **Click "Create Enrollment"**
   - Wait for the backend to process (usually < 1 second)
   - Success message will appear with enrollment ID

5. **Copy the enrollment ID**
   - Click "Copy to Clipboard" button
   - Or manually select and copy the ID

6. **Add to .env.local**
   ```bash
   # Edit .env.local
   VITE_ENROLLMENT_ID=paste-your-id-here
   ```

7. **Restart dev server**
   ```bash
   npm run dev
   ```

### Features:
✅ Real-time backend status check  
✅ Form validation  
✅ One-click copy to clipboard  
✅ Clear next steps displayed  
✅ Error messages if something fails  
✅ Beautiful, responsive UI  

---

## 🚀 Method 2: Helper Script

For command-line enthusiasts.

### Usage:

```bash
# Basic usage
npm run enroll PATIENT_ID

# Example
npm run enroll a1b2c3d4-e5f6-7890-abcd-ef1234567890

# With custom values
API_URL=http://localhost:8000 \
./scripts/create-enrollment.sh \
  PATIENT_ID \
  DOCTOR_ID \
  70.0 \
  24.0
```

### What it does:
1. ✅ Checks if backend is running
2. ✅ Creates enrollment via API
3. ✅ Displays enrollment ID
4. ✅ Automatically updates `.env.local`
5. ✅ Shows next steps

---

## 🔧 Method 3: Manual curl

For direct API access.

### Command:

```bash
curl -X POST "http://localhost:8000/weight-loss-agent/enroll" \
  -H "Content-Type: application/json" \
  -d '{
    "patient_id": "YOUR_PATIENT_ID",
    "program_goals": "Lose 10kg in 3 months through healthy diet and exercise",
    "target_weight_kg": 70.0,
    "target_bmi": 24.0,
    "enrolled_by_care_provider_id": "YOUR_DOCTOR_ID"
  }'
```

### Response:

```json
{
  "status": "success",
  "message": "Patient enrolled successfully in weight loss program",
  "data": {
    "enrollment_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "patient_id": "YOUR_PATIENT_ID",
    "enrolled_by_care_provider_id": "YOUR_DOCTOR_ID",
    "enrollment_date": "2024-10-23T12:00:00Z",
    "is_active": true,
    "program_goals": "Lose 10kg in 3 months...",
    "target_weight_kg": 70.0,
    "target_bmi": 24.0,
    "created_at": "2024-10-23T12:00:00Z"
  }
}
```

Copy the `enrollment_id` value.

---

## 📝 Required Information

To create an enrollment, you need:

| Field | Required | Description | Example |
|-------|----------|-------------|---------|
| Patient ID | ✅ Yes | UUID from database | `a1b2c3d4-e5f6...` |
| Doctor/Provider ID | ✅ Yes | Enrolling doctor UUID | `doctor-uuid...` |
| Target Weight | ✅ Yes | Goal weight in kg | `70.0` |
| Program Goals | ❌ No | Description of goals | `Lose 10kg...` |
| Target BMI | ❌ No | Goal BMI | `24.0` |

### Where to get Patient ID?

**From PostgreSQL:**
```sql
SELECT id, first_name, last_name, email 
FROM patients 
WHERE email = 'patient@example.com';
```

**From backend logs:**
- Check patient creation logs
- Use patient management endpoints

**Create new test patient:**
- Use backend patient creation API
- Contact backend admin

---

## 🎯 After Creating Enrollment

### Step 1: Update .env.local

```bash
# Edit .env.local in wtl-main project
VITE_API_BASE_URL=http://localhost:8000
VITE_ENROLLMENT_ID=your-enrollment-id-here
```

### Step 2: Restart Dev Server

```bash
# Kill current server (Ctrl+C)
# Start again
npm run dev
```

### Step 3: Open Dashboard

```
http://localhost:5173
```

You should now see the patient's data!

---

## 🐛 Troubleshooting

### "Cannot connect to backend"

**Problem**: Backend is not running or not accessible

**Solutions:**
1. Start aihealth-server:
   ```bash
   cd /Users/lokeshreddydodla/aihealth-server
   # Start your backend
   ```

2. Check if running:
   ```bash
   curl http://localhost:8000/health
   ```

3. Check if port 8000 is correct:
   ```bash
   lsof -i :8000
   ```

### "Patient not found"

**Problem**: Patient ID doesn't exist in database

**Solutions:**
1. Verify patient exists:
   ```sql
   SELECT id FROM patients WHERE id = 'YOUR_UUID';
   ```

2. Use correct patient UUID (not name or email)

3. Create patient first if needed

### "Only doctors can enroll patients"

**Problem**: Care provider is not a doctor

**Solutions:**
1. Use a doctor's UUID for `enrolled_by_care_provider_id`

2. Check provider role:
   ```sql
   SELECT id, role FROM care_providers WHERE id = 'YOUR_UUID';
   ```

3. Role must be exactly "doctor" (lowercase)

### "Patient already enrolled"

**Problem**: Patient has an active enrollment

**Solutions:**
1. Use existing enrollment ID:
   ```bash
   # Find existing enrollment
   curl http://localhost:8000/weight-loss-agent/patient/PATIENT_ID/enrollment
   ```

2. Or deactivate old enrollment first (via backend)

### "Invalid UUID format"

**Problem**: Patient/Doctor ID is not a valid UUID

**Solutions:**
1. Ensure IDs are in UUID format:
   ```
   xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

2. Copy IDs directly from database

3. Don't use names, emails, or other identifiers

---

## 💡 Tips

1. **Keep enrollment IDs safe** - They're sensitive!
2. **One enrollment per patient** - Can't have multiple active enrollments
3. **Test with real patient data** - For best experience
4. **Use web interface** - It's the easiest method
5. **Check backend first** - Make sure it's running before creating enrollments

---

## 📚 Related Documentation

- **GET_STARTED.md** - Complete setup guide
- **QUICKSTART.md** - Fast setup (5 min)
- **API_INTEGRATION.md** - API details
- **README.md** - Project overview

---

## 🆘 Still Having Issues?

1. **Check backend logs** for detailed error messages
2. **Verify database** has correct patient/doctor data
3. **Use web interface** - it shows better error messages
4. **Run health check**:
   ```bash
   npm run backend:check
   ```
5. **Check browser console** (F12) if using web interface

---

**Happy enrolling! 🎉**

