'use strict';

module.exports = {
  'GET /': {
    middlewares: ['helloWorld']
  },
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
  'POST /findUserDate': {
    middlewares: ['findUserDate']
  },
  'PATCH /updateDate/:dateId': {
    middlewares: ['updateDate']
  },
  'POST /updateDateUser': {
    middlewares: ['updateDateUser']
  },
  'POST /updateDateUserList': {
    middlewares: ['updateDateUserList']
  },
  'DELETE /deleteDate/:dateId': {
    middlewares: ['deleteDate']
  },
  'POST /generateDate': {
    middlewares: ['generateDate']
  },
  'DELETE /deleteAllDate/': {
    middlewares: ['deleteAllDate']
  }
};
