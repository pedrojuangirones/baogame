var socket = io.connect();

var AppController = function($scope) {
  $scope.log ='';
  $scope.serverlog ='';

  $scope.board = {};
  $scope.board.fields=['1','2'];
  $scope.board.rows = ['1', '2'];
  $scope.board.houses = ['1', '2', '3','4'];

  $scope.doClick = function(item, event) {
    $scope.log ='click ' + event.target.id;

    $scope.drawClick(event.target);
      socket.emit('newmove','oneClick:' + event.target.id);

  }

  $scope.doDblClick = function (item, event) {
    $scope.log ='Dblclick ' + event.target.id;
    clearHouse(event.target);
    sendMove('dblClick:' + event.target.id, socket);
    //alert("dbl clicked: " + event.target.id);
  }

  socket.on('send:name', function (data) {
    $scope.name = data.name;
  });

  socket.on('newmove', function (move) {
  //  $scope.serverlog= 'new move ' + move;

    $scope.arguments = move.split(":");
    $scope.canvasID = $scope.arguments[1];
    $scope.serverlog= 'canvas ' + $scope.canvasID;
    $scope.canvas = document.getElementById($scope.canvasID);

    if ($scope.arguments[0]==="oneClick") {
      drawClick($scope.canvas);
    } else if ($scope.arguments[0]==="dblClick") {
      clearHouse($scope.canvas);
    }

  });

  $scope.notes = [];
  $scope.addNote = function () {
    var title = $scope.title,
    body = $scope.body;

    socket.emit('addNote', { title: title, body: body });

    $scope.title = '';
    $scope.body = '';
  };

  $scope.removeNote = function (note) {
    socket.emit('removeNote', note);
  };

  $scope.drawClick = function (canvas) {
    //$scope.serverlog ='drawclick';

    drawCircle(canvas);
  }

  socket.on('list', function (documents) {
    $scope.$apply(function () {
      $scope.notes = documents;
    });
  });

  socket.on('newNote', function (note) {
    $scope.$apply(function () {
      $scope.notes.push(note);
    });
  });

  socket.on('deletedNote', function (note) {
    $scope.serverlog ='deletedNote';

    $scope.$apply(function () {
      var i = $scope.notes.indexOf(note);
      $scope.notes.splice(i, 1);
    });
  });
}

function sendMove(move, socket) {
  socket.emit('newmove', move);
}



function clearHouse(canvas) {
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function drawCircle(canvas) {
    var context = canvas.getContext('2d');

    context.beginPath();
    context.arc(50, 50, 20, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 5;
    context.strokeStyle = '#003300';
    context.stroke();

    return true;
}
