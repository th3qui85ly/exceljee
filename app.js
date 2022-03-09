//jshint esversion:6

const mongoose = require('mongoose');
const detailModel = require("./public/js/details-schema.js");
const visitModel = require("./public/js/visit-schema.js");
const feeModel = require("./public/js/fees-schema.js");
var studyModel = require('./public/js/study-schema.js');
var teacherModel = require('./public/js/teacher-schema.js');
const express = require("express");
var nodemailer = require('nodemailer');
var otpGenerator = require('otp-generator');
const https = require("https");
var path = require('path')
const bodyParser = require("body-parser");
const initiateMongoServer = require('./public/js/db-connect.js');
let ejs = require('ejs');
const session = require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var multer = require('multer');
var fs = require('fs');
const zoomtoken = require('./public/js/createMeetingToken.js');
const rp = require('request-promise');
var meetingModel = require('./public/js/meeting-schema.js');
var models = require('./public/js/schemas.js');
const open = require('open');

const app = express();
var store = new MongoDBStore({
  uri: 'mongodb+srv://admin-exceljee:topatopa@cluster0.wfgot.mongodb.net/db1?retryWrites=true&w=majority',
  collection: 'Sessions'
});

// Catch errors
store.on('error', function(error) {
  console.log(error);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(
  session({
    secret: 'ssshhhhh',
    saveUninitialized: true,
    resave: true,
    path: "/login/",
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

app.use(express.static(path.join(__dirname, '/public')));

var site = "60b8f50a12a89dc51e2b755f"
app.get("/", async (req, res) => {
  initiateMongoServer();
  const aaa = await visitModel.updateOne({
    _id: site
  }, {
    $inc: {
      site: 1
    }
  });
  res.sendFile(__dirname + "/html/index.html");
});

let c = 0;

app.get("/register", function(req, res) {
  res.render(__dirname + "/html/regform.ejs", {
    message: ""
  });
});

app.post('/verifyOtp', async (req, res) => {
  initiateMongoServer();
  const ccc = await detailModel.findOne({ //Check if eamil exist
    email: req.body.email
  }, {
    _id: 1,
    first_name: 1
  });
  console.log(ccc.first_name);
  if (ccc.first_name != null) {
    console.log("Email Exist");
    res.render(__dirname + "/html/regform.ejs", {
      message: 1
    });
  } else {
    console.log(req.body.otp);
    var transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'exceljee.app@gmail.com',
        pass: 'Mernproject@1'
      }
    });
    var mailOptions = {
      from: 'exceljee.app@gmail.com',
      to: req.body.email,
      subject: 'Otp for verification',
      text: "OTP for verify email is \n " + req.body.otp + "\nDon't share with anyone"
    };

    transport.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
});

//Download Materials
app.get("/downloadFile1", function(req, res) {
  var file = path.join(__dirname + "/pdf/basic-maths.pdf");
  res.download(file);
});
app.get("/downloadFile2", function(req, res) {
  var file = path.join(__dirname + "/pdf/chem-notes.pdf");
  res.download(file);
});
app.get("/downloadFile3", function(req, res) {
  var file = path.join(__dirname + "/pdf/phy-notes.pdf");
  res.download(file);
});

//Registration

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads')
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now())
  }
});
var upload = multer({
  storage: storage
});


app.post("/submit-form", upload.single('picfile'), async (req, res, next) => {
  initiateMongoServer();

  //if (res) {
  var obj = {
    first_name: req.body.fname,
    last_name: req.body.lname,
    email: req.body.email,
    password: req.body.pwd,
    phone: req.body.phno,
    prtname: req.body.pname,
    prtno: req.body.phno_2,
    address: req.body.address,
    city: req.body.city,
    img_pic: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))
  }
  //  }
  detailModel.create(obj, async (err, item) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Registered");
      await visitModel.updateOne({
        _id: site
      }, {
        $inc: {
          user: 1
          //,sales: sales
        }
      });
      fs.unlink(__dirname + '/uploads/' + req.file.filename, function(err) {
        if (err) return console.log(err);
        console.log('Internal file deleted successfully');
      });
    }
  });

});


//Login

app.get("/login", function(req, res) {
  res.render(__dirname + "/html/login.ejs", {
    error: ""
  });
});

