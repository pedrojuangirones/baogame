angular.module('baoApp.game',[
    'baoApp.graphics'
])
function setupBoard(boardType, $scope){
  var store = []
  for (var i=0; i<2; i++) {
    store[i] = {}
    store[i].canvasId = ('store:' + i);
    store[i].highlight = 0;
    store[i].beans = []
  }


  var hand = []
    for (var i=0; i<2; i++) {
      hand[i] = {}
      hand[i].canvasId = ('hand:' + i);
      hand[i].highlight = 0;
      hand[i].beans = []
    }

  switch(boardType) {
    case 'Bao':
    case 'Omweso':
      var numberOfFields =2;
      var numberOfRows = 2;
      var numberOfHouses=8;

// Both store camvas in the DOM are defined from the first element of the array
      store[0].storeWidth=0;
      store[0].storeHeight=0;
      break;
  case 'Hawalis':
    var numberOfFields =2;
    var numberOfRows = 2;
    var numberOfHouses=7;

  // Both store camvas in the DOM are defined from the first element of the array
    store[0].storeWidth=0;
    store[0].storeHeight=0;
    break;
  case 'Congkak (x5)':
    var numberOfFields =2;
    var numberOfRows = 1;
    var numberOfHouses=5;

// Both store camvas in the DOM are defined from the first element of the array
    store[0].storeWidth=150;
    store[0].storeHeight=150;
    break;
  case 'Congkak (x7)':
    var numberOfFields =2;
    var numberOfRows = 1;
    var numberOfHouses=7;

// Both store camvas in the DOM are defined from the first element of the array
    store[0].storeWidth=150;
    store[0].storeHeight=150;
    break;
  default:
      alert('This board is not yet implemented')
      return;
      break;
  }


  /*
  Generate the board
*/
  var board =  generateBoard(
                                numberOfFields,
                                numberOfRows,
                                numberOfHouses);


  var beanBag = {}
  beanBag.beans=[];
  beanBag.canvasId = 'beanBag'

  $scope.$apply();
  //populateBoard(gameName,allTheBeans,board,beanBag, hand);

/*
  var bagCanvas = document.getElementById('beanBag');

  for (var i=0; i<numberOfBeans; i++) {
    var aBean=allTheBeans.pop();
    aBean = placeBean(aBean, beanBag.beans, bagCanvas)
    beanBag.beans.push(aBean);
  }*/


  var gameState = {boardType: boardType, hand: hand, board: board, store: store, beanBag: beanBag}; //, board: board, hand: hand, beanBag: beanBag, store: store}
  return gameState;
}

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
                 highlight: 0,
                 beans :[]
               }

          row.house.push(house);
        }
        field.row.push(row);
      }
      board.field.push(field);
    }
    return board;
}

function   populateBoard(gameState) {

  gameName = gameState.gameName;
  board = gameState.board;
  beanBag = gameState.beanBag
  hand = gameState.hand;

  for (var k=0; k<board.field.length; k++) {
      for (var i=0; i<board.field[k].row.length; i++) {
        for (var j=0; j<board.field[k].row[i].house.length; j++) {

          switch (gameName) {
            /*
            We deal first with boards that have the same number of
            seeds in each house */
            case 'Hawalis':
            case 'BAO-MALAWI':
              var numBeansInHouse = 2;
              var canvas = document.getElementById(board.field[k].row[i].house[j].canvasId);
              for (var l=0; l<numBeansInHouse; l++) {
                var aBean=createBean();
                aBean = placeBean(aBean, board.field[k].row[i].house[j].beans, canvas);
                board.field[k].row[i].house[j].beans.push(aBean);
              };
              break;
            case 'Congkak':
              var numBeansInHouse = 7;
              var canvas = document.getElementById(board.field[k].row[i].house[j].canvasId);
              for (var l=0; l<numBeansInHouse; l++) {
                var aBean=createBean();
                aBean = placeBean(aBean, board.field[k].row[i].house[j].beans, canvas);
                board.field[k].row[i].house[j].beans.push(aBean);
              };
              break;
            case 'Omweso':
              var numBeansInHouse = 4;
              var canvas = document.getElementById(board.field[k].row[i].house[j].canvasId);
              if (((k==0) && (i==0)) || ((k=1)&&(i==i))) {
                for (var l=0; l<numBeansInHouse; l++) {
                  var aBean=createBean();
                  aBean = placeBean(aBean, board.field[k].row[i].house[j].beans, canvas);
                  board.field[k].row[i].house[j].beans.push(aBean);
                };
                
              }
              break;

          default:
              alert('This game is not available');
              return;
          }
        }
      }
    }

}

function createBean(){
  var aBean={
             id:0,
             color: 'green',
             border: '#003300',
             x: 0,
             y: 0
           }
   return aBean;
}

function getBoards() {
  var boards = [
    'Bao',
    'Omweso',
    'Hawalis',
    'Congkak (x5)',
    'Congkak (x7)'
  ]
  return boards;
}
function getGames(){
  var games = [
    'BAO-MALAWI',
    'Bao la kiswahili',
    'Bao la kujifunza',
    'Hawalis',
    'Omweso',
    'Congkak'
  ]

  return games;
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
                 highlight: oldBoard.field[(numF-1)-k].row[(numR-1)-i].house[(numH-1)-j].highlight,
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

function clearHouseHighlight(board){
  var numF = board.numberOfFields;
  var numR = board.numberOfRows;
  var numH = board.numberOfHouses;
    for (var k=0; k<numF; k++) {
      for (var i=0; i<numR; i++) {
        for (var j=0; j<numH; j++) {
          board.field[k].row[i].house[j].highlight=0;
        }
      }
    }
    //return board;
}

function updateGame(gameID, board, hand, beanBag, store, socket) {
  paintGame(board, hand, beanBag, store)
  gameState = {gameID: gameID, board: board, hand: hand, beanBag: beanBag, store: store}
  socket.emit('gamestate', gameState)
}
