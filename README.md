🗳 Smart E-Voting System with OTP verification(Online Voting with OTP Verification)

A secure Full-Stack Online Voting System built using React (Frontend), Node.js (Backend), and MySQL (Database). The system supports Admin and Voter roles, JWT authentication, OTP email verification, and secure one-vote-per-election functionality.

🚀 Tech Stack

Frontend: React.js, Axios, Chart.js
Backend: Node.js, Express.js (MVC Architecture)
Database: MySQL
Authentication & Security: JWT, bcrypt, OTP Email Verification
APIs: RESTful APIs

🗂 Models

User: name, email, password, role, isVerified, otp
Election: title, startDate, endDate, status
Candidate: name, party, electionId, votes
Vote: voterId, candidateId, electionId
AuditLog: userId, action, timestamp

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

# Clone repository
git clone https://github.com/sheetalpadanad414/Smart-E-Voting-.git

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
