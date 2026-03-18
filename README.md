# Smart E-Voting System

## BCA Final Year Project

**A Comprehensive Web-Based Electronic Voting Platform**

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Installation Guide](#installation-guide)
6. [Database Schema](#database-schema)
7. [API Documentation](#api-documentation)
8. [Security Implementation](#security-implementation)
9. [Performance Optimization](#performance-optimization)
10. [User Roles & Workflows](#user-roles--workflows)
11. [CRUD Operations](#crud-operations)
12. [Testing](#testing)
13. [Deployment](#deployment)
14. [Future Enhancements](#future-enhancements)
15. [Contributors](#contributors)

---

## Project Overview

### Abstract

The Smart E-Voting System is a secure, scalable, and user-friendly web-based platform designed to facilitate electronic voting for various types of elections. The system supports multiple election categories including National, State, Local Government, and Institutional elections, providing a comprehensive solution for democratic processes.

### Objectives

- Develop a secure and transparent electronic voting system
- Implement role-based access control for different user types
- Ensure vote integrity and voter anonymity
- Provide real-time election monitoring and results
- Support multiple election types and categories
- Enable location-based voting restrictions
- Implement comprehensive audit logging

### Scope

The system caters to four primary user roles:
- **Admin**: Complete system management and configuration
- **Voter**: Participate in elections and view results
- **Election Officer**: Monitor elections and manage candidates
- **Observer**: Analyze election data and generate reports

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (React)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Admin   │  │  Voter   │  │ Officer  │  │ Observer │   │
│  │Dashboard │  │Interface │  │Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTPS/REST API
┌─────────────────────────────────────────────────────────────┐
│              Application Layer (Node.js/Express)             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Authentication & Authorization (JWT)                 │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Auth    │  │ Election │  │  Vote    │  │  Admin   │  │
│  │Controller│  │Controller│  │Controller│  │Controller│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕ SQL Queries
┌─────────────────────────────────────────────────────────────┐
│                  Data Layer (MySQL)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Users   │  │Elections │  │  Votes   │  │Candidates│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Component Architecture

**Frontend (React.js)**
- Component-based architecture
- State management using Zustand
- Routing with React Router v6
- Responsive UI with Tailwind CSS

**Backend (Node.js/Express)**
- RESTful API architecture
- MVC pattern implementation
- Middleware-based request processing
- Service layer for business logic

**Database (MySQL)**
- Relational database design
- Normalized schema (3NF)
- Foreign key constraints
- Indexed queries for performance

---


## Technology Stack

### Frontend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 18.2.0 | UI framework |
| React Router | 6.20.0 | Client-side routing |
| Tailwind CSS | 3.3.6 | Styling framework |
| Axios | 1.6.2 | HTTP client |
| Zustand | 4.4.7 | State management |
| React Hot Toast | 2.4.1 | Notifications |
| React Icons | 4.12.0 | Icon library |
| Chart.js | 4.4.0 | Data visualization |
| jsPDF | 2.5.1 | PDF generation |

### Backend Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x | Runtime environment |
| Express.js | 4.18.2 | Web framework |
| MySQL2 | 3.6.5 | Database driver |
| JWT | 9.0.2 | Authentication |
| Bcrypt.js | 2.4.3 | Password hashing |
| Helmet | 7.1.0 | Security headers |
| Morgan | 1.10.0 | HTTP logging |
| Multer | 1.4.5 | File uploads |
| Nodemailer | 6.9.7 | Email service |
| Node-schedule | 2.1.1 | Task scheduling |

### Development Tools

- **Version Control**: Git
- **API Testing**: Postman
- **Code Editor**: VS Code
- **Package Manager**: npm
- **Process Manager**: Nodemon

---

## Features

### Core Features

#### 1. User Management
- Multi-role user registration (Admin, Voter, Officer, Observer)
- Email verification with OTP
- Secure password hashing (bcrypt)
- Account lockout after failed attempts
- Profile management

#### 2. Election Management
- Create elections with categories (National, State, Local, Institutional)
- Set election schedules (start/end dates)
- Location-based restrictions (Country/State)
- Election status automation (Draft → Active → Completed)
- Multiple election types support

#### 3. Candidate Management
- Add candidates to elections
- Party affiliation support
- Candidate profiles with photos
- Bulk candidate operations

#### 4. Party Management
- Political party registration
- Party logo management
- Party-candidate associations
- Party statistics

#### 5. Voting System
- Secure vote casting
- One vote per election per voter
- Vote anonymity preservation
- Real-time vote counting
- Vote verification

#### 6. Results & Analytics
- Real-time result updates
- Graphical data visualization
- Export results (PDF/CSV)
- Voter turnout statistics
- Party-wise analysis

#### 7. Security Features
- JWT-based authentication
- Role-based access control (RBAC)
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention
- XSS protection

#### 8. Audit & Logging
- Comprehensive action logging
- User activity tracking
- Election event logging
- System audit trails

---

## Installation Guide

### Prerequisites

Before installation, ensure you have:

- **Node.js** (v18.x or higher)
- **MySQL** (v8.x or higher)
- **npm** (v9.x or higher)
- **Git** (for cloning repository)

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/smart-e-voting.git
cd smart-e-voting
```

### Step 2: Database Setup

1. **Create MySQL Database**

```sql
CREATE DATABASE smart_e_voting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Configure Database Connection**

Create `backend/.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=smart_e_voting
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# OTP Configuration
OTP_EXPIRE=5

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Smart E-Voting <noreply@evoting.com>
```

3. **Run Database Migrations**

```bash
cd backend
node config/initDatabase.js
node migrations/add-party-system.js
node migrations/add-election-categories.js
node migrations/add-location-tables.js
```

### Step 3: Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will start on `http://localhost:5000`

### Step 4: Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend will start on `http://localhost:3000`

### Step 5: Create Admin Account

```bash
cd backend
node createAdmin.js
```

Default admin credentials:
- **Email**: admin@evoting.com
- **Password**: admin123

### Step 6: Verify Installation

1. Open browser: `http://localhost:3000`
2. Login with admin credentials
3. Access admin dashboard

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    users    │────────>│  elections   │<────────│ candidates  │
│             │         │              │         │             │
│ - id (PK)   │         │ - id (PK)    │         │ - id (PK)   │
│ - email     │         │ - title      │         │ - name      │
│ - password  │         │ - start_date │         │ - party_id  │
│ - role      │         │ - end_date   │         │ - photo     │
│ - is_verified│        │ - status     │         └─────────────┘
└─────────────┘         │ - category_id│                │
       │                └──────────────┘                │
       │                       │                        │
       │                       │                        │
       v                       v                        v
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│    votes    │         │   parties    │         │audit_logs   │
│             │         │              │         │             │
│ - id (PK)   │         │ - id (PK)    │         │ - id (PK)   │
│ - user_id   │         │ - name       │         │ - user_id   │
│ - election_id│        │ - logo       │         │ - action    │
│ - candidate_id│       │ - description│         │ - timestamp │
│ - timestamp │         └──────────────┘         └─────────────┘
└─────────────┘
```

### Core Tables

#### 1. users
```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'voter', 'election_officer', 'observer') DEFAULT 'voter',
  is_verified BOOLEAN DEFAULT FALSE,
  failed_login_attempts INT DEFAULT 0,
  account_locked_until DATETIME NULL,
  last_login DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);
```

#### 2. elections
```sql
CREATE TABLE elections (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
  is_public BOOLEAN DEFAULT TRUE,
  category_id INT,
  type_id INT,
  country_id INT,
  state_id INT,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES election_categories(id),
  INDEX idx_status (status),
  INDEX idx_dates (start_date, end_date)
);
```

#### 3. candidates
```sql
CREATE TABLE candidates (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  election_id VARCHAR(36) NOT NULL,
  party_id VARCHAR(36),
  photo VARCHAR(255),
  bio TEXT,
  position VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL,
  INDEX idx_election (election_id)
);
```

#### 4. votes
```sql
CREATE TABLE votes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  election_id VARCHAR(36) NOT NULL,
  candidate_id VARCHAR(36) NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
  FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vote (user_id, election_id),
  INDEX idx_election (election_id),
  INDEX idx_candidate (candidate_id)
);
```

#### 5. parties
```sql
CREATE TABLE parties (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  logo VARCHAR(255),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
);
```

#### 6. election_categories
```sql
CREATE TABLE election_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  category_name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 7. audit_logs
```sql
CREATE TABLE audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(36),
  changes JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);
```

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

### API Endpoints

#### Authentication Endpoints

**1. Register User**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "1234567890",
  "role": "voter"
}

Response: 201 Created
{
  "message": "Registration successful",
  "userId": "uuid",
  "email": "john@example.com",
  "developmentOTP": "123456"
}
```

**2. Verify OTP**
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456"
}

Response: 200 OK
{
  "message": "Email verified successfully",
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "voter"
  }
}
```

**3. Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "message": "OTP sent to your email",
  "email": "john@example.com",
  "requiresOTP": true,
  "developmentOTP": "123456"
}
```

**4. Admin Login (No OTP)**
```http
POST /api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@evoting.com",
  "password": "admin123"
}

Response: 200 OK
{
  "success": true,
  "message": "Admin login successful",
  "data": {
    "token": "jwt_token",
    "user": { ... }
  }
}
```

#### Election Endpoints

**1. Get All Elections**
```http
GET /api/admin/elections?page=1&limit=20&status=active
Authorization: Bearer <token>

Response: 200 OK
{
  "elections": [...],
  "total": 50,
  "pages": 3,
  "current_page": 1
}
```

**2. Create Election**
```http
POST /api/admin/elections
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "2024 General Election",
  "description": "National general election",
  "start_date": "2024-04-01T09:00:00",
  "end_date": "2024-04-30T18:00:00",
  "category_id": 1,
  "type_id": 1,
  "is_public": true
}

Response: 201 Created
{
  "message": "Election created successfully",
  "election": { ... }
}
```

**3. Update Election**
```http
PUT /api/admin/elections/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}

Response: 200 OK
{
  "message": "Election updated successfully",
  "election": { ... }
}
```

**4. Delete Election**
```http
DELETE /api/admin/elections/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Election deleted successfully"
}
```

#### Voting Endpoints

**1. Cast Vote**
```http
POST /api/vote/cast
Authorization: Bearer <token>
Content-Type: application/json

{
  "election_id": "uuid",
  "candidate_id": "uuid"
}

Response: 201 Created
{
  "message": "Vote cast successfully",
  "vote": { ... }
}
```

**2. Get Election Results**
```http
GET /api/vote/results/:electionId
Authorization: Bearer <token>

Response: 200 OK
{
  "election": { ... },
  "results": [
    {
      "candidate_id": "uuid",
      "candidate_name": "John Doe",
      "party_name": "Party A",
      "vote_count": 150,
      "percentage": 45.5
    }
  ],
  "total_votes": 330,
  "voter_turnout": 75.5
}
```

#### Party Endpoints

**1. Get All Parties**
```http
GET /api/parties?page=1&limit=50&search=congress
Authorization: Bearer <token>

Response: 200 OK
{
  "parties": [...],
  "total": 10,
  "pages": 1
}
```

**2. Create Party**
```http
POST /api/parties
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "New Party",
  "logo": "party-logo.png",
  "description": "Party description"
}

Response: 201 Created
{
  "message": "Party created successfully",
  "party": { ... }
}
```

---

## Security Implementation

### 1. Authentication & Authorization

#### JWT (JSON Web Tokens)
- Token-based stateless authentication
- Tokens expire after 7 days
- Secure token generation using HS256 algorithm
- Token validation on every protected route

```javascript
// Token Generation
const token = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE }
);
```

#### Role-Based Access Control (RBAC)
```javascript
// Middleware for role authorization
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};
```

### 2. Password Security

#### Bcrypt Hashing
- Passwords hashed with bcrypt (10 salt rounds)
- Never store plain text passwords
- Secure password comparison

```javascript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Password verification
const isValid = await bcrypt.compare(password, user.password);
```

#### Password Policy
- Minimum 8 characters
- Account lockout after 5 failed attempts
- Lockout duration: 30 minutes

### 3. OTP Verification

- 6-digit random OTP generation
- OTP expiry: 5 minutes
- One-time use only
- Secure OTP storage with expiration

```javascript
// OTP Generation
const otp = Math.floor(100000 + Math.random() * 900000).toString();
```

### 4. HTTP Security Headers (Helmet)

```javascript
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));
```

Protects against:
- XSS attacks
- Clickjacking
- MIME sniffing
- DNS prefetch control

### 5. Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
```

