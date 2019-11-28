'use strict';

const httpStatus = require('http-status');

/**
 *
 * Error handler middlewear
 *
 * @response
 *       400:
 *         description: Mongo related error
 *       404:
 *         description: User not found
 *       500:
 *         description: Unknown error
 */
module.exports = (err, req, res, next) => {
  console.log('errorHandler');
  console.error(err);
  const getStatusCode = err => {
    let numberFromStatus = Number.isInteger(err.status) && err.status;
    let numberFromCode = Number.isInteger(err.code) && err.code;
    let status = numberFromStatus || numberFromCode || 500;
    if (typeof httpStatus[status] === 'undefined') {
      err.message = 'Unknown status code: ' + status;
      status = 500;
    }
    return status;
  };

  if (!err) err = {};

  switch (err.name) {
    case 'CastError':
      err.status = 404;
      err.message = 'Date Not Found.';
      break;
    case 'BulkWriteError':
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
