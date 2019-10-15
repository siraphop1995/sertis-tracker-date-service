'use strict';

module.exports = {
  'GET /': {
    middlewares: ['helloWorld']
  },
  'GET /admin': {
    middlewares: ['getAllAdmins']
  },
  'POST /admin': {
    middlewares: ['addAdmin']
  },
  'GET /admin/:adminId': {
    middlewares: ['getAdmin']
  },
  'PATCH /admin/:adminId': {
    middlewares: ['updateAdmin']
  },
  'DELETE /admin/:adminId': {
    middlewares: ['deleteAdmin']
  },
  'GET /date': {
    middlewares: ['getAllDates']
  },
  'POST /date': {
    middlewares: ['addDate']
  },
  'GET /date/:dateId': {
    middlewares: ['getDate']
  },
  'PATCH /date/:dateId': {
    middlewares: ['updateDate']
  },
  'DELETE /date/:dateId': {
    middlewares: ['deleteDate']
  }
};
