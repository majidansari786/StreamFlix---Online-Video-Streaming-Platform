const jwt = require('jsonwebtoken');
const User = require('../model/user');

require('dotenv').config();

async function auth(req,res,next){
  const accessToken = req.cookies.userAcesstoken;
  
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
      return res.status(403).json({ error: 'Refresh token not provided' });
    }
  
  const user = await User.findOne({ refreshToken: refreshToken });
  if (!user) {
      return res.status(403).json({ error: 'Invalid refresh token' });
    }

   if (accessToken) {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN, async (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (refreshErr, refreshDecoded) => {
            if (refreshErr) return res.status(403).json({ error: 'Invalid refresh token' });

            const payload = { id: user._id, email: user.email };
            const newAccessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, { expiresIn: '1h' });

            res.cookie('userAcesstoken', newAccessToken, {
              httpOnly: true,
              secure: false,
              sameSite: 'Strict',
              maxAge: 60 * 60 * 1000,
            });

            req.user = user;
            return next();
          });
        } else {
          return res.status(403).json({ error: 'Invalid access token' });
        }
      } else {
        req.user = decoded;
        return next();
      }
    });
  }else{
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, (err, decoded) => {
      if (err) return res.status(403);
      const payload = {id:user._id, email:user.email};
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN, {expiresIn:'1h'});
      res.cookie('userAcesstoken',accessToken,{httpOnly: true,secure: false,sameSite: 'Strict',maxAge: 24 * 60 * 60 * 1000 })
      req.user = user;
      return next();
    });
  }
}
module.exports = auth;
