# Smart E-Voting System

A comprehensive, secure, and transparent voting platform built with advanced architecture patterns.

## 🌟 Features

### Admin Features
- ✅ Complete CRUD operations for users, elections, and candidates
- ✅ Dashboard with real-time statistics
- ✅ User management (create, edit, delete voters and admins)
- ✅ Election lifecycle management (draft, active, completed)
- ✅ Candidate management with symbols/images
- ✅ Audit logs for tracking all activities
- ✅ Role-based access control

### Voter Features
- ✅ User registration with OTP email verification
- ✅ Secure login with bcrypt password hashing
- ✅ Browse available elections
- ✅ One vote per election (duplicate voting prevention)
- ✅ Voting history tracking
- ✅ Real-time election results viewing
- ✅ PDF export of results

### System Features
- ✅ JWT authentication with token expiration
- ✅ OTP verification (6-digit codes)
- ✅ Bcrypt password hashing with configurable rounds
- ✅ Auto election start/end by date
- ✅ Live results dashboard with charts
- ✅ PDF result export functionality
- ✅ Account lockout after failed login attempts
- ✅ IP tracking and device fingerprinting
- ✅ Comprehensive audit logging
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS security headers
- ✅ MVC architecture with REST APIs

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── config/          # Database & configuration
├── models/          # Data models
├── controllers/     # Business logic (MVC)
├── routes/          # API endpoints
├── middleware/      # Auth, validation, error handling
├── services/        # Business services
├── utils/           # Helper functions
└── server.js        # Entry point
```

### Frontend (React)
```
frontend/
├── src/
│   ├── components/  # Reusable components
│   ├── pages/       # Page components
│   ├── services/    # API services
│   ├── contexts/    # State management (Zustand)
│   ├── styles/      # CSS/Tailwind
│   └── App.jsx      # Main app component
```

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Nodemailer** - Email service
- **PDFKit** - PDF generation
- **node-schedule** - Job scheduling
- **Express-validator** - Input validation
- **Helmet** - Security headers
- **CORS** - Cross-origin support

### Frontend
- **React 18** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Icons** - Icons
- **React Hot Toast** - Notifications
- **moment.js** - Date handling

✨ Features

👨‍💼 Admin

CRUD Users
CRUD Elections
CRUD Candidates
Auto election start/end by date
View live results dashboard (charts)
Export results as PDF
Audit logs tracking

🗳 Voter
Registration with OTP email verification
Secure login (JWT + bcrypt)
Vote once per election (duplicate prevention)
View live results

🔐 Security

JWT-based authentication
bcrypt password hashing
OTP email verification
Role-Based Access Control (RBAC)
One vote per election validation

🏗 Architecture

MVC Pattern
RESTful API design
Role-based route protection
election status management via date check

📦 Installation

# Backend
cd server
npm install
npm start

# Frontend
cd client
npm install
npm start

Configure .env with DB credentials, JWT secret, and email service keys.

🎯 Objective

To provide a secure, scalable, and transparent digital voting platform with real-time results and fraud prevention.

Author: Sheetal Padanad
        Sammed chougale
BCA Final Year Project

## Quick Start (Local)

1. Create environment files

        - Copy `backend/.env.example` to `backend/.env` and fill values (MySQL, SMTP, JWT secret).
        - Copy `frontend/.env.example` to `frontend/.env` if you need a custom API URL.

2. Initialize the database

        - Ensure MySQL (XAMPP) is running and you can connect with the credentials set in `backend/.env`.
        - From the repo root run (this creates DB and tables):

```bash
node backend/config/initDatabase.js
```

3. Install dependencies and start servers

Backend (in a terminal):

```bash
cd backend
npm install
npm run dev
```

Frontend (in another terminal):

```bash
cd frontend
npm install
npm start
```

4. Create accounts

- Use the API or frontend register form to create users. Admins can be created by setting `role: "admin"` on registration or via the database.

5. Voting OTP flow (user)

- When a verified user attempts to vote, click the "Request OTP" button (frontend) which calls `POST /api/voter/vote/request-otp`.
- The system emails a 6-digit OTP that expires in 5 minutes.
- Verify the OTP at `POST /api/voter/vote/verify-otp` (frontend handles this flow). After successful verification you can cast vote at `POST /api/voter/vote`.

## Environment Variables (important)

- `backend/.env` must include DB connection, `JWT_SECRET`, `OTP_EXPIRE`, and SMTP settings.
- `frontend/.env` can set `REACT_APP_API_URL` if backend isn't at localhost:5000.

If you want, I can now: run an end-to-end smoke test, replace the prompt-based OTP UI with a modal, or add README examples for API calls. Which should I do next?
