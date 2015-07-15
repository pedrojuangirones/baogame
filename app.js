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

var notes = require('./data/notes');

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
