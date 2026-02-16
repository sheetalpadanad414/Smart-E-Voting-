#!/usr/bin/env node
/**
 * Integration Test for Register and Login Functionality
 * Tests the fixed authentication flow with OTP verification
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  bold: '\x1b[1m'
};

class AuthFlowTester {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.testUser = {
      email: `testuser_${Date.now()}@example.com`,
      password: 'TestPassword123!@#',
      name: 'Test User',
      phone: '9876543210'
    };
    this.testOfficer = {
      email: `officer_${Date.now()}@example.com`,
      password: 'OfficerPassword123!@#',
      name: 'Test Officer',
      phone: '9876543211',
      department: 'Elections Department',
      designation: 'Senior Officer',
      assignment_area: 'District A'
    };
    this.capturedOTP = null;
  }

  log(type, message) {
    const timestamp = new Date().toLocaleTimeString();
    switch (type) {
      case 'success':
        console.log(`${colors.green}✓ [${timestamp}] ${message}${colors.reset}`);
        this.passed++;
        break;
      case 'fail':
        console.log(`${colors.red}✗ [${timestamp}] ${message}${colors.reset}`);
        this.failed++;
        break;
      case 'info':
        console.log(`${colors.blue}ℹ [${timestamp}] ${message}${colors.reset}`);
        break;
      case 'warn':
        console.log(`${colors.yellow}⚠ [${timestamp}] ${message}${colors.reset}`);
        break;
      case 'header':
        console.log(`${colors.bold}${colors.blue}\n${'='.repeat(70)}\n${message}\n${'='.repeat(70)}${colors.reset}\n`);
        break;
    }
  }

  async test(name, fn) {
    try {
      console.log(`  Testing: ${name}...`);
      await fn();
      return true;
    } catch (error) {
      this.log('fail', `${name}: ${error.message}`);
      return false;
    }
  }

  async checkServer() {
    this.log('header', 'Checking Server Connection');
    try {
      const response = await axios.get('http://localhost:5000/health', { timeout: 5000 });
      this.log('success', `Server is running: ${response.data.status}`);
      return true;
    } catch (error) {
      this.log('fail', 'Cannot connect to server on http://localhost:5000');
      this.log('warn', 'Make sure to start the backend server with: npm start');
      return false;
    }
  }

  async testVoterRegistration() {
    this.log('header', 'Test 1: Voter Registration');

    return this.test('Register voter with complete profile', async () => {
      const response = await axios.post(`${API_URL}/auth/register`, {
        ...this.testUser,
        role: 'voter'
      });

      if (!response.data.userId) throw new Error('No userId in response');
      if (!response.data.email) throw new Error('No email in response');
      if (response.data.role !== 'voter') throw new Error('Role mismatch');

      this.log('success', `Voter registered: ${response.data.email}`);
      this.log('info', `User ID: ${response.data.userId}`);
    });
  }

  async testOfficerRegistration() {
    this.log('header', 'Test 2: Election Officer Registration (with role-specific fields)');

    return this.test('Register officer with department and designation', async () => {
      const response = await axios.post(`${API_URL}/auth/register`, {
        ...this.testOfficer,
        role: 'election_officer'
      });

      if (!response.data.userId) throw new Error('No userId in response');
      if (response.data.role !== 'election_officer') throw new Error('Role mismatch');

      this.log('success', `Officer registered: ${response.data.email}`);
      this.log('info', `Department: Election Officer, Designation: Senior Officer`);
    });
  }

  async testInvalidRegistration() {
    this.log('header', 'Test 3: Invalid Registration Tests');

    await this.test('Reject weak password', async () => {
      try {
        await axios.post(`${API_URL}/auth/register`, {
          name: 'Weak Password User',
          email: `weak_${Date.now()}@example.com`,
          password: 'weak',
          phone: '9876543210',
          role: 'voter'
        });
        throw new Error('Should have rejected weak password');
      } catch (error) {
        if (error.response?.status === 400) {
          this.log('success', 'Weak password correctly rejected');
        } else {
          throw error;
        }
      }
    });

    await this.test('Reject officer registration without department', async () => {
      try {
        await axios.post(`${API_URL}/auth/register`, {
          name: 'Officer Without Dept',
          email: `officerinvalid_${Date.now()}@example.com`,
          password: 'ValidPassword123!@#',
          phone: '9876543210',
          role: 'election_officer'
          // Missing department and designation
        });
        throw new Error('Should have rejected officer without department');
      } catch (error) {
        if (error.response?.status === 400) {
          this.log('success', 'Officer without required fields correctly rejected');
        } else {
          throw error;
        }
      }
    });

    await this.test('Reject duplicate email', async () => {
      try {
        // Register first user
        await axios.post(`${API_URL}/auth/register`, {
          ...this.testUser,
          role: 'voter'
        });

        // Try to register with same email
        await axios.post(`${API_URL}/auth/register`, {
          name: 'Duplicate User',
          email: this.testUser.email,
          password: 'DifferentPassword123!@#',
          phone: '9876543212',
          role: 'voter'
        });
        throw new Error('Should have rejected duplicate email');
      } catch (error) {
        if (error.response?.status === 409) {
          this.log('success', 'Duplicate email correctly rejected');
        } else {
          throw error;
        }
      }
    });
  }

  async testLoginFlow() {
    this.log('header', 'Test 4: Login Flow (OTP-based)');

    return this.test('Login sends OTP and requires verification', async () => {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: this.testUser.email,
        password: this.testUser.password
      });

      if (!response.data.message) throw new Error('No message in login response');
      if (!response.data.message.includes('OTP')) throw new Error('Login response should mention OTP');

      // Important: Backend should log OTP to console
      this.log('success', 'Login sent OTP request');
      this.log('warn', 'Check backend console for OTP sent to: ' + this.testUser.email);
      this.log('info', `Response: ${response.data.message}`);
    });
  }

  async testInvalidLogin() {
    this.log('header', 'Test 5: Invalid Login Tests');

    await this.test('Reject invalid email', async () => {
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: 'nonexistent@example.com',
          password: this.testUser.password
        });
        throw new Error('Should have rejected invalid email');
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('success', 'Invalid email correctly rejected');
        } else {
          throw error;
        }
      }
    });

    await this.test('Reject invalid password', async () => {
      try {
        await axios.post(`${API_URL}/auth/login`, {
          email: this.testUser.email,
          password: 'WrongPassword123!@#'
        });
        throw new Error('Should have rejected invalid password');
      } catch (error) {
        if (error.response?.status === 401) {
          this.log('success', 'Invalid password correctly rejected');
        } else {
          throw error;
        }
      }
    });
  }

  async testOTPValidation() {
    this.log('header', 'Test 6: OTP Validation');

    return this.test('Invalid OTP rejected', async () => {
      try {
        await axios.post(`${API_URL}/auth/verify-otp`, {
          email: this.testUser.email,
          otp: '000000' // Invalid OTP
        });
        throw new Error('Should have rejected invalid OTP');
      } catch (error) {
        if (error.response?.status === 400) {
          this.log('success', 'Invalid OTP correctly rejected');
        } else {
          throw error;
        }
      }
    });
  }

  async printSummary() {
    console.log('\n' + '='.repeat(70));
    console.log(`${colors.bold}Test Summary${colors.reset}`);
    console.log('='.repeat(70));
    console.log(`${colors.green}✓ Passed: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${this.failed}${colors.reset}`);
    console.log('='.repeat(70) + '\n');

    if (this.failed === 0) {
      this.log('success', 'All tests passed!');
      return 0;
    } else {
      this.log('fail', `${this.failed} test(s) failed`);
      return 1;
    }
  }

  async runAll() {
    console.clear();
    this.log('header', 'Smart E-Voting Authentication Flow Integration Tests');

    // Check server first
    if (!(await this.checkServer())) {
      return 1;
    }

    // Run all tests
    await this.testVoterRegistration();
    await this.testOfficerRegistration();
    await this.testInvalidRegistration();
    await this.testLoginFlow();
    await this.testInvalidLogin();
    await this.testOTPValidation();

    // Print summary
    return await this.printSummary();
  }
}

// Run tests
async function main() {
  const tester = new AuthFlowTester();
  const exitCode = await tester.runAll();
  process.exit(exitCode);
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
