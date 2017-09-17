var express = require('express');
var router = express.Router();
var crypto = require('crypto'); // to create hashes
var nodemailer = require('nodemailer');
var request = require('request-promise'); // api request
var adminEmail = 'jaetest94@gmail.com'
var transporter = nodemailer.createTransport({ // transporter = email sender
  service: 'gmail',
  auth: {
    user: adminEmail,
    pass: 'jaetest94!' //password
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

router.get('/newuser', function(req, res){
  res.render('newuser', { title: 'Add new user '});
});

router.get('/verification', function(req, res){
  res.render('verification', { title: 'Verify new user '});
});



// Step 1 - Generate a hash-value, and email to a user
// TODO : this part should be connected with the indorse account.
// Once a user enter this page, all user need to do is adding the github-account
// Input : username(Github username) / useremail (email that is connected to indorse account)
// Output : 1. Sending an email to useremail with hash-value
//          2. Write username, useremail, userhash in the database
router.post('/adduser', function(req, res){

  var db = req.db; // assign internal DB variable
  var userName = req.body.username;
  var userEmail = req.body.useremail;
  // Every time user make an input, a unique hash will be created and stored in a database.
  // Hash collision is not a problem in this case.
  var userHash = crypto.createHash('md5').update(userEmail).digest('hex');
  var collection = db.get('usercollection'); // Table name : 'usercollection'

  // email context
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

  // write into database
  collection.insert({
    "username" : userName,
    "email" : userEmail,
    "hash" : userHash
  }, function(err, doc){
    if(err){
      res.send("Error : Unable to add the user email / erorr : " + err);     // debug message

    }
    else{
      // sending an email to the user with hash value
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

// TODO : Get the user name from the user's authentication. (Currently receiving from uesr input)
// Step 2 - Verify if a user has right to create a repository that he claimed
// Input : username , userhash (useremail is dummy data for this post request)
// Output : 4 types 1. successfully verified
//                  2. username does not exist
//                  3. hash value repository does not exist in the username
//                  4. error
router.post('/addVerification', function(req, res){

  console.log('Verification processing..');
  var db = req.db;   // assign internal DB variable
  var userName = req.body.username;
  var userEmail = req.body.useremail;
  var userHash = req.body.userhash;

  var isHash = new RegExp(userHash,'g'); // find a string matches with userhash
  var isUser = new RegExp(userName,'g'); // find a string matches with username
  var hasRepo = false; // If a user has hash value repository, this variable will be true. Defalt vallue is false

  var collection = db.get('usercollection');

  // Asynchrnous and sequential function
  // Getting the Github user's information from Github's API
  // Then, filter the repository name with the hash-value
  // Then, check if the repo owner's username matches with the username
  // Then, update the database that the user owns that Github repository
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
    return data.name.match(isHash);
  }).then(function(data){
        // If hash-value named repository not exist
        if(data[0]==undefined){
          res.send('Error : Repository ' + userHash + ' does not exist');
        }
    var repoOwner = data[0].owner.login;
    var hasRepo = isUser.test(repoOwner);
    return hasRepo;
  }).then(function(hasRepo){
        // updating database - This part should be updated
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
    console.log(err); // print error
    if(err.statusCode==404){
      res.send('Github username "'+userName + '" does not exist');
    }else{
      res.send('Error : Unable to verify Github user : ' + userName);
    }
  });
});


module.exports = router;
