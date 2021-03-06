/* ===== IMPORTS ===== */
var express = require('express'),
  app = express(),
  router = express.Router(),
  server = require('http').createServer(app),
  bodyParser = require('body-parser'),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  flash = require('connect-flash'),
  swig = require('swig'),
  mongoose = require('mongoose');

app.engine('html', swig.renderFile);
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(session({
  secret: 'bananas',
  resave: true,
  saveUninitialized: true
}));
app.use(flash());
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
  year: String,
  reviewCount: Number, // used for the admin panels
  reviewerIsMe: Boolean, // used for the admin panels
  reviewAverage: Number, // used for the admin panels
  question1: String,
  question2: String,
  question3: String,
  question4: String,
  question5: String,
  question6: String,
  date: { type: Date, default: Date.now },
  rejected: Boolean
});

var Event = mongoose.model('Event', {
  name: String,
  date: { type: Date, default: Date.now }
});

var EventAttendance = mongoose.model('EventAttendance', {
  eventID: String,
  name: String,
  email: String
});

var Review = mongoose.model('Review', {
  reviewer: String,
  reviewerName: String,
  application: String,
  comments: String,
  weight: Number
});

var Reviewer = mongoose.model('Reviewer', {
  name: String,
  isAdmin: Boolean
});

/* ===== ROUTES ===== */

app.post('/save', function(req, res) {
  if (!req.body.fname || !req.body.lname || !req.body.gender ||
      !req.body.email || !req.body.year || !req.body.q1 ||
      !req.body.q2 || !req.body.q3 || !req.body.q4 ||
      !req.body.q5 || !req.body.q6) {
    req.flash('error', 'A required field was missing');
    res.redirect('/');
    return;
  }
  var application = new Application({
    firstname: req.body.fname,
    lastname: req.body.lname,
    gender: req.body.gender,
    email: req.body.email,
    year: req.body.year,
    question1: req.body.q1,
    question2: req.body.q2,
    question3: req.body.q3,
    question4: req.body.q4,
    question5: req.body.q5,
    question6: req.body.q6,
    rejected: false
  });
  application.save(function (err) {
    if (err) {
      console.log(err);
      req.flash('error', 'There was an error saving your application');
      res.redirect('/');
      return;
    }
  });
  req.flash('success', 'Application Submitted Successfully!');
  res.redirect('/');
});

app.post('/event/:id', function(req, res) {
  if (!req.body.email || !req.body.name) {
    res.redirect('/event/' + req.params.id);
    return;
  }
  var attendance = EventAttendance({
    eventID: req.params.id,
    name: req.body.name,
    email: req.body.email.toLowerCase()
  });
  attendance.save(function(err) {
    if (err) {
      console.log(err);
    }
  });
  res.redirect('/event/' + req.params.id);
});

app.post('/review/:id/save', ensureAuthenticated, function(req, res) {
  Review.update({
    reviewer: req.session.reviewer,
    application: req.params.id
  }, {
    reviewerName: req.session.reviewer.name,
    comments: req.body.comments,
    weight: req.body.weight
  }, { upsert: true }, function(err) {
    if (err)
      console.log(err);
  });

  req.flash('success', 'Review submitted successfully');
  res.redirect('/review/' + req.params.id);
});

app.post('/login', function(req, res) {
  Reviewer.findOne({ _id: req.body.reviewer }, function(err, reviewer) {
    if (reviewer) {
      req.session.reviewer = reviewer;
      if (req.session.next) {
        res.redirect(req.session.next);
      } else {
        res.redirect('/review');
      }
    } else {
      res.redirect('/login');
    }
  });
});

app.post('/review/:id/reject', ensureAdmin, function(req, res) {
  Application.update({
    _id: req.params.id
  }, {
    rejected: true
  }, function(err) {
    if (err)
      console.log(err);
  });
  res.end('{"success" : "Rejected Successfully", "status" : 200}');
});

app.post('/review/:id/unreject', ensureAdmin, function(req, res) {
  Application.update({
    _id: req.params.id
  }, {
    rejected: false
  }, function(err) {
    if (err)
      console.log(err);
  });
  res.end('{"success" : "Unrejected Successfully", "status" : 200}');
});

app.delete('/:id', ensureAdmin, function(req, res) {
  Application.remove({ _id: req.params.id }, function (err) {
    if (err) {
      console.log(err);
    }
  });
  Review.remove({ application: req.params.id }, function (err) {
    if (err) {
      console.log(err);
    }
  });
  res.end('{"success" : "Deleted Successfully", "status" : 200}');
});

/* ===== VIEWS ===== */
app.get('/', function(req, res) {
  res.render('application', {
    success: req.flash('success'),
    error: req.flash('error')
  });
});

