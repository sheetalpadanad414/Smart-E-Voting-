# Smart E-Voting System - Roles & Permissions Guide

## Overview

The Smart E-Voting System supports four distinct user roles, each with specific permissions and responsibilities. This guide explains the capabilities and features available to each role.

---

## 1. **Admin** 👤

### Description
System administrators with complete control over platform operations and user management.

### Key Responsibilities
- Manage all system users and their roles
- Create and configure elections
- Monitor system security and audit logs
- Configure system settings

### Features & Permissions

#### User Management
- **View all users** - See complete list of all system users
- **Create users** - Add new admins, election officers, observers, and voters
- **Edit users** - Update user details, department, designation
- **Delete users** - Remove users from the system
- **Reset passwords** - Help users reset forgotten passwords
- **Manage roles** - Assign or change user roles

#### Election Management
- **Create elections** - Set up new elections with details and dates
- **Edit elections** - Modify election settings before/during election
- **Delete elections** - Remove elections from the system
- **Start/Stop elections** - Control election timing
- **Manage candidates** - Add, edit, delete candidates
- **Set election status** - Draft, Active, Completed

#### Monitoring
- **View audit logs** - See all system activities
- **System statistics** - Dashboard with comprehensive metrics
- **Security monitoring** - Check failed login attempts, suspicious activities
- **System health** - Monitor database, server performance

#### Dashboard
- **Statistics Cards**:
  - Total users
  - Active elections
  - Total votes cast
  - System uptime
- **Recent activities log**
- **User management table**
- **Election management table**

### Default Routes
- Dashboard: `/admin/dashboard`
- Users: `/admin/users`
- Elections: `/admin/elections`

### Database Permissions
- Full read/write access to all tables
- Can create audit logs
- System configuration access

---

## 2. **Election Officer** 📋

### Description
Government officials responsible for monitoring elections and ensuring smooth operations.

### Key Responsibilities
- Monitor real-time voting progress
- Ensure voting procedures are followed correctly
- Generate official election reports
- Handle emergency situations

### Features & Permissions

#### Election Monitoring
- **View assigned elections** - See only elections in their jurisdiction/assignment
- **Real-time updates** - Live vote counts and percentages
- **Candidate performance** - Track candidate vote progression
- **Voter turnout** - Monitor participation rates
- **System alerts** - Get notified of suspicious patterns

#### Live Analytics
- **Hourly voting trends** - Charts showing votes per hour
- **Candidate ranking** - Real-time ranking updates
- **Vote distribution** - Visual representation of votes
- **Turnout statistics** - Eligibility vs actual voters

#### Security & Monitoring
- **Suspicious activity alerts**:
  - Multiple votes from same IP
  - Unusual voting patterns
  - Timing anomalies
- **System integrity checks**
- **Data consistency verification**

#### Report Generation
- **Export election data** - JSON, CSV, PDF formats
- **Generate reports**:
  - Final summary reports
  - Live snapshots of voting
  - Turnout analysis
  - Candidate ranking reports
  - Geographical data reports
- **Custom report filters**:
  - By election
  - By date range
  - By report type

#### Dashboard
- **Statistics Cards**:
  - Assigned elections count
  - Active elections count
  - Total votes cast
  - Average voter turnout
- **Quick actions**:
  - Monitor elections
  - Generate reports
  - Security alerts
- **Elections table** with:
  - Election status
  - Vote counts
  - Turnout percentage
  - Candidate count

### Field Requirements for Registration
- **Name**: Required
- **Email**: Required, unique
- **Phone**: Required
- **Department**: Required (e.g., Election Commission)
- **Designation**: Required (e.g., Senior Officer)
- **Assignment Area**: Optional (e.g., North District)

### Default Routes
- Dashboard: `/election-officer/dashboard`
- Monitoring: `/election-officer/monitoring`
- Monitoring Detail: `/election-officer/monitoring/:electionId`
- Reports: `/election-officer/reports`

### API Endpoints Available
- `GET /api/election-officer/elections` - Get assigned elections
- `GET /api/election-officer/elections/:id/details` - Election details
- `GET /api/election-officer/elections/:id/updates` - Live updates
- `GET /api/election-officer/elections/:id/report` - Generate report
- `GET /api/election-officer/elections/:id/turnout` - Turnout stats
- `GET /api/election-officer/elections/:id/alerts` - Security alerts
- `GET /api/election-officer/elections/:id/export` - Export data

---

## 3. **Observer** 👁️

### Description
Neutral third-party observers ensuring transparency and fairness of elections.

