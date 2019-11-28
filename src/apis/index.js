'use strict';

/**
 * Middlewares to handle requests.
 * Business logics (e.g. db, provider) should be implementd separately
 * and exposed as a list of methods that will be called here.
 *
 * Different schemas may require different implementation of standard methods
 * (list, get, create, update, delete). Consult mongoose documentation
 * for more details.
 */
const DateDoc = require('../db').dateDocument;
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const db = require('../utils/dbHandler');

/**
 * GET
 *   /
 *     @description To test api to date service
 *     @return {string} Hello message
 */
exports.helloWorld = (req, res, next) => {
  console.log('Hello World! date-service');
  res.json({ message: 'Hello World! date-service' });
};

/**
 * GET
 *   /getAllDates
 *     @description To get a list of all date
 *      @return {Array} Array of date data object
 */
exports.getAllDates = async (req, res) => {
  console.log('getAllDateDocs');
  const date = await DateDoc.find({}, null);
  res.json(date);
};

/**
 * POST
 *   /createDate
 *     @description Create new date
 *      @param req.body.date {Object} Date data object.
 *      @return {Object} Date data object
 */
exports.createDate = async (req, res) => {
  console.log('createDate');
  const { dateQuery } = req.body;
  const [day, month, year] = _parseDate(dateQuery);
  const users = await db.getUserList();

  const tempDate = _createMoment(day, month, year);

  let newDate = new DateDoc({
    date: tempDate,
    dateType: await _checkDateType(tempDate),
    users: users
  });
  console.log(newDate);

  const date = await newDate.save();
  res.json({
    date: date
  });
};

/**
 * POST
 *   /findDateById/:dateId
 *     @description Query for date data by id
 *      @param req.params.dateId {string} Date mongo id.
 *      @return {object} Date data object
 */
exports.findDateById = async (req, res) => {
  console.log('findDateById');
  const date = await DateDoc.findOne({ _id: req.params.dateId });
  res.json(date);
};

/**
 * POST
 *   /findDate
 *     @description Query for date data by query
 *      @param req.body.dateQuery {Object} Date data object.
 *      @return {object} Date data object
 */
exports.findDate = async (req, res) => {
  console.log('findDate');
  const { dateQuery } = req.body;
  const [day, month, year] = _parseDate(dateQuery);

  const tempDate = _createMoment(day, month, year);

  let dateRes = await DateDoc.findOne({
    date: tempDate
  });
  if (!dateRes) return res.json({ date: null });

  dateRes = JSON.parse(JSON.stringify(dateRes));
  const users = await db.getFullUserList();
  dateRes.users = dateRes.users.map(d => {
    const i = users.findIndex(u => u.uid == d.uid);
    d.firstName = users[i].firstName;
    d.lastName = users[i].lastName;
    return d;
  });

  res.json({
    date: dateRes
  });
};

/**
 * POST
 *   /findUserDate
 *     @description Query for date data by userId and month.
 *                  Will find data of specific user only.
 *                  Will find the whole month if monthQuery,
 *                  are present
 *      @param req.body.userId {Object} Date data object.
 *      @param req.body.monthQuery {string} Month data.
 *      @return {Array} Array of date data object
 */
exports.findUserDate = async (req, res) => {
  console.log('findUserDate');

  const { userId, monthQuery } = req.body;
  let startDate = undefined;
  let endDate = undefined;

  if (!monthQuery) {
    endDate = moment([2019, 9, 11])
      .tz('Asia/Bangkok')
      .format();
    startDate = moment(endDate)
      .subtract(29, 'day')
      .tz('Asia/Bangkok')
      .format();
  } else {
    endDate = moment(monthQuery)
      .endOf('month')
      .tz('Asia/Bangkok')
      .format();
    startDate = moment(monthQuery)
      .startOf('month')
      .tz('Asia/Bangkok')
      .format();
  }
  let user = await db.findUser(userId);

  user = {
    _id: user._id,
    lid: user.lid,
    uid: user.uid,
    firstName: user.firstName,
    lastName: user.lastName,
    initCode: user.initCode,
    dateData: []
  };
  const dateData = await DateDoc.find(
    {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    },
    null,
    { sort: { date: -1 } }
  );

  const userDateData = dateData.map(date => {
    let user = date.users.find(user => user.uid === userId);

    date.date = moment(date.date).format('DD/MM/YYYY');

    let dateData = {
      did: date._id,
      date: date.date,
      dateType: date.dateType
    };

    dateData.date = _addDay(dateData.date);

    const data = user ? user.data : {};

    return { ...dateData, data };
  });
  user.dateData = userDateData;

  res.json({ user: user });
};

/**
 * PATCH
 *   /updateDate/:dateId
 *     @description Update date data
 *      @param req.params.dateId {string} Date mongo id.
 *      @param req.body.query {Object} Date data object.
 *      @return {Object} Date data object
 */
exports.updateDate = async (req, res) => {
  console.log('updateDate');
  let newDateDoc = req.body;
  const date = await DateDoc.updateOne({ _id: req.params.dateId }, newDateDoc);
  res.json(date);
};

