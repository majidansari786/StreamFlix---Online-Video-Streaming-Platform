#!/usr/bin/env node

const crypto = require('crypto');

// Load environment variables
require('dotenv').config();

console.log('🧪 Testing API Security Implementation...\n');

// Test configuration
const config = {
  baseUrl: 'http://localhost:3000',
  apiKey: process.env.API_KEY,
  clientSecret: process.env.FRONTEND_SECRET,
  apiSecret: process.env.API_SECRET
};

// Test cases
const testCases = [
  {
    name: 'Test 1: Missing API Key',
    headers: {
      'X-Client-Secret': config.clientSecret,
      'X-Timestamp': Date.now().toString()
    },
    expectedStatus: 401
  },
  {
    name: 'Test 2: Missing Client Secret',
    headers: {
      'X-API-Key': config.apiKey,
      'X-Timestamp': Date.now().toString()
    },
    expectedStatus: 401
  },
  {
    name: 'Test 3: Invalid API Key Format',
    headers: {
      'X-API-Key': 'invalid-key',
      'X-Client-Secret': config.clientSecret,
      'X-Timestamp': Date.now().toString()
    },
    expectedStatus: 401
  },
  {
    name: 'Test 4: Valid Request (Should Pass)',
    headers: {
      'X-API-Key': config.apiKey,
      'X-Client-Secret': config.clientSecret,
      'X-Timestamp': Date.now().toString()
    },
    expectedStatus: 200
  },
  {
    name: 'Test 5: Expired Timestamp',
    headers: {
      'X-API-Key': config.apiKey,
      'X-Client-Secret': config.clientSecret,
      'X-Timestamp': (Date.now() - 10 * 60 * 1000).toString() // 10 minutes ago
    },
    expectedStatus: 401
  },
  {
    name: 'Test 6: Future Timestamp',
    headers: {
      'X-API-Key': config.apiKey,
      'X-Client-Secret': config.clientSecret,
      'X-Timestamp': (Date.now() + 10 * 60 * 1000).toString() // 10 minutes in future
    },
    expectedStatus: 401
  }
];

// Generate signature for enhanced security test
function generateSignature(method, path, timestamp, secret) {
  const data = `${method}${path}${timestamp || ''}`;
  return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

// Test with signature
const timestamp = Date.now().toString();
const signature = generateSignature('GET', '/api/test', timestamp, config.apiSecret);

testCases.push({
  name: 'Test 7: Request with Signature (Enhanced Security)',
  headers: {
    'X-API-Key': config.apiKey,
    'X-Client-Secret': config.clientSecret,
    'X-Timestamp': timestamp,
    'X-Signature': signature
  },
  expectedStatus: 200
});

// Function to make HTTP request
async function makeRequest(testCase) {
  const { name, headers, expectedStatus } = testCase;
  
  try {
    const response = await fetch(`${config.baseUrl}/api/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    });

    const status = response.status;
    const success = status === expectedStatus;
    
    console.log(`${success ? '✅' : '❌'} ${name}`);
    console.log(`   Status: ${status} (Expected: ${expectedStatus})`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
      } catch (e) {
        console.log(`   Response: ${await response.text()}`);
      }
    } else {
      try {
        const error = await response.json();
        console.log(`   Error: ${error.message || error.error}`);
      } catch (e) {
        console.log(`   Error: ${response.statusText}`);
      }
    }
    
    console.log('');
    return success;
    
  } catch (error) {
    console.log(`❌ ${name}`);
    console.log(`   Error: ${error.message}`);
    console.log('');
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('Configuration:');
  console.log(`   Base URL: ${config.baseUrl}`);
  console.log(`   API Key: ${config.apiKey ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Client Secret: ${config.clientSecret ? '✅ Set' : '❌ Missing'}`);
  console.log(`   API Secret: ${config.apiSecret ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  if (!config.apiKey || !config.clientSecret || !config.apiSecret) {
    console.log('❌ Missing required environment variables. Please run the generateSecrets.js script first.');
    return;
  }

  console.log('Running security tests...\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;

  for (const testCase of testCases) {
    const passed = await makeRequest(testCase);
    if (passed) passedTests++;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('📊 Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All security tests passed! Your API is properly secured.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check your security configuration.');
  }
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
  console.log('❌ Fetch API not available. Please use Node.js 18+ or install node-fetch.');
  console.log('   npm install node-fetch');
} else {
  runTests().catch(console.error);
}
