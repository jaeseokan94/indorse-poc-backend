var express = require('express');
var router = express.Router();
var crypto = require('crypto'); // to create hashes
var nodemailer = require('nodemailer');
var request = require('request-promise'); // api request


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

  // TODO : Get the user name from the user's authentication. (Currently receiving from uesr input)
  var userName = req.body.username;
  var userEmail = req.body.useremail;
  var userHash = 'cb71bc305bfde6f67af6ee1959e67d54'; // get this from database
  var isVerified = '';
  var api = GithubRepo(userName);

/*
  request(api,function(error, response, body){
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body)
      console.log(info);
      console.log('Getting a request from ' + api);
    }else{
      console.log(error);
      console.log('response status code : '+response.statusCode);
    }

  })*/
// TODO : working in progress
var github = {

  checkHash: function(repo,hash){
    return repo.includes(hash);
  },

  getUserRepos: function(userId,hash){
    return request({
      "method":"GET",
      "uri": 'https://api.github.com/users/'+userId+'/repos?sort=created',
      "json": true,
      "headers": {
        "User-Agent": "node.js"
      }
    });
  }

}

function main(userId,hash){
  console.log('aaa');
    return github.getUserRepos(userId,hash).then(checkHash);
}
console.log('check');

main(userName,userHash);


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
    "hash" : userHash,
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

// This method checks if hash exist , this method could be used to verify user's social media account using REST API
// Verification need to be done before proceeding to the verification confirmed page.
// Input
// userId - social media ID
// hash - hash code that user would like to Verify
// source - source that user would like to verify eg) github, linkedIn etc
// Output
// True or False
function RequestAPI(api) {
  var body = request('GET',api);

  var body = request(api,function(error, response, body){
    if (!error && response.statusCode == 200) {
      var info = JSON.parse(body)
      console.log(info);
    }

  })

}
// API need to be returned before calling RequestAPI function
// Input
// userId - github username
// Output
// API
function GithubRepo(userId){
    // sort value = created day, since hash named repository is likely to be created most recently, it is more effecient in checking if hash value exist from the result JSON
    return results = 'https://api.github.com/users/'+userId+'/repos?sort=created';
}

module.exports = router;
