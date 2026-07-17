const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Sign a JWT token for the given payload.
 */
const signToken = (payload) => {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiry });
};

/**
 * Verify and decode a JWT token.
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret);
};

module.exports = { signToken, verifyToken };
