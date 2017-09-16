var express = require('express');
var router = express.Router();
var crypto = require('crypto'); // to create hashes
var nodemailer = require('nodemailer');

var adminEmail = 'jaetest94@gmail.com'

// main page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Indorse - Github verification page' });
});


router.get('/userlist', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({},{},function(e,docs){
      res.render('userlist',{
        "userlist" : docs
      });
    });
});

// write : add new user
// TODO : this part should be connected with the indorse account.
// so once a user enter this page, all user need to do is adding the github-account
router.get('/newuser', function(req, res){
  res.render('newuser', { title: 'Add new user '});
});

// POST to add user service
router.post('/adduser', function(req, res){
  // assign internal DB variable
  var db = req.db;

  var userName = req.body.username;
  var userEmail = req.body.useremail;
  // every time user make an input, a unique hash will be created and stored in a database.
  var userHash = crypto.createHash('md5').update(userEmail).digest('hex');

  var collection = db.get('usercollection');

  var mailOptions = {
    from: adminEmail,
    to: userEmail,
    subject: 'Instruction : Github verification',
    html: '<h1> Are you ' + userName + ' ? </h1>' +
    '<p> To claim your github repository, please create a repository name with   ' +
    userHash +
    '<br> <p> After creating the repository, please cick verified button to complete verification </p>'
  };

  collection.insert({
    "username" : userName,
    "email" : userEmail,
    "hash" : userHash

  }, function(err, doc){
    if(err){
      res.send("Error : Unable to add the user email");
    }
    else{
      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
  }
});
      // direct to userlist page
      res.redirect("userlist");
    }
  });

});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: adminEmail,
    pass: 'jaetest94!'
  }
});



module.exports = router;
