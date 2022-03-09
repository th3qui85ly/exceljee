var error = 0;
var count = 0;
var OTP = '';
$(document).ready(function() {
  var current_fs, next_fs, previous_fs; //fieldsets
  var opacity;

  $(".next").click(function() {
    error = 0;
    if (count == 0) {
      error = 0;
      validation();
      if (error != 0) {
        count = 0;
      }
    }
    if (count == 3) {
      var email = document.getElementsByName("email");
      generateOTP();
      $.ajax({
        url: '/verifyOtp',
        type: 'POST',
        cache: false,
        data: {
          email: email[0].value,
          otp: OTP
        },
        success: function(data) {}
      });
      count = count + 1;
    }  else if (count == 4) {
      error = 0
      var otp = document.getElementsByName("otp");
      if (parseInt(OTP) == parseInt(otp[0].value)) {
        count = count + 1
      } else {
        error = error + 1
        alert("Invalid OTP")
      }
    } else if (count == 5) {
      error = 0;
      validateDetails();
      console.log(count);
      if (error != 0) {
        count = 5;
      }
    } else if (count == 9) {
      console.log("in");
      $("#msform")[0].submit();
      count = count + 1;
    }
    if (error == 0) {
      current_fs = $(this).parent();
      next_fs = $(this).parent().next();


      //Add Class Active
      $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

      //show the next fieldset
      next_fs.show();
      //hide the current fieldset with style
      current_fs.animate({
        opacity: 0
      }, {
        step: function(now) {
          // for making fielset appear animation
          opacity = 1 - now;

          current_fs.css({
            'display': 'none',
            'position': 'relative'
          });
          next_fs.css({
            'opacity': opacity
          });
        },
        duration: 600
      });
    }
  });

  $(".previous").click(function() {

    current_fs = $(this).parent();
    previous_fs = $(this).parent().prev();

    //Remove class active
    $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

    //show the previous fieldset
    previous_fs.show();

    //hide the current fieldset with style
    current_fs.animate({
      opacity: 0
    }, {
      step: function(now) {
        // for making fielset appear animation
        opacity = 1 - now;

        current_fs.css({
          'display': 'none',
          'position': 'relative'
        });
        previous_fs.css({
          'opacity': opacity
        });
      },
      duration: 600
    });
  });

  $('.radio-group .radio').click(function() {
    $(this).parent().find('.radio').removeClass('selected');
    $(this).addClass('selected');
  });
});

function validation() {
  error = 0;
  count = 0;
  var fn = document.getElementsByName("fname");
  var ln = document.getElementsByName("lname");
  var email = document.getElementsByName("email");
  allLetter(fn[0].value, "First Name");
  allLetter(ln[0].value, "Last Name");
  ValidateEmail(email[0].value);

}

function allLetter(inputtxt, s) {
  var letters = /^[A-Za-z]+$/;
  if (inputtxt.match(letters)) {
    count = count + 1;
  } else {
    error = error + 1;
    alert("Invalid " + s);
  }
}

function allLettername(inputtxt, s) {
  var letters = /^[A-Za-z ]+$/;
  if (inputtxt.match(letters)) {
    count = count + 1;
  } else {
    error = error + 1;
    alert("Invalid " + s);
  }
}

function ValidateEmail(mail) {
  if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(mail)) {
    count = count + 1;
  } else {
    error = error + 1;
    alert("You have entered an invalid email address!");
  }
}

function validateDetails() {
  error = 0;
  var pname = document.getElementsByName("pname");
  var city = document.getElementsByName("city");
  var state = document.getElementsByName("state");
  var phno = document.getElementsByName("phno");
  allLettername(pname[0].value, "Parent's Name");
  allLetter(city[0].value, "City");
  allLettername(state[0].value, "State");
  phoneNum(parseInt(phno[0].value), "Phone Number");
}

function phoneNum(n, s) {

  if (n > 1000000000) {
    count = count + 1;
  } else {
    error = error + 1;
    alert("Invalid " + s)
  }
}

function generateOTP() {
  OTP = "";
  var digits = '0123456789';
  for (let i = 0; i < 6; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  console.log(OTP);
}

/*
function CheckPassword(inputtxt) {
  count = 3;
  var decimal = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/;
  if (inputtxt.match(decimal)) {
    count = count + 1;
  } else {
    error = error + 1;
    alert('INVALID PASSWORD\nPassword between 8 to 15 character\nOne lowercase letter\nOne uppercase letter\nOne numeric digit \nAnd one special character')
  }
}

function confirmppwd(p,cp){
  if(p==cp){
    count=count+1;
  }else{
    error=error+1;
    alert("Password doesn't match with Confirm Password");
  }
}*/
