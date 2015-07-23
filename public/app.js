
angular.module('baoApp',[
  'baoApp.graphics'
])

   .controller('AppController', function ($scope) {
     var socket = io.connect();
       $scope.pageTitle ='Bao Game';
       $scope.log ='';
       $scope.connected = false;
       $scope.user = 'guest';
       $scope.loginUser = '';
       $scope.loginPassword = '';

       $scope.serverlog ='';
       $scope.onUsers = [];
       $scope.blockedUsers = [];
       $scope.invitesReceived = [];

       $scope.selectedHost='';
       $scope.invitesMade = [];
       $scope.inviteAccepted = '';

       var gameID = '';


       /*
       Users functions
       */
       $scope.register = function (){
          // $scope.pageTitle  = 'Sign In' ;
          if ($scope.loginUser=='' ) {
            alert('User name too short')
          } else if ( $scope.loginPassword=='')  {
            alert('Password too short')
          } else {
           socket.emit('signup', {user: $scope.loginUser, password : $scope.loginPassword})
           $scope.loginUser = '';
           $scope.loginPassword = '';
         }

       }


       socket.on('registrationfailure', function(errMsg) {
         $scope.serverlog ='registrationfailure';
         alert('This user already exists');
       });

       socket.on('registrationsuccess', function(credential) {
         $scope.serverlog ='registrationsuccess';
         credential.password=prompt('Confirm password for ' + credential.user, '');
         socket.emit('login', credential)
       });

       $scope.logIn = function (){
          if (($scope.loginUser=='' ) || ( $scope.loginPassword=='')){
            alert('Wrong user or password')
          } else {
            socket.emit('login', {user: $scope.loginUser, password : $scope.loginPassword})
            $scope.loginUser = '';
            $scope.loginPassword = '';
          }
       };

       socket.on('loginfailure', function(errMsg) {
         $scope.serverlog ='loginfailure';
         alert('Failed to log in: ' + errMsg);
       });

       socket.on('loginOK', function(user) {
         $scope.serverlog ='loginOK';
         $scope.user = user
         $scope.connected=true;
         $scope.$apply();
       });

       socket.on('usersOnLine', function(userList) {
         if (!$scope.connected) return;
         $scope.onUsers = [];
         for (var i=0; i<userList.length; i++) {
           if ($scope.user !== userList[i]) {
             $scope.onUsers.push(userList[i]);
           }
         }
         updateBlocks();

         //$scope.$apply();
       });

       $scope.logOut = function (){
         if (!checkConnected($scope.connected)) return;
         socket.emit('logout', $scope.user)
         $scope.user = 'guest';
         $scope.onUsers = [];
         $scope.invitesReceived = [];
         $scope.selectedHost='';
         $scope.invitesMade = [];
         $scope.inviteAccepted = '';
         $scope.$apply();


       };

       $scope.invite = function (){
         if (!checkConnected($scope.connected)) return;

         var invitee=$scope.onUsers[document.inviteForm.onlineUsers.selectedIndex];

         for (var i=0; i<$scope.invitesMade.length; i++) {
           if ($scope.invitesMade[i]==invitee) {
             alert('You have already invited' + invitee)
             return false;
           }
         }
         socket.emit('invitation', {fromUser:$scope.user, toUser:invitee});
         $scope.invitesMade.push(invitee);
         $scope.$apply();
       };

       socket.on('invitation', function(invitationCard) {
         if ($scope.user == invitationCard.toUser) {
           $scope.invitesReceived.push(invitationCard.fromUser);
         }
         $scope.$apply();
       });

       $scope.cancelInvite = function (){
         if (!checkConnected($scope.connected)) return;
         if (document.inviteForm.invitesMade.selectedIndex == -1) {
           alert('No invitation selected')
           return false;
         } else {
           var invitee = $scope.invitesMade[document.inviteForm.invitesMade.selectedIndex];
           socket.emit('cancelInvitation', {fromUser:$scope.user, toUser:invitee});
           $scope.invitesMade.splice(document.inviteForm.invitesMade.selectedIndex,1);
         }
         $scope.$apply();
       }

       socket.on('cancelInvitation', function(invitationCard) {

         if ($scope.user == invitationCard.toUser) {
           for (var i=0; i<$scope.invitesReceived.length; i++) {
             if ($scope.invitesReceived[i]==invitationCard.fromUser) {
               $scope.invitesReceived.splice(i,1);
             }
           }
         }

         $scope.$apply();
       })

       $scope.blockUser = function (){
         if (!checkConnected($scope.connected)) return;
         if (document.inviteForm.onlineUsers.selectedIndex == -1) {
           alert('No User selected')
           return false;
         } else {
           var userToBlock = $scope.onUsers[document.inviteForm.onlineUsers.selectedIndex];
           socket.emit('blockuser', {fromUser:$scope.user, blockedUser:userToBlock});
         }
       }

       socket.on('blockedusers', function(blockedusers) {
         $scope.blockedUsers=[];
         for (var j=0; j<blockedusers.length; j++) {
           $scope.blockedUsers[j]=blockedusers[j];
         }
         updateBlocks();
       })

       $scope.unBlockUser = function() {
         if (!checkConnected($scope.connected)) return;
         if (document.inviteForm.onlineUsers.selectedIndex == -1) {
           alert('No User selected')
           return false;
         } else {
           var userToUnBlock = $scope.onUsers[document.inviteForm.onlineUsers.selectedIndex].split(' ')[0];
           socket.emit('unblockuser', {fromUser:$scope.user, blockedUser:userToUnBlock});
         }
       }

       $scope.acceptInvite = function (){
         if (!checkConnected($scope.connected)) return;
         if (document.inviteForm.invitesReceived.selectedIndex == -1) {
           alert('No invitation selected')
           return false;
         } else {
           var gameHost = $scope.invitesReceived[document.inviteForm.invitesReceived.selectedIndex];
           socket.emit('acceptinvitation', {fromUser:gameHost, toUser:$scope.user});
         }
         gameID=gameHost + '-' + $scope.user;
         alert('gameID in guest = ' + gameID )
         $scope.log = "Playing"
         $scope.$apply();
         }

      socket.on('invitationaccepted', function(invitationCard){
           if ($scope.user == invitationCard.fromUser) {
             alert(invitationCard.toUser +' has accepted your invitation to play')
             gameID = invitationCard.fromUser + '-' + invitationCard.toUser;
             socket.emit('startgame', gameID);
           }
           for (var i=0; i<$scope.invitesMade.length; i++) {
             socket.emit('cancelInvitation', {fromUser:$scope.user, toUser:$scope.invitesMade[i]});
           }
           $scope.invitesMade=[];
           $scope.log = "Finally playing"
           $scope.$apply();
       })

       $scope.declineInvite = function (){
         if (!checkConnected($scope.connected)) return;
         if (document.inviteForm.invitesReceived.selectedIndex == -1) {
           alert('No invitation selected')
           return false;
         } else {
           var gameHost = $scope.invitesReceived[document.inviteForm.invitesReceived.selectedIndex];
           socket.emit('declineinvitation', {fromUser:gameHost, toUser:$scope.user});
           $scope.invitesReceived.splice(document.inviteForm.invitesReceived.selectedIndex,1);
         }
         $scope.$apply();
       }

       socket.on('declineinvitation', function(invitationCard){
         if ($scope.user == invitationCard.fromUser) {
           alert(invitationCard.toUser +' has declined your invitation to play')
           for (var i=0; i<$scope.invitesMade.length; i++) {
             if ($scope.invitesMade[i]==invitationCard.toUser) {
               $scope.invitesMade.splice(i,1);
             }
           }
         }
         $scope.$apply();
       })

/*
game functions
*/

       $scope.board = {};
       $scope.board.fields=['1','2'];
       $scope.board.rows = ['1', '2'];
       $scope.board.houses = ['1', '2', '3','4','5','6'];

       $scope.doClick = function(item, event) {
         if (gameID=='') {
           alert('You are not playing')
           return false;
         }

         $scope.log ='click ' + event.target.id;

         drawClick(event.target);
         //alert('oneClick:' + event.target.id)
         sendMove({type:'oneClick' , targetID: event.target.id}, socket);
       }

       $scope.doDblClick = function (item, event) {
         if (gameID=='') {
           alert('You are not playing')
           return false;
         }

         $scope.log ='Dblclick ' + event.target.id;
         clearHouse(event.target);
         sendMove({type:'dblClick' , targetID: event.target.id}, socket);
         //alert("dbl clicked: " + event.target.id);
       }

       socket.on('servermove', function (move) {
       //  $scope.serverlog= 'new move ' + move;
         var canvas = document.getElementById(move.targetID);
         if (move.type === "oneClick") {
           drawClick(canvas);
         } else {
           clearHouse(canvas);

         }
         $scope.serverlog= 'canvas ' + move.targetID;
       });

     function sendMove(move, socket) {
       if (gameID=='') {
         alert('You are not playing')
         return false;
       }
       //alert('move is game:' + gameID + ' move: ' +move );
       socket.emit('newmove', {game: gameID, move:move});
     }

     function drawClick(canvas) {
       drawCircle(canvas);
     }

     function updateBlocks(){
       for (var i=0; i<$scope.onUsers.length; i++) {
         var user=$scope.onUsers[i].split(' ')[0];
         if ($scope.blockedUsers.indexOf(user) > -1 ) {
           $scope.onUsers[i]= user + ' (blocked)';
         } else {
           $scope.onUsers[i]= user;
         }
       }
     $scope.$apply();

     }
   });

   function checkConnected(check){
     if (check) {
       return true;
     } else {
      alert('You are not logged in');
      return false;
     }

   }