### 6. CORS Configuration

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  exposedHeaders: ['Content-Type', 'Content-Length']
}));
```

### 7. SQL Injection Prevention

- Parameterized queries using MySQL2
- Input validation with express-validator
- No direct string concatenation in queries

```javascript
// Safe query with parameters
const query = 'SELECT * FROM users WHERE email = ?';
const [rows] = await connection.query(query, [email]);
```

### 8. XSS Protection

- Input sanitization
- Output encoding
- Content Security Policy headers
- React's built-in XSS protection

### 9. Vote Integrity

- One vote per user per election (database constraint)
- Vote anonymity (no direct user-vote linkage in results)
- Immutable vote records
- Audit trail for all voting actions

```sql
UNIQUE KEY unique_vote (user_id, election_id)
```

### 10. Audit Logging

All critical actions logged:
- User registration/login
- Election creation/modification
- Vote casting
- Admin actions
- Failed authentication attempts

```javascript
await AdminService.logAction(
  userId,
  'CAST_VOTE',
  'vote',
  voteId,
  { election_id, candidate_id },
  ipAddress
);
```

---

## Performance Optimization

### 1. Database Optimization

#### Indexing Strategy
```sql
-- User lookups
INDEX idx_email ON users(email);
INDEX idx_role ON users(role);

