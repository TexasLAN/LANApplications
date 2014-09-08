function deletePost(id) {
  $.ajax({
    url: '/' + id,
    type: 'DELETE',
    success: function(result) {
      window.location.replace('/admin');
    }
  });
}

function rejectPost(id) {
  $.ajax({
    url: '/review/' + id + '/reject',
    type: 'POST',
    success: function(result) {
      console.log("ASDASD");
      window.location.href = window.location.href;
    }
  });
}

function unrejectPost(id) {
  $.ajax({
    url: '/review/' + id + '/unreject',
    type: 'POST',
    success: function(result) {
      window.location.href = window.location.href;
    }
  });
}
