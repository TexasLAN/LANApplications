$("#application").submit(function( event ) {
  var elems = [$("#fname"), $("#lname"), $("#email"), $("#q1")];
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
});
