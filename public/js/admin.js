function deletePost(id) {
  $.ajax({
    url: '/' + id,
    type: 'DELETE',
    success: function(result) {
      window.location.replace('/admin');
    }
  });
}
