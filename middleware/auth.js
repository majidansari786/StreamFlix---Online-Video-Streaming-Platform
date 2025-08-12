const jwt = require('jsonwebtoken');
const User = require('../model/user');
require('dotenv').config();

async function auth(req, res, next) {
  const accessToken = req.cookies.userAcesstoken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken && !refreshToken) {
    return res.status(401).json({ error: 'No tokens provided' });
  }

  if (accessToken) {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          // Access token expired, try refreshing
          if (!refreshToken) {
            return res.status(401).json({ error: 'Refresh token missing' });
          }

          // Verify refresh token
          jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (refreshErr, refreshDecoded) => {
            if (refreshErr) {
              return res.status(403).json({ error: 'Invalid refresh token' });
            }

            // Check if refresh token exists in DB
            const user = await User.findOne({ refreshToken });
            if (!user) {
              return res.status(403).json({ error: 'Refresh token not recognized' });
            }

            // Generate new access token
            const payload = { id: user._id, email: user.email };
            const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

            // Set new access token cookie
            res.cookie('userAcesstoken', newAccessToken, {
              httpOnly: true,
              secure: false, // true if production with HTTPS
              sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
              maxAge: 60 * 60 * 1000,
            });

            req.user = user;
            return next();
          });
        } else {
          // Other token errors
          return res.status(403).json({ error: 'Invalid access token' });
        }
      } else {
        // Access token valid
        req.user = decoded;
        return next();
      }
    });
  } else if (refreshToken) {
    // No access token, but refresh token present
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: 'Invalid refresh token' });
      }

      const user = await User.findOne({ refreshToken });
      if (!user) {
        return res.status(403).json({ error: 'Refresh token not recognized' });
      }

      // Generate new access token
      const payload = { id: user._id, email: user.email };
      const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

      res.cookie('userAcesstoken', newAccessToken, {
        httpOnly: true,
        secure: false,
        sameSite: process.env.NODE_ENV === 'production' ? 'Strict' : 'Lax',
        maxAge: 60 * 60 * 1000,
      });

      req.user = user;
      return next();
    });
  }
}

module.exports = auth;