-- Election queries
INDEX idx_status ON elections(status);
INDEX idx_dates ON elections(start_date, end_date);

-- Vote counting
INDEX idx_election ON votes(election_id);
INDEX idx_candidate ON votes(candidate_id);

-- Audit queries
INDEX idx_created ON audit_logs(created_at);
```

#### Query Optimization
- Use of prepared statements
- Efficient JOIN operations
- Pagination for large datasets
- Aggregate functions for statistics

```javascript
// Efficient pagination
query += ' ORDER BY created_at DESC LIMIT ?, ?';
params.push((page - 1) * limit, limit);
```

### 2. Caching Strategy

#### Result Caching
```sql
CREATE TABLE election_results_cache (
  id VARCHAR(36) PRIMARY KEY,
  election_id VARCHAR(36),
  total_voters INT,
  total_votes INT,
  results JSON,
  last_updated TIMESTAMP
);
```

### 3. Connection Pooling

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### 4. Compression

```javascript
const compression = require('compression');
app.use(compression()); // Gzip compression for responses
```

### 5. Static File Serving

```javascript
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
```

### 6. Frontend Optimization

- Code splitting with React.lazy()
- Image optimization
- Lazy loading for components
- Memoization with React.memo()
- Debouncing for search inputs

```javascript
// Lazy loading
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
```

### 7. API Response Optimization

- Selective field projection
- Pagination for list endpoints
- Efficient data serialization
- Minimal payload size

### 8. Scheduled Tasks

```javascript
// Auto-update election status
schedule.scheduleJob('* * * * *', async () => {
  await Election.updateStatusBasedOnDate();
});
```

---

## User Roles & Workflows

### 1. Admin Workflow

```
Login → Dashboard → Manage Elections/Users/Parties
  ↓