/**
 * POST
 *   /updateDateUser
 *     @description Update user data of specific date.
 *                  Will only update one specific user.
 *      @param req.body.did {string} Date id of updated date
 *      @param req.body.uid {string} User id of updated user
 *      @param req.body.newData {Object} User data to be update
 *      @return {Object} Date data object
 */
exports.updateDateUser = async (req, res) => {
  console.log('updateDateUserList');
  let { did, uid, newData } = req.body;

  const newDate = await DateDoc.findOneAndUpdate(
    { _id: did, 'users.uid': uid },
    {
      $set: {
        'users.$.data': newData
      }
    }
  );
  if (!newDate) return res.status(404).json({ status: 'date not found' });

  res.json({ newDate: newDate });
};

/**
 * POST
 *   /updateDateUserList
 *     @description Update user data of specific date.
 *                  Will only update multiple user.
 *      @param req.body.dateId {string} Date id of updated date
 *      @param req.body.userList {Object} User list data to be update
 *      @return {Object} Date data object
 */
exports.updateDateUserList = async (req, res) => {
  console.log('updateDateUserList');
  let { dateId, userList } = req.body;

  let dateData = await DateDoc.findOne({ _id: dateId });
  if (!dateData) return res.status(404).json({ status: 'date not found' });

  const newUserList = dateData.users.map(user => {
    const newUser = userList.find(userL => userL._id == user._id);
    const newData = newUser ? newUser.data : user.data;
    user.data = newData;
    return user;
  });

  const newDate = await DateDoc.findOneAndUpdate(
    { _id: dateId },
    {
      $set: {
        users: newUserList
      }
    }
  );

  res.json({ date: newDate });
};

/**
 * DELETE
 *   /deleteDate/:dateId
 *     @description Delete date data
 *      @param req.params.dateId {string} Date mongo id.
 *      @return {object} Delete response
 */
exports.deleteDate = async (req, res) => {
  console.log('deleteDate');
  const date = await DateDoc.deleteOne({ _id: req.params.dateId });
  let message = 'No date remove';
  if (date.deletedCount >= 1) {
    message = 'Delete date id: ' + req.params.dateId + ' successfully';
  }
  const response = {
    message: message,
    id: date._id
  };
  res.json(response);
};

//The following route are use for testing and development

/**
 * POST
 *   /generateDate
 *     @description Generate empty date according to query
 *      @param req.body.dateNo {number} Number of date to generate.
 *      @param req.body.startDate {string} The last date to generate.
 *      @return {Array} Array of user data object
 */
exports.generateDate = async (req, res) => {
  console.log('generateDate');
  const { dateNo, startDate } = req.body;
  const [day, month, year] = _parseDate(startDate);
  const users = await db.getUserList();
  let dateArray = [];

  for (let i = 0; i < dateNo; i++) {
    const date = moment([year, month - 1, day, 2])
      .subtract(i, 'day')
      .tz('Asia/Bangkok')
      .format();
    let newDate = new DateDoc({
      date: date,
      dateType: await _checkDateType(date),
      users: users
    });
    dateArray.push(newDate);
  }
  await DateDoc.insertMany(dateArray);
  res.json(dateArray);
};

/**
 * GET
 *   /deleteAllDate
 *     @description Delete all date
 *      @return {Object} Delete respond
 */
exports.deleteAllDate = async (req, res) => {
  const date = await DateDoc.deleteMany({});
  res.json(date);
};

/**
 * Parse date string into array of date (number)
 * @param     {string} date - string of date
 * @returns   {number} number
 * @example    _parseDate('10/10/2019')
 */
function _parseDate(date) {
  return date.split('/').map(d => parseInt(d, 10));
}

/**
 * Add respective date name into date
 * @param     {string} date - string of date
 * @returns   {string} date
 * @example    _addDay('10/10/2019')
 */
function _addDay(date) {
  const [dd, mm, yy] = _parseDate(date);
  const day = moment([yy, mm - 1, dd])
    .tz('Asia/Bangkok')
    .format('ddd');
  return `${date} (${day})`;
}

/**
 * Create a moment date from date string
 * @param     {number} day
 * @param     {number} month
 * @param     {number} year
 * @returns   {Date} moment date
 * @example    _createMoment(10,10,2019)
 */
function _createMoment(day, month, year) {
  return moment([year, month - 1, day, 2])
    .tz('Asia/Bangkok')
    .format();
}

/**
 * Check if the date is weekday/weekend/holiday.
 * Will read data from holidayList.json to check
 * for holiday.
 * @requires  /src/utils/holidayList.json
 * @param     {Date} date
 * @returns   {string} dateType
 * @example    _checkDateType(new Date())
 */
async function _checkDateType(date) {
  const newDate = moment(date);
  const name = newDate.format('ddd');
  let type = 'workday';
  if (name == 'Sat' || name == 'Sun') return 'weekend';

  const contents = await readFile(
    path.join(__dirname, '../utils/holidayList.json'),
    'utf8'
  );
  const holidayList = JSON.parse(contents);
  const formatDate = newDate.format('DD/MM');
  const result = holidayList.some(h => {
    return h === formatDate;
  });
  return result ? 'holiday' : type;
}
