
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
       $scope.gameHosts = [];

       $scope.selectedHost='';
       $scope.invitesMade = [];
       $scope.inviteAccepted = '';



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
         $scope.$apply();
       });

       $scope.logOut = function (){
         if (!checkConnected($scope.connected)) return;
         socket.emit('logout', $scope.user)
         $scope.user = 'guest';
         $scope.onUsers = [];
         $scope.gameHosts = [];
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
           $scope.gameHosts.push(invitationCard.fromUser);
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
           for (var i=0; i<$scope.gameHosts.length; i++) {
             if ($scope.gameHosts[i]==invitationCard.fromUser) {
               $scope.gameHosts.splice(i,1);
             }
           }
         }

         for (var i=0; i<$scope.invitesMade.length; i++) {
           if ($scope.invitesMade[i]==invitee) {
             alert('You have already invited' + invitee)
             return false;
           }
         }
         $scope.$apply();
       })

       $scope.blockUser = function (){
         if (!checkConnected($scope.connected)) return;

         alert('This functionality is not implemented yet')

             $scope.pageTitle = 'Block User' ;
             document.outputForm.outputText.value="Block user: " +
                document.inviteForm.onlineUsers[document.inviteForm.onlineUsers.selectedIndex].value;
         }


       $scope.acceptInvite = function (){
         if (!checkConnected($scope.connected)) return;

             $scope.pageTitle = 'Accept' ;
             document.outputForm.outputText.value="Accept invite from user: " +
                document.inviteForm.invitesReceived[document.inviteForm.invitesReceived.selectedIndex].value;
         }

       $scope.declineInvite = function (){
         if (!checkConnected($scope.connected)) return;

             $scope.pageTitle = 'Decline' ;
             document.outputForm.outputText.value="Decline invite from user: " +
                document.inviteForm.invitesReceived[document.inviteForm.invitesReceived.selectedIndex].value;
         }
/*
game functions
*/

       $scope.board = {};
       $scope.board.fields=['1','2'];
       $scope.board.rows = ['1', '2'];
       $scope.board.houses = ['1', '2', '3','4','5','6'];

       $scope.doClick = function(item, event) {
         $scope.log ='click ' + event.target.id;

         drawClick(event.target);
         sendMove('oneClick:' + event.target.id, socket);
       }

       $scope.doDblClick = function (item, event) {
         $scope.log ='Dblclick ' + event.target.id;
         clearHouse(event.target);
         sendMove('dblClick:' + event.target.id, socket);
         //alert("dbl clicked: " + event.target.id);
       }

       socket.on('servermove', function (move) {
       //  $scope.serverlog= 'new move ' + move;

         $scope.arguments = move.split(":");
         $scope.canvasID = $scope.arguments[1];
         $scope.serverlog= 'canvasf ' + $scope.canvasID;

         $scope.canvas = document.getElementById($scope.canvasID);

         if ($scope.arguments[0]==="oneClick") {
           drawClick($scope.canvas);
         } else if ($scope.arguments[0]==="dblClick") {
           clearHouse($scope.canvas);
         }

       });
   });

   function checkConnected(check){
     if (check) {
       return true;
     } else {
      alert('You are not logged in');
      return false;
     }

   }
   function sendMove(move, socket) {
     socket.emit('newmove', move);
   }

   function drawClick(canvas) {
     drawCircle(canvas);
   }
