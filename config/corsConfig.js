const cors = require('cors');

// Enhanced CORS configuration with strict security
const corsConfig = {
  // Strict origin whitelist
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      return callback(null, true);
    }

    // Define allowed origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'https://yourdomain.com', // Replace with your actual domain
      'https://www.yourdomain.com',
      'https://stream-frontend-dun-two.vercel.app'
    ];

    // Check if origin is in whitelist
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`[CORS] Blocked request from unauthorized origin: ${origin}`);
      callback(new Error('Not allowed by CORS policy'));
    }
  },

  // Allowed methods
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],

  // Allowed headers
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-API-Key',
    'X-Client-Secret',
    'X-Timestamp',
    'X-Signature',
    'Accept',
    'Origin',
    'X-Requested-With'
  ],

  // Exposed headers
  exposedHeaders: [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection',
    'Strict-Transport-Security'
  ],

  // Credentials
  credentials: true,

  // Preflight continue
  preflightContinue: false,

  // Options success status
  optionsSuccessStatus: 204,

  // Max age for preflight requests
  maxAge: 86400, // 24 hours

  // Custom error handler
  onError: (err, req, res, next) => {
    console.error('[CORS ERROR]', err);
    res.status(403).json({
      error: 'CORS policy violation',
      message: 'Request blocked by CORS policy',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Forbidden'
    });
  }
};

// Create CORS middleware
const corsMiddleware = cors(corsConfig);

// Additional security headers middleware
const securityHeaders = (req, res, next) => {
  // Security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  });

  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');

  next();
};

module.exports = {
  corsMiddleware,
  securityHeaders,
  corsConfig
};
