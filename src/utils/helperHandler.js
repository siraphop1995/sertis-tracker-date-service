const jwt = require('jsonwebtoken');
const axios = require('axios');

function asyncWrapper(fn) {
  return async (req, res, next) => {
    try {
      return await fn.apply(null, [req, res, next]);
    } catch (err) {
      next(err);
    }
  };
}

function checkToken(req, res, next) {
  if (req.url == '/findUserDate' && req.method == 'POST') {
    axios.defaults.headers.common['authorization'] = process.env.AUTH_TOKEN;
    return next();
  }
  let token = req.headers['authorization'];
  if (token) {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    jwt.verify(token, 'secret', (err, decoded) => {
      if (err) {
        console.log('ERR');
        return res.status(401).json({
          success: false,
          location: 'middleware checkToken',
          message: 'Token is not valid'
        });
      } else {
        axios.defaults.headers.common['authorization'] = token;
        req.decoded = decoded;
        next();
      }
    });
  } else {
    return res.status(401).json({
      success: false,
      location: 'middleware checkToken',
      message: 'Auth token is not supplied'
    });
  }
}

module.exports = {
  asyncWrapper,
  checkToken
};
