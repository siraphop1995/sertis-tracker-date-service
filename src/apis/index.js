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
// const Admin = require('../models/adminListModel');
const Date = require('../db').dateDocument;

exports.helloWorld = (req, res) => {
  console.log('helloWorld');
  res.send('Hello World');
};

exports.getAllDates = async (req, res) => {
  console.log('getAllDates');
  const date = await Date.find({}, null);
  console.log(date);
  res.json(date);
};

exports.addDate = async (req, res) => {
  console.log('addDate');
  let newDate = new Date(req.body);
  const date = await newDate.save();
  res.json(date);
};

exports.getDate = async (req, res) => {
  console.log('getDate');
  const date = await Date.findOne({ _id: req.params.dateId });
  res.json(date);
};

exports.updateDate = async (req, res) => {
  console.log('updateDate');
  let newDate = req.body;
  const date = await Date.updateOne({ _id: req.params.dateId }, newDate);
  res.json(date);
};

exports.deleteDate = async (req, res) => {
  console.log('deleteDate');
  const date = await Date.deleteOne({ _id: req.params.dateId });
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
