var http = require('http'),
path = require('path');

var express = require('express'),
app = express();

var server = http.createServer(app);
io = require('socket.io').listen(server);

var expressLayouts = require('express-ejs-layouts');

server.listen(3000);
var notes = require('./data/notes');

app.set('view engine', 'ejs');
app.set('layout', 'layout.ejs');

app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(request, response) {
  response.render('index.ejs');
});

io.sockets.on('connection', function (socket) {
  notes.list(function (err, documents) {
    socket.emit('list', documents);
  });

  socket.on('addNote', function (note) {
    notes.create(note.title, note.body, function () {
      io.sockets.emit('newNote', note);
    });
  });

  socket.on('removeNote', function (note) {
    notes.remove(note._id, function () {
      io.sockets.emit('deletedNote', note);
    });
  });

  socket.on('newmove', function(move) {
    console.log('newmove ' + move);
    socket.broadcast.emit('newmove' ,  move  );
  })
});
