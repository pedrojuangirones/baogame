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

var credentials = require('./data/credentials');


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


var usersOnLine = [];

io.on('connection', function(socket) {
  console.log('a user connected');
  credentials.list(function (err, documents) {

  //socket.emit('list', documents);
  });

  socket.on('signup', function(credential){

    console.log('Register ' + credential.user +' '+ credential.password)

    credentials.create(credential.user, credential.password, function (insertError) {
      if (insertError=='uniqueViolated') {
        console.log('Error ' + insertError)
        socket.emit('registrationfailure', insertError);
      } else {
        console.log(credential.user +' registered ' )
        socket.emit('registrationsuccess', insertError)
      }

      credentials.list(function (err, data) {
        var users = [];
        for (var i=0; i<data.length; i++) {
          users[i]=data[i].user;
        }
        console.log(users);

      });
    });
  })



    socket.on('login', function(credential){

      console.log('login ' + credential.user +' '+ credential.password)
      var alreadyOnline = false;
      for (var i=0; i<usersOnLine.length; i++) {
        if (credential.user===usersOnLine[i]) alreadyOnline =true;
      }
      if (alreadyOnline) {
        console.log('Already logged in');
        socket.emit('loginfailure', 'Already logged in');
      } else {
        credentials.checkPassword(credential.user, credential.password, function (checkOK) {
          if (checkOK) {
            socket.username = credential.user;
            socket.emit('loginOK', credential.user);
            console.log('loginOK ' + credential.user);
            usersOnLine.push(credential.user);
            console.log(usersOnLine);
            socket.emit('usersOnLine',usersOnLine)
            socket.broadcast.emit('usersOnLine',usersOnLine)
          } else {
            socket.emit('loginfailure', 'Wrong user or password');
            console.log('loginfailure ' + credential.user);
          }
       });
     }
  })

  socket.on('logout', function(user){
    console.log('Log out ' + user);
    logoutUser(user,socket)
  })

  socket.on('invitation', function(invitationCard){
    console.log('Invitation: from ' + invitationCard.fromUser + ' to ' + invitationCard.toUser);
    socket.broadcast.emit('invitation', invitationCard);
  })

  socket.on('cancelInvitation', function(invitationCard){
    console.log('Cancel invitation: from ' + invitationCard.fromUser + ' to ' + invitationCard.toUser);
    socket.broadcast.emit('cancelInvitation', invitationCard);
  })


  socket.on('newmove', function(move) {
    console.log('new move ' + move);
    socket.broadcast.emit('servermove' ,  move  );
    //socket.emit('newmove' ,  move  );
  })

  socket.on('disconnect', function() {
    console.log('user disconected' + socket.username);
    logoutUser(socket.username|| 'guest', socket);
    console.log(usersOnLine);
  })
});

function logoutUser(user, socket) {
  for (var i=0; i<usersOnLine.length; i++) {
    if (user == usersOnLine[i]) {
      usersOnLine.splice(i,1);
    }
  }
  socket.broadcast.emit('usersOnLine',usersOnLine)

}
function activateUser(user,socket){
  //socket.emit('loginsuccess', user);
  console.log (usersOnLine);


  console.log('Confirmed ' + user)
}
