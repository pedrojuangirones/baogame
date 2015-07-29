angular.module('baoApp.game',[
    'baoApp.graphics'
])

function generateBoard(numberOfFields,numberOfRows,numberOfHouses) {
    board = {
              numberOfFields: numberOfFields,
              numberOfRows: numberOfRows,
              numberOfHouses: numberOfHouses,
              field:[]
            };
    for (var k=0; k<numberOfFields; k++) {
      var field;
      field = {id: k, row: []};
      for (var i=0; i<numberOfRows; i++) {
        var row;
        row={id: i, house : []}
        for (var j=0; j<numberOfHouses; j++) {
          var house;
          house={
                 id: j,
                 canvasId:('house:' + k +'.' + i + '.' + j),
                 beans :[]
               }
          /*aBean=$scope.beanBag.pop();
          house.beans.push(aBean);*/
          row.house.push(house);
        }
        field.row.push(row);
      }
      board.field.push(field);
    }
    return board;
}

function mirrorBoard(oldBoard) {
  var numF = oldBoard.numberOfFields;
  var numR = oldBoard.numberOfRows;
  var numH = oldBoard.numberOfHouses;
  board = {
            numberOfFields: numF ,
            numberOfRows: numR,
            numberOfHouses: numH,
            field:[]
          };
    for (var k=0; k<numF; k++) {
      var field;
      field = {id: k, row: []};
      for (var i=0; i<numR; i++) {
        var row;
        row={id: i, house : []}
        for (var j=0; j<numH; j++) {
          var house;
          house={
                 id: j,
                 canvasId:('house:' + k +'.' + i + '.' + j),
                 beans : oldBoard.field[(numF-1)-k].row[(numR-1)-i].house[(numH-1)-j].beans
               }
          /*aBean=$scope.beanBag.pop();
          house.beans.push(aBean);*/
          row.house.push(house);
        }
        field.row.push(row);
      }
      board.field.push(field);
    }
    return board;
}

function pickBeans(startCoords,endCoords, beanBag) {
  var pickedBeans = [];
  var maxX = Math.max(startCoords.x,endCoords.x)
  var minX = Math.min(startCoords.x,endCoords.x)
  var maxY = Math.max(startCoords.y,endCoords.y)
  var minY = Math.min(startCoords.y,endCoords.y)

/*  alert('x: ' + maxX + ' y: ' + maxY +
         '\nx: ' + minX + ' y: ' + minY) ;*/
  for (var i=(beanBag.beans.length - 1); i>-1; i--) {
    beanX = beanBag.beans[i].x;
    beanY = beanBag.beans[i].y;

    if ( ( minX < beanX ) && (minY < beanY)
      &&  maxX> beanX && maxY > beanY) {
        pickedBeans.push(beanBag.beans[i]);
        beanBag.beans.splice(i,1);
        //alert('found')

    }
  }
  return pickedBeans;

}

function updateGame(gameID, board, hand, beanBag, store, socket) {
  paintGame(board, hand, beanBag, store)

  gameState = {gameID: gameID, board: board, hand: hand, beanBag: beanBag, store: store}
  socket.emit('gamestate', gameState)
}


function setBeanXY(bean,beans,canvas) {
  var componentType = canvas.id.split(':')[0]

  //alert('componentType')
}