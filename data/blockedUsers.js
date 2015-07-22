var path = require('path');
var Datastore = require('nedb');
var db = {
  blockedUsers: new Datastore({ filename: path.join(__dirname, 'blockedUsers.db'), autoload: true })

};

db.blockedUsers.ensureIndex({ fieldName: 'user', unique: true }, function (err) {});

var blockedUsers = {
  create: function(aUser, callback) {
    db.blockedUsers.insert({ user: aUser, blockedUser: [] }, function(err) {
       var error =null
       if (err !== null) {
         error = err.errorType ;
       }
       callback(error);
    });
  },

  add: function(blockRequest, callback) {
    console.log('in blockedUsers.add ' + blockRequest.fromUser)

    db.blockedUsers.find( {user : blockRequest.fromUser}, function (err, data) {
      if (data[0]) {
        console.log ('found user ' + data[0]._id);
        db.blockedUsers.update({ _id: data[0]._id }, { $addToSet: { blockedUser: blockRequest.blockedUser } }, {}, function (){
          blockedUsers.sublist(blockRequest.fromUser, function(data){
            console.log('in blockedUsers.add data is ' + data)
            callback(data)
          });
        })
      }
    })
  },

  removeBlock: function(unBlockRequest, callback) {

    console.log('in blockedUsers.remove ' + unBlockRequest.blockedUser + ' from ' + unBlockRequest.fromUser)
    db.blockedUsers.find( {user : unBlockRequest.fromUser}, function (err, data) {
      if (data[0]) {
        console.log ('found user ' + data[0]._id);
        db.blockedUsers.update({ _id: data[0]._id }, { $pull: { blockedUser: unBlockRequest.blockedUser } }, {}, function (){
          blockedUsers.sublist(unBlockRequest.fromUser, function(blockedUserList){
            console.log('in blockedUsers.remove data is ' + blockedUserList)
            callback(blockedUserList)
          });
        })
      }
    })

  },
  list: function(callback) {
    db.blockedUsers.find({}).exec(callback);
  },

  sublist: function(aUser,callback) {
    console.log('in blockedUsers.sublist for user ' + aUser);
    db.blockedUsers.find({user: aUser}, function(err,data){
      console.log('data is ' + data[0].blockedUser)
      callback (data[0].blockedUser);
    })

  },

  remove: function(id, callback) {
    db.blockedUsers.remove({ _id: id }, callback);
  }
};

module.exports = blockedUsers;
