var express = require('express');
var router = express.Router();
var crypto = require('crypto'); // to create hashes
var nodemailer = require('nodemailer');
var request = require('request-promise'); // api request


var adminEmail = 'jaetest94@gmail.com'

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: adminEmail,
    pass: 'jaetest94!'
  }
});
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

  console.log('Verification processing..');
  // assign internal DB variable
  var db = req.db;
  // TODO : Get the user name from the user's authentication. (Currently receiving from uesr input)
  var userName = req.body.username;
  var userEmail = req.body.useremail;
  var userHash = req.body.userhash; // get this from database



  var isHash = new RegExp(userHash,'g'); // find a string that has this hash
  var isUser = new RegExp(userName,'g');
  var hasRepo = false;

  var collection = db.get('usercollection');


  request({
    "method":"GET",
    "uri":'https://api.github.com/users/'+userName+'/repos?sort=created',
    "json": true,
    "headers":{
      "User-Agent": "node.js"
    }
  }).then(function(data){
    return data;
  }).filter(function(data){
    console.log('this is null ' + data);
    return data.name.match(isHash);
  }).then(function(data){
    // repository not exist
        if(data[0]==undefined){
          res.send('Error : Repository ' + userHash + ' does not exist');
        }
    var repoOwner = data[0].owner.login;
    var hasRepo = isUser.test(repoOwner);
    return hasRepo;
  }).then(function(hasRepo){
        // updating database
        collection.insert({
          "username" : userName,
          "email" : userEmail,
          "hash" : userHash,
          "isVerified" : hasRepo
        }, function(err, doc){
          if(err){
            res.send("Error : " + err);     // debug message
          }
          else{
            // Added
            res.send('Successful : Github ID ' + userName + ' is integrated to ' + userEmail );
          }
      });
  }).catch(function(err){
    console.log('error code : '+err.statusCode);
    console.log(err);
    if(err.statusCode==404){
      res.send('Github username "'+userName + '" does not exist');
    }else{
      res.send('Error : Unable to verify Github user : ' + userName);
    }
  });
});


module.exports = router;
