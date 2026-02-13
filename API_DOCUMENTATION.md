# API Documentation - Smart E-Voting System

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer {token}
```

---

## Authentication Endpoints

### 1. User Registration
**POST** `/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phone": "9876543210"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. Please verify your email with OTP.",
  "userId": "uuid",
  "email": "john@example.com"
}
```

**Validations:**
- Password: Min 8 chars, uppercase, lowercase, digit, special char
- Email: Valid email format
- Name: At least 2 characters

---

### 2. Verify OTP
**POST** `/auth/verify-otp`

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "voter"
  }
}
```

---

### 3. Login
**POST** `/auth/login`

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "voter"
  }
}
```

**Error (401):**
```json
{
  "error": "Invalid email or password"
}
```

---

### 4. Resend OTP
**POST** `/auth/resend-otp`

**Request:**
```json
{
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "message": "OTP sent to your email"
}
```

---

### 5. Get Profile
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "voter",
    "is_verified": true,
    "last_login": "2024-01-15T10:30:00Z"
  }
}
```

---

## Admin Endpoints

**All endpoints require:** `Authorization: Bearer {token}` and `role: admin`

### Dashboard

#### Get Dashboard Statistics
**GET** `/admin/dashboard`

**Response (200):**
```json
{
  "users": {
    "total_users": 150,
    "total_admins": 5,
    "verified_voters": 145,
    "unverified_voters": 0
  },
  "elections": {
    "draft": 3,
    "active": 2,
    "completed": 10
  },
  "recent_activities": [
    {
      "id": "uuid",
      "user_name": "Admin User",
      "action": "CREATE_ELECTION",
      "entity_type": "election",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### User Management

#### Get All Users
**GET** `/admin/users?page=1&limit=20&role=voter&verified=true`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `role` - Filter by role (admin/voter)
- `verified` - Filter by verification status (true/false)

**Response (200):**
```json
{
  "total": 100,
  "pages": 5,
  "current_page": 1,
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "role": "voter",
      "is_verified": true,
      "voter_id": "VOTER001",
      "last_login": "2024-01-15T10:30:00Z",
      "created_at": "2024-01-10T15:00:00Z"
    }
  ]
}
```

#### Create User
**POST** `/admin/users`

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "SecurePass@123",
  "phone": "9876543211",
  "role": "voter"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "jane@example.com",
    "name": "Jane Smith",
    "role": "voter"
  }
}
```

#### Update User
**PUT** `/admin/users/{userId}`

**Request:**
```json
{
  "name": "Jane Smith Updated",
  "phone": "9876543212",
  "voter_id": "VOTER002"
}
```

