var mongoose = require('mongoose');

var studySchema = new mongoose.Schema({
    type:String,
    subject: String,
    topic: String,
    desc: String,
    file:Buffer  
});

//Image is a model which has a schema imageSchema

module.exports = new mongoose.model('Studymaterial', studySchema);