### Key Responsibilities
- Monitor election process transparently
- Verify integrity of voting system
- Document and report observations
- Ensure public accessibility to election data

### Features & Permissions

#### Read-Only Access
- **View public elections** - Only elections marked as public
- **View results** - Once elections are complete or as allowed
- **View voting trends** - Anonymized voting patterns over time
- **View candidate analysis** - Ranking and vote distribution

#### Analysis Tools
- **Voting trends** - Charts showing votes over time by candidate
- **Comparative analysis**:
  - Candidate rankings
  - Vote margins
  - Victory analysis
- **Statistical summaries**:
  - Total votes
  - Voter participation rates
  - Vote distribution percentages

#### Data Verification
- **Integrity checks**:
  - Vote count verification
  - Candidate match verification
  - Data consistency checks
  - All checks marked as verified ✓
- **Transparency reports** - Verify election fairness

#### Report Export
- **Export capabilities**:
  - JSON format
  - CSV format (downloadable)
  - Read-only access to all data
- **Report templates**:
  - Final results summary
  - Voter participation analysis
  - Candidate ranking
  - Geographical data (if available)

#### Dashboard
- **Statistics Cards**:
  - Elections observed
  - Total votes tracked
  - Average voter turnout
  - Data integrity (100%)
- **Observable elections grid**:
  - Election title and status
  - Vote counts
  - Candidate count
  - Voter turnout percentage
  - Quick "View Analysis" button

### Field Requirements for Registration
- **Name**: Required
- **Email**: Required, unique
- **Phone**: Required
- **Department**: Required (e.g., NGO, International Observer Group)
- **Designation**: Required (e.g., Lead Observer)
- **Assignment Area**: Optional

### Default Routes
- Dashboard: `/observer/dashboard`
- Elections: `/observer/elections`
- Results: `/observer/elections/:electionId/results`
- Analysis: `/observer/elections/:electionId/analysis`

### API Endpoints Available (Read-Only)
- `GET /api/observer/elections` - Get observable elections
- `GET /api/observer/elections/:id/results` - View results
- `GET /api/observer/elections/:id/trends` - Voting trends
- `GET /api/observer/elections/:id/analysis` - Comparative analysis
- `GET /api/observer/elections/:id/report` - Export report
- `GET /api/observer/elections/:id/integrity` - Integrity verification

### Data Access Limitations
- Cannot modify any election data
- Cannot view voter identities
- Cannot view non-public elections
- Read-only dashboard access

---

## 4. **Voter** 🗳️

### Description
Citizens with the right to vote in elections.

### Key Responsibilities
- Cast votes in elections
- View election information
- Check personal voting history
- View public election results

### Features & Permissions

#### Voting
- **Browse elections** - View available elections to vote in
- **View election details**:
  - Candidates list with descriptions
  - Election timing and dates
  - Instructions for voting
- **Cast vote** - Vote for one candidate per election
- **Vote confirmation** - Confirmation after voting
- **One vote per election** - System prevents double voting

#### Election Results
- **View results** - Access election results
- **Results breakdown**:
  - Vote counts per candidate
  - Percentage distribution
  - Visual charts and graphs
  - Candidate rankings

#### Voting History
- **View voting history** - See past and current elections voted in
- **Download certificates** - Proof of participation (if enabled)
- **Election notifications** - Updates on election status

#### Dashboard/Home
- **Elections listing**:
  - Upcoming elections
  - Ongoing elections
  - Completed elections
  - Personal voting status per election
- **Election cards** showing:
  - Status (Not Voted, Voted, Results Available)
  - Election details
  - Vote button or results link

### Field Requirements for Registration
- **Name**: Required
- **Email**: Required, unique
- **Phone**: Required
- **Voter ID**: Optional (can be set by admin later)

### Default Routes
- Elections: `/elections`
- Vote: `/elections/:id`
- Results: `/results/:id`
- History: `/history`

### API Endpoints Available
- `GET /api/voter/elections` - List elections
- `GET /api/voter/elections/:id` - Election details
- `POST /api/voter/elections/:id/vote` - Cast vote
- `GET /api/voter/elections/:id/results` - View results
- `GET /api/voter/voting-history` - Voting history
- `GET /api/voter/profile` - User profile

### Security Features
- **Vote concealment** - Cast votes anonymously in system
- **IP logging** - Track voting device (not voter identity)
- **Double-vote prevention** - One vote per election guaranteed
- **Secure authentication** - JWT token required

---

## Registration & Access Control

