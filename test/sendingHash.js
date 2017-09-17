// There are two parts that need to be tested in this step
// 1. If email is sent to the right user
// 2. If valid hash is created.
//     - There is no need to test the module (createHash('md5')), as it should already be united-tested.
//     - But need to make sure if hash is sent to the user

/*
  case 1
  Input  github-account : hello-world / indorse-account : jaeseokn@gmail.com
  Expect : an email with randomly generated hash value should be arrived in jaeseokn@gmail.com mailbox.
  Result : email arrived /  hash : cb71bc305bfde6f67af6ee1959e67d54

  case 2
  Input github-account : different-name / indorse-account : jaeseokn@gmail.com
  Expect : email with same hash value as case 1 should be arrived
  Result : email arrived / hash : cb71bc305bfde6f67af6ee1959e67d54

  case 3
  Input github-account : hello-world / indorse-account : jaeseokan94@gmail.com
  Expect : different hash value should be generated
  Result : email arrived / hash : 9ef93b8678ad3e2889d4e0ae769516d7

*/
