/*
  TODO: Testing is not automoated - following results are obtained by manually inputting values

  case 1
  username : jaeseokan94 / hashvalue : cb71bc305bfde6f67af6ee1959e67d54
  Expect : Successful
  Result : Successful : Github ID jaeseokan94 is integrated to test@indorse.com

  case 2
  username : indorseio / hashvalue : indorse-poc-backend
  Expect : Successful
  Result : Successful : Github ID indorseio is integrated to test@indorse.com

  case 3
  username : wrongUserNameShouldNotExist / hashvalue : cb71bc305bfde6f67af6ee1959e67d54
  Expect : Username does not exist
  Result : Github username "wrongUserNameShouldNotExist" does not exist

  caes 4
  username :indorseio /  hashvalue : repositoryNameWrong
  Expect : Repository does not exist
  Result : Error : Repository repositoryNameWrong does not exist

  case 5
  username : '' / hashvalue : ''
  Expect : Username does not exist
  Result : Github username "" does not exist
  All 5 cases passed

*/
var assert = require('assert');
var should = require('should');


//var app = require('../routes/index.js');
var request = require('request');


var case1 = {
  uri: 'http://localhost:3000/addVerification',
  form: postData
};

var case2 = {
  uri: 'http://localhost:3000/addVerification',
  form: successfulCase2
};
var case3 = {
  uri: 'http://localhost:3000/addVerification',
  json: wrongUsernameCase
};

var case4 = {
  uri: 'http://localhost:3000/addVerification',
  json: wrongHashrepoCase
};

// this case should success because this repository exist
var successfulCase1 = {
   inputUserName : 'jaeseokan94',
   userEmail : 'test@indorse.com',
   userHash : 'cb71bc305bfde6f67af6ee1959e67d54'
};

// this case should success because this repository exist (https://github.com/indorseio/indorse-poc-backend)
var successfulCase2 = {
   username : 'indorseio',
   useremail : 'test@indorse.com',
   userhash : 'indorse-poc-backend'
};


var wrongUsernameCase = {
   username : 'wrongUserNameShouldNotExist',
   useremail : 'test@indorse.com',
   userhash : 'cb71bc305bfde6f67af6ee1959e67d54'
};

var wrongHashrepoCase = {
  userName : 'indorseio',
  userEmail : 'test@indorse.com',
  userHash : 'repositoryNameWrong'
};


case1Result = function(err, httpResponse, body){
  console.log('Case1');
  console.log(body);
};
case2Result = function(err, httpResponse, body){
  console.log('Case2');
  console.log(body);
};
case3Result = function(err, httpResponse, body){
  console.log('Case3 - wrong username');
  console.log(body);
};
case4Result = function(err, httpResponse, body){
  console.log('Case4 - repo not exist');
  console.log(body);
};


request.post(case1,case1Result);
request.post(case2,case2Result);
request.post(case3,case3Result);
request.post(case4,case4Result);

/* // testing template
describe('POST /addVerification',function(){
  it('return the result of verification', function(done){
    request(app).post('/addVerification')
    .send({
      "method":"GET",
      "uri":'https://api.github.com/users/jaeseokan94/repos?sort=created',
      "json": true,
      "headers":{
        "User-Agent": "node.js"
      }
    })
    .expect('happen')
    .end(function(err,res){
      if(err) done(err);
      res.body.should.have.property('Successful');
      done();
    });
  });
});*/