app.post("/alogin", async (req, res) => {
  initiateMongoServer();
  if (req.body.role == "admin") {

    if (req.body.email == "exceljee@admin" && req.body.password == "mernproject") {
      req.session.email = req.body.email;

      var asd = await visitModel.findOne({
        _id: site
      })
      await detailModel.find({}, (err, items) => {
        if (err) {
          console.log(err);
        } else {
          res.render(__dirname + '/html/admin.ejs', {
            items: asd,
            newuser: items
          });
        }
      });
    } else {
      res.render(__dirname + "/html/login.ejs", {
        error: "Wrong EmailId or Password"
      });
      console.log("Wrong EmailId or Password");
    }
  } else if (req.body.role == "teacher") {
    const td = await teacherModel.findOne({
      password: req.body.password,
      email: req.body.email
    }, {
      _id: 1
    });
    if (td != null) {
      req.session.email = req.body.email;
      teacherModel.findOne({
        email: req.session.email
      }, (err, items) => {
        if (err) {
          console.log(err);
        } else {
          res.render(__dirname + '/html/teacher.ejs', {
            items: items
          });
        }
      });
    } else {
      res.render(__dirname + "/html/login.ejs", {
        error: "Wrong EmailId or Password"
      });
      console.log("Wrong EmailId or Password");
    }
  } else if (req.body.role == "student") {
    const ddd = await detailModel.findOne({
      password: req.body.password,
      email: req.body.email
    }, {
      _id: 1
    });
    if (ddd != null) {
      req.session.email = req.body.email;
      detailModel.findOne({
        email: req.session.email
      }, (err, items) => {
        if (err) {
          console.log(err);
        } else {
          res.render(__dirname + '/html/user-index.ejs', {
            items: items
          });
        }
      });
    } else {
      res.render(__dirname + "/html/login.ejs", {
        error: "Wrong EmailId or Password"
      });
      console.log("Wrong EmailId or Password");
    }
  } else {
    console.log("not selected");
  }

});

//Reset Password

app.get("/forgotpass", function(req, res) {
  res.render(__dirname + "/html/forgot.ejs", {
    error: ""
  });
});

var dd2;
var otp = otpGenerator.generate(6, {
  alphabets: false,
  specialChars: false,
  upperCase: false
});
app.post("/validateEmailForgotPass", async (req, res) => {
  initiateMongoServer();
  dd2 = await detailModel.findOne({
    email: req.body.fg_email,
  }, {
    _id: 1
  });
  if (dd2 != null) {
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'exceljee.app@gmail.com',
        pass: 'Mernproject@1'
      }
    });

    var mailOptions = {
      from: 'exceljee.app@gmail.com',
      to: req.body.fg_email,
      subject: 'OTP for forget password',
      text: "OTP for password change is \n " + otp + "\nDon't share with anyone"
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  } else {
    console.log("Email Does Not Exist");
    res.render(__dirname + "/html/forgot.ejs", {
      error: "Email is not Registered !"
    });
  }
});
app.get("/reset-pass", function(req, res) {
  if (otp != req.query.otp) {
    console.log("wrong otp");
    res.render(__dirname + "/html/forgot.ejs", {
      error: "Wrong OTP !"
    });
  } else {
    console.log("OTP is correct");
    res.render(__dirname + "/html/reset.ejs")
  }
});

//Change-Pass
app.post("/change-pass", async (req, res) => {
  initiateMongoServer();
  const dd3 = await detailModel.updateOne({
    _id: dd2._id
  }, {
    $set: {
      password: req.body.password
    }
  });
  res.sendFile(__dirname + "/html/login.html");
});


/////------     ADMIN      -------/////



app.get("/newuser", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    var acd = await models.scBatch.find();
    await detailModel.findOne({
      _id: req.query.index
    }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/newuser.ejs', {
          items: items,
          message: "",
          option: req.query.o,
          itemss: acd
        });
      }
    });
  }
});

app.get("/profile", function(req, res) {
  initiateMongoServer();
  var filepath;
  var filename;
  detailModel.findOne({
    _id: req.query.index
  }, function(err, data) {
    const arr = new Uint8Array(data.img_pic.buffer);
    filename = data.first_name + data.last_name + ".jpg";
    filepath = __dirname + "/download/" + filename;
    fs.writeFileSync(filepath, arr);
    file = path.join(__dirname + "/download/" + filename);
    res.download(file);
  });
});

function convert(str) {
  var date = new Date(str),
    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
    day = ("0" + date.getDate()).slice(-2);
  hours = ("0" + date.getHours()).slice(-2);
  minutes = ("0" + date.getMinutes()).slice(-2);
  return [date.getFullYear(), mnth, day].join("-") + " " + [hours, minutes].join(":");
}

