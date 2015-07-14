var socket = io.connect();

var AppController = function($scope) {
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
    $scope.$apply(function () {
      var i = $scope.notes.indexOf(note);
      $scope.notes.splice(i, 1);
    });
  });
}
