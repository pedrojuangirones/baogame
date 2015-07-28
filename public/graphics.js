angular.module('baoApp.graphics',[])

function placeBean(bean, beans, canvas) {
  var beanRadius = 5;
  var componentType = getComponenType(canvas)
  switch (componentType) {
    case 'house':
    for (var i=0; i<(beans.length+1); i++) {
      bean.x = (10 +15*(Math.floor(i/4)));
      bean.y = (10 + 15*(i%4));
      if (i<beans.length) {
        if ( (bean.x !== beans[i].x) || (bean.y !== beans[i].y) ) {
          continue
        }
      }
    }
        break;
    case 'beanBag':
    for (var i=0; i<(beans.length+1); i++) {
      bean.x = (10 +15*(Math.floor(i/2)));
      bean.y = (10 + 15*(i%2));
      if (i<beans.length) {
        if ( (bean.x !== beans[i].x) || (bean.y !== beans[i].y) ) {
          continue
        }
      }
    }
        break;
    case 'hand':
    for (var i=0; i<(beans.length+1); i++) {
      bean.x = (10 + 15*(i%3));
      bean.y = (10 +15*(Math.floor(i/3)));
      if (i<beans.length) {
        if ( (bean.x !== beans[i].x) || (bean.y !== beans[i].y) ) {
          continue
        }
      }
    }
        break;
    default:
     alert('Wrong canvas ID')
  }
  return bean
}

function drawBeans(beans, canvas){
  if (beans) {
    for (var i=0; i<beans.length; i++){
      drawBean(beans[i],canvas)
    }
  } else {
    alert('here')
  }
}

function drawBean(bean,canvas){
  var context = canvas.getContext('2d');

  var finalX;
  var finalY;

  var componentType = getComponenType(canvas)
  switch (componentType) {
    case 'house':
        finalX=bean.x ; //+ canvas.width/2;
        finalY=bean.y ; //+ canvas.height/2;
        break;
    case 'beanBag':
    case 'hand':
        finalX=bean.x;
        finalY=bean.y;
        break;
    default:
     alert ('Wrong canvas ID')
  }

  context.beginPath();
  context.arc(finalX, finalY, 5, 0, 2 * Math.PI, false);
  context.fillStyle = bean.color;
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = bean.border;
  context.stroke();

  return true;
}

function drawCircle(canvas) {
    var context = canvas.getContext('2d');

    context.beginPath();
    context.arc(10, 10, 5, 0, 2 * Math.PI, false);
    context.fillStyle = 'green';
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#003300';
    context.stroke();

    return true;
}

function paintGame(board, hand, beanBag, store){

  paintComponent(beanBag)
  if (store) {
    //alert('store')
  }
  for (var k=0; k<board.field.length; k++) {
    //alert('field ' + k + ' ' + board.field[k].id)
   for (var i=0; i<board.field[k].row.length; i++) {
      //alert('row ' + board.field[k].row[i].id)
      for (var j=0; j<board.field[k].row[i].house.length; j++) {
        //alert('house' + board.field[k].row[i].house[j].id)
        paintComponent(board.field[k].row[i].house[j])
      }

    }
  }

  for (var i=0; i<hand.length; i++) {
    paintComponent(hand[i])
  }

}

function paintComponent(component) {
  if (!component.canvasId) {
    alert('canvasId not defined')
    return
  }

  //alert('canvas ' + component.canvasId)

  var canvas = document.getElementById(component.canvasId);
  clear(canvas)
  //alert('canvas 2' + component.canvasId)
  if (component.beans.length) {
    //alert('beans found')
    drawBeans(component.beans,canvas)

  }
}

function clear(canvas) {
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function getComponenType(canvas) {
  return canvas.id.split(':')[0]
}