app.post("/newstudentcourse", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    var password = otpGenerator.generate(8, {
      alphabets: true,
      specialChars: true,
      upperCase: true
    });
    var current = new Date();
    var year = current.getFullYear() - 2000;
    var course = "2 Yr Course";
    if (req.body.course == 1) {
      course = "1 Yr Course";
    }
    var zzx = await visitModel.findOne({
      _id: site
    }, {
      _id: 0,
      user: 1
    });
    var rollno = req.body.course * 100000 + year * 1000 + zzx.user + 1;
    console.log(rollno);
    var link = "https://rzp.io/l/MUTP8Pn";
    if (req.body.course == 1) {
      link = "https://rzp.io/l/mG8rSEZ2";
    }
    await detailModel.updateOne({
      email: req.body.email
    }, {
      $set: {
        course: course,
        roll_no: rollno,
        plan: req.body.plan,
        paidIntm: req.body.paid,
        password: password,
        link: link,
        batch: req.body.batch
      }
    });
    console.log(req.body.batch);
    await models.scDoubt.updateOne({
      batchId: req.body.batch
    }, {
      $inc: {
        studentCount: 1
      }
    });
    var due = 1;
    var amount = 0;
    if (req.body.course == 1) {
      if (req.body.paid == 1) {
        amount = 25000;
      } else {
        amount = 45000;
        due = 4;
      }
    }
    if (req.body.course == 2) {
      if (req.body.paid == 1) {
        amount = 30000;
      } else {
        amount = 85000;
        due = 4;
      }
    }
    var y = req.body.plan + " Installment"
    var gfh = await detailModel.findOne({
      email: req.body.email
    });
    var names = gfh.first_name + " " + gfh.last_name;
    await feeModel.create({
      name: names,
      rollno: rollno,
      course: course,
      plan: y,
      link: link,
      fInstallment: convert(current),
      amountPaid: amount,
      noDue: due
    });
    await visitModel.updateOne({
      _id: site
    }, {
      $inc: {
        sales: amount
      }
    })
    var acd = await models.scBatch.find();
    await detailModel.findOne({
      email: req.body.email
    }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/newuser.ejs', {
          items: items,
          message: items.first_name + " " + items.last_name + " has been registered",
          option: "",
          itemss: acd
        });
      }
    });
  }
});

app.get("/salary", async (req, res) => {
  var months = [
    { month: 'January'   },
   { month: 'February'  },
   { month: 'March' },
   { month: 'April' }, 
   { month: 'May' },
   { month: 'June'  },
   { month: 'July'  }, 
   { month: 'August'  },
   { month : 'September'  },
   { month: 'October' },
   { month: 'November'  },
   { month: 'December' }
  ];
  res.render(__dirname + '/html/salview.ejs', {
    items: months
  });
});

app.get("/fees", async (req, res) => {
  initiateMongoServer();
  await feeModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      res.render(__dirname + '/html/fees.ejs', {
        items: items,
      });
    }
  });
});

app.get("/notifyforfees", async (req, res) => {
  initiateMongoServer();
  await detailModel.updateOne({
    roll_no: req.query.i
  }, {
    $set: {
      notify: "Fees Due"
    }
  });
  await feeModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      console.log(items);
      res.render(__dirname + '/html/fees.ejs', {
        items: items,
      });
    }
  });
});

app.get("/paidfees", async (req, res) => {
  initiateMongoServer();
  var tamount = 0;
  var current = new Date();
  var azd = await feeModel.findOne({
    rollno: req.query.i
  });
  await detailModel.updateOne({
    roll_no: req.query.i
  }, {
    $set: {
      notify: ""
    }
  });
  if (azd.course == "1 Yr Course") {
    tamount = 25000;
    await feeModel.updateOne({
      rollno: req.query.i
    }, {
      $inc: {
        amountPaid: 25000,
        noDue: 3
      },
      $set: {
        sInstallment: convert(current),
      }
    });
  } else {
    tamount = 30000;
    if (azd.noDue == 1) {
      await feeModel.updateOne({
        rollno: req.query.i
      }, {
        $inc: {
          amountPaid: 30000,
          noDue: 1
        },
        $set: {
          sInstallment: convert(current),
        }
      });
    }
    if (azd.noDue == 2) {
      await feeModel.updateOne({
        rollno: req.query.i
      }, {
        $inc: {
          amountPaid: 30000,
          noDue: 2
        },
        $set: {
          tInstallment: convert(current),
        }
      });
    }
  }

  await feeModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      res.render(__dirname + '/html/fees.ejs', {
        items: items,
      });
    }
  });

  await visitModel.updateOne({
    _id: site
  }, {
    $inc: {
      sales: tamount
    }
  })
});

