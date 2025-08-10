const crypto = require('crypto');

// Security Configuration
const securityConfig = {
  // API Security
  api: {
    // API key length (32 characters = 128 bits)
    keyLength: 32,
    
    // Client secret length
    secretLength: 64,
    
    // Request timestamp window (5 minutes)
    timestampWindow: 5 * 60 * 1000,
    
    // Enable signature validation
    enableSignature: process.env.ENABLE_SIGNATURE_VALIDATION === 'true',
    
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false,
    }
  },

  // CORS Security
  cors: {
    allowedOrigins: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://yourdomain.com', // Replace with your actual domain
      'https://www.yourdomain.com'
    ],
    
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    
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
    ]
  },

  // JWT Security
  jwt: {
    accessTokenExpiry: '1h',
    refreshTokenExpiry: '7d',
    algorithm: 'HS256'
  },

  // Session Security
  session: {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  },

  // Helmet Security
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }
};

// Utility functions for security
const securityUtils = {
  // Generate a secure API key
  generateApiKey: () => {
    return crypto.randomBytes(securityConfig.api.keyLength).toString('hex');
  },

  // Generate a secure client secret
  generateClientSecret: () => {
    return crypto.randomBytes(securityConfig.api.secretLength).toString('hex');
  },

  // Generate a secure session secret
  generateSessionSecret: () => {
    return crypto.randomBytes(64).toString('hex');
  },

  // Validate API key format
  validateApiKey: (apiKey) => {
    return /^[a-fA-F0-9]{32}$/.test(apiKey);
  },

  // Generate request signature
  generateSignature: (method, path, timestamp, secret) => {
    const data = `${method}${path}${timestamp || ''}`;
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
  },

  // Validate request timestamp
  validateTimestamp: (timestamp, windowMs = securityConfig.api.timestampWindow) => {
    const requestTime = parseInt(timestamp);
    const currentTime = Date.now();
    return Math.abs(currentTime - requestTime) <= windowMs;
  },

  // Sanitize user input
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  },

  // Generate secure random string
  generateSecureString: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  }
};

// Environment-specific security settings
const getEnvironmentSecurity = () => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return {
        ...securityConfig,
        cors: {
          ...securityConfig.cors,
          allowedOrigins: securityConfig.cors.allowedOrigins.filter(origin => 
            origin.startsWith('https://')
          )
        },
        session: {
          ...securityConfig.session,
          cookie: {
            ...securityConfig.session.cookie,
            secure: true
          }
        }
      };
    
    case 'development':
      return {
        ...securityConfig,
        cors: {
          ...securityConfig.cors,
          allowedOrigins: [
            'http://localhost:3000',
            'http://127.0.0.1:3000'
          ]
        }
      };
    
    default:
      return securityConfig;
  }
};

module.exports = {
  securityConfig: getEnvironmentSecurity(),
  securityUtils,
  getEnvironmentSecurity
};
