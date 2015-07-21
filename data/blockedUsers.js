var path = require('path');
var Datastore = require('nedb');
var db = {
  blockedUsers: new Datastore({ filename: path.join(__dirname, 'blockedUsers.db'), autoload: true })

};

db.blockedUsers.ensureIndex({ fieldName: 'user', unique: true }, function (err) {});

var blockedUsers = {
  create: function(aUser, callback) {
    db.credentials.insert({ user: aUser, blockedUser: {} }, function(err) {
       var error =null
       if (err !== null) {
         error = err.errorType ;
       }
       callback(error);
    });
  },

  list: function(callback) {
    db.blockedUsers.find({}).exec(callback);
  },
  remove: function(id, callback) {
    db.blockedUsers.remove({ _id: id }, callback);
  }
};

module.exports = blockedUsers;
