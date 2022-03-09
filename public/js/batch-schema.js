//jshint esversion:6

const mongoose = require('mongoose');

var batchSchema = new mongoose.Schema({
    batchId: String,
    studentCount:Number,
    createdAt: {
      type: Date,
      default: Date.now()
    }
});

const scBatch= new mongoose.model('Batchs', batchSchema);   // creating a Batch schema in mongodb

module.exports = scBatch;
