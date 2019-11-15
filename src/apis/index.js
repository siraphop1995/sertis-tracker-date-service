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
const axios = require('axios');
const { USER_SERVER } = process.env;
const moment = require('moment-timezone');
const path = require('path');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

exports.getAllDates = async (req, res) => {
  console.log('getAllDateDocs');
  const date = await DateDoc.find({}, null);
  res.json(date);
};

exports.createDate = async (req, res) => {
  const { dateQuery } = req.body;
  const [day, month, year] = _parseDate(dateQuery);
  const users = (await axios.get(`${USER_SERVER}/getAllUsers`)).data.map(
    user => {
      return {
        _id: user._id,
        lid: user.lid,
        uid: user.uid
      };
    }
  );
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

exports.findDateById = async (req, res) => {
  console.log('findDateById');
  const date = await DateDoc.findOne({ _id: req.params.dateId });
  res.json(date);
};

exports.findDate = async (req, res) => {
  const { dateQuery } = req.body;
  const [day, month, year] = _parseDate(dateQuery);

  const tempDate = _createMoment(day, month, year);

  const dateRes = await DateDoc.findOne({
    date: tempDate
  });

  res.json({
    date: dateRes
  });
};

exports.findUserDate = async (req, res) => {
  const { userId, monthQuery } = req.body;
  console.log(monthQuery);
  let startDate = undefined;
  let endDate = undefined;

  if (!monthQuery) {
    endDate = moment()
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
  let user = (
    await axios.post(`${USER_SERVER}/findUser`, {
      uid: userId
    })
  ).data;
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
    user.data.totalWorkTime = _toHour(user.data.totalWorkTime);
    user.data.actualWorkTime = _toHour(user.data.actualWorkTime);
    user.data.expectedWorkTime = _toHour(user.data.expectedWorkTime);

    const { data } = user;

    return { ...dateData, data };
  });
  user.dateData = userDateData;

  res.json({ user: user });
};

exports.updateDate = async (req, res) => {
  console.log('updateDate');
  let newDateDoc = req.body;
  const date = await DateDoc.updateOne({ _id: req.params.dateId }, newDateDoc);
  res.json(date);
};

exports.updateDateUser = async (req, res) => {
  console.log('updateDateUserList');
  let { userData, userDate } = req.body;

  let dateData = await DateDoc.findOne({ _id: userDate.did });
  if (!dateData) return res.status(404).json({ status: 'date not found' });

  console.log(userDate.data);

  const newDate = await DateDoc.findOneAndUpdate(
    { _id: userDate.did, 'users.uid': userData.uid },
    {
      $set: {
        'users.$.data': userDate.data
      }
    }
  );

  res.json({ newDate: newDate });
};

exports.updateDateUserList = async (req, res) => {
  console.log('updateDateUserList');
  let { userList, dateId } = req.body;

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

//======= Dev Helper =========

exports.generateDate = async (req, res) => {
  console.log('generateDate');
  const { dateNo, startDate } = req.body;
  const [day, month, year] = _parseDate(startDate);
  const users = (await axios.get(`${USER_SERVER}/getAllUsers`)).data.map(
    user => {
      return {
        _id: user._id,
        lid: user.lid,
        uid: user.uid
      };
    }
  );
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

exports.removeAllDate = async (req, res) => {
  const date = await DateDoc.deleteMany({});
  res.json(date);
};

function _parseDate(date) {
  return date.split('/').map(d => parseInt(d, 10));
}

function _toHour(time) {
  if (!time) return '-';
  let hh = Math.floor(time / 60);
  let mm = Math.floor(time - hh * 60);
  hh = hh < 10 ? '0' + hh : hh;
  mm = mm < 10 ? '0' + mm : mm;
  return `${hh}:${mm}`;
}

function _addDay(date) {
  const [dd, mm, yy] = _parseDate(date);
  const day = moment([yy, mm - 1, dd])
    .tz('Asia/Bangkok')
    .format('ddd');
  return `${date} (${day})`;
}

function _createMoment(day, month, year) {
  return moment([year, month - 1, day, 2])
    .tz('Asia/Bangkok')
    .format();
}

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
