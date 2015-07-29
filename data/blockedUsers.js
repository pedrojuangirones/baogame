var path = require('path');
var Datastore = require('nedb');
var db = {
  blockedUsers: new Datastore({ filename: path.join(__dirname, 'blockedUsers.db'), autoload: true })

};

db.blockedUsers.ensureIndex({ fieldName: 'user', unique: true }, function (err) {});

var blockedUsers = {
  create: function(aUser, callback) {
    db.blockedUsers.insert({ user: aUser, blockedUser: [] , blockedByUser: [] }, function(err) {
       var error =null
       if (err !== null) {
         error = err.errorType ;
       }
       callback(error);
    });
  },

  add: function(blockRequest, callback) {
    console.log('in blockedUsers.add ' + blockRequest.blockedByUser)
    db.blockedUsers.find( {user : blockRequest.blockedByUser}, function (err, data) {
      if (data[0]) {
        db.blockedUsers.update({ _id: data[0]._id },
            { $addToSet: { blockedUser: blockRequest.blockedUser } }, {}, function (){
          db.blockedUsers.find( {user : blockRequest.blockedUser}, function (err, data) {
          if (data[0]) {
           db.blockedUsers.update({ _id: data[0]._id },
            { $addToSet: { blockedByUser: blockRequest.blockedByUser } }, {}, function (){
               callback();
            });
          }
        })
      });
    }
  })
  },

  removeBlock: function(unBlockRequest, callback) {

    console.log('in blockedUsers.remove ' + unBlockRequest.blockedUser + ' from ' + unBlockRequest.blockedByUser)
    db.blockedUsers.find( {user : unBlockRequest.blockedByUser}, function (err, data) {
      if (data[0]) {
        console.log ('found user ' + data[0]._id);
        db.blockedUsers.update({ _id: data[0]._id },
            { $pull: { blockedUser: unBlockRequest.blockedUser } }, {}, function (){
          db.blockedUsers.find( {user : unBlockRequest.blockedUser}, function (err, data) {
          if (data[0]) {
            db.blockedUsers.update({ _id: data[0]._id },
            { $pull: { blockedByUser: unBlockRequest.blockedByUser } }, {}, function (){
              callback();
            });
          }
        })
      })
     }
    })
  },

  list: function(callback) {
    db.blockedUsers.find({}).exec(callback);
  },

  blockList: function(aUser,callback) {
    console.log('in blockedUsers.blockedList for user ' + aUser);
    db.blockedUsers.find({user: aUser}, function(err,data){
      console.log('data is ' + data[0].blockedUser)
      callback ({blockedUser: data[0].blockedUser, blockedByUser: data[0].blockedByUser});
    })

  },

  remove: function(id, callback) {
    db.blockedUsers.remove({ _id: id }, callback);
  }
};

module.exports = blockedUsers;
