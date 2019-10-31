'use strict';

module.exports = {
  'GET /getAllDates': {
    middlewares: ['getAllDates']
  },
  'POST /createDate': {
    middlewares: ['createDate']
  },
  'GET /findDateById/:dateId': {
    middlewares: ['findDateById']
  },
  'POST /findDate': {
    middlewares: ['findDate']
  },
  'PATCH /updateDate/:dateId': {
    middlewares: ['updateDate']
  },
  'DELETE /deleteDate/:dateId': {
    middlewares: ['deleteDate']
  },
  'POST /generateDate': {
    middlewares: ['generateDate']
  },
  'GET /removeAllDate/': {
    middlewares: ['removeAllDate']
  }
};
