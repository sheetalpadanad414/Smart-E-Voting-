#!/bin/bash
# Smart E-Voting System - Quick Start Testing Guide

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Smart E-Voting System - Authentication Flow Test Guide${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}STEP 1: Prerequisites Check${NC}"
echo "=================================="
echo -e "✓ Node.js installed: $(node -v)"
echo -e "✓ npm installed: $(npm -v)"
echo -e ""

# Check if MySQL is available
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✓ MySQL is available${NC}"
    MYSQL_AVAILABLE=true
else
    echo -e "${YELLOW}⚠ MySQL not found in PATH${NC}"
    MYSQL_AVAILABLE=false
fi

echo -e "\n${YELLOW}STEP 2: Install Backend Dependencies${NC}"
echo "======================================"
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
    INSTALL=false
else
    echo "Installing dependencies..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✓ Dependencies installed${NC}"
    INSTALL=true
fi

echo -e "\n${YELLOW}STEP 3: Environment Configuration${NC}"
echo "================================="
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓ .env file exists${NC}"
    echo ""
    echo "Current configuration:"
    grep "^[^#]" backend/.env | head -10
else
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo ""
    echo "Creating .env from .env.example..."
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}✓ .env created from template${NC}"
    else
        echo -e "${RED}✗ .env.example not found${NC}"
        echo ""
        echo "Please create backend/.env with these settings:"
        echo ""
        cat << 'EOF'
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_voting_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
OTP_EXPIRE=5
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Smart E-Voting System <noreply@votingsystem.com>
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000
BCRYPT_ROUNDS=10
EOF
    fi
fi

echo -e "\n${YELLOW}STEP 4: Database Setup${NC}"
echo "======================"

if [ "$MYSQL_AVAILABLE" = true ]; then
    echo -e "Initializing database..."
    cd backend
    node config/initDatabase.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database initialized successfully${NC}"
    else
        echo -e "${RED}✗ Database initialization failed${NC}"
        echo "Make sure MySQL is running and credentials in .env are correct"
    fi
    cd ..
else
    echo -e "${YELLOW}⚠ MySQL not found. Database initialization skipped.${NC}"
    echo ""
    echo "To manually initialize:"
    echo "1. Start MySQL server"
    echo "2. Run: cd backend && node config/initDatabase.js"
fi

echo -e "\n${YELLOW}STEP 5: Start Backend Server${NC}"
echo "============================="
echo ""
echo "Starting backend on http://localhost:5000..."
echo ""
echo -e "${YELLOW}To start the server, run:${NC}"
echo "  cd backend"
echo "  npm start"
echo ""
echo -e "${YELLOW}Server should show:${NC}"
echo "  ✓ Server running on port 5000"
echo "  ✓ Database connection successful"
echo "  ✓ Environment: development"
echo ""

echo -e "\n${YELLOW}STEP 6: Run Integration Tests${NC}"
echo "=============================="
echo ""
echo -e "${YELLOW}Option A: Automated Integration Test (Recommended)${NC}"
echo "  cd backend"
echo "  node testAuthIntegration.js"
echo ""
echo "  This test:"
echo "  ✓ Checks server connectivity"
echo "  ✓ Tests voter registration"
echo "  ✓ Tests officer registration"
echo "  ✓ Tests login OTP flow"
echo "  ✓ Tests error handling"
echo "  ✓ Validates role-specific fields"
echo ""

echo -e "${YELLOW}Option B: Interactive Test (With Manual OTP Input)${NC}"
echo "  cd backend"
echo "  node testAuthFlow.js"
echo ""
echo "  This test:"
echo "  ✓ Prompts for OTP from console"
echo "  ✓ Tests complete registration flow"
echo "  ✓ Tests complete login flow"
echo "  ✓ Tests profile retrieval"
echo ""

echo -e "\n${YELLOW}STEP 7: Manual Testing with Frontend${NC}"
echo "======================================"
echo ""
echo "1. Open http://localhost:3000/register in browser"
echo ""
echo "2. Test Registration:"
echo "   - Select a role (Voter, Officer, Observer, or Admin)"
echo "   - Fill in all required fields"
echo "   - Enter password meeting requirements:"
echo "     • Minimum 8 characters"
echo "     • Uppercase letter"
echo "     • Lowercase letter"
echo "     • Number"
echo "     • Special character (@\$!%*?&)"
echo "   - Submit form"
echo "   - You'll see: 'OTP sent to your email'"
echo "   - Check backend console for OTP"
echo "   - Enter OTP to complete registration"
echo ""
echo "3. Test Login:"
echo "   - Go to http://localhost:3000/login"
echo "   - Enter registered email and password"
echo "   - You'll see: 'OTP sent. Check console for OTP'"
echo "   - Check backend console for OTP"
echo "   - Enter OTP to complete login"
echo ""

echo -e "\n${YELLOW}STEP 8: Verify Fixes${NC}"
echo "===================="
echo ""
echo "✓ Check: Registration shows 4 role options"
echo "✓ Check: Officer/Observer roles show department field"
echo "✓ Check: Backend console shows OTP on registration"
echo "✓ Check: Backend console shows OTP on login"
echo "✓ Check: OTP submission gives you JWT token"
echo "✓ Check: Invalid OTP properly rejected"
echo "✓ Check: Duplicate email properly rejected"
echo "✓ Check: Weak password properly rejected"
echo ""

echo -e "\n${YELLOW}STEP 9: API Testing (Optional)${NC}"
echo "=============================="
echo ""
echo "Test with curl:"
echo ""
echo "Register Voter:"
echo 'curl -X POST http://localhost:5000/api/auth/register \'
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo '    \"name\": \"Test User\","'
echo '    \"email\": \"test@example.com\","'
echo '    \"password\": \"TestPass123!@#\","'
echo '    \"phone\": \"9876543210\","'
echo '    \"role\": \"voter\"'
echo "  }'"
echo ""
echo "Check backend console for OTP"
echo ""
echo "Verify OTP:"
echo 'curl -X POST http://localhost:5000/api/auth/verify-otp \'
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo '    \"email\": \"test@example.com\","'
echo '    \"otp\": \"123456\"'
echo "  }'"
echo ""

echo -e "\n${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}All fixes have been implemented!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}What was fixed:${NC}"
echo "1. Register.jsx - Populated roles array"
echo "2. Login flow - Now sends OTP"
echo "3. ResendOTP - Using OTP model instead of User table"
echo "4. User model - Removed duplicate OTP methods"
echo "5. Role-specific fields - Department and designation"
echo ""

echo -e "${YELLOW}Files Modified:${NC}"
echo "- frontend/src/pages/Register.jsx"
echo "- backend/controllers/authController.js"
echo "- backend/models/User.js"
echo ""

echo -e "${YELLOW}Files Created:${NC}"
echo "- backend/testAuthIntegration.js (automated test)"
echo "- backend/testAuthFlow.js (interactive test)"
echo "- FIX_SUMMARY.md (complete documentation)"
echo "- QUICK_FIX_REFERENCE.md (quick reference)"
echo "- AUTH_FIXES_DOCUMENTATION.md (detailed docs)"
echo "- VISUAL_FIX_SUMMARY.md (visual comparison)"
echo ""

echo -e "${GREEN}System is ready for testing!${NC}"
echo ""
