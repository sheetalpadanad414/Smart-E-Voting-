const axios = require('axios');
const readline = require('readline');

const API_URL = 'http://localhost:5000/api/auth';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bold}${colors.blue}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

// Test Registration Flow
async function testRegistration() {
  log.header('TEST 1: User Registration Flow');
  
  const testUser = {
    name: 'Test Voter',
    email: `voter_${Date.now()}@example.com`,
    password: 'TestPassword123!@#',
    phone: '9876543210',
    role: 'voter'
  };

  try {
    log.info(`Registering user: ${testUser.email}`);
    const response = await axios.post(`${API_URL}/register`, testUser);
    
    log.success('Registration request successful');
    log.info(`User ID: ${response.data.userId}`);
    log.info(`Email: ${response.data.email}`);
    log.info(`Role: ${response.data.role}`);
    
    return {
      email: testUser.email,
      userId: response.data.userId,
      otp: null
    };
  } catch (error) {
    log.error('Registration failed');
    if (error.response?.data?.error) {
      log.error(error.response.data.error);
    } else {
      log.error(error.message);
    }
    return null;
  }
}

// Test Registration with Officer Role
async function testRegistrationOfficer() {
  log.header('TEST 2: Election Officer Registration (with role-specific fields)');
  
  const testOfficer = {
    name: 'Test Election Officer',
    email: `officer_${Date.now()}@example.com`,
    password: 'TestPassword123!@#',
    phone: '9876543210',
    role: 'election_officer',
    department: 'Elections Department',
    designation: 'Senior Officer',
    assignment_area: 'District A'
  };

  try {
    log.info(`Registering officer: ${testOfficer.email}`);
    const response = await axios.post(`${API_URL}/register`, testOfficer);
    
    log.success('Officer registration request successful');
    log.info(`User ID: ${response.data.userId}`);
    log.info(`Role: ${response.data.role}`);
    
    return {
      email: testOfficer.email,
      userId: response.data.userId
    };
  } catch (error) {
    log.error('Officer registration failed');
    if (error.response?.data?.error) {
      log.error(error.response.data.error);
    } else {
      log.error(error.message);
    }
    return null;
  }
}

// Test OTP Verification for Registration
async function testVerifyRegistrationOTP(email) {
  log.header('TEST 3: Verify Registration OTP');
  
  log.warn(`Check backend console for OTP sent to ${email}`);
  log.info('Backend will log OTP on POST /auth/register');
  
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`\nEnter the 6-digit OTP: `, async (otp) => {
      try {
        log.info(`Verifying OTP: ${otp}`);
        const response = await axios.post(`${API_URL}/verify-otp`, {
          email: email,
          otp: otp.trim()
        });
        
        log.success('OTP verified successfully');
        log.info(`Token: ${response.data.token.substring(0, 20)}...`);
        log.info(`User: ${response.data.user.name} (${response.data.user.role})`);
        
        resolve({
          token: response.data.token,
          user: response.data.user
        });
      } catch (error) {
        log.error('OTP verification failed');
        if (error.response?.data?.error) {
          log.error(error.response.data.error);
        } else {
          log.error(error.message);
        }
        resolve(null);
      } finally {
        rl.close();
      }
    });
  });
}

// Test Login Flow
async function testLogin(email, password) {
  log.header('TEST 4: User Login (with OTP requirement)');
  
  try {
    log.info(`Logging in with email: ${email}`);
    const response = await axios.post(`${API_URL}/login`, {
      email: email,
      password: password
    });
    
    log.success('Login request successful');
    log.info('OTP sent to email');
    log.info(`Message: ${response.data.message}`);
    
    return email;
  } catch (error) {
    log.error('Login failed');
    if (error.response?.data?.error) {
      log.error(error.response.data.error);
    } else {
      log.error(error.message);
    }
    return null;
  }
}

