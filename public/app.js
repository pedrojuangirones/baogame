
angular.module('baoApp',[
  'baoApp.graphics' ,
  'baoApp.game'
])

   .controller('AppController', function ($scope) {
     var socket = io.connect();
       $scope.mousePos ='';
       $scope.mouseDown = false ;
       $scope.startSelCoords = {x:0,y:0};
       $scope.endSelCoords = {x:0,y:0};
       $scope.pageTitle ='Bao Game';
       $scope.log ='';
       $scope.connected = false;
       $scope.user = 'guest';
       $scope.loginUser = '';
       $scope.loginPassword = '';

       $scope.serverlog ='';
       $scope.onUsers = [];
       $scope.blockedUsers = [];
       $scope.blockedByUsers = [];
       $scope.invitesReceived = [];

       $scope.selectedHost='';
       $scope.invitesMade = [];
       $scope.inviteAccepted = '';

       var gameID = 'default';


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

    socket.on('reset', function(msg){
      reset();
    })
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

       socket.on('loginsuccess', function(user) {
         $scope.serverlog ='loginsuccess';
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
           socket.emit('blockuser', {blockedByUser:$scope.user, blockedUser:userToBlock});
         }
       }

       socket.on('blocklist', function(blockList) {
         $scope.blockedUsers=[];
         $scope.blockedByUsers=[];
         //alert('in block list')
         for (var j=0; j<blockList.blockedUser.length; j++) {
           //alert(j)
           $scope.blockedUsers[j]=blockList.blockedUser[j];
         }
         for (var j=0; j<blockList.blockedByUser.length; j++) {
           //alert(j)
           $scope.blockedByUsers[j]=blockList.blockedByUser[j];
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
           socket.emit('unblockuser', {blockedByUser:$scope.user, blockedUser:userToUnBlock});
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
       $scope.numberOfBeans = 64;
       $scope.beanBag = {}
       $scope.beanBag.beans=[];

       $scope.hand = [{}]
       $scope.hand[0].beans = []
/*
       for (var i=0; i<$scope.numberOfBeans; i++) {
         var aBean={
                    id:i,
                    color: 'green',
                    border: '#003300',
                    x: (10 + 15*(Math.floor(i/32))),
                    y: (10 +15*(i%32))
                  }
         $scope.hand[0].beans.push(aBean);
       }
       var canvas = document.getElementById('hand:0');
       drawBeans($scope.hand[0].beans,canvas)
*/
       for (var i=0; i<$scope.numberOfBeans; i++) {
         var aBean={
                    id:i,
                    color: 'green',
                    border: '#003300',
                    x: (10 +15*(i%32)),
                    y: (10 + 15*(Math.floor(i/32)))
                  }
         $scope.beanBag.beans.push(aBean);
       }

       var canvas = document.getElementById('beanBag');
       drawBeans($scope.beanBag.beans,canvas)

       $scope.numberOfFields =2;
       $scope.numberOfRows = 2;
       $scope.numberOfHouses=3;
/*
Generate the board
*/
    $scope.board =  generateBoard($scope.numberOfFields,
                                  $scope.numberOfRows,
                                  $scope.numberOfHouses);

    $scope.doMouseDown = function(event){
      $scope.mouseDown =true;
      $scope.startSelCoords = mouseCanvasCoords(event);
    }

    $scope.doMouseUp = function(event){
      $scope.endSelCoords = mouseCanvasCoords(event);
    //  alert('up x: ' +  $scope.endSelCoords.x + ' y: '+ $scope.endSelCoords.y)
      var beans = pickBeans($scope.startSelCoords,$scope.endSelCoords,$scope.beanBag)

      var canvas = document.getElementById('beanBag');
      clear(canvas)
      drawBeans($scope.beanBag.beans,canvas)

      var numBeans=beans.length
      var canvas = document.getElementById('hand:0');
      for (var i=0; i<numBeans; i++) {
        var aBean;
        aBean = beans.pop()
        aBean = placeBean(aBean, $scope.hand[0].beans, canvas)
        $scope.hand[0].beans.push(aBean)
      }
      clear(canvas)
      drawBeans($scope.hand[0].beans,canvas)

      $scope.mouseDown =false;
    }

       $scope.doClick = function(item, event) {
         if (gameID=='') {
           alert('You are not playing')
           return false;
         }
/*
         var aBean={id:65,color: 'red',border: '#003300',x: 0,y: 0  }
         var thisBeans;
         setBeanXY(aBean, thisBeans, event.target);
         drawBean(aBean,event.target);
*/
         $scope.log ='click ' + event.target.id;

         //drawClick(event.target);
         //alert('oneClick: ' + event.target.id + 'width' + event.target.width)

         sendMove({type:'oneClick' , targetID: event.target.id}, socket);
       }

       $scope.doMove = function (ev) {
         ev           = ev || window.event;
         $scope.mousePos = mouseCanvasCoords(ev);
       }

       $scope.doDblClick = function (item, event) {
         if (gameID=='') {
           alert('You are not playing')
           return false;
         }

         $scope.log ='Dblclick ' + event.target.id;

         clear(event.target);
         sendMove({type:'dblClick' , targetID: event.target.id}, socket);
         //alert("dbl clicked: " + event.target.id);
       }

       socket.on('servermove', function (move) {
       //  $scope.serverlog= 'new move ' + move;
         var canvas = document.getElementById(move.targetID);
         if (move.type === "oneClick") {
           drawClick(canvas);
         } else {
           clear(canvas);

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
      //alert('number online ' + $scope.onUsers.length)
      for (var i=0; i<$scope.onUsers.length; i++) {
        $scope.onUsers[i]=$scope.onUsers[i].split(' ')[0];
      }

      for (var j=0; j<$scope.blockedByUsers.length; j++) {
         //alert ('j ' + j);
         var indexOfBlockedByUser = $scope.onUsers.indexOf($scope.blockedByUsers[j])
         if ( indexOfBlockedByUser > -1 ) {
           $scope.onUsers.splice(indexOfBlockedByUser,1);
         }
      }


       //alert('after removal '+ $scope.onUsers.length)
  for (var i=0; i<$scope.onUsers.length; i++) {
         var user=$scope.onUsers[i].split(' ')[0];
         if ($scope.blockedUsers.indexOf(user) > -1 ) {
           $scope.onUsers[i]= user + ' (blocked)';
         }
       }
     $scope.$apply();

  }

     function reset(){
       $scope.log ='';
       $scope.connected = false;
       $scope.user = 'guest';
       $scope.loginUser = '';
       $scope.loginPassword = '';

       $scope.serverlog ='';
       $scope.onUsers = [];
       $scope.blockedUsers = [];
       $scope.blockedByUsers = [];
       $scope.invitesReceived = [];

       $scope.selectedHost='';
       $scope.invitesMade = [];
       $scope.inviteAccepted = '';

       var gameID = '';
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

  function mouseCanvasCoords(ev){
    var rect = ev.target.getBoundingClientRect();
    var absoluteCoords = mouseCoords(ev);

    return {
      x: absoluteCoords.x - rect.left,
      y: absoluteCoords.y - rect.top
    }
	}

	function mouseCoords(ev){
    if(ev.pageX || ev.pageY){
       return {x:ev.pageX, y:ev.pageY};
    }
    return {
     x:ev.clientX + document.body.scrollLeft - document.body.clientLeft,
     y:ev.clientY + document.body.scrollTop  - document.body.clientTop
    };
	}