Create Election → Add Candidates → Monitor Voting
  ↓
View Results → Generate Reports → Audit Logs
```

**Admin Capabilities:**
- Create and manage elections
- Add/remove users
- Manage candidates and parties
- View real-time statistics
- Access audit logs
- Generate reports
- System configuration

### 2. Voter Workflow

```
Register → Verify Email (OTP) → Login (OTP)
  ↓
View Available Elections → Select Election
  ↓
Review Candidates → Cast Vote → Confirmation
  ↓
View Results (after election ends)
```

**Voter Capabilities:**
- Register and verify account
- View active elections
- Cast votes
- View election results
- Check voting history
- Update profile

### 3. Election Officer Workflow

```
Login → Dashboard → Monitor Elections
  ↓
View Real-time Statistics → Manage Candidates
  ↓
Generate Reports → Export Data
```

**Officer Capabilities:**
- Monitor assigned elections
- View real-time voting statistics
- Manage candidates
- Generate election reports
- Export voting data

### 4. Observer Workflow

```
Login → Dashboard → View Elections
  ↓
Analyze Voting Patterns → Generate Reports
  ↓
Export Analytics → View Audit Logs
```

**Observer Capabilities:**
- View election data
- Analyze voting patterns
- Generate analytical reports
- Export statistics
- View audit trails (read-only)

---

## CRUD Operations

### User Management

#### Create User (Register)
```javascript
// Controller: authController.js
static async register(req, res, next) {
  const { name, email, password, phone, role } = req.body;
  
  // Validate input
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields required' });
  }
  
  // Check existing user
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  
  // Create user
  const user = await User.create({ name, email, password, phone, role });
  
  // Generate OTP
  const otp = generateOTP();
  await OTP.create(email, otp, 'registration');
  
  res.status(201).json({ message: 'Registration successful', userId: user.id });
}
```

#### Read User
```javascript
// Model: User.js
static async findById(id) {
  const query = 'SELECT * FROM users WHERE id = ?';
  const [rows] = await connection.query(query, [id]);
  return rows.length > 0 ? rows[0] : null;
}