// Test OTP Verification for Login
async function testVerifyLoginOTP(email) {
  log.header('TEST 5: Verify Login OTP');
  
  log.warn(`Check backend console for OTP sent to ${email}`);
  
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question(`\nEnter the 6-digit OTP: `, async (otp) => {
      try {
        log.info(`Verifying login OTP: ${otp}`);
        const response = await axios.post(`${API_URL}/verify-otp`, {
          email: email,
          otp: otp.trim()
        });
        
        log.success('Login OTP verified successfully');
        log.info(`Token: ${response.data.token.substring(0, 20)}...`);
        log.info(`User: ${response.data.user.name} (${response.data.user.role})`);
        
        resolve({
          token: response.data.token,
          user: response.data.user
        });
      } catch (error) {
        log.error('Login OTP verification failed');
        if (error.response?.data?.error) {
          log.error(error.response.data.error);
        } else {
          log.error(error.message);
        }
        resolve(null);
      } finally {
        rl.close();
      }
    });
  });
}

// Test Resend OTP
async function testResendOTP(email) {
  log.header('TEST 6: Resend OTP');
  
  try {
    log.info(`Requesting OTP resend for: ${email}`);
    const response = await axios.post(`${API_URL}/resend-otp`, {
      email: email
    });
    
    log.success('OTP resent successfully');
    log.info(response.data.message);
    return true;
  } catch (error) {
    log.error('Resend OTP failed');
    if (error.response?.data?.error) {
      log.error(error.response.data.error);
    } else {
      log.error(error.message);
    }
    return false;
  }
}

// Main test runner
async function runAuthFlowTests() {
  console.clear();
  log.header('SMART E-VOTING SYSTEM - Authentication Flow Tests');
  
  log.info('Testing complete registration and login flow with OTP verification');
  log.info('Make sure the backend server is running on http://localhost:5000');
  
  // Test 1: Check server health
  try {
    const health = await axios.get('http://localhost:5000/health');
    log.success(`Server is running: ${health.data.status}`);
  } catch (error) {
    log.error('Cannot connect to server. Make sure backend is running!');
    log.warn('Run: npm start in the backend directory');
    process.exit(1);
  }

  // Test 2: Registration
  const voter = await testRegistration();
  if (!voter) {
    log.error('Stopping tests due to registration failure');
    return;
  }

  // Test 3: Verify Registration OTP
  let registrationResult = await testVerifyRegistrationOTP(voter.email);
  if (!registrationResult) {
    log.warn('Skipping login test due to OTP verification failure');
    return;
  }

  // Test 4: Officer Registration
  const officer = await testRegistrationOfficer();
  if (officer) {
    let officerResult = await testVerifyRegistrationOTP(officer.email);
    if (!officerResult) {
      log.warn('Officer OTP verification failed');
    }
  }

  // Test 5: Login Flow
  const loginEmail = await testLogin(voter.email, 'TestPassword123!@#');
  if (!loginEmail) {
    log.error('Stopping tests due to login failure');
    return;
  }

  // Test 6: Verify Login OTP
  let loginResult = await testVerifyLoginOTP(loginEmail);
  if (!loginResult) {
    log.warn('Login OTP verification failed');
    return;
  }

  // Test 7: Test Get Profile
  log.header('TEST 7: Get User Profile (with token)');
  try {
    log.info('Fetching user profile with token');
    const response = await axios.get('http://localhost:5000/api/auth/profile', {
      headers: {
        Authorization: `Bearer ${loginResult.token}`
      }
    });
    
    log.success('Profile retrieved successfully');
    log.info(`Name: ${response.data.user.name}`);
    log.info(`Email: ${response.data.user.email}`);
    log.info(`Role: ${response.data.user.role}`);
  } catch (error) {
    log.error('Failed to get profile');
    if (error.response?.data?.error) {
      log.error(error.response.data.error);
    }
  }

  log.header('All Tests Completed');
  log.success('Authentication flow tests finished successfully');
}

// Run the tests
runAuthFlowTests().catch(error => {
  log.error('Test suite error: ' + error.message);
  process.exit(1);
});
