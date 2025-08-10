const verifyFrontendSecret = (req, res, next) => {
  const clientSecret = req.headers["x-client-secret"];
  if (clientSecret !== process.env.FRONTEND_SECRET) {
    return res.status(403).json({ message: "Forbidden: Invalid source" });
  }
  next();
};

module.exports = verifyFrontendSecret;