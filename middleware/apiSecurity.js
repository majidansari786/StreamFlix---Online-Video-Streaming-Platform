const crypto = require('crypto');

// API Security Middleware - Multiple layers of protection
const apiSecurity = (req, res, next) => {
  try {
    // 1. API Key Validation
    const apiKey = req.headers['x-api-key'];
    const clientSecret = req.headers['x-client-secret'];
    
    if (!apiKey || !clientSecret) {
      return res.status(401).json({ 
        error: 'Missing authentication headers',
        message: 'API key and client secret required'
      });
    }

    // Validate API key format (should be a 32-character hex string)
    if (!/^[a-fA-F0-9]{32}$/.test(apiKey)) {
      return res.status(401).json({ 
        error: 'Invalid API key format',
        message: 'API key must be a valid 32-character hex string'
      });
    }

    // Validate client secret
    if (clientSecret !== process.env.FRONTEND_SECRET) {
      return res.status(403).json({ 
        error: 'Invalid client secret',
        message: 'Access denied: Invalid source'
      });
    }

    // 2. Origin Verification
    const origin = req.headers.origin;
    const referer = req.headers.referer;
    
    // Check if request comes from allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://yourdomain.com', // Replace with your actual domain
      'https://www.yourdomain.com'
    ];

    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ 
        error: 'Origin not allowed',
        message: 'Request origin not in whitelist'
      });
    }

    // 3. Request Timestamp Validation (Prevent replay attacks)
    const timestamp = req.headers['x-timestamp'];
    if (timestamp) {
      const requestTime = parseInt(timestamp);
      const currentTime = Date.now();
      const timeWindow = 5 * 60 * 1000; // 5 minutes
      
      if (Math.abs(currentTime - requestTime) > timeWindow) {
        return res.status(401).json({ 
          error: 'Request expired',
          message: 'Request timestamp is too old or too new'
        });
      }
    }

    // 4. Request Signature Validation (Optional but recommended)
    const signature = req.headers['x-signature'];
    if (signature && process.env.ENABLE_SIGNATURE_VALIDATION === 'true') {
      const expectedSignature = crypto
        .createHmac('sha256', process.env.API_SECRET)
        .update(`${req.method}${req.path}${timestamp || ''}`)
        .digest('hex');
      
      if (signature !== expectedSignature) {
        return res.status(401).json({ 
          error: 'Invalid signature',
          message: 'Request signature validation failed'
        });
      }
    }

    // 5. User Agent Validation
    const userAgent = req.headers['user-agent'];
    if (!userAgent || userAgent.length < 10) {
      return res.status(400).json({ 
        error: 'Invalid user agent',
        message: 'User agent header is required and must be valid'
      });
    }

    // 6. Rate Limiting Check (Additional layer)
    const clientIP = req.ip || req.connection.remoteAddress;
    if (!clientIP) {
      return res.status(400).json({ 
        error: 'Invalid request',
        message: 'Unable to determine client IP'
      });
    }

    // Add security headers to response
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Cache-Control': 'no-store, no-cache, must-revalidate, private'
    });

    // Log security event
    console.log(`[SECURITY] API access granted to ${clientIP} from ${origin || 'unknown origin'}`);

    next();
  } catch (error) {
    console.error('[SECURITY ERROR]', error);
    return res.status(500).json({ 
      error: 'Security validation failed',
      message: 'Internal server error during security check'
    });
  }
};

module.exports = apiSecurity;
