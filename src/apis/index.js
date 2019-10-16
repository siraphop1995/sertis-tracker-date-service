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
exports.getAllDates = async (req, res) => {
  console.log('getAllDateDocs');
  const date = await DateDoc.find({}, null);
  res.json(date);
};

exports.addDate = async (req, res) => {
  console.log('addDateDoc');
  let newDate = new DateDoc(req.body);
  const date = await newDate.save();
  res.json(date);
};

exports.getDate = async (req, res) => {
  console.log('getDateDoc');
  const date = await DateDoc.findOne({ _id: req.params.dateId });
  res.json(date);
};

exports.updateDate = async (req, res) => {
  console.log('updateDateDoc');
  let newDateDoc = req.body;
  const date = await DateDoc.updateOne({ _id: req.params.dateId }, newDateDoc);
  res.json(date);
};

exports.deleteDate = async (req, res) => {
  console.log('deleteDateDoc');
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
  console.log('generateUsr');
  const { dateNo } = req.params;
  const users = (await axios.get(`${USER_SERVER}/user`)).data.map(user => {
    return {
      _id: user._id,
      lineId: user.lineId,
      employeeId: user.employeeId
    };
  });
  let dateArray = [];
  for (let i = 1; i <= dateNo; i++) {
    let newDate = new DateDoc({
      date: new Date(new Date(2019, 6, 11).valueOf() - 1000 * 60 * 60 * 24 * 0),
      employees: users
    });
    dateArray.push(newDate);
  }
  await DateDoc.insertMany(dateArray);
  res.json(dateArray);

  res.json(newDate)
};

exports.removeAllDate = async (req, res) => {
  const date = await DateDoc.deleteMany({});
  res.json(date);
};