static async getAll(page = 1, limit = 20, filters = {}) {
  let query = 'SELECT * FROM users WHERE 1=1';
  const params = [];
  
  if (filters.role) {
    query += ' AND role = ?';
    params.push(filters.role);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ?, ?';
  params.push((page - 1) * limit, limit);
  
  const [users] = await connection.query(query, params);
  return users;
}
```

#### Update User
```javascript
// Controller: adminController.js
static async updateUser(req, res, next) {
  const { id } = req.params;
  const updates = req.body;
  
  const success = await User.update(id, updates);
  
  if (!success) {
    return res.status(400).json({ error: 'No updates provided' });
  }
  
  res.json({ message: 'User updated successfully' });
}

// Model: User.js
static async update(userId, updates) {
  const allowedFields = ['name', 'phone', 'role'];
  const updateFields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      updateFields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  values.push(userId);
  const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
  
  await connection.query(query, values);
  return true;
}
```

#### Delete User
```javascript
// Controller: adminController.js
static async deleteUser(req, res, next) {
  const { id } = req.params;
  
  await User.delete(id);
  
  res.json({ message: 'User deleted successfully' });
}

// Model: User.js
static async delete(userId) {
  const query = 'DELETE FROM users WHERE id = ?';
  await connection.query(query, [userId]);
  return true;
}
```

### Election Management

#### Create Election
```javascript
// Controller: adminController.js
static async createElection(req, res, next) {
  const electionData = req.body;
  const createdBy = req.user.userId;
  
  const election = await Election.create(electionData, createdBy);
  
  res.status(201).json({
    message: 'Election created successfully',
    election
  });
  
  // Log action
  await AdminService.logAction(
    createdBy,
    'CREATE_ELECTION',
    'election',
    election.id,
    electionData,
    req.ip
  );
}

// Model: Election.js
static async create(electionData, createdBy) {
  const { title, description, start_date, end_date, category_id } = electionData;
  const id = generateUUID();
  
  const query = `
    INSERT INTO elections 
    (id, title, description, start_date, end_date, category_id, created_by, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
  `;
  
  await connection.query(query, [
    id, title, description, start_date, end_date, category_id, createdBy
  ]);
  
  return { id, title, status: 'draft' };
}
```

#### Read Elections
```javascript
// Controller: adminController.js
static async getAllElections(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filters = {
    status: req.query.status,
    category_id: req.query.category_id
  };
  
  const result = await Election.getAll(page, limit, filters);
  
  res.json({
    elections: result.elections,
    total: result.total,
    pages: result.pages,
    current_page: page
  });
}

// Model: Election.js
static async getAll(page = 1, limit = 20, filters = {}) {
  let query = 'SELECT * FROM elections WHERE 1=1';
  const params = [];
  
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  
  if (filters.category_id) {
    query += ' AND category_id = ?';
    params.push(filters.category_id);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ?, ?';
  params.push((page - 1) * limit, limit);
  
  const [elections] = await connection.query(query, params);
  
  // Get total count
  const [countResult] = await connection.query(
    'SELECT COUNT(*) as total FROM elections WHERE 1=1'
  );
  
  return {
    elections,
    total: countResult[0].total,
    pages: Math.ceil(countResult[0].total / limit)
  };
}
```

#### Update Election
```javascript
// Controller: adminController.js
static async updateElection(req, res, next) {
  const { id } = req.params;
  const updates = req.body;
  
  const success = await Election.update(id, updates);
  
  if (!success) {
    return res.status(400).json({ error: 'No updates provided' });
  }
  
  res.json({ message: 'Election updated successfully' });
  
  // Log action
  await AdminService.logAction(
    req.user.userId,
    'UPDATE_ELECTION',
    'election',
    id,
    updates,
    req.ip
  );
}

// Model: Election.js
static async update(electionId, updates) {
  const allowedFields = ['title', 'description', 'start_date', 'end_date', 'status'];
  const updateFields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      updateFields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (updateFields.length === 0) return false;
  
  values.push(electionId);
  const query = `UPDATE elections SET ${updateFields.join(', ')} WHERE id = ?`;
  
  await connection.query(query, values);
  return true;
}
```

#### Delete Election
```javascript
// Controller: adminController.js
static async deleteElection(req, res, next) {
  const { id } = req.params;
  
  await Election.delete(id);
  
  res.json({ message: 'Election deleted successfully' });
  
  // Log action
  await AdminService.logAction(
    req.user.userId,
    'DELETE_ELECTION',
    'election',
    id,
    {},
    req.ip
  );
}

// Model: Election.js
static async delete(electionId) {
  const query = 'DELETE FROM elections WHERE id = ?';
  await connection.query(query, [electionId]);
  return true;
}
```

### Vote Management

#### Create Vote (Cast Vote)
```javascript
// Controller: voteController.js
static async castVote(req, res, next) {
  const { election_id, candidate_id } = req.body;
  const userId = req.user.userId;
  
  // Check if already voted
  const existingVote = await Vote.findByUserAndElection(userId, election_id);
  if (existingVote) {
    return res.status(400).json({ error: 'You have already voted in this election' });
  }
  
  // Verify election is active
  const election = await Election.findById(election_id);
  if (election.status !== 'active') {
    return res.status(400).json({ error: 'Election is not active' });
  }
  
  // Cast vote
  const vote = await Vote.create({
    user_id: userId,
    election_id,
    candidate_id,
    ip_address: req.ip
  });
  
  res.status(201).json({
    message: 'Vote cast successfully',
    vote_id: vote.id
  });
  
  // Log action
  await AdminService.logAction(
    userId,
    'CAST_VOTE',
    'vote',
    vote.id,
    { election_id, candidate_id },
    req.ip
  );
}

// Model: Vote.js
static async create(voteData) {
  const { user_id, election_id, candidate_id, ip_address } = voteData;
  const id = generateUUID();
  
  const query = `
    INSERT INTO votes (id, user_id, election_id, candidate_id, ip_address)
    VALUES (?, ?, ?, ?, ?)
  `;
  
  await connection.query(query, [
    id, user_id, election_id, candidate_id, ip_address
  ]);
  
  return { id };
}
```

#### Read Votes (Get Results)
```javascript
// Controller: voteController.js
static async getElectionResults(req, res, next) {
  const { electionId } = req.params;
  
  const results = await Vote.getElectionResults(electionId);
  const totalVotes = await Vote.getTotalVotes(electionId);
  
  res.json({
    election_id: electionId,
    results,
    total_votes: totalVotes
  });
}

// Model: Vote.js
static async getElectionResults(electionId) {
  const query = `
    SELECT 
      c.id as candidate_id,
      c.name as candidate_name,
      p.name as party_name,
      COUNT(v.id) as vote_count,
      (COUNT(v.id) * 100.0 / (SELECT COUNT(*) FROM votes WHERE election_id = ?)) as percentage
    FROM candidates c
    LEFT JOIN votes v ON c.id = v.candidate_id
    LEFT JOIN parties p ON c.party_id = p.id
    WHERE c.election_id = ?
    GROUP BY c.id
    ORDER BY vote_count DESC
  `;
  
  const [results] = await connection.query(query, [electionId, electionId]);
  return results;
}
```

### Party Management

#### Create Party
```javascript
// Controller: partyController.js
static async createParty(req, res, next) {
  const { name, logo, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Party name is required' });
  }
  
  const party = await Party.create({ name, logo, description });
  
  res.status(201).json({
    message: 'Party created successfully',
    party
  });
  
  // Log action
  await AdminService.logAction(
    req.user.userId,
    'CREATE_PARTY',
    'party',
    party.id,
    req.body,
    req.ip
  );
}

// Model: Party.js
static async create(partyData) {
  const { name, logo, description } = partyData;
  const id = generateUUID();
  
  const query = `
    INSERT INTO parties (id, name, logo, description)
    VALUES (?, ?, ?, ?)
  `;
  
  await connection.query(query, [id, name, logo || null, description || null]);
  
  return { id, name, logo, description };
}
```

#### Read Parties
```javascript
// Controller: partyController.js
static async getAllParties(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const search = req.query.search || '';
  
  const result = await Party.getAll(page, limit, search);
  
  res.json({
    parties: result.parties,
    total: result.total,
    pages: result.pages,
    current_page: page
  });
}

// Model: Party.js
static async getAll(page = 1, limit = 50, search = '') {
  let query = `
    SELECT p.*, 
      (SELECT COUNT(*) FROM candidates WHERE party_id = p.id) as candidate_count
    FROM parties p
    WHERE 1=1
  `;
  const params = [];
  
  if (search) {
    query += ' AND p.name LIKE ?';
    params.push(`%${search}%`);
  }
  
  query += ' ORDER BY p.name ASC LIMIT ?, ?';
  params.push((page - 1) * limit, limit);
  
  const [parties] = await connection.query(query, params);
  
  return {
    parties,
    total: parties.length,
    pages: Math.ceil(parties.length / limit)
  };
}
```

#### Update Party
```javascript
// Controller: partyController.js
static async updateParty(req, res, next) {
  const { id } = req.params;
  const updates = req.body;
  
  const success = await Party.update(id, updates);
  
  if (!success) {
    return res.status(400).json({ error: 'No updates provided' });
  }
  
  res.json({ message: 'Party updated successfully' });
}

// Model: Party.js
static async update(partyId, updates) {
  const allowedFields = ['name', 'logo', 'description'];
  const updateFields = [];
  const values = [];
  
  for (const [key, value] of Object.entries(updates)) {
    if (allowedFields.includes(key) && value !== undefined) {
      updateFields.push(`${key} = ?`);
      values.push(value);
    }
  }
  
  if (updateFields.length === 0) return false;
  
  values.push(partyId);
  const query = `UPDATE parties SET ${updateFields.join(', ')} WHERE id = ?`;
  
  await connection.query(query, values);
  return true;
}
```

#### Delete Party
```javascript
// Controller: partyController.js
static async deleteParty(req, res, next) {
  const { id } = req.params;
  
  await Party.delete(id);
  
  res.json({ message: 'Party deleted successfully' });
}

// Model: Party.js
static async delete(partyId) {
  // Check if party has candidates
  const [candidates] = await connection.query(
    'SELECT COUNT(*) as count FROM candidates WHERE party_id = ?',
    [partyId]
  );
  
  if (candidates[0].count > 0) {
    throw new Error(`Cannot delete party with ${candidates[0].count} associated candidates`);
  }
  
  await connection.query('DELETE FROM parties WHERE id = ?', [partyId]);
  return true;
}
```

---

## Login & Logout Flow

### Login Process

#### 1. User Login Flow

```
┌─────────────┐
│ User enters │
│ credentials │
└──────┬──────┘
       │
       v
┌─────────────────────┐
│ POST /api/auth/login│
│ { email, password } │
└──────┬──────────────┘
       │
       v
┌──────────────────────┐
│ Validate credentials │
│ Check account lock   │
└──────┬───────────────┘
       │
       v
┌──────────────────┐
│ Generate OTP     │
│ Send to email    │
└──────┬───────────┘
       │
       v
┌──────────────────────┐
│ User enters OTP      │
│ POST /api/auth/      │
│ verify-otp           │
└──────┬───────────────┘
       │
       v
┌──────────────────────┐
│ Verify OTP           │
│ Generate JWT token   │
│ Update last_login    │
└──────┬───────────────┘
       │
       v
┌──────────────────────┐
│ Return token & user  │
│ Store in localStorage│
└──────┬───────────────┘
       │
       v
┌──────────────────────┐
│ Redirect to dashboard│
└──────────────────────┘
```

#### 2. Login Implementation

**Backend - Login Controller**
```javascript
// authController.js
static async login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Step 1: Check account lock
    const isLocked = await User.isAccountLocked(email);
    if (isLocked) {
      return res.status(429).json({ 
        error: 'Account temporarily locked' 
      });
    }
    
    // Step 2: Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Step 3: Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await User.recordFailedLogin(email);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Step 4: Check email verification
    if (!user.is_verified) {
      return res.status(403).json({ 
        error: 'Please verify your email first' 
      });
    }
    
    // Step 5: Generate and send OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await OTP.create(email, otp, 'login', expiresAt);
    
    // Step 6: Send OTP email (skip in development)
    const isDevelopment = process.env.NODE_ENV !== 'production';
    if (!isDevelopment) {
      await sendOTPEmail(email, otp, 'login');
    }
    
    // Step 7: Return response
    const response = {
      message: 'OTP sent to your email',
      email: email,
      requiresOTP: true
    };
    
    if (isDevelopment) {
      response.developmentOTP = otp;
      console.log(`🔐 Login OTP for ${email}: ${otp}`);
    }
    
    res.json(response);
    
    // Step 8: Reset failed attempts
    await User.resetFailedAttempts(email);
    
    // Step 9: Log action
    await AdminService.logAction(
      user.id, 
      'LOGIN_REQUEST', 
      'user', 
      user.id, 
      {}, 
      req.ip
    );
  } catch (error) {
    next(error);
  }
}
```

**Backend - OTP Verification**
```javascript
// authController.js
static async verifyOTP(req, res, next) {
  try {
    const { email, otp } = req.body;
    
    // Step 1: Verify OTP
    const isValid = await OTP.verify(email, otp);
    if (!isValid) {
      return res.status(400).json({ 
        error: 'Invalid or expired OTP' 
      });
    }
    
    // Step 2: Get user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Step 3: Update last login
    await User.updateLastLogin(user.id);
    
    // Step 4: Generate JWT token
    const token = generateToken(user.id, user.role);
    
    // Step 5: Return token and user data
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
    // Step 6: Log action
    await AdminService.logAction(
      user.id, 
      'LOGIN_SUCCESS', 
      'user', 
      user.id, 
      {}, 
      req.ip
    );
  } catch (error) {
    next(error);
  }
}
```

**Frontend - Login Component**
```javascript
// Login.jsx
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Step 1: Send login request
    const response = await axios.post(
      'http://localhost:5000/api/auth/login',
      { email, password }
    );
    
    // Step 2: Check if OTP required
    if (response.data.requiresOTP) {
      setShowOTPModal(true);
      setDevelopmentOTP(response.data.developmentOTP);
      toast.success('OTP sent to your email');
    }
  } catch (error) {
    toast.error(error.response?.data?.error || 'Login failed');
  } finally {
    setLoading(false);
  }
};

