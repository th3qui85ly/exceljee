'use strict';

$(function() {
  $("input[type='password'][data-eye]").each(function(i) {
    var $this = $(this),
      id = 'eye-password-' + i,
      el = $('#' + id);

    $this.wrap($("<div/>", {
      style: 'position:relative',
      id: id
    }));

    $this.css({
      paddingRight: 60
    });
    $this.after($("<div/>", {
      html: 'Show',
      class: 'btn btn-primary btn-sm',
      id: 'passeye-toggle-' + i,
    }).css({
      position: 'absolute',
      right: 10,
      top: ($this.outerHeight() / 2) - 12,
      padding: '2px 7px',
      fontSize: 12,
      cursor: 'pointer',
    }));

    $this.after($("<input/>", {
      type: 'hidden',
      id: 'passeye-' + i
    }));

    var invalid_feedback = $this.parent().parent().find('.invalid-feedback');

    if (invalid_feedback.length) {
      $this.after(invalid_feedback.clone());
    }

    $this.on("keyup paste", function() {
      $("#passeye-" + i).val($(this).val());
    });
    $("#passeye-toggle-" + i).on("click", function() {
      if ($this.hasClass("show")) {
        $this.attr('type', 'password');
        $this.removeClass("show");
        $(this).removeClass("btn-outline-primary");
      } else {
        $this.attr('type', 'text');
        $this.val($("#passeye-" + i).val());
        $this.addClass("show");
        $(this).addClass("btn-outline-primary");
      }
    });
  });

  $(".my-login-validation").submit(function() {
    var form = $(this);
    if (form[0].checkValidity() === false) {
      event.preventDefault();
      event.stopPropagation();
    }
    form.addClass('was-validated');
  });
});
var c=0;

function showDiv() {
    c=c+1;
    if(c==1 && document.getElementById('email').value!=""){
   document.getElementById('myDiv').style.display = "block";
 }
}

/* $('#myButton').click(function() {
    c=c+1;
    console.log(c);
    var f=document.getElementsByName("fg_email");
  if(c==1){
    $('#myDiv').toggle('slow', function() {});
}});*/
