/* ===== IMPORTS ===== */
var express = require('express'),
  app = express(),
  server = require('http').createServer(app),
  mongoose = require('mongoose');

app.configure(function() {
  app.use(express.static('public'));
  app.use(express.cookieParser());
  app.set('views', __dirname + '/views');
  app.set('view engine', 'html');
  app.use(express.bodyParser());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(flash())
  app.use(app.router);
});

/* ===== GLOBALS ===== */
var port = Number(process.env.PORT || 8000),
    uristring = (process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/applications');

/* ===== MONGODB ===== */
mongoose.connect(uristring, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
    console.log ('Succeeded connected to: ' + uristring);
  }
});

var Application = mongoose.model('Application', {
  firstname: String,
  lastname: String,
  email: String,
  gender: String,
});

/* ===== ROUTES ===== */
app.post('/save', function(res, req) {

});

/* ===== VIEWS ===== */
app.get('/', function(res, req) {
  res.render('application');
});

app.get('/admin', function(res, req) {

});

/* ===== START THE SERVER ===== */
server.listen(port);
