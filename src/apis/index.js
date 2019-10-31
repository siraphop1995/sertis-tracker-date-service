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
  const tempDate = moment([year, month - 1, day, 2]);
  let newDate = new DateDoc({
    date: tempDate,
    formatDate: tempDate.format('DD/MM/YYYY'),
    dateType: await _checkDateType(tempDate),
    employees: users
  });
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

  const dateRes = await DateDoc.findOne({
    date: {
      $gte: moment([year, month - 1, day]),
      $lt: moment([year, month - 1, day + 1])
    }
  });

  res.json({
    date: dateRes
  });
};

exports.updateDate = async (req, res) => {
  console.log('updateDate');
  let newDateDoc = req.body;
  const date = await DateDoc.updateOne({ _id: req.params.dateId }, newDateDoc);
  res.json(date);
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
    const date = moment([year, month - 1, day, 2]).subtract(i, 'day');
    let newDate = new DateDoc({
      date: date,
      formatDate: date.format('DD/MM/YYYY'),
      dateType: await _checkDateType(date),
      employees: users
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
async function _checkDateType(date) {
  const name = date.format('ddd');
  let type = 'workday';
  if (name == 'Sat' || name == 'Sun') return 'weekend';

  const contents = await readFile(
    path.join(__dirname, '../utils/holidayList.json'),
    'utf8'
  );
  const holidayList = JSON.parse(contents);
  const formatDate = date.format('DD/MM');
  const result = holidayList.some(h => {
    return h === formatDate;
  });
  return result ? 'holiday' : type;
}
