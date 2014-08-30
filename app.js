/* ===== IMPORTS ===== */
var express = require('express'),
  app = express(),
  router = express.Router(),
  server = require('http').createServer(app),
  bodyParser = require('body-parser'),
  swig = require('swig'),
  mongoose = require('mongoose');

app.engine('html', swig.renderFile);
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
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
  gender: String,
  email: String,
  question1: String
});

var Review = mongoose.model('Review', {
  reviewer: String,
  application: String,
  comments: String,
  weight: Number
});

/* ===== ROUTES ===== */
app.post('/save', function(req, res) {
  var application = new Application({
    firstname: req.body.fname,
    lastname: req.body.lname,
    gender: req.body.gender,
    email: req.body.email,
    question1: req.body.q1
  });
  application.save(function (err) {
    if (err)
      console.log(err);
  });
});

app.post('/review/:id/save', function(req, res) {
  var review = new Review({
    reviewer: req.session.reviewer,
    application: req.params.id,
    comments: req.body.comments,
    weight: req.body.weight
  });
  review.save(function (err) {
    if (err)
      console.log(err);
  });
});

/* ===== VIEWS ===== */
app.get('/', function(req, res) {
  res.render('application');
});

app.get('/review', function(req, res) {
  Application.find({}, function(err, applications) {
    res.render('reviewlist', { applications: applications });
  });
});

app.get('/review/:id', function(req, res) {
  Application.findOne({ _id: req.params.id }, function(err, application) {
    res.render('reviewapplication', { application: application });
  });
});

app.get('/admin', function(req, res) {
  Application.find({}, function(err, applications) {
    res.render('adminlist', { applications: applications });
  });
});

app.get('/admin/:id', function(req, res) {
  Application.findOne({ _id: req.params.id }, function(err, application) {
    res.render('adminapplication', { application: application });
  });
});

/* ===== START THE SERVER ===== */
server.listen(port);
console.log('Node server started on port ' + port);
