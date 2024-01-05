var mongoose = require("mongoose");
const { User } = require("../models/user");
const dbURI = process.env.dbURI;

//privilges policy
/*
0 = admin
1 = manager
2 = normal user
*/

async function registerAdmin(data) {
  let aUser;
  // create a user a new user
  aUser = new User({
    username: data.username,
    email: data.email,
    password: data.password,
    privilege: 0,
  });
  await aUser.save();    
  return aUser.toJSON();
}

async function registerUser(data) {
  let aUser;
  // create a user a new user
  aUser = new User({
    username: data.username,
    email: data.email,
    password: data.password,
    privilege: 2,
  });
  await aUser.save();    
  return aUser.toJSON();
}

async function fetchUser(username, password, callback) {
    // fetch the user and test password verification
    await User.findOne({username: username}).then(function(user) { //once user is found, try matching passwords
      if(!user) return callback({error: true})
      user.comparePassword(password, function(matchError, isMatch) {
          if (matchError) {
            return callback({error: true})

          } else if (!isMatch) {
            return callback({error: true})
          } else {
            return callback({error: false, aUser: user}) //passwords match
          }
        })
    })
}

module.exports = {
  registerUser: registerUser,
  fetchUser: fetchUser,
  registerAdmin: registerAdmin
};
