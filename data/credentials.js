var path = require('path');
var Datastore = require('nedb');
var db = {
  credentials: new Datastore({ filename: path.join(__dirname, 'credentials.db'), autoload: true })

};

db.credentials.ensureIndex({ fieldName: 'user', unique: true }, function (err) {});

var credentials = {
  create: function(aUser, aPassword, callback) {
    db.credentials.insert({ user: aUser, password: aPassword }, function(err) {
       var error =null
       if (err !== null) {
         error = err.errorType ;
       }
       callback(error);
    });
  },
  checkPassword: function(aUser, aPassword, callback) {

    db.credentials.find({user: aUser}, function(err,data){
      var check;
      if (data[0]) {
        console.log('User found = true' );
        if ( data[0].password == aPassword) {
          check=true;
        } else {
          check=false;
        }
      } else {
        console.log('User found = false' );
      }
      callback(check);
    })



  },
  /*
  checkPassword: function(user, callback) {
    db.credentials.find(user:user){
      console.log
    }
  },
  */
  list: function(callback) {
    db.credentials.find({}).exec(callback);
  },
  remove: function(id, callback) {
    db.credentials.remove({ _id: id }, callback);
  }
};

module.exports = credentials;
