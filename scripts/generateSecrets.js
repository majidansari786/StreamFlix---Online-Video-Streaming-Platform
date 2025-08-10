#!/usr/bin/env node

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating Secure API Keys and Secrets...\n');

// Generate secure keys and secrets
const secrets = {
  // API Security
  API_KEY: crypto.randomBytes(32).toString('hex'),
  API_SECRET: crypto.randomBytes(64).toString('hex'),
  FRONTEND_SECRET: crypto.randomBytes(64).toString('hex'),
  
  // JWT Secrets
  ACCESS_TOKEN_SECRET: crypto.randomBytes(64).toString('hex'),
  REFRESH_TOKEN_SECRET: crypto.randomBytes(64).toString('hex'),
  
  // Session Secret
  SESSION_SECRET: crypto.randomBytes(64).toString('hex'),
  
  // Database
  DB_SECRET: crypto.randomBytes(32).toString('hex'),
  
  // General App Secret
  APP_SECRET: crypto.randomBytes(64).toString('hex')
};

// Display generated secrets
console.log('Generated Secrets:');
console.log('==================');
Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}: ${value}`);
});

// Create .env file content
const envContent = `# API Security
API_KEY=${secrets.API_KEY}
API_SECRET=${secrets.API_SECRET}
FRONTEND_SECRET=${secrets.FRONTEND_SECRET}

# JWT Secrets
ACCESS_TOKEN_SECRET=${secrets.ACCESS_TOKEN_SECRET}
REFRESH_TOKEN_SECRET=${secrets.REFRESH_TOKEN_SECRET}

# Session Security
SESSION_SECRET=${secrets.SESSION_SECRET}

# Database Security
DB_SECRET=${secrets.DB_SECRET}

# App Security
APP_SECRET=${secrets.APP_SECRET}

# Security Features
ENABLE_SIGNATURE_VALIDATION=true
NODE_ENV=development

# CORS Origins (Update these with your actual domains)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Additional Security
ENABLE_HTTPS_REDIRECT=false
ENABLE_HSTS=true
ENABLE_CSP=true
`;

// Write to .env file
const envPath = path.join(__dirname, '..', '.env');
fs.writeFileSync(envPath, envContent);

console.log('\n✅ Secrets generated and saved to .env file');
console.log('⚠️  IMPORTANT: Keep these secrets secure and never commit them to version control!');
console.log('📁 .env file created at:', envPath);

// Create .env.example file
const envExampleContent = `# API Security
API_KEY=your_32_character_hex_api_key_here
API_SECRET=your_64_character_hex_api_secret_here
FRONTEND_SECRET=your_64_character_hex_frontend_secret_here

# JWT Secrets
ACCESS_TOKEN_SECRET=your_64_character_hex_access_token_secret_here
REFRESH_TOKEN_SECRET=your_64_character_hex_refresh_token_secret_here

# Session Security
SESSION_SECRET=your_64_character_hex_session_secret_here

# Database Security
DB_SECRET=your_32_character_hex_db_secret_here

# App Security
APP_SECRET=your_64_character_hex_app_secret_here

# Security Features
ENABLE_SIGNATURE_VALIDATION=true
NODE_ENV=development

# CORS Origins (Update these with your actual domains)
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Additional Security
ENABLE_HTTPS_REDIRECT=false
ENABLE_HSTS=true
ENABLE_CSP=true
`;

const envExamplePath = path.join(__dirname, '..', '.env.example');
fs.writeFileSync(envExamplePath, envExampleContent);

console.log('📋 .env.example file created for reference');

// Create security documentation
const securityDoc = `# API Security Configuration

## Overview
This application implements multiple layers of security to ensure only authorized frontend applications can access the APIs.

## Security Layers

### 1. API Key Authentication
- **Header**: \`X-API-Key\`
- **Format**: 32-character hexadecimal string
- **Purpose**: Primary authentication mechanism

### 2. Client Secret Validation
- **Header**: \`X-Client-Secret\`
- **Format**: 64-character hexadecimal string
- **Purpose**: Ensures request comes from authorized frontend

### 3. Request Timestamp Validation
- **Header**: \`X-Timestamp\`
- **Format**: Unix timestamp in milliseconds
- **Purpose**: Prevents replay attacks (5-minute window)

### 4. Request Signature (Optional)
- **Header**: \`X-Signature\`
- **Format**: HMAC-SHA256 hash
- **Purpose**: Additional request integrity verification

### 5. Origin Verification
- **CORS**: Strict origin whitelist
- **Headers**: Origin and Referer validation
- **Purpose**: Ensures requests come from allowed domains

### 6. Rate Limiting
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Purpose**: Prevents abuse and DDoS attacks

## Frontend Integration

### Required Headers
\`\`\`javascript
const headers = {
  'X-API-Key': 'your_api_key_here',
  'X-Client-Secret': 'your_client_secret_here',
  'X-Timestamp': Date.now().toString(),
  'Content-Type': 'application/json'
};

// Optional: Add signature for enhanced security
if (enableSignature) {
  const signature = generateSignature(method, path, timestamp, apiSecret);
  headers['X-Signature'] = signature;
}
\`\`\`

### Example Request
\`\`\`javascript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(data)
});
\`\`\`

## Environment Variables

### Required
- \`API_KEY\`: Your 32-character API key
- \`FRONTEND_SECRET\`: Your 64-character frontend secret
- \`API_SECRET\`: Your 64-character API secret (for signatures)

### Optional
- \`ENABLE_SIGNATURE_VALIDATION\`: Enable/disable signature validation
- \`NODE_ENV\`: Environment (development/production)

## Security Best Practices

1. **Never expose secrets in client-side code**
2. **Use HTTPS in production**
3. **Rotate API keys regularly**
4. **Monitor API usage and logs**
5. **Implement proper error handling**
6. **Use environment-specific configurations**

## Troubleshooting

### Common Errors
- **401 Unauthorized**: Missing or invalid API key
- **403 Forbidden**: Invalid client secret or origin
- **429 Too Many Requests**: Rate limit exceeded
- **400 Bad Request**: Invalid timestamp or signature

### Debug Mode
Set \`NODE_ENV=development\` to see detailed error messages.
`;

const securityDocPath = path.join(__dirname, '..', 'SECURITY.md');
fs.writeFileSync(securityDocPath, securityDoc);

console.log('📚 Security documentation created: SECURITY.md');
console.log('\n🎉 Setup complete! Your APIs are now secured.');
console.log('\nNext steps:');
console.log('1. Update your frontend to include the required headers');
console.log('2. Test the security with a simple API call');
console.log('3. Review SECURITY.md for implementation details');
console.log('4. Update .env with your actual domain names');
