/* ===== IMPORTS ===== */
var express = require('express'),
  app = express(),
  router = express.Router(),
  server = require('http').createServer(app),
  swig = require('swig'),
  mongoose = require('mongoose');

app.engine('html', swig.renderFile);
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

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
app.get('/', function(req, res) {
  res.render('application');
});

app.get('/admin', function(req, res) {

});

/* ===== START THE SERVER ===== */
server.listen(port);
