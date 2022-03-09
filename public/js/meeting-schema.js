//jshint esversion:6

const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  zoom_id: Number,
  topic: String,
  start_time: Date,
  duration: Number,
  host_url: String,
  user_url: String
});

const Meeting = mongoose.model("Meeting", meetingSchema); //creating model fruit which have 'fruitSchema' as Schema

module.exports = Meeting;
