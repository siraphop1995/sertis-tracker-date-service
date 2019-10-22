'use strict';

module.exports = {
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
  },
  'GET /generateDate/:dateNo': {
    middlewares: ['generateDate']
  },
  'GET /removeAllDate/': {
    middlewares: ['removeAllDate']
  },
  'POST /findDate/': {
    middlewares: ['findDate']
  },
};