app.get("/notify", async (req, res) => {
  initiateMongoServer();
  var zzy = await detailModel.findOne({
    _id: req.query.index
  }, {
    _id: 0,
    email: 1,
    password: 1
  });
  console.log(zzy.email);
  var transports = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'exceljee.app@gmail.com',
      pass: 'Mernproject@1'
    }
  });
  var mailOptions = {
    from: 'exceljee.app@gmail.com',
    to: zzy.email,
    subject: 'Successfully Registered',
    text: "You registration to ExcelJee has been sucessfully done\nYou can login to your account from website by your email and\nPassword : " + zzy.password
  };
  transports.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  var acd = await models.scBatch.find();
  await detailModel.findOne({
    _id: req.query.index
  }, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      console.log(items);
      res.render(__dirname + '/html/newuser.ejs', {
        items: items,
        message: items.first_name + " " + items.last_name + " has been Notified",
        option: "",
        itemss: acd
      });
    }
  });
});

app.get("/uploadfile", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    res.sendFile(__dirname + "/html/upload.html");
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

app.post('/upload', upload.single('file'), (req, res, next) => {
  initiateMongoServer();
  if (res)
    var obj = {
      type: req.body.filetype,
      subject: req.body.subject,
      topic: req.body.topic,
      desc: req.body.desc,
      file: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))

    }
  studyModel.create(obj, (err, item) => {
    if (err) {
      console.log(err);
    } else {
      console.log("file uploaded sucessfully");
      fs.unlink(__dirname + '/uploads/' + req.file.filename, function(err) {
        if (err) return console.log(err);
        console.log('internal file deleted successfully');
      });
      res.sendFile(__dirname + "/html/upload.html");
    }
  });
});

