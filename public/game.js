angular.module('baoApp.game',[
    'baoApp.graphics'
])
function setupBoard(boardType, $scope, gameName){
  var numberOfHands=2;
  var numberOfStores=0;
  var numberOfBags=0;

  switch(boardType) {
    case 'Bao/Omweso':
      var numberOfFields =2;
      var numberOfRows = 2;
      var numberOfHouses=8;

// Both store camvas in the DOM are defined from the first element of the array
      break;
  case 'Hawalis':
    var numberOfFields =2;
    var numberOfRows = 2;
    var numberOfHouses=7;

  // Both store camvas in the DOM are defined from the first element of the array
    break;
  case 'Congkak (x5)':
    var numberOfFields =2;
    var numberOfRows = 1;
    var numberOfHouses=5;
    var numberOfStores=2;

// Both store camvas in the DOM are defined from the first element of the array
    break;
  case 'Congkak (x7)':
    var numberOfFields =2;
    var numberOfRows = 1;
    var numberOfHouses=7;
    var numberOfStores=2;
// Both store camvas in the DOM are defined from the first element of the array
    break;
  case 'Tchuka Ruma':
    var numberOfStores = 1;
    var numberOfHands=1;
    var numberOfFields =1;
    var numberOfRows = 1;
    var numberOfHouses=4;
    break;
  default:
      alert('This board is not yet implemented')
      return;
      break;
  }

  var hand = []
    for (var i=0; i<numberOfHands; i++) {
      hand[i] = {}
      hand[i].canvasId = ('hand:' + i);
      hand[i].highlight = 0;
      hand[i].beans = []
    }

  var store = []
  for (var i=0; i<numberOfStores; i++) {
    store[i] = {}
    store[i].canvasId = ('store:' + i);
    store[i].highlight = 0;
    store[i].beans = []
  }


  var beanBag = []
  for (var i=0; i<numberOfBags; i++) {
    beanBag[i] = {}
    beanBag[i].canvasId = ('beanBag:' + i);
    beanBag[i].highlight = 0;
    beanBag[i].beans=[];
  }

/*
  Generate the board
*/
  var board =  generateBoard(
                                numberOfFields,
                                numberOfRows,
                                numberOfHouses);



  $scope.$apply();
  //populateBoard(gameName,allTheBeans,board,beanBag, hand);

/*
  var bagCanvas = document.getElementById('beanBag');

  for (var i=0; i<numberOfBeans; i++) {
    var aBean=allTheBeans.pop();
    aBean = placeBean(aBean, beanBag.beans, bagCanvas)
    beanBag.beans.push(aBean);
  }*/


  var gameState = {boardType: boardType, gameName: gameName, hand: hand, board: board, store: store, beanBag: beanBag}; //, board: board, hand: hand, beanBag: beanBag, store: store}
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
  store = gameState.store;

  /*
  Place beans in the board
  */
  for (var k=0; k<board.field.length; k++) {
      for (var i=0; i<board.field[k].row.length; i++) {
        for (var j=0; j<board.field[k].row[i].house.length; j++) {
          board.field[k].row[i].house[j].beans=[];
          switch (gameName) {
            /*
            We deal first with boards that have the same number of
            seeds in each house */
            case 'Hawalis':
            case 'Bao la kujifunza':
            case 'Tchuka Ruma':
              var numBeansInHouse = 2;
              var canvas = document.getElementById(board.field[k].row[i].house[j].canvasId);
              for (var l=0; l<numBeansInHouse; l++) {
                var aBean=createBean();
                aBean = placeBean(aBean, board.field[k].row[i].house[j].beans, canvas);
                board.field[k].row[i].house[j].beans.push(aBean);
              };
              break;

            case 'Bao la kiswahili':
              var houseCanvas = document.getElementById(board.field[k].row[i].house[j].canvasId);
              if (((k==0) && (i==1) && (j==3)) || ((k==1)&&(i==0) && (j==4))) {
                var numBeansInHouse = 6;
              } else if (((k==0) && (i==1) && ((j==1) || (j==2)))
                        || ((k==1) && (i==0) && ((j==5) || (j==6))) ){
                var numBeansInHouse = 2;
              } else {
                var numBeansInHouse = 0;
              }

              for (var l=0; l<numBeansInHouse; l++) {
                var aBean=createBean();
                aBean = placeBean(aBean, board.field[k].row[i].house[j].beans, houseCanvas);
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
              if (((k==0) && (i==0)) || ((k==1)&&(i==1))) {
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
    /*
    Place beans in the hands
    */

    switch (gameName) {
      case 'Bao la kiswahili':
        var numBeansInHand = 22;
        break;
      default:
        var numBeansInHand = 0;
  }


    for (var i=0; i<hand.length; i++ ) {
      var handCanvas = document.getElementById(hand[i].canvasId);
      hand[i].beans=[];

      for (var l=0; l<numBeansInHand; l++) {
        var aBean=createBean();
        aBean = placeBean(aBean, hand[i].beans, handCanvas);
        hand[i].beans.push(aBean);
      };
    }

    for (var i=0; i<store.length; i++ ) {
      var storeCanvas = document.getElementById(hand[i].canvasId);
      store[i].beans=[];
    }
}

function createBean(){
  var aBean={
             id:0,
             color: setBeanColor(), //'green', //rgb2hex(100,100,0) ,
             border: 'khaki',
             x: -20,
             y: -20
           }
   return aBean;
}

function getBoards() {
  var boards = [
    'Bao/Omweso',
    'Hawalis',
    'Congkak (x5)',
    'Congkak (x7)',
    'Tchuka Ruma'
  ]
  return boards;
}
function getGames(){
  var games = [
    'Bao la kujifunza',
    'Bao la kiswahili',
    'Congkak',
    'Hawalis',
    'Omweso',
    'Tchuka Ruma'

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

function clearHighlight(board, store){
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
  for (var i=0; i<store.length; i++) {
    store[i].highlight=0;
  }
    //return board;
}

function updateGame(gameID, board, hand, beanBag, store, socket) {
  paintGame(board, hand, beanBag, store)
  gameState = {gameID: gameID, board: board, hand: hand, beanBag: beanBag, store: store}
  socket.emit('gamestate', gameState)
}