### Step 1: Role Selection
Users select their role during registration:
- 🗳️ Voter
- 📋 Election Officer
- 👁️ Observer
- ⚙️ Admin (requires special permission)

### Step 2: Role-Specific Fields
Depending on the selected role:

**All Roles**:
- Full Name (required)
- Email (required, unique)
- Phone (required)
- Password (required, min 8 chars)

**Election Officer & Observer**:
- Department (required)
- Designation (required)
- Assignment Area (optional)

### Step 3: Email Verification
- OTP sent to registered email
- User must verify email within 5 minutes
- After verification, user can login

### Step 4: Dashboard Access
After successful login, users are redirected to role-specific dashboards:
- **Admin**: `/admin/dashboard`
- **Election Officer**: `/election-officer/dashboard`
- **Observer**: `/observer/dashboard`
- **Voter**: `/elections`

---

## Authorization & Access Control

### Middleware
Role-based authorization enforced at:
- **Route level**: Protected routes check user role
- **API level**: Backend verifies permissions via JWT
- **Component level**: UI hides/shows features based on role

### Header Navigation
The header dynamically updates based on user role:
- Shows role-specific menu items
- Displays user name and role
- Provides logout functionality

### Feature Toggle
- Features visible only to authorized roles
- Unauthorized access returns 403 Forbidden
- Graceful error handling with user-friendly messages

---

## Database Schema

### Users Table
```sql
role ENUM('admin', 'voter', 'election_officer', 'observer')
department VARCHAR(100) -- For election_officer and observer
designation VARCHAR(100) -- For election_officer and observer
assignment_area VARCHAR(255) -- For election_officer
voter_id VARCHAR(20) UNIQUE -- For voters
```

### Role-Based Queries
- Filtering by role for dashboards
- Department/designation for officer search
- Assignment area for location-based assignment

---

## Best Practices & Recommendations

### For Admins
1. Create election officers for each district/region
2. Assign observers from recognized organizations
3. Regularly review audit logs for security
4. Test elections before going live

### For Election Officers
1. Monitor elections continuously during voting hours
2. Document any suspicious activities
3. Generate reports at regular intervals
4. Contact admin for emergency situations

### For Observers
1. Document observations in notes (if feature available)
2. Verify data consistency regularly
3. Download reports for official records
4. Report findings to relevant authorities

### For Voters
1. Vote only once per election
2. Keep login credentials confidential
3. Verify voting confirmation after casting vote
4. Report any system issues immediately

---

## Security Considerations

### Authentication
- **OTP Verification**: Required for new account verification
- **JWT Tokens**: Secure token-based authentication
- **Password**: Minimum 8 characters (preferably with special characters)
- **Account Lock**: Locked after 5 failed login attempts

### Voting Security
- **Ballot Secrecy**: Voter identity not linked to vote
- **Vote Integrity**: Each vote independently verified
- **Audit Trail**: All votes logged with metadata
- **Non-Repudiation**: Voters cannot deny their vote

### System Security
- **Role-Based Access Control**: Strict permission enforcement
- **Data Encryption**: Sensitive data encrypted in transit and at rest
- **Activity Logging**: All administrative actions logged
- **Rate Limiting**: API endpoints rate-limited to prevent abuse

---

## Troubleshooting

### Cannot Login
- Verify OTP email verification was completed
- Check account hasn't been locked (wait 15 minutes)
- Ensure password is correct
- Look for password reset email if account was reset

### Missing Elections
- Election Officer: Check if elections are assigned to your area
- Voter: Election may not be visible yet or may have closed
- Observer: Election must be marked as public

### Export Issues
- Ensure sufficient disk space
- Try different export format (JSON, CSV, PDF)
- Check browser download settings
- Verify file permissions

### Performance Issues
- Check internet connection speed
- Clear browser cache and cookies
- Try in incognito/private window
- Use supported browsers (Chrome, Firefox, Safari, Edge)

---

## Future Enhancements

Planned features for upcoming versions:
- [ ] Biometric voter verification
- [ ] Real-time WebSocket updates
- [ ] Mobile app for election officers
- [ ] Advanced geospatial analysis
- [ ] Machine learning-based anomaly detection
- [ ] Blockchain integration for vote immutability
- [ ] Multi-language support
- [ ] Accessibility features (WCAG 2.1 AA)

---

## Support & Contact

For issues or questions:
- Send email to: support@smartevoting.com
- Call helpline: +1-800-VOTING-1
- Report security issues: security@smartevoting.com

---

**Version**: 1.0  
**Last Updated**: February 2024  
**Document Maintained By**: Technical Team
