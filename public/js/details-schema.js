//jshint esversion:6

const mongoose = require('mongoose');

const detailSchema = new mongoose.Schema({
  roll_no:Number,
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  phone: Number,
  prtname: String,
  prtphn:{
    type:Number,
    default:0
  },
  course:{                                 //11,12,21,23
    type:String,
    default:"none"
  },
  batch:{                                 //11,12,21,23
    type:String,
    default:"none"
  },
  address: String,
  city: String,
  img_pic: Buffer,
  createdAt: {
    type: Date,
    default: Date.now()
  },
  plan:{                                 //11,12,21,23
    type:Number,
    default:0
  },
  paidIntm:{                                 //11,12,21,23
    type:Number,
    default:0
  },
  notify:{                                 //11,12,21,23
    type:String,
    default:""
  },
  link:String
});

const Detail = mongoose.model("Detail", detailSchema); //creating model detail which have 'detailSchema' as Schema

module.exports = Detail;
