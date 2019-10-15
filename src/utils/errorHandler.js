'use strict';

const httpStatus = require('http-status');

module.exports = (err, req, res, next) => {
  console.log('errorHandler');
  const getStatusCode = err => {
    let numberFromStatus = Number.isInteger(err.status) && err.status;
    let numberFromCode = Number.isInteger(err.code) && err.code;
    return numberFromStatus || numberFromCode || 500;
  };

  if (!err) err = {};

  switch (err.name) {
    case 'CastError':
      err.status = 404;
      err.message = 'Date Not Found.';
      break;
    case 'MongoError':
      if (err.code === 11000) {
        err.message = 'Date already exists.';
      }
      err.status = 400;
      err.code = 400;
      break;
  }

  const status = getStatusCode(err);

  res.status(status).json({
    error: {
      code: status,
      status: httpStatus[status],
      message: err.message
    }
  });
};