app.get('/event/:id', function(req, res) {
  Event.findOne({ _id: req.params.id }, function(err, event) {
    if (!event) {
      req.flash('error', 'Event does not exist');
      res.redirect('/');
      return;
    }
    res.render('event', { event: event });
  });
});

app.get('/login', function(req,res) {
  if (req.session.reviewer) {
    res.redirect('/review');
    return;
  }
  res.render('authenticate');
});

app.get('/review', ensureAuthenticated, function(req, res) {
  Application.find({}, function(err, applications) {
    if (applications.length === 0) {
      req.flash('error', 'No applications currently exist');
      res.redirect('/');
      return;
    }
    var completed = 0;
    applications.forEach(function(value, index) {
      Review.find({ application: value._id }, function(err, reviews) {
        value.reviewCount = reviews.length;
        value.reviewAverage = 0;
        completed++;
        reviews.forEach(function(review) {
          value.reviewAverage += review.weight;
          if (review.reviewer === req.session.reviewer._id) {
            value.reviewerIsMe = true;
          }
        });
        value.reviewAverage /= reviews.length;
        if (completed === applications.length) {
          res.render('reviewlist', { applications: applications });
        }
      });
    });
  });
});

app.get('/review/:id', ensureAuthenticated, function(req, res) {
  Application.findOne({ _id: req.params.id }, function(err, application) {
    if (!application) {
      res.redirect('/review');
      return;
    }
    Review.find({ application: req.params.id }, function(err, reviews) {
      var review = null;
      reviews = reviews.filter(function(value) {
        if (value.reviewer === req.session.reviewer._id) {
          review = value;
          return false;
        } else {
          return true;
        }
      });
      EventAttendance.find({
        email: application.email.toLowerCase()
      }, function(err, attendances) {
        if (attendances.length === 0) {
          res.render('reviewapplication', {
            success: req.flash('success'),
            application: application,
            reviews: reviews,
            myReview: review
          });
          return;
        }
        var events = [];
        var completed = 0;
        attendances.forEach(function (attendance) {
          Event.findOne({ _id: attendance.eventID }, function(err, event) {
            events.push(event.name);
            completed++;
            if (completed === attendances.length) {
              res.render('reviewapplication', {
                success: req.flash('success'),
                application: application,
                events: events,
                reviews: reviews,
                myReview: review
              });
            }
          });
        });
      });
    });
  });
});

app.get('/admin', ensureAdmin, function(req, res) {
  Application.find({}, function(err, applications) {
    if (applications.length === 0) {
      req.flash('error', 'No applications currently exist');
      res.redirect('/');
      return;
    }
    var completed = 0;
    applications.forEach(function(value, index) {
      Review.find({ application: value._id }, function(err, reviews) {
        value.reviewCount = reviews.length;
        if (reviews.length > 0) {
          value.reviewAverage = 0;
          reviews.forEach(function(review) {
            value.reviewAverage += review.weight;
          });
          value.reviewAverage /= reviews.length;
        }
        completed++;
        if (completed === applications.length) {
          res.render('adminlist', { applications: applications });
        }
      });
    });
  });
});

app.get('/admin/:id', ensureAdmin, function(req, res) {
  Application.findOne({ _id: req.params.id }, function(err, application) {
    if (!application) {
      res.redirect('/admin');
      return;
    }
    Review.find({ application: application._id }, function(err, reviews) {
      if (reviews.length > 0) {
        application.reviewAverage = 0;
        reviews.forEach(function(review) {
          application.reviewAverage += review.weight;
        });
        application.reviewAverage /= reviews.length;
      }
      EventAttendance.find({
        email: application.email
      }, function(err, attendances) {
        if (attendances.length === 0) {
          res.render('adminapplication', { application: application });
          return;
        }
        var events = [];
        var completed = 0;
        attendances.forEach(function (attendance) {
          Event.findOne({ _id: attendance.eventID }, function(err, event) {
            events.push(event.name);
            completed++;
            if (completed === attendances.length) {
              res.render('adminapplication', {
                application: application,
                events: events
              });
            }
          });
        });
      });
    });
  });
});

/* ===== HELPER FUNCTIONS ===== */
function ensureAuthenticated(req, res, next) {
  if (!req.session.reviewer) {
    req.session.next = req.url;
    res.redirect('/login');
  } else {
    next();
  }
}

function ensureAdmin(req, res, next) {
  if (!req.session.reviewer) {
    req.session.next = req.url;
    res.redirect('/login');
  } else if (!req.session.reviewer.isAdmin) {
    res.redirect('/review');
  } else {
    next();
  }
}

/* ===== START THE SERVER ===== */
server.listen(port);
console.log('Node server started on port ' + port);
