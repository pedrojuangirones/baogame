
angular.module('baoApp',[
  'baoApp.graphics'
])

   .controller('AppController', function ($scope) {
     var socket = io.connect();
       $scope.pageTitle ='Bao Game';
       $scope.log ='';
       $scope.user = 'guest';
       $scope.loginUser = '';
       $scope.loginPassword = '';

       $scope.serverlog ='';
       $scope.onUsers = [];


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

       socket.on('registrationsuccess', function(msg) {
         $scope.serverlog ='registrationsuccess';
       });

       $scope.logIn = function (){
          // $scope.pageTitle  = 'Sign In' ;
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
         alert('Failed to log in. Wrong user or password' + errMsg);
       });
       socket.on('loginOK', function(errMsg) {
         $scope.serverlog ='loginOK';
         $scope.user = errMsg
//         alert('Failed to log in. Wrong user or password' + errMsg);
       });
       socket.on('usersOnLine', function(userList) {
         for (var i=0; i<userList.length; i++) {
           $scope.onUsers[i]=userList[i];
         }
       });




       $scope.invite = function (){
               $scope.pageTitle = 'Invite' ;

           document.outputForm.outputText.value="Invite player: "  +
                   document.inviteForm.onlineUsers[document.inviteForm.onlineUsers.selectedIndex].value;
       }

       $scope.cancelInvite = function (){
             $scope.pageTitle = 'Cancel Invite' ;
             document.outputForm.outputText.value="Cancel Invite" +
                     document.inviteForm.invitesMade[document.inviteForm.invitesMade.selectedIndex].value;;
         }

       $scope.blockUser = function (){
             $scope.pageTitle = 'Block User' ;
             document.outputForm.outputText.value="Block user: " +
                document.inviteForm.onlineUsers[document.inviteForm.onlineUsers.selectedIndex].value;
         }


       $scope.acceptInvite = function (){
             $scope.pageTitle = 'Accept' ;
             document.outputForm.outputText.value="Accept invite from user: " +
                document.inviteForm.invitesReceived[document.inviteForm.invitesReceived.selectedIndex].value;
         }

       $scope.declineInvite = function (){
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
       $scope.board.houses = ['1', '2', '3','4','5'];

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

   function sendMove(move, socket) {
     socket.emit('newmove', move);
   }

   function drawClick(canvas) {
     drawCircle(canvas);
   }
