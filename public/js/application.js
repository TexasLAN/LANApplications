$("#application").submit(function( event ) {
  var elems = [$("#fname"), $("#lname"), $("#email"), $("#q1"), $("#q2"), $("#q3"), $("#q4"), $("#q5"), $("#q6")];
  var valid = true;
  elems.forEach(function(elem) {
    elem.parent().removeClass("has-error");
    if (elem.val() === "") {
      valid = false;
      elem.parent().addClass("has-error");
    }
  });
  if(!valid) {
    alert("All form fields are required for submission");
    event.preventDefault();
  }

  var boxes = [$("#q1"), $("#q2"), $("#q3"), $("#q4"), $("#q5"), $("#q6")];
  var length = true;
  boxes.forEach(function(box) {
    if (box.val().length > 1024) {
      length = false;
      box.parent().addClass("has-error");
    }
  });
  if(!length) {
    alert("One or more of your open responses are too long");
    event.preventDefault();
  }

  if(valid && length) {
    elems.forEach(function(elem) {
      elem.garlic('destroy');
    });
    $("#gender").garlic('destroy');
    $("#year").garlic('destroy');
  }
});

var boxes = [$("#q1"), $("#q2"), $("#q3"), $("#q4"), $("#q5"), $("#q6")];
boxes.forEach(function(box) {
  box.keyup(function() {
    if (box.val().length > 1024) {
      box.parent().addClass("has-error");
    } else {
      box.parent().removeClass("has-error");
    }
  });
});
