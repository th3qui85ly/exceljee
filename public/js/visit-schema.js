//jshint esversion:6

const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
site: Number,
user:Number,
employee:Number,
sales:Number
});

const Visit = mongoose.model("Visit", visitSchema);

module.exports = Visit;
