var mongoose = require("mongoose");

var ttSchema = new mongoose.Schema({
  batchId:String,
  topic: String,
  desc: String,
  date: Number,
  month: Number,
  year: Number,
  start_hour: Number,
  start_min: Number,
  end_hour: Number,
  end_min: Number,
  zoom_id: Number
});
const scTimetable = new mongoose.model('Timetable', ttSchema);

var feedbackSchema = new mongoose.Schema({
  subject: String,
  comment: String,
  createdAt: {
    type: Date,
    default: Date.now()
  }
});
const scFeedback = new mongoose.model('Feedbacks', feedbackSchema);

var doubtSchema = new mongoose.Schema({
  subject: String,
  topic: String,
  question: String,
  batch: String,
  qImage: Buffer,
  rollno: Number,
  code: {
    type: Number,
    default: 0
  },
  createdAt: String,
  status: {                      //0-not asked  1-no ques img  2-with ques img  3-ans
    type: Number,
    default: 0
  }
});
const scDoubt = new mongoose.model('Doubts', doubtSchema);

var answerSchema = new mongoose.Schema({
  answer: {
    type: String,
    default: "none"
  },
  aImage: Buffer,
  code: {
    type: Number,
    default: 0
  },
  createdAt: String,
  status: {                      //0-not asked  1-no ans img  2-with ans img
    type: Number,
    default: 0
  }
});
const scAnswer = new mongoose.model('Answers', answerSchema);

var batchSchema = new mongoose.Schema({
  batchId: String,
  studentCount: Number,
  createdAt: {
    type: Date,
    default: Date.now()
  }
});
const scBatch = new mongoose.model('Batchs', batchSchema);

var batchTeacherSchema = new mongoose.Schema({
    batchId: String,
    subject:String,
    teachername:String,
    teacherId: String
});
const scTBatch = new mongoose.model('Batchtechers', batchTeacherSchema);

module.exports = {
  scTimetable,
  scFeedback,
  scDoubt,
  scBatch,
  scTBatch,
  scAnswer
}
