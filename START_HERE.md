# 🚀 Smart E-Voting System - Quick Start

## ✅ System Ready

Your Smart E-Voting system is fully configured and ready to use.

---

## 🎯 Quick Start

### Start the System
```bash
start-system.bat
```

Or manually:
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Admin Login**: admin@evoting.com / admin123

---

## 📊 System Status

### Database
- **Name**: smart_e_voting
- **Users**: 40 (39 voters, 1 admin)
- **Face Verified**: 2 users
- **Elections**: 22 total (1 active)
- **Candidates**: 43
- **Parties**: 8
- **Votes Cast**: 18

### Configuration
- Backend Port: 5000 ✓
- Frontend Port: 3000 ✓
- Database: localhost:3306 ✓
- Face Recognition: Enabled ✓
- Models: 8/8 downloaded ✓

---

## 🔄 Face Registration Flow

```
Register → OTP Verification → Face Capture → Elections
```

1. User fills registration form
2. Verifies OTP (auto-filled in development)
3. Face capture screen appears
4. Camera captures face
5. 128D descriptor extracted and stored
6. User redirected to elections

### What Gets Stored
- `face_descriptor`: JSON array of 128 floats
- `face_verified`: TRUE
- `face_registered_at`: Timestamp
- `face_image_path`: NULL (descriptor-only storage)

---

## 🔍 Verification Commands

### Check System Status
```bash
check-system-ready.bat
```

### Verify Database
```bash
cd backend
node verify-full-setup.js
```

### Check Face Recognition
```bash
cd backend
node verify-setup.js
```

---

## 🐛 Troubleshooting

### Backend Won't Start
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend Won't Start
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed
taskkill /PID <process_id> /F
```

### Camera Not Working
- Allow camera permission in browser
- Check if another app is using camera
- Ensure good lighting
- Face camera directly

### Models Not Loading
```bash
# Re-download models
download-models.bat
```

### Database Connection Failed
- Check MySQL/MariaDB is running
- Verify credentials in `backend/.env`
- Run: `node verify-full-setup.js`

---

## 📁 Important Files

### Scripts
- `start-system.bat` - Start backend + frontend
- `check-system-ready.bat` - Verify system status
- `download-models.bat` - Download face recognition models
- `test-face-system.bat` - Test face recognition setup

### Backend
- `backend/.env` - Environment configuration
- `backend/server.js` - Main server file
- `backend/controllers/faceController.js` - Face recognition API
- `backend/verify-full-setup.js` - System verification

### Frontend
- `frontend/.env` - Frontend configuration
- `frontend/src/components/FaceCapture.jsx` - Face capture UI
- `frontend/src/pages/Register.jsx` - Registration flow
- `frontend/public/models/` - Face recognition models (8 files)

---

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
DB_HOST=localhost
DB_NAME=smart_e_voting
DB_USER=root
DB_PASSWORD=
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🎯 API Endpoints

### Face Recognition
- `POST /api/face/store-descriptor` - Store face data
- `GET /api/face/get-descriptor` - Get stored data
- `GET /api/face/status` - Check registration status
- `DELETE /api/face/delete` - Remove face data

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-otp` - Verify OTP

---

## 💡 Key Features

- **Face Recognition**: Optional biometric authentication
- **OTP Verification**: Email-based verification
- **Multiple Election Types**: National, State, Local, Institutional
- **Party System**: Support for political parties
- **Real-time Results**: Live vote counting
- **Admin Dashboard**: Comprehensive management interface
- **Voter Tracking**: Monitor voter participation

---

## 📝 Important Notes

### NULL Values in Database
- `similarity_score = NULL` for registration logs is CORRECT
- `image_path = NULL` is CORRECT (descriptor-only storage)
- These are intentional, not errors

### Face Recognition
- Uses face-api.js (client-side processing)
- Stores only 128D descriptor (not images)
- Privacy-focused design
- No Python service needed

### Security
- JWT authentication
- Password hashing with bcrypt
- Rate limiting enabled
- CORS configured

---

## 🎉 You're Ready!

Your system is fully configured and ready to use.

```bash
start-system.bat
```

Then open: **http://localhost:3000**

For detailed information, check `README.md`
