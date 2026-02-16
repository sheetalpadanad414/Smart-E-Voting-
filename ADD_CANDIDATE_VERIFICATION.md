# Add Candidate Functionality - Verification Guide

## Backend Status ✓

The backend is properly configured and running with all necessary endpoints:

### API Endpoints Available:
- `POST /api/auth/admin/login` - Admin login (working)
- `GET /api/admin/elections` - Get all elections
- `POST /api/admin/elections` - Create election
- `GET /api/admin/elections/:election_id/candidates` - Get candidates for election
- `POST /api/admin/candidates` - Add new candidate
- `PUT /api/admin/candidates/:id` - Update candidate
- `DELETE /api/admin/candidates/:id` - Delete candidate

### Backend Files Verified:
- ✓ `backend/routes/authRoutes.js` - Admin login route added
- ✓ `backend/controllers/authController.js` - adminLogin method implemented
- ✓ `backend/routes/adminRoutes.js` - All candidate routes configured
- ✓ `backend/controllers/adminController.js` - All candidate methods implemented
- ✓ `backend/models/Candidate.js` - Full CRUD operations available

## Frontend Status ✓

The frontend has a complete candidate management interface:

### Frontend Files:
- ✓ `frontend/src/pages/AdminCandidates.jsx` - Full UI for managing candidates
- ✓ `frontend/src/services/api.js` - All API methods configured
- ✓ `frontend/src/App.jsx` - Routes configured for `/admin/candidates`

### Features Available:
1. Select election from dropdown
2. View all candidates for selected election
3. Add new candidate with form
4. Edit existing candidates
5. Delete candidates
6. Search candidates by name
7. Pagination support

## How to Test

### 1. Start the Backend (if not running):
```bash
cd backend
node server.js
```

### 2. Start the Frontend (if not running):
```bash
cd frontend
npm start
```

### 3. Access Admin Dashboard:
1. Go to `http://localhost:3000/login`
2. Login with admin credentials:
   - Email: `admin@evoting.com`
   - Password: `admin123`

### 4. Navigate to Candidates:
- From dashboard, click "Manage Candidates" button
- Or go directly to `http://localhost:3000/admin/candidates`

### 5. Add a Candidate:
1. Select an election from the dropdown
2. Click "Add Candidate" button
3. Fill in the form:
   - Candidate Name (required)
   - Party Name
   - Position (e.g., President, Vice President)
   - Symbol/Logo (e.g., 🦁)
   - Image URL
   - Description
4. Click "Add Candidate"

## Expected Behavior

✓ Form should submit successfully
✓ Success toast notification should appear
✓ Candidate should appear in the candidates table
✓ You can edit or delete the candidate
✓ Search functionality should work

## Troubleshooting

### If admin login fails:
```bash
cd backend
node createAdmin.js
```

### If no elections exist:
1. Go to `/admin/elections`
2. Create a new election first
3. Then add candidates to that election

### If API calls fail:
- Check backend is running on port 5000
- Check frontend .env has `REACT_APP_API_URL=http://localhost:5000/api`
- Check browser console for errors
- Check backend terminal for error logs

## Admin Credentials

- Email: `admin@evoting.com`
- Password: `admin123`

## Notes

- The backend server is currently running (Process ID: 10)
- All routes are properly configured
- The admin login route was successfully added
- Rate limiting is active (may need to wait if too many requests)
