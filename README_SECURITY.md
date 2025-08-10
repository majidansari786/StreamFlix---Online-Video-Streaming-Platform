# 🔐 API Security Implementation Guide

## Overview
This guide explains how to implement comprehensive API security for your Node.js application, ensuring that only authorized frontend applications can access your APIs.

## 🚀 Quick Start

### 1. Generate Security Keys
Run the security generation script to create all necessary keys and secrets:

```bash
node scripts/generateSecrets.js
```

This will create:
- `.env` file with all security keys
- `.env.example` file for reference
- `SECURITY.md` with detailed security documentation

### 2. Update Your Domain Configuration
Edit the `.env` file and update the allowed origins with your actual domain names:

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 3. Restart Your Application
The security middleware is now active and protecting all your API routes.

## 🛡️ Security Features Implemented

### 1. **API Key Authentication**
- **Header**: `X-API-Key`
- **Format**: 32-character hexadecimal string
- **Purpose**: Primary authentication mechanism

### 2. **Client Secret Validation**
- **Header**: `X-Client-Secret`
- **Format**: 64-character hexadecimal string
- **Purpose**: Ensures request comes from authorized frontend

### 3. **Request Timestamp Validation**
- **Header**: `X-Timestamp`
- **Format**: Unix timestamp in milliseconds
- **Purpose**: Prevents replay attacks (5-minute window)

### 4. **Request Signature (Optional)**
- **Header**: `X-Signature`
- **Format**: HMAC-SHA256 hash
- **Purpose**: Additional request integrity verification

### 5. **Origin Verification**
- **CORS**: Strict origin whitelist
- **Headers**: Origin and Referer validation
- **Purpose**: Ensures requests come from allowed domains

### 6. **Rate Limiting**
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Purpose**: Prevents abuse and DDoS attacks

### 7. **Security Headers**
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-Frame-Options**: Prevents clickjacking
- **X-XSS-Protection**: XSS protection
- **Strict-Transport-Security**: HTTPS enforcement
- **Content Security Policy**: XSS and injection protection

## 🔧 Frontend Integration

### Using the Secure API Client

The `Frontend/js/apiClient.js` file provides a secure way to make API calls:

```javascript
import apiClient from './js/apiClient.js';

// Make secure API calls
try {
  // GET request
  const movies = await apiClient.get('/api/movies');
  
  // POST request
  const newMovie = await apiClient.post('/api/addmovie', {
    title: 'New Movie',
    description: 'Movie description'
  });
  
  // PUT request
  const updatedMovie = await apiClient.put('/api/update/movie/123', {
    title: 'Updated Movie'
  });
  
  // DELETE request
  await apiClient.delete('/api/movie/123');
  
} catch (error) {
  console.error('API Error:', error.message);
}
```

### Manual Implementation

If you prefer to implement security headers manually:

```javascript
const makeSecureRequest = async (url, options = {}) => {
  const timestamp = Date.now().toString();
  
  const headers = {
    'X-API-Key': 'your_api_key_here',
    'X-Client-Secret': 'your_client_secret_here',
    'X-Timestamp': timestamp,
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Optional: Add signature for enhanced security
  if (enableSignature) {
    const signature = generateSignature(options.method || 'GET', url, timestamp);
    headers['X-Signature'] = signature;
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Usage
const data = await makeSecureRequest('/api/movies', {
  method: 'POST',
  body: JSON.stringify({ title: 'New Movie' })
});
```

## 📋 Environment Variables

### Required Variables
```env
# API Security
API_KEY=your_32_character_hex_api_key_here
API_SECRET=your_64_character_hex_api_secret_here
FRONTEND_SECRET=your_64_character_hex_frontend_secret_here

# JWT Secrets
ACCESS_TOKEN_SECRET=your_64_character_hex_access_token_secret_here
REFRESH_TOKEN_SECRET=your_64_character_hex_refresh_token_secret_here

# Session Security
SESSION_SECRET=your_64_character_hex_session_secret_here
```

