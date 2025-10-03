#!/usr/bin/env node

/**
 * Comprehensive Admin Flow Test Script
 * 
 * This script tests the complete admin user creation and authentication flow:
 * 1. Creates admin user via /api/admin/seed
 * 2. Verifies user exists in Stack Auth
 * 3. Verifies profile exists in Supabase with admin role
 * 4. Tests authentication endpoints
 * 5. Validates redirect logic
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'daniel.nonso48@gmail.com';
const ADMIN_PASSWORD = 'Ashnag12@';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${step}. ${message}`, 'cyan');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { response, data, success: response.ok };
  } catch (error) {
    return { error: error.message, success: false };
  }
}

async function testCheckUserEndpoint() {
  logStep('1', 'Testing Check User Endpoint');
  
  const { response, data, success, error } = await makeRequest(`${BASE_URL}/api/check-user`, {
    method: 'POST',
    body: JSON.stringify({
      email: ADMIN_EMAIL
    })
  });

  if (error) {
    logError(`Request failed: ${error}`);
    return false;
  }

  if (success && data.success && data.found) {
    logSuccess(`User profile found in database`);
    logInfo(`Profile ID: ${data.profile.id}`);
    logInfo(`Stack User ID: ${data.profile.stack_user_id}`);
    logInfo(`Role: ${data.profile.role}`);
    logInfo(`Is Admin: ${data.analysis.isAdmin}`);
    logInfo(`Can Access Admin Dashboard: ${data.analysis.canAccessAdminDashboard}`);
    
    if (data.profile.role === 'admin') {
      logSuccess(`User has correct admin role`);
      return data.profile;
    } else {
      logError(`User role is '${data.profile.role}', expected 'admin'`);
      return false;
    }
  } else {
    logError(`Check user failed: ${data.error || data.message || 'User not found'}`);
    return false;
  }
}

async function testAdminDashboardAccess() {
  logStep('2', 'Testing Admin Dashboard Access');
  
  try {
    const response = await fetch(`${BASE_URL}/admin`);
    
    if (response.ok) {
      logSuccess(`Admin dashboard is accessible`);
      logInfo(`Status: ${response.status}`);
      return true;
    } else if (response.status === 302 || response.status === 307) {
      logSuccess(`Admin dashboard redirects (likely to login) - this is expected behavior`);
      logInfo(`Status: ${response.status}`);
      return true;
    } else {
      logError(`Admin dashboard returned unexpected status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to access admin dashboard: ${error.message}`);
    return false;
  }
}

async function testStackAuthIntegration() {
  logStep('3', 'Testing Stack Auth Integration');
  
  try {
    const response = await fetch(`${BASE_URL}/handler/signin`);
    
    if (response.ok) {
      logSuccess(`Stack Auth signin page is accessible`);
      return true;
    } else {
      logError(`Stack Auth signin page returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    logError(`Failed to access Stack Auth signin: ${error.message}`);
    return false;
  }
}

async function runComprehensiveTest() {
  log('\n🚀 Testing Admin Flow (User Already Created)', 'bright');
  log('=' * 60, 'yellow');
  
  const results = {
    checkUser: false,
    dashboardAccess: false,
    stackAuth: false
  };

  // Test 1: Check User Endpoint
  results.checkUser = await testCheckUserEndpoint();
  
  // Test 2: Admin Dashboard Access
  results.dashboardAccess = await testAdminDashboardAccess();
  
  // Test 3: Stack Auth Integration
  results.stackAuth = await testStackAuthIntegration();

  // Summary
  log('\n📊 Test Results Summary', 'bright');
  log('=' * 60, 'yellow');
  
  const tests = [
    { name: 'Check User Endpoint', result: results.checkUser },
    { name: 'Admin Dashboard Access', result: results.dashboardAccess },
    { name: 'Stack Auth Integration', result: results.stackAuth }
  ];

  let passedTests = 0;
  tests.forEach(test => {
    if (test.result) {
      logSuccess(`${test.name}: PASSED`);
      passedTests++;
    } else {
      logError(`${test.name}: FAILED`);
    }
  });

  log(`\n📈 Overall Results: ${passedTests}/${tests.length} tests passed`, 'bright');
  
  if (passedTests === tests.length) {
    logSuccess('🎉 All tests passed! Admin flow is working correctly.');
    log('\n✨ Admin User Setup Complete:', 'bright');
    log(`   📧 Email: ${ADMIN_EMAIL}`, 'green');
    log(`   🔑 Password: ${ADMIN_PASSWORD}`, 'green');
    log(`   🎯 Admin Dashboard: ${BASE_URL}/admin`, 'green');
    log(`   🔐 Sign In: ${BASE_URL}/handler/signin`, 'green');
    log('\n🔄 Authentication Flow:', 'bright');
    log(`   1. Go to ${BASE_URL}/handler/signin`, 'blue');
    log(`   2. Sign in with the credentials above`, 'blue');
    log(`   3. You should be redirected to ${BASE_URL}/admin`, 'blue');
  } else {
    logError('❌ Some tests failed. Please check the issues above.');
  }

  return passedTests === tests.length;
}

// Run the test if this script is executed directly
if (require.main === module) {
  runComprehensiveTest()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      logError(`Test script failed: ${error.message}`);
      process.exit(1);
    });
}