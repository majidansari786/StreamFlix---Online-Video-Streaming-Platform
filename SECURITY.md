# API Security Configuration

## Overview
This application implements multiple layers of security to ensure only authorized frontend applications can access the APIs.

## Security Layers

### 1. API Key Authentication
- **Header**: `X-API-Key`
- **Format**: 32-character hexadecimal string
- **Purpose**: Primary authentication mechanism

### 2. Client Secret Validation
- **Header**: `X-Client-Secret`
- **Format**: 64-character hexadecimal string
- **Purpose**: Ensures request comes from authorized frontend

### 3. Request Timestamp Validation
- **Header**: `X-Timestamp`
- **Format**: Unix timestamp in milliseconds
- **Purpose**: Prevents replay attacks (5-minute window)

### 4. Request Signature (Optional)
- **Header**: `X-Signature`
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
```javascript
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
```

### Example Request
```javascript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: headers,
  body: JSON.stringify(data)
});
```

## Environment Variables

### Required
- `API_KEY`: Your 32-character API key
- `FRONTEND_SECRET`: Your 64-character frontend secret
- `API_SECRET`: Your 64-character API secret (for signatures)

### Optional
- `ENABLE_SIGNATURE_VALIDATION`: Enable/disable signature validation
- `NODE_ENV`: Environment (development/production)

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
Set `NODE_ENV=development` to see detailed error messages.
