# Project Cleanup Report

## Files to Delete

### Root Directory - Unused Images (4 files)
These image files are not referenced anywhere in the codebase:
- ❌ congress.jpg
- ❌ denocratic.jpg  
- ❌ green.jpg
- ❌ Independent.png

Note: These were source files for logo conversion scripts. The actual logos are in backend/uploads/party-logos/ as PNG files.

### Root Directory - Unused Scripts (2 files)
- ❌ email.js (not imported anywhere)
- ❌ ADD_MISSING_COLUMN.sql (not referenced)

### Backend - Test Files (47 files)
All test-*.js and test*.js files are standalone test scripts not used in production:
- ❌ test-complete-flow.js
- ❌ test-db-connection.js
- ❌ test-election-categories.js
- ❌ test-election-creation.js
- ❌ test-election-status.js
- ❌ test-election-types.js
- ❌ test-local-logos.js
- ❌ test-location-dashboard.js
- ❌ test-location-feature.js
- ❌ test-logo-system.js
- ❌ test-party-logo-system.js
- ❌ test-party-system-complete.js
- ❌ test-party-system.js
- ❌ test-refactored-system.js
- ❌ test-vote-flow.js
- ❌ test-vote-submission.js
- ❌ test-voter-tracking.js
- ❌ testAddCandidate.js
- ❌ testAddCandidateFixed.js
- ❌ testAdminLogin.js
- ❌ testAPI.js
- ❌ testAuthFlow.js
- ❌ testAuthIntegration.js
- ❌ testCastVote.js
- ❌ testDbConnection.js
- ❌ testElectionControl.js
- ❌ testElectionResults.js
- ❌ testEmail.js
- ❌ testGetCandidates.js
- ❌ testOTPFlow.js
- ❌ testOTPLogin.js
- ❌ testResultsFeature.js
- ❌ testVotingFlow.js
- ❌ testVotingSystem.js

### Backend - Setup/Migration Scripts (30 files)
One-time setup scripts no longer needed:
- ❌ add-parties-with-urls.js
- ❌ add-test-party-with-logo.js
- ❌ check-candidates-table.js
- ❌ check-congress-logo.js
- ❌ check-parties.js
- ❌ checkElectionStatus.js
- ❌ checkUsersTable.js
- ❌ completeElection.js
- ❌ copy-real-logos.js
- ❌ create-active-election.js
- ❌ create-database.js
- ❌ create-missing-tables.js
- ❌ create-placeholder-images.js
- ❌ create-proper-images.js
- ❌ create-real-png-logos.js
- ❌ create-sample-parties-local.js
- ❌ create-svg-logos.js
- ❌ create-test-voter.js
- ❌ createAdmin.js
- ❌ createTestElection.js
- ❌ createTestVoter.js
- ❌ deleteAdmin.js
- ❌ fix-collation.js
- ❌ fix-congress-logo.js
- ❌ fix-party-foreign-key.js
- ❌ fixScopes.js
- ❌ list-elections.js
- ❌ resetAdminAccount.js
- ❌ setup-database.js
- ❌ setup-real-party-logos.js
- ❌ setupTestElection.js
- ❌ update-database.js
- ❌ update-party-logos.js
- ❌ use-existing-logos.js

### Backend - Unused Files (3 files)
- ❌ serverSimple.js (duplicate server file)
- ❌ package_simple.json (duplicate package file)
- ❌ db-setup.html (setup documentation)

### Backend - Migration Scripts (Keep but can archive)
- ⚠️ migrate-database.js (keep for reference)
- ⚠️ migrateInstitutional.js (keep for reference)

### Frontend - Unused Page Components (13 files)
Pages that are not imported in App.jsx:
- ❌ AdminDashboard.jsx (using AdminDashboardEnhanced.jsx)
- ❌ AdminDashboardComplete.jsx
- ❌ AdminDashboardNew.jsx
- ❌ AdminElections.jsx (using AdminElectionsEnhanced.jsx)
- ❌ AdminParties.jsx (using AdminPartiesEnhanced.jsx)
- ❌ ElectionResultsNew.jsx
- ❌ LoginEnhanced.jsx
- ❌ LoginSimple.jsx
- ❌ VoteElection.jsx
- ❌ VoteElectionNew.jsx
- ❌ VoterElections.jsx (using VoterElectionsEnhanced.jsx)
- ❌ VoterElectionsNew.jsx

### Frontend - Unused Dependencies (3 packages)
Not imported anywhere in the codebase:
- ❌ moment (use native Date instead)
- ❌ lodash (not used)
- ❌ html2canvas (not used)
- ❌ jspdf (not used)

### Backend - Unused Dependencies (2 packages)
- ❌ jest (no test files in use)
- ❌ supertest (no test files in use)

## Files to Keep

### Essential Backend Files
- ✅ server.js (main server)
- ✅ All files in config/, controllers/, middleware/, models/, routes/, services/, utils/
- ✅ package.json, package-lock.json
- ✅ .env, .env.example

### Essential Frontend Files
- ✅ All imported pages in App.jsx
- ✅ All components in src/components/
- ✅ All contexts in src/contexts/
- ✅ services/api.js
- ✅ package.json, package-lock.json

### Essential Root Files
- ✅ README.md
- ✅ .gitignore
- ✅ .env.example
- ✅ Batch scripts for starting services

## Summary
- Total files to delete: ~100 files
- Disk space to recover: ~5-10 MB
- Dependencies to remove: 5 packages
- No impact on core functionality

## Recommended Actions
1. Delete all test files from backend/
2. Delete all setup/migration scripts from backend/
3. Delete unused page components from frontend/src/pages/
4. Remove unused dependencies from package.json files
5. Delete unused images from root directory
6. Run npm install in both frontend and backend after cleanup
