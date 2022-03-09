//jshint esversion:6

const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    teacherId: String,
    first_name: String,
    last_name: String,
    email: String,
    password: String,
    phone: Number,
    qualif: String,
    subject: String,
    course: String,
    pic: Buffer,
    createdAt: {
      type: Date,
      default: Date.now()
    }
  });

  const Teacher = mongoose.model("Teacher", teacherSchema); //creating model teacher which have 'teacherSchema' as Schema

  module.exports = Teacher;