app.get("/showfile", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    studyModel.find({}, (err, items) => {
      if (err) {
        console.log(err);
        res.status(500).send('An error occurred', err);
      } else {
        res.render(__dirname + '/html/show-del.ejs', {
          items: items
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

app.post("/delfile", async (req, res) => {
  initiateMongoServer();
  await studyModel.deleteOne({
    topic: req.body.filename
  });
  studyModel.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      res.render(__dirname + '/html/show-del.ejs', {
        items: items
      });
    }
  });
});


function timetableupdate(topic, desc, date, start_time, duration, zoom_id,batch) {
  initiateMongoServer();
  var end_hr = parseInt(duration / 60) + parseInt(start_time.slice(0, 2)); // no condition if hr>23:00
  var dur_min = duration % 60;
  var end_min = dur_min + parseInt(start_time.slice(3));
  if (end_min > 59) {
    end_hr = end_hr + 1;
    end_min = end_min - 60;
  }

  models.scTimetable.create({
    batchId:batch,
    topic: topic,
    desc: desc,
    date: date.slice(8),
    month: date.slice(5, 7),
    year: date.slice(0, 4),
    start_hour: start_time.slice(0, 2),
    start_min: start_time.slice(3),
    end_hour: end_hr,
    end_min: end_min,
    zoom_id: zoom_id
  });
  console.log("timetable updated");
}

app.get("/ttTest", function(req, res) {
  res.render(__dirname + "/html/ttTest.ejs", {
    message: ""
  });
});

app.post("/timetable-update", function(req, res) {
  var zoom_id = 0;
  timetableupdate(req.body.topic, "Online Test", req.body.date, req.body.start_time, req.body.duration, zoom_id,req.body.batch);
  res.render(__dirname + "/html/ttTest.ejs", {
    message: "TimeTable Updated"
  });
});

app.post("/createmeeting", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    var email = "exceljee.app@gmail.com";
    var start = req.body.date + "T" + req.body.time + ":01.000+05:30";
    var options = {
      method: "POST",
      uri: "https://api.zoom.us/v2/users/" + email + "/meetings",
      body: {
        topic: req.body.topic,
        type: 2,
        start_time: start,
        duration: req.body.duration,
        settings: {
          host_video: "true",
          participant_video: "true",
          in_meeting: "true"
        }
      },
      auth: {
        'bearer': zoomtoken
      },
      headers: {
        'User-Agent': 'Zoom-api-Jwt-Request',
        'content-type': 'application/json'
      },
      json: true
    };

    rp(options)
      .then(function(response) {
        meetingModel.create({
          zoom_id: response.id,
          topic: response.topic,
          start_time: response.start_time,
          duration: response.duration,
          host_url: response.start_url,
          user_url: response.join_url
        });
        console.log("Meeting Created");
        console.log(req.body.batch);
        
        timetableupdate(req.body.topic, "Online Class", req.body.date, req.body.time, req.body.duration, response.id,req.body.batch);
      });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

/////    Show Feedback    /////
app.get('/show-feedbacks', async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    await models.scFeedback.find({
      $query: {},
      $orderby: {
        createdAt: 1
      }
    }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        console.log(items);
        res.render(__dirname + '/html/feedback-view.ejs', {
          items: items
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

/////    Batch Manage   //////
app.get('/manage-batch', async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    await models.scBatch.find({}, async (err, items) => {
      if (err) {
        console.log(err);
      } else {
        var wwx = await models.scTBatch.find();
        res.render(__dirname + '/html/manage-batch.ejs', {
          items: items,
          itemss: wwx,
          message: ""
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

app.post("/editbatch", async (req, res) => {
  initiateMongoServer();
  var www = await teacherModel.findOne({
    teacherId: req.body.tid
  });
  console.log(req.body.bid);
  await models.scTBatch.create({
    batchId: req.body.bid,
    subject: www.subject,
    teachername: www.first_name + " " + www.last_name,
    teacherId: www.teacherId
  });
  await models.scBatch.find({}, async (err, items) => {
    if (err) {
      console.log(err);
    } else {
      var wwx = await models.scTBatch.find();
      res.render(__dirname + '/html/manage-batch.ejs', {
        items: items,
        itemss: wwx,
        message: "Batch " + req.body.bid + " Updated"
      });
    }
  });
});

app.post('/createbatch', async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    await models.scBatch.create({
      batchId: req.body.bid,
      studentCount: 0
    });
    await models.scBatch.find({}, async (err, items) => {
      if (err) {
        console.log(err);
      } else {
        var wwx = await models.scTBatch.find();
        res.render(__dirname + '/html/manage-batch.ejs', {
          items: items,
          itemss: wwx,
          message: ""
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

app.get('/deletebatch', async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    await models.scBatch.deleteOne({
      batchId: req.query.i
    })
    await models.scBatch.find({}, async (err, items) => {
      if (err) {
        console.log(err);
      } else {
        var wwx = await models.scTBatch.find();
        res.render(__dirname + '/html/manage-batch.ejs', {
          items: items,
          itemss: wwx,
          message: ""
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

app.get('/removeteacher', async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    await models.scTBatch.deleteOne({
      batchId: req.query.j,
      teacherId: req.query.i
    })
    await models.scBatch.find({}, async (err, items) => {
      if (err) {
        console.log(err);
      } else {
        var wwx = await models.scTBatch.find();
        res.render(__dirname + '/html/manage-batch.ejs', {
          items: items,
          itemss: wwx,
          message: ""
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

/////    TimeTable   //////
app.get('/seett-admin', async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    await models.scTimetable.find({}, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/showTTadmin.ejs', {
          items: items
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

app.get('/ttDelete', async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    await models.scTimetable.deleteOne({
      _id: req.query.index
    });
    console.log("TimeTable Updated (Value Deleted)");
    await models.scTimetable.find({}, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/showTTadmin.ejs', {
          items: items
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

app.get("/user", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    {
      if (req.query.a == "student") {
        await detailModel.find({
          course: {
            $ne: "none"
          }
        }, (err, items) => {
          if (err) {
            console.log(err);
          } else {
            res.render(__dirname + '/html/user.ejs', {
              items: items
            });
          }
        });
      }
      if (req.query.a == "teacher") {
        await teacherModel.find({}, (err, data) => {
          if (err) {
            console.log(err);
          } else {
            res.render(__dirname + '/html/showallteachers.ejs', {
              data: data
            });
          }
        });
      }
    }
  }
});

app.get("/registerTeacher", function(req, res) {
  res.sendFile(__dirname + "/html/teacher-reg.html");
});

//search
app.get('/search', (req, res) => {
  try {
    teacherModel.find({
      $or: [{
        first_name: {
          '$regex': req.query.dsearch
        }
      }, {
        teacherId: {
          '$regex': req.query.dsearch
        }
      }]
    }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/teacherlist.ejs', {
          data: data
        });
      }
    })
  } catch (error) {
    console.log(error);
  }
});

app.get('/usearch', (req, res) => {
  try {
    detailModel.find({
      $or: [{
        first_name: {
          '$regex': req.query.dsearch
        }
      }, {
        roll_no: {
          '$regex': req.query.dsearch
        }
      }]
    }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/userlist.ejs', {
          items: items
        });
      }
    })
  } catch (error) {
    console.log(error);
  }
});

/////-----------      STUDENT     ----------- /////

// Load edit profile page
app.get("/editprof", function(req, res) {
  try {
    detailModel.findOne({
        email: req.session.email
    }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/update-stu.ejs', {
          items: items
        });
      }
    });
  } catch (error) {
    console.log(error);
  }
  // if (req.session.email) {
  //   res.render(__dirname + "/html/update-stu.ejs");
  // } else {
  //   res.render(__dirname + "/html/login.ejs", {
  //     error: "Login First"
  //   });
  // }
});

// Update student profile records
app.post("/editprof", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    console.log(req.body.fname);
   await detailModel.updateOne({
      email: req.session.email
    }, {
      $set: {
        first_name: req.body.fname,
        last_name: req.body.lname,
        prtname: req.body.pname,
        address: req.body.address,
        phone: req.body.phn,
        city: req.body.city
      }
    });
    console.log("1 Document updated...");
    await detailModel.findOne({
      email: req.session.email
    }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/update-stu.ejs', {
          items: items
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login first"
    });
  }
});

app.get("/online-exam", function(req, res) {
  if (req.session.email) {
    res.redirect("https://web.papershala.com/login/user");
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

//// edit Password from profile
app.post("/editpassword", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    var sss = await detailModel.updateOne({
      email: req.session.email
    }, {
      $set: {
        password: req.body.password
      }
    });
    console.log("password changed");
    res.redirect('stuprof');
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

app.get("/studymaterial", function(req, res) {
  initiateMongoServer();
  if (req.session.email) {
    studyModel.find({}, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/st-study.ejs', {
          items: items
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

var file;

app.get("/bt_click", function(req, res) {
  initiateMongoServer();
  var filepath;
  var filename;
  studyModel.findOne({
    topic: req.query.filename
  }, function(err, data) {
    const arr = new Uint8Array(data.file.buffer);
    console.log(data.type);
    if (data.type == "image") {
      filename = data.topic + ".jpg";
    } else {
      filename = data.topic + ".pdf";
    }
    filepath = __dirname + "/download/" + filename;
    fs.writeFileSync(filepath, arr);
    file = path.join(__dirname + "/download/" + filename);
    res.download(file);
  });
});

/////    Show Time Table    /////
app.get('/seett', async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    var dmr=await detailModel.findOne({
      email: req.session.email
    });
    var current = new Date();
    var tt = await models.scTimetable.find({
      $and: [{
          year: {
            $gte: current.getFullYear()
          }
        }, {
          month: {
            $gte: current.getMonth() + 1
          }
        },{
          batchId:dmr.batch
        } //,
        //    {
        ////    date: {
        //    $gte: current.getDate()
        //  }
        //  }
      ]
    }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/showTimeTable.ejs', {
          items: items
        });
      }
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

/////       Join Meeting           /////
app.get("/joinmeeting", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    var psi; 
    var actor;
    var dmr=await detailModel.findOne({
      email: req.session.email
    });
    var current = new Date();
    if (dmr== null) {
      actor = "teacher";
      var rpg=await teacherModel.findOne({
        email: req.session.email
      });
      var dmrs=await models.scTBatch.find({
        teacherId:rpg.teacherId
      },{
        _id:0,batchId:1
      });
      var array=[];
      var i=0;
      for (const element of dmrs) {
        array[i]=element.batchId;
        i=i+1;
      }
      await models.scTimetable.find({
        $and: [{
            year: {
              $gte: current.getFullYear()
            }
          }, {
            month: {
              $gte: current.getMonth() + 1
            }
          },{
            batchId:{
              $in:array
            }
          } ,
          //  {
          ///  date: {
          //    $gte: current.getDate()
          //  }
          //  },
          {
            desc: "Online Class"
          }
        ]
      }, (err, items) => {
        if (err) {
          console.log(err);
        } else {
          console.log(items)
          res.render(__dirname + '/html/joinmeeting.ejs', {
            items: items,
            actor: actor
          });
        }
      });

    }
    else{
      psi=dmr.batch;
      actor= "student";
      await models.scTimetable.find({
        $and: [{
            year: {
              $gte: current.getFullYear()
            }
          }, {
            month: {
              $gte: current.getMonth() + 1
            }
          },{
            batchId:psi
          } ,
          //  {
          ///  date: {
          //    $gte: current.getDate()
          //  }
          //  },
          {
            desc: "Online Class"
          }
        ]
      }, (err, items) => {
        if (err) {
          console.log(err);
        } else {
          res.render(__dirname + '/html/joinmeeting.ejs', {
            items: items,
            actor: actor
          });
        }
      });
    }

    
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

app.get("/joinmeetingid", async (req, res) => {
  initiateMongoServer();
  var url = await meetingModel.findOne({
    zoom_id: parseInt(req.query.index)
  }, {
    _id: 0,
    user_url: 1,
    host_url: 1
  });
  if (req.query.actor = "student") {
    res.redirect(url.user_url);
  } else {
    res.redirect(url.host_url);
  }
});

/////       Ask Doubt              /////

app.get("/doubtsTable", async (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    var off = await detailModel.findOne({
      email: req.session.email
    });
    models.scDoubt.find({
      rollno: off.roll_no
    }, (err, items) => {
      if (err) {
        console.log(err);
      } else {
        res.render(__dirname + '/html/doubtsTable.ejs', {
          items: items
        });
      }
    });
  }

});

app.post("/askdoubt", upload.single('image'), async (req, res, next) => {
  initiateMongoServer();
  var obj;
  var current = new Date();
  var ghg = await detailModel.findOne({
    email: req.session.email
  }, {
    _id: 0,
    roll_no: 1,
    batch: 1
  });
  if (!req.file) {
    obj = {
      subject: req.body.subject,
      topic: req.body.topic,
      question: req.body.question,
      rollno: ghg.roll_no,
      batch: ghg.batch,
      createdAt: convert(current).slice(0, 10),
      status: 1
    }
  } else {
    console.log("file is selected");
    obj = {
      subject: req.body.subject,
      topic: req.body.topic,
      question: req.body.question,
      rollno: ghg.roll_no,
      batch: ghg.batch,
      createdAt: convert(current).slice(0, 10),
      qImage: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      status: 2
    }
  }
  models.scDoubt.create(obj, async (err, item) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Asked");
      if (req.file) {
        fs.unlink(__dirname + '/uploads/' + req.file.filename, function(err) {
          if (err) return console.log(err);
          console.log('Internal file deleted successfully');
        });
      }
    }
  });
});

app.get("/showans", async (req, res) => {
  initiateMongoServer();
  var items = await models.scDoubt.findOne({
    code: req.query.i
  });
  var itemss = await models.scAnswer.findOne({
    code: req.query.i
  });
  await res.render(__dirname + "/html/showanswer.ejs", {
    items: items,
    itemss: itemss
  })
});

/////       Feedback Student       /////
app.post("/feedback-update", (req, res) => {
  initiateMongoServer();
  if (req.session.email) {
    models.scFeedback.create({
      subject: req.body.subject,
      comment: req.body.comment
    });
  } else {
    res.render(__dirname + "/html/login.ejs", {
      error: "Login First"
    });
  }
});

///////--------- TEACHER---------///////


// Teacher registration
app.post("/teacher-form", upload.single('pic'), async (req, res, next) => {
  initiateMongoServer();
  const tc = teacherModel.findOne({ //Check if eamil exist
    email: req.body.email
  }, {
    _id: 0,
    first_name: 1
  });
  if (tc != null) {
    if (res) {
      var current = new Date();
      var year = current.getFullYear() - 2000;
      var course = 2;
      if (req.body.course == "1 Year Course") {
        course = 1;
      }
      var zzz = await visitModel.findOne({
        _id: site
      }, {
        _id: 0,
        employee: 1
      });
      var tid = course * 10000 + year * 100 + zzz.employee + 1;
      console.log(tid);
      var obj = {
        teacherId: tid,
        first_name: req.body.fname,
        last_name: req.body.lname,
        email: req.body.email,
        password: req.body.pwd,
        phone: req.body.phno,
        subject: req.body.sub,
        qualif: req.body.qualif,
        course: req.body.course,
        img_pic: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename))
      }
    }
    teacherModel.create(obj, async (err, item) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Teacher Registered");
        await visitModel.updateOne({
          _id: site
        }, {
          $inc: {
            employee: 1
          }
        });
        fs.unlink(__dirname + '/uploads/' + req.file.filename, function(err) {
          if (err) return console.log(err);
          console.log('Internal file deleted successfully');
        });
        res.sendFile(__dirname + "/html/index.html");
      }
    });
  } else {
    console.log("Email already exists." + req.body.email);
    console.log(tc);
  }
});


// teacher pwd change
app.post("/tpwdchng", async (req, res) => {
  initiateMongoServer();
  const dd3 = await teacherModel.updateOne({
    _id: dd2._id
  }, {
    $set: {
      password: req.body.password
    }
  });
  res.sendFile(__dirname + "/html/login.html");
});

app.get("/tUnanswered", async (req, res) => {
  initiateMongoServer();
  var dfd = await teacherModel.findOne({
    email: req.session.email
  });
  var ded=await models.scTBatch.find({
    teacherId:dfd.teacherId
  },{
    _id:0,batchId:1
  });
  var array=[];
      var i=0;
      for (const element of ded) {
        array[i]=element.batchId;
        i=i+1;
      }
      console.log(array);
  models.scDoubt.find({
    batch: {
      $in:array
    },
    subject: dfd.subject
  }, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      res.render(__dirname + '/html/tDoubtAnswered.ejs', {
        items: items
      });
    }
  });
});

app.get("/answerdoubt", async (req, res) => {
  initiateMongoServer();
  var itemss = "";
  var items = await models.scDoubt.findOne({
    _id: req.query.i
  });
  if (items.status == 3) {
    itemss = await models.scAnswer.findOne({
      code: items.code
    })
  }
  await res.render(__dirname + '/html/ansdoubtpage.ejs', {
    items: items,
    itemss: itemss
  });
});

app.post("/answer", upload.single('aImage'), async (req, res, next) => {
  initiateMongoServer();
  var obj;
  var code = otpGenerator.generate(8, {
    alphabets: false,
    specialChars: false,
    upperCase: false
  });
  var current = new Date();
  if (!req.file) {
    obj = {
      answer: req.body.answer,
      code: code,
      createdAt: convert(current).slice(0, 10),
      status: 1
    }
    await models.scDoubt.updateOne({
      _id: req.body.id
    }, {
      $set: {
        code: code,
        status: 3
      }
    });

  } else {
    console.log("file is selected");
    obj = {
      answer: req.body.answer,
      code: code,
      createdAt: convert(current).slice(0, 10),
      aImage: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      status: 2
    }
    await models.scDoubt.updateOne({
      _id: req.body.id
    }, {
      $set: {
        status: 3,
        code: code
      }
    });
  }
  models.scAnswer.create(obj, async (err, item) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Answered");
      if (req.file) {
        fs.unlink(__dirname + '/uploads/' + req.file.filename, function(err) {
          if (err) return console.log(err);
          console.log('Internal file deleted successfully');
        });
      }
    }
  });
});

app.post("/editanswer", upload.single('aImage'), async (req, res, next) => {
  initiateMongoServer();
  var obj;
  var current = new Date();
  if (!req.file) {
    obj = {
      answer: req.body.answer,
      createdAt: convert(current).slice(0, 10),
      status: 1
    }
    await models.scDoubt.updateOne({
      _id: req.body.id
    }, {
      $set: {
        status: 3
      }
    });
  } else {
    console.log("file is selected");
    obj = {
      answer: req.body.answer,
      createdAt: convert(current).slice(0, 10),
      aImage: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
      status: 2
    }
    await models.scDoubt.updateOne({
      _id: req.body.id
    }, {
      $set: {
        status: 3,
      }
    });
  }
  models.scAnswer.updateOne({
    _id: req.body.id
  }, obj, async (err, item) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Edited");
      if (req.file) {
        fs.unlink(__dirname + '/uploads/' + req.file.filename, function(err) {
          if (err) return console.log(err);
          console.log('Internal file deleted successfully');
        });
      }
    }
  });
});

app.post("/ansbycode", async (req, res) => {
  initiateMongoServer();
  var ans = await models.scDoubt.findOne({
    code: req.body.code
  });
  await models.scDoubt.updateOne({
    _id: req.body.id
  }, {
    $set: {
      code: req.body.code,
      status: 3
    }
  });
});

app.get("/downloadquesimage", async (req, res) => {
  initiateMongoServer();
  var filepath;
  var filename;
  models.scDoubt.findOne({
    _id: req.query.i
  }, function(err, data) {
    const arr = new Uint8Array(data.qImage.buffer);
    filename = "question_image.jpg";
    filepath = __dirname + "/download/" + filename;
    fs.writeFileSync(filepath, arr);
    file = path.join(__dirname + "/download/" + filename);
    res.download(file);
  });
});

app.get("/downloadansimage", async (req, res) => {
  initiateMongoServer();
  var filepath;
  var filename;
  models.scAnswer.findOne({
    _id: req.query.i
  }, function(err, data) {
    const arr = new Uint8Array(data.aImage.buffer);
    filename = "answer_image.jpg";
    filepath = __dirname + "/download/" + filename;
    fs.writeFileSync(filepath, arr);
    file = path.join(__dirname + "/download/" + filename);
    res.download(file);
  });
});

app.get("/logout", function(req, res) {
  console.log(req.session.email);
  req.session.destroy();
  res.redirect('/login');
});


//Server(heroku)
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started sucessfully");
});
