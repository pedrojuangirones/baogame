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
var blockedUsers = require('./data/blockedUsers');


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
  socket.emit('reset', '');


  socket.on('signup', function(credential){

    console.log('Register ' + credential.user +' '+ credential.password)

    credentials.create(credential.user, credential.password, function (insertError) {
      if (insertError=='uniqueViolated') {
        console.log('Error ' + insertError)
        socket.emit('registrationfailure', insertError);
      } else {
        console.log(credential.user +' registered ' )
        blockedUsers.create(credential.user, function(insertError) {})
        socket.emit('registrationsuccess', credential)
      }

      credentials.list(function (err, data) {
        var users = [];
        for (var i=0; i<data.length; i++) {
          users[i]=data[i].user;
        }
        console.log('All registered users when ' + credential.user + ' registers ' + users);

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
            socket.join(socket.username);
            socket.emit('loginsuccess', credential.user);
            console.log('loginsuccess ' + credential.user);

            usersOnLine.push(credential.user);
            console.log('user online at login ' + usersOnLine);
            socket.emit('usersOnLine',usersOnLine)
            socket.broadcast.emit('usersOnLine',usersOnLine)

           blockedUsers.blockList(credential.user, function (blockedUsersList) {
            console.log('Send blocked user list on login ' + blockedUsersList)
            socket.emit('blocklist', blockedUsersList);
            })

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
    socket.to(invitationCard.toUser).emit('invitation', invitationCard);
  })

  socket.on('cancelInvitation', function(invitationCard){
    console.log('Cancel invitation: from ' + invitationCard.fromUser + ' to ' + invitationCard.toUser);
    socket.to(invitationCard.toUser).emit('cancelInvitation', invitationCard);
  })

  socket.on('declineinvitation', function(invitationCard){
    console.log('Invitation declined: from ' + invitationCard.fromUser + ' by ' + invitationCard.toUser);
    socket.to(invitationCard.fromUser).emit('declineinvitation', invitationCard);
  })

  socket.on('acceptinvitation', function(invitationCard){
    console.log('Invitation accepted: from ' + invitationCard.fromUser + ' by ' + invitationCard.toUser);
    var gameID = invitationCard.fromUser + '-' + invitationCard.toUser;
    socket.join(gameID);
    console.log('User ' +socket.username + ' has joined game' + gameID)

    socket.to(invitationCard.fromUser).emit('invitationaccepted', invitationCard);
  })

  socket.on('startgame', function(gameID){
    console.log('User ' +socket.username + ' has joined game' + gameID)
    socket.join(gameID);
  })

  socket.on('changeplayer', function(gameID){
    console.log('User ' +socket.username + ' has joined game' + gameID)
    socket.to(gameID).emit('changeplayer', gameID);
  })

  socket.on('gamestate', function(gameState) {
    console.log('gamestate transferred. gameID= ' + gameState.gameID)
    socket.to(gameState.gameID).emit('gamestate', gameState);
  })

/*
BLOCK user
*/
  socket.on('blockuser', function(blockRequest){
    console.log('Block request from ' + blockRequest.blockedByUser
    + ' to ' + blockRequest.blockedUser)
    blockedUsers.add(blockRequest, function () {
      blockedUsers.blockList(blockRequest.blockedByUser,function(blockList){
        socket.emit('blocklist', blockList);
      })
      blockedUsers.blockList(blockRequest.blockedUser,function(blockList){
        socket.to(blockRequest.blockedUser).emit('blocklist', blockList);
      })
    })
  })
/*
UNBLOCK user
*/
  socket.on('unblockuser', function(unBlockRequest){
    console.log('Unblock request from ' + unBlockRequest.blockedByUser
        + ' to ' + unBlockRequest.blockedUser);
    blockedUsers.removeBlock(unBlockRequest, function (blockList) {
      blockedUsers.blockList(unBlockRequest.blockedByUser,function(blockList){
        socket.emit('blocklist', blockList);
      })
      blockedUsers.blockList(unBlockRequest.blockedUser,function(blockList){
        socket.to(unBlockRequest.blockedUser).emit('usersOnLine',usersOnLine)
        socket.to(unBlockRequest.blockedUser).emit('blocklist', blockList);
      })
    })
  })

  socket.on('newmove', function(move) {
    console.log('new move -- game:' + move.game + ' move: ' + move.move );
    socket.to(move.game).broadcast.emit('servermove' ,  move.move  );
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