const handleOTPVerify = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  try {
    // Step 1: Verify OTP
    const response = await axios.post(
      'http://localhost:5000/api/auth/verify-otp',
      { email, otp }
    );
    
    // Step 2: Store token and user
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Step 3: Update Zustand store
    setUser(user);
    setToken(token);
    
    // Step 4: Redirect based on role
    const redirectPath = user.role === 'admin' 
      ? '/admin/dashboard' 
      : '/elections';
    
    navigate(redirectPath);
    toast.success('Login successful');
  } catch (error) {
    toast.error(error.response?.data?.error || 'OTP verification failed');
  } finally {
    setLoading(false);
  }
};
```

#### 3. Admin Login (No OTP)

```javascript
// authController.js
static async adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Step 1: Find user
    const user = await User.findByEmail(email);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. Admin privileges required.' 
      });
    }
    
    // Step 2: Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      await User.recordFailedLogin(email);
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }
    
    // Step 3: Reset failed attempts
    await User.resetFailedAttempts(email);
    
    // Step 4: Update last login
    await User.updateLastLogin(user.id);
    
    // Step 5: Generate token (no OTP required)
    const token = generateToken(user.id, user.role);
    
    // Step 6: Return response
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      }
    });
    
    // Step 7: Log action
    await AdminService.logAction(
      user.id, 
      'ADMIN_LOGIN', 
      'user', 
      user.id, 
      {}, 
      req.ip
    );
  } catch (error) {
    next(error);
  }
}
```

### Logout Process

#### 1. Logout Flow

```
┌─────────────────┐
│ User clicks     │
│ Logout button   │
└────────┬────────┘
         │
         v
