var path = require('path');
var Datastore = require('nedb');
var db = {
  notes: new Datastore({ filename: path.join(__dirname, 'notes.db'), autoload: true })
};

var notes = {
  create: function(title, body, callback) {
    db.notes.insert({ title: title, body: body }, callback);
  },
  list: function(callback) {
    db.notes.find({}).exec(callback);
  },
  remove: function(id, callback) {
    db.notes.remove({ _id: id }, callback);
  }
};

module.exports = notes;
