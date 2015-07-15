var path = require('path');

var express = require('express'),
app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
app.set('port', process.env.PORT || 5000);
http.listen(app.get('port'), function(){
  console.log('listening on port: ', app.get('port'));
});



var expressLayouts = require('express-ejs-layouts');

/*
example of how we would retrieve functionality from a script
located in /public/data/notes.js

var notes = require('./data/notes');

the contents of the script would be :
var notes = {
  method: function(),
  method2: function(callback) {
    db.notes.find({}).exec(callback);
  }
};

module.exports = notes;

*/

app.set('view engine', 'ejs');
app.set('layout', 'layout.ejs');

app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(request, response) {
  response.render('index.ejs');
});

io.on('connection', function(socket) {
  console.log('a user connected');

  socket.on('newmove', function(move) {
    console.log('new move ' + move);
    socket.broadcast.emit('servermove' ,  move  );
    //socket.emit('newmove' ,  move  );
  })
});