┌─────────────────────┐
│ Clear localStorage  │
│ - Remove token      │
│ - Remove user data  │
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│ Clear Zustand store │
│ - setUser(null)     │
│ - setToken(null)    │
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│ Log action (optional)│
│ POST /api/auth/logout│
└────────┬────────────┘
         │
         v
┌─────────────────────┐
│ Redirect to login   │
│ Show success message│
└─────────────────────┘
```

#### 2. Logout Implementation

**Frontend - Logout Function**
```javascript
// useAuthStore.js (Zustand)
const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  
  logout: () => {
    // Step 1: Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Step 2: Clear Zustand state
    set({ user: null, token: null });
    
    // Step 3: Optional - Log action on backend
    // axios.post('/api/auth/logout');
  }
}));
```

**Component - Logout Button**
```javascript
// Header.jsx
import useAuthStore from '../contexts/authStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // Step 1: Call logout function
    logout();
    
    // Step 2: Redirect to login
    navigate('/login');
    
    // Step 3: Show success message
    toast.success('Logged out successfully');
  };
  
  return (
    <header>
      <button onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
};
```

**Backend - Logout Endpoint (Optional)**
```javascript
// authController.js
static async logout(req, res, next) {
  try {
    const userId = req.user.userId;
    
    // Log action
    await AdminService.logAction(
      userId,
      'LOGOUT',
      'user',
      userId,
      {},
      req.ip
    );
    
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
}
```

### Session Management

#### Token Validation Middleware
```javascript
// authMiddleware.js
const authenticateToken = (req, res, next) => {
  // Step 1: Get token from header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  // Step 2: Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Step 3: Attach user to request
    req.user = user;
    next();
  });
};
```

#### Protected Route Example
```javascript
// Frontend - App.jsx
const RoleRoute = ({ children, allowedRoles }) => {
  const tokenFromStorage = localStorage.getItem('token');
  const userFromStorage = localStorage.getItem('user');
  
  let userObj = null;
  try {
    if (userFromStorage) {
      userObj = JSON.parse(userFromStorage);
    }
  } catch (e) {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    return <Navigate to="/login" replace />;
  }
  
  // Check authentication
  if (!tokenFromStorage || !userObj) {
    return <Navigate to="/login" replace />;
  }
  
  // Check authorization
  if (allowedRoles && !allowedRoles.includes(userObj.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};
```

---
