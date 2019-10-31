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
exports.getAllDates = async (req, res) => {
  console.log('getAllDateDocs');
  const date = await DateDoc.find({}, null);
  res.json(date);
};

exports.createDate = async (req, res) => {
  console.log('createDate');
  let newDate = new DateDoc(req.body);
  const date = await newDate.save();
  res.json(date);
};

exports.findDateById = async (req, res) => {
  console.log('findDateById');
  const date = await DateDoc.findOne({ _id: req.params.dateId });
  res.json(date);
};

exports.findDate = async (req, res) => {
  const { date } = req.body;
  const [dd, mm, yyyy] = date.split('/');
  const newDate = moment([yyyy, mm - 1, dd]).tz('Asia/Bangkok');

  const newYear = newDate.year();
  const newMonth = newDate.month();
  const newDay = newDate.date();

  const dateRes = await DateDoc.findOne({
    date: {
      $gte: moment([newYear, newMonth, newDay]),
      $lt: moment([newYear, newMonth, newDay + 1])
    }
  });

  res.json({
    newDate: newDate,
    date: dateRes,
    moment: moment([newYear, newMonth, newDay])
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
  const { dateNo } = req.params;
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
  for (let i = 1; i <= dateNo; i++) {
    let newDate = new DateDoc({
      date: moment().subtract(i, 'day'),
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