**Response (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "uuid",
    "name": "Jane Smith Updated",
    "email": "jane@example.com",
    "phone": "9876543212",
    "role": "voter"
  }
}
```

#### Delete User
**DELETE** `/admin/users/{userId}`

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### Election Management

#### Get All Elections
**GET** `/admin/elections?page=1&limit=10&status=active`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `status` - Filter by status (draft/active/completed)

**Response (200):**
```json
{
  "total": 15,
  "pages": 2,
  "current_page": 1,
  "elections": [
    {
      "id": "uuid",
      "title": "Presidential Election 2024",
      "description": "Vote for president",
      "start_date": "2024-02-01T09:00:00Z",
      "end_date": "2024-02-01T18:00:00Z",
      "status": "active",
      "is_public": true,
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Create Election
**POST** `/admin/elections`

**Request:**
```json
{
  "title": "Presidential Election 2024",
  "description": "Vote for president",
  "start_date": "2024-02-01T09:00:00Z",
  "end_date": "2024-02-01T18:00:00Z",
  "is_public": true
}
```

**Response (201):**
```json
{
  "message": "Election created successfully",
  "election": {
    "id": "uuid",
    "title": "Presidential Election 2024",
    "status": "draft"
  }
}
```

#### Get Election Details
**GET** `/admin/elections/{electionId}`

**Response (200):**
```json
{
  "election": {
    "id": "uuid",
    "title": "Presidential Election 2024",
    "description": "Vote for president",
    "start_date": "2024-02-01T09:00:00Z",
    "end_date": "2024-02-01T18:00:00Z",
    "status": "active",
    "is_public": true,
    "created_by": "uuid",
    "created_by_name": "Admin User"
  },
  "candidates": [
    {
      "id": "uuid",
      "name": "Candidate 1",
      "party_name": "Party A",
      "vote_count": 150
    }
  ],
  "total_candidates": 1
}
```

#### Update Election
**PUT** `/admin/elections/{electionId}`

**Request:**
```json
{
  "title": "Presidential Election 2024 - Updated",
  "description": "Updated description",
  "start_date": "2024-02-01T09:00:00Z",
  "end_date": "2024-02-01T19:00:00Z",
  "is_public": true
}
```

**Response (200):**
```json
{
  "message": "Election updated successfully",
  "election": { }
}
```

#### Delete Election
**DELETE** `/admin/elections/{electionId}`

**Note:** Only draft elections can be deleted

**Response (200):**
```json
{
  "message": "Election deleted successfully"
}
```

---

### Candidate Management

#### Get Candidates by Election
**GET** `/admin/elections/{electionId}/candidates?page=1&limit=50`

**Response (200):**
```json
{
  "total": 5,
  "pages": 1,
  "current_page": 1,
  "candidates": [
    {
      "id": "uuid",
      "name": "Candidate 1",
      "description": "Candidate bio",
      "symbol": "🔴",
      "position": "President",
      "party_name": "Party A",
      "vote_count": 150
    }
  ]
}
```

#### Create Candidate
**POST** `/admin/candidates`

**Request:**
```json
{
  "election_id": "uuid",
  "name": "Candidate 1",
  "description": "Candidate bio",
  "symbol": "🔴",
  "position": "President",
  "party_name": "Party A",
  "image_url": "https://example.com/image.jpg"
}
```

**Response (201):**
```json
{
  "message": "Candidate created successfully",
  "candidate": {
    "id": "uuid",
    "name": "Candidate 1"
  }
}
```

#### Update Candidate
**PUT** `/admin/candidates/{candidateId}`

**Request:**
```json
{
  "name": "Candidate 1 Updated",
  "description": "Updated bio"
}
```

**Response (200):**
```json
{
  "message": "Candidate updated successfully",
  "candidate": { }
}
```

#### Delete Candidate
**DELETE** `/admin/candidates/{candidateId}`

**Response (200):**
```json
{
  "message": "Candidate deleted successfully"
}
```

---

### Audit Logs

#### Get Audit Logs
**GET** `/admin/audit-logs?page=1&limit=50&user_id=uuid&action=CREATE_ELECTION&entity_type=election`

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page
- `user_id` - Filter by user
- `action` - Filter by action
- `entity_type` - Filter by entity type

**Response (200):**
```json
{
  "logs": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "action": "CREATE_ELECTION",
      "entity_type": "election",
      "entity_id": "uuid",
      "changes": {"title": "New Election"},
      "ip_address": "192.168.1.1",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

## Voter Endpoints

### Elections

#### Get Available Elections
**GET** `/voter/elections?page=1&limit=20`

**Response (200):**
```json
{
  "total": 50,
  "pages": 3,
  "current_page": 1,
  "elections": [
    {
      "id": "uuid",
      "title": "Presidential Election",
      "description": "Vote for president",
      "start_date": "2024-02-01T09:00:00Z",
      "end_date": "2024-02-01T18:00:00Z",
      "status": "active",
      "is_public": true"
    }
  ]
}
```

#### Get Election Details
**GET** `/voter/elections/{electionId}`

**Headers (Optional for voting):**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "election": {
    "id": "uuid",
    "title": "Presidential Election",
    "description": "Vote for president",
    "start_date": "2024-02-01T09:00:00Z",
    "end_date": "2024-02-01T18:00:00Z",
    "status": "active"
  },
  "candidates": [
    {
      "id": "uuid",
      "name": "Candidate 1",
      "party_name": "Party A",
      "symbol": "🔴",
      "description": "Bio"
    }
  ],
  "has_voted": false
}
```

---

### Voting

#### Cast Vote
**POST** `/voter/vote`

**Headers:**
```
Authorization: Bearer {token}
```

**Request:**
```json
{
  "election_id": "uuid",
  "candidate_id": "uuid"
}
```

**Response (201):**
```json
{
  "message": "Vote cast successfully!",
  "vote_id": "uuid"
}
```

**Errors:**
```json
{
  "error": "You have already voted in this election"
}
```

---

#### Get Voting History
**GET** `/voter/voting-history?page=1&limit=20`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "total": 5,
  "pages": 1,
  "current_page": 1,
  "votes": [
    {
      "id": "uuid",
      "election_title": "Presidential Election",
      "candidate_name": "Candidate 1",
      "voted_at": "2024-02-01T10:30:00Z"
    }
  ]
}
```

---

### Results

#### Get Election Results
**GET** `/voter/elections/{electionId}/results`

**Response (200):**
```json
{
  "election": {
    "id": "uuid",
    "title": "Presidential Election",
    "status": "completed"
  },
  "results": {
    "total_voters": 1000,
    "total_votes": 985,
    "turnout": "98.50",
    "candidates": [
      {
        "id": "uuid",
        "name": "Candidate 1",
        "vote_count": 450,
        "party_name": "Party A"
      }
    ]
  }
}
```

#### Export Results as PDF
**GET** `/voter/elections/{electionId}/results/export`

**Response:** PDF file download

---

## Error Responses

### 400 - Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Please provide a valid email"
    }
  ]
}
```

### 401 - Unauthorized
```json
{
  "error": "Invalid or expired token"
}
```

### 403 - Forbidden
```json
{
  "error": "Access denied: Insufficient permissions"
}
```

### 404 - Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 429 - Too Many Requests
```json
{
  "error": "Too many authentication attempts, please try again later"
}
```

### 500 - Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limited |
| 500 | Server Error - Internal error |

---

## Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes
- **API endpoints**: 100 requests per minute
- **Vote endpoint**: 1 request per election per hour

---

## Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"Pass@123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass@123"}'

# Get profile (with token)
curl -H "Authorization: Bearer {token}" \
  http://localhost:5000/api/auth/profile
```

### Using Postman

1. Import these endpoints
2. Set base URL: `http://localhost:5000/api`
3. Add token in Authorization tab
4. Send requests

---

## Rate Limits & Throttling

Every response includes rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642345000
```