### Optional Variables
```env
# Security Features
ENABLE_SIGNATURE_VALIDATION=true
NODE_ENV=development

# CORS Origins
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing Security

### 1. Test the Security Endpoint
```bash
# This should fail without proper headers
curl http://localhost:3000/api/test

# This should work with proper headers
curl -H "X-API-Key: your_api_key" \
     -H "X-Client-Secret: your_client_secret" \
     -H "X-Timestamp: $(date +%s)000" \
     http://localhost:3000/api/test
```

### 2. Test CORS Protection
```bash
# This should be blocked
curl -H "Origin: https://malicious-site.com" \
     -H "X-API-Key: your_api_key" \
     -H "X-Client-Secret: your_client_secret" \
     http://localhost:3000/api/test
```

### 3. Test Rate Limiting
```bash
# Make multiple requests quickly to test rate limiting
for i in {1..110}; do
  curl -H "X-API-Key: your_api_key" \
       -H "X-Client-Secret: your_client_secret" \
       -H "X-Timestamp: $(date +%s)000" \
       http://localhost:3000/api/test
  echo "Request $i"
done
```

## 🔍 Monitoring and Logging

### Security Logs
The security middleware logs all security events:

```javascript
// Check your console for security logs
[SECURITY] API access granted to 192.168.1.100 from http://localhost:3000
[CORS] Blocked request from unauthorized origin: https://malicious-site.com
```

### Error Responses
Common security error responses:

```json
// 401 Unauthorized - Missing or invalid API key
{
  "error": "Missing authentication headers",
  "message": "API key and client secret required"
}

// 403 Forbidden - Invalid client secret or origin
{
  "error": "Origin not allowed",
  "message": "Request origin not in whitelist"
}

// 429 Too Many Requests - Rate limit exceeded
{
  "error": "Too many requests",
  "message": "Too many requests from this IP, please try again later."
}
```

## 🚨 Security Best Practices

### 1. **Never Expose Secrets in Client-Side Code**
- Use environment variables
- Store secrets securely
- Rotate keys regularly

### 2. **Use HTTPS in Production**
- Enable HTTPS redirect
- Use secure cookies
- Implement HSTS

### 3. **Monitor and Log**
- Log all security events
- Monitor API usage patterns
- Set up alerts for suspicious activity

### 4. **Regular Maintenance**
- Rotate API keys monthly
- Update allowed origins
- Review security logs
- Test security measures

### 5. **Error Handling**
- Don't expose sensitive information in errors
- Use generic error messages in production
- Log detailed errors for debugging

## 🔧 Troubleshooting

### Common Issues

#### 1. **CORS Errors**
```bash
# Check your allowed origins in .env
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

#### 2. **Authentication Errors**
```bash
# Verify your API keys are correct
# Check that headers are being sent properly
# Ensure timestamp is within 5-minute window
```

#### 3. **Rate Limiting Issues**
```bash
# Adjust rate limit settings in config/security.js
# Check if multiple clients are using the same IP
```

#### 4. **Signature Validation Failures**
```bash
# Verify API_SECRET is set correctly
# Check timestamp format (milliseconds)
# Ensure method and path are correct
```

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages:

```env
NODE_ENV=development
```

## 📚 Additional Resources

- `SECURITY.md` - Detailed security documentation
- `config/security.js` - Security configuration
- `middleware/apiSecurity.js` - Security middleware
- `Frontend/js/apiClient.js` - Frontend security client

## 🆘 Support

If you encounter issues:

1. Check the security logs in your console
2. Verify all environment variables are set
3. Test with the provided test endpoint
4. Review the error response details
5. Check CORS and origin settings

## 🔄 Updates and Maintenance

### Regular Security Updates
- Monitor security advisories
- Update dependencies regularly
- Review and update security policies
- Test security measures periodically

### Key Rotation
- Rotate API keys monthly
- Update client secrets quarterly
- Monitor for suspicious activity
- Keep security documentation updated

---

**Remember**: Security is an ongoing process. Regularly review and update your security measures to stay protected against new threats.
