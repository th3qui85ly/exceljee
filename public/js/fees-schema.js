//jshint esversion:6

const mongoose = require('mongoose');

const feesSchema = new mongoose.Schema({
  name: String,
  rollno: Number,
  course: String,
  plan: String,
  link: String,
  fInstallment: {
    type: String,
    default: "Due"
  },
  sInstallment: {
    type: String,
    default: "Due"
  },
  tInstallment: {
    type: String,
    default: "Due"
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  noDue:Number
});

const Fee = mongoose.model("Fee", feesSchema);

module.exports = Fee;
