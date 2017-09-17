var express = require('express');
var router = express.Router();
var crypto = require('crypto'); // to create hashes
var nodemailer = require('nodemailer');
var request = require('request'); // api request

var adminEmail = 'jaetest94@gmail.com'

// main page
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Indorse - Github verification page' });
});

// this page shows the list of users
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
    subject: 'Confirm your Github integration',
    html: '<h1> Are you ' + userName + ' ? </h1>' +
    '<p> To link your Github repository, please create a repository name with   ' +
    userHash +
    '<br> <p> After creating the repository, please click '+'Confirm'+
    ' to complete verification </p>'
  };

  collection.insert({
    "username" : userName,
    "email" : userEmail,
    "hash" : userHash

  }, function(err, doc){
    if(err){
      res.send("Error : Unable to add the user email / erorr : " + err);     // debug message

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



router.get('/verification', function(req, res){
  res.render('verification', { title: 'Verify new user '});
});

router.post('/addVerification', function(req, res){
  // assign internal DB variable
  var db = req.db;

  var userName = req.body.username;
  // every time user make an input, a unique hash will be created and stored in a database.
  var userHash = crypto.createHash('md5').update(userEmail).digest('hex');

  var collection = db.get('usercollection');

  var mailOptions = {
    from: adminEmail,
    to: userEmail,
    subject: 'Confirm your Github integration',
    html: '<h1> Are you ' + userName + ' ? </h1>' +
    '<p> To link your Github repository, please create a repository name with   ' +
    userHash +
    '<br> <p> After creating the repository, please click '+'Confirm'+
    ' to complete verification </p>'
  };

  collection.insert({
    "username" : userName,
    "email" : userEmail,
    "hash" : userHash
    "isVerified" : isVerified

  }, function(err, doc){
    if(err){
      res.send("Error : Unable to add the user email / erorr : " + err);     // debug message

    }
    else{
      transporter.sendMail(mailOptions, function(error, info){
          if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
  }
});

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: adminEmail,
    pass: 'jaetest94!'
  }
});

// This method checks if hash exist
// Input
// userId - Indorse ID
// hash - hash code that user would like to Verify
// source - source that user would like to verify eg) github, linkedIn etc
// Output
// True or False
function isHashExist(userId, hash, source) {

  request('',function(error, response, body){
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body)
      
    }

  })

}

module.exports = router;
