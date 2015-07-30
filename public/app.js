
angular.module('baoApp',[
  'baoApp.graphics' ,
  'baoApp.game'
])

   .controller('AppController', function ($scope) {
     var socket = io.connect();
     $scope.houseWidth=75;
     $scope.houseHeight=75;
     $scope.handWidth= 50;
     $scope.handHeight = 400;
     $scope.storeWidth = 0;
     $scope.storeHeight = 0;
     $scope.beanBagWidth = 500; //value overwritten in html until timeout
     $scope.beanBagHeight = 35;
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
       var activePlayer = true;

       /*
       game functions
       */

       var game = {};
       game.mode = 'BAO-MALAWI';
       $scope.numberOfFields =2;
       $scope.numberOfRows = 2;
       $scope.numberOfHouses=8;

              $scope.numberOfBeans = 64;
              $scope.beanBag = {}
              $scope.beanBag.beans=[];
              $scope.beanBag.canvasId = 'beanBag'

              $scope.hand = [{}];
              $scope.store = [{}]

              for (var i=0; i<2; i++) {
                $scope.hand[i] = {}
                $scope.hand[i].canvasId = ('hand:' + i);
                $scope.hand[i].highlight = 0;
                $scope.hand[i].beans = []
              }
              var canvas = document.getElementById('beanBag');
              for (var i=0; i<$scope.numberOfBeans; i++) {
                var aBean={
                           id:i,
                           color: 'green',
                           border: '#003300',
                           x: 0,
                           y: 0
                         }
                aBean = placeBean(aBean, $scope.beanBag.beans, canvas)
                $scope.beanBag.beans.push(aBean);
              }


       /*
       Generate the board
       */
           $scope.board =  generateBoard(game,
                                         $scope.numberOfFields,
                                         $scope.numberOfRows,
                                         $scope.numberOfHouses);

           $scope.$apply();
           drawBeans($scope.beanBag.beans,canvas)


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

       $scope.acceptInvite = function (){
         if (!checkConnected($scope.connected)) return;
         if (document.inviteForm.invitesReceived.selectedIndex == -1) {
           alert('No invitation selected')
           return false;
         } else {
           var gameHost = $scope.invitesReceived[document.inviteForm.invitesReceived.selectedIndex];
           socket.emit('acceptinvitation', {fromUser:gameHost, toUser:$scope.user});
           gameID=gameHost + '-' + $scope.user;
           activePlayer = true;
           $scope.log = "Playing"
           $scope.$apply();

         }

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
           $scope.hand[0].highlight = 0;
           $scope.hand[1].highlight = 2;
           activePlayer = false;
           populateBoard(game,$scope.board,$scope.beanBag)
           updateGame(gameID, $scope.board, $scope.hand, $scope.beanBag, $scope.store,socket)

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

    $scope.changePlayer = function(){
      if (gameID=='') {
        alert('You are not playing')
        return false;
      }

      if (!activePlayer) {
        alert('You are not playing')
        return false;
      }
      activePlayer=false;

      clearHouseHighlight($scope.board)
      $scope.hand[0].highlight = 0;
      $scope.hand[1].highlight = 2;

      $scope.$apply();

      socket.emit('changeplayer',gameID);
      updateGame(gameID, $scope.board, $scope.hand, $scope.beanBag, $scope.store,socket)

    }

    socket.on('changeplayer', function(){
      activePlayer=true;
//      $scope.hand[0].highlight = 2;
//      $scope.hand[1].highlight = 0;

    })

    $scope.doMouseDown = function(event){
      if (gameID=='') {
        alert('You are not playing')
        return false;
      }

      if (!activePlayer) {
        alert('You are not playing')
        return false;
      }

      $scope.mouseDown =true;
      $scope.startSelCoords = mouseCanvasCoords(event);
    }

    $scope.doMouseUp = function(event){
      if (gameID=='') {
        alert('You are not playing')
        return false;
      }

      if (!activePlayer) {
        alert('You are not playing')
        return false;
      }

      $scope.endSelCoords = mouseCanvasCoords(event);
    //  alert('up x: ' +  $scope.endSelCoords.x + ' y: '+ $scope.endSelCoords.y)
      var beans = pickBeans($scope.startSelCoords,$scope.endSelCoords,$scope.beanBag)

      var canvas = document.getElementById('beanBag');
      clear(canvas)
    //  drawBeans($scope.beanBag.beans,canvas)

      var numBeans=beans.length
      var canvas = document.getElementById('hand:0');
      for (var i=0; i<numBeans; i++) {
        var aBean;
        aBean = beans.pop()
        aBean = placeBean(aBean, $scope.hand[0].beans, canvas)
        $scope.hand[0].beans.push(aBean)
      }

      $scope.$apply()
      clear(canvas)
      //drawBeans($scope.hand[0].beans,canvas)

      updateGame(gameID, $scope.board, $scope.hand, $scope.beanBag, $scope.store,socket)

      $scope.mouseDown =false;
    }

    $scope.doHouseDblClick = function(event) {
      if (gameID=='') {
        alert('You are not playing')
        return false;
      }

      if (!activePlayer) {
        alert('You are not playing')
        return false;
      }

      var canvas = document.getElementById('hand:0');
      var args = event.target.id.split(':')[1].split('.');
      var fieldNum = args[0]
      var rowNum = args[1];
      var houseNum = args[2];

      var numBeans=$scope.board.field[fieldNum].row[rowNum].house[houseNum].beans.length;

      for (var i=0; i<numBeans; i++) {
        var aBean;
        aBean = $scope.board.field[fieldNum].row[rowNum].house[houseNum].beans.pop();
        aBean = placeBean(aBean, $scope.hand[0].beans, canvas);
        $scope.hand[0].beans.push(aBean)
      }
      clearHouseHighlight($scope.board);
      $scope.hand[0].highlight = 1 ;
      $scope.board.field[fieldNum].row[rowNum].house[houseNum].highlight = 2;
      $scope.$apply();
      updateGame(gameID, $scope.board, $scope.hand, $scope.beanBag, $scope.store,socket)
    }

      $scope.doHouseClick = function(event){
        if (gameID=='') {
          alert('You are not playing')
          return false;
        }

        if (!activePlayer) {
          alert('You are not playing')
          return false;
        }

        var canvas = event.target;
        var args = event.target.id.split(':')[1].split('.');
        var fieldNum = args[0]
        var rowNum = args[1];
        var houseNum = args[2];


        if ($scope.hand[0].beans.length > 0 ) {
          var aBean = $scope.hand[0].beans.pop();
          aBean = placeBean(aBean,
                           $scope.board.field[fieldNum].row[rowNum].house[houseNum].beans,
                           canvas)
          $scope.board.field[fieldNum].row[rowNum].house[houseNum].beans.push(aBean);
        }

        clearHouseHighlight($scope.board);
        //$scope.hand[0].highlight = 2 ;
        $scope.board.field[fieldNum].row[rowNum].house[houseNum].highlight = 1;
        $scope.$apply();

        updateGame(gameID, $scope.board, $scope.hand, $scope.beanBag, $scope.store,socket)

      }

       $scope.doClick = function(item, event) {
         if (gameID=='') {
           alert('You are not playing')
           return false;
         }

         if (!activePlayer) {
           alert('You are not playing')
           return false;
         }

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

         if (!activePlayer) {
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

       socket.on('gamestate', function(gameState) {
         $scope.beanBag = gameState.beanBag;

         $scope.board = mirrorBoard(gameState.board);
         for (var i=0; i<2; i++) {
           $scope.hand[i].beans = gameState.hand[(i+1)%2].beans;
           $scope.hand[i].highlight = gameState.hand[(i+1)%2].highlight
         }

         $scope.store = gameState.store;

         $scope.$apply();

         paintGame($scope.board, $scope.hand, $scope.beanBag, $scope.store,socket)
         $scope.$apply();

       })

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
