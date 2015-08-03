angular.module('baoApp.graphics',[])

function placeBean(bean, beans, canvas) {
  var beanRadius = 5;
  var componentType = getComponenType(canvas)
  switch (componentType) {
    case 'store':
    case 'house':
    if (beans.length>0) {

      var potRadius = Math.min(canvas.width, canvas.height)
      var angle;
      var radAngle;
      var rX;      //unitary vecto in the direction of the new bean (X component)
      var rY;      //unitary vector in the direction of the new bean (Y component)
      var distanceFromCentre;
      var distanceIncrement;
      var overlap  = true;
      var logicalBeanDiameter=10

      distanceFromCentre=5;
      distanceIncrement=1;
//        alert('in loop')

          do {
              angle=Math.random()*360;

              if ((angle==90)||((angle==270))) { //avoid infinite tagent
                angle = angle +1
              };
               radAngle=(angle*(Math.PI/180));
               rX=Math.cos(radAngle);
               rY=Math.sin(radAngle);



              var beanDistance;
              for (var j=0; j<5; j++) {
                bean.x=distanceFromCentre*rX;
                bean.y=distanceFromCentre*rY;
                overlap=false;
                for (var i=0; i<beans.length; i++){
                   beanDistance=Math.sqrt((square(beans[i].x-bean.x))
                                              +  square(beans[i].y-bean.y));
                    if (beanDistance <= logicalBeanDiameter) {
                        overlap=true;
                    }
                }
                if (overlap) {
                  distanceFromCentre=Math.min((distanceFromCentre+distanceIncrement),
                                        (potRadius-0.8*logicalBeanDiameter));
                }
              }


          } while (overlap);

    } else { //place the first bean
      bean.x = (0.2*Math.random())*canvas.width;
      bean.y = (0.2*Math.random())*canvas.height
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
     alert('Wrong canvas ID place')
  }
  return bean
}

function  square( d){
    return d*d;
}

function setBeanColor(){
    var rComponent,gComponent,bComponent;
    var contrast=7;
    rComponent=120+contrast*Math.floor(Math.random()*20);
    gComponent=40+contrast*Math.floor(Math.random()*10);
    bComponent=20+contrast*Math.floor(Math.random()*10);
    return rgbToHex(rComponent,gComponent,bComponent);
  }

    function rgbToHex(r, g, b) {
        return "#" + componentToHex(Math.min(r,255)) +
                     componentToHex(Math.min(g,255)) +
                     componentToHex(Math.min(b,255));
    }

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
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
    case 'store':
    case 'house':
        finalX=bean.x + canvas.width/2;
        finalY=bean.y + canvas.height/2;
        break;
    case 'beanBag':
    case 'hand':
        finalX=bean.x;
        finalY=bean.y;
        break;
    default:
     alert ('Wrong canvas ID draw')
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
//alert('paint beanBag')
  paintComponent(beanBag)
  if (store) {
    for (var i=0; i<store.length; i++) {
      paintComponent(store[i])
    }
  }
//  alert('paintHands' + hand[0].highlight + ',' + hand[1].highlight)

  //alert('paintHands' +hand.length)
  for (var i=0; i<hand.length; i++) {
    paintComponent(hand[i])
  }
//alert('paintHouses')
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

}

function paintComponent(component) {
  if (!component.canvasId) {
    alert('canvasId not defined')
    return
  }


  var canvas = document.getElementById(component.canvasId);
  clear(canvas)
  highlight(canvas, component.highlight)
  drawBorder(canvas)
  if (component.beans.length) {
    //alert('beans found')
    drawBeans(component.beans,canvas)

  }
}

function drawBorder(canvas){
  var context = canvas.getContext('2d');

  switch(getComponenType(canvas)) {
    case 'store':
    case 'house':
    context.beginPath();
    //context.rect(0, 0, canvas.width, canvas.height)
    context.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, 2 * Math.PI, false);
    context.lineWidth = 2;
    context.strokeStyle = 'brown';
    context.stroke();
      break;
    case 'hand':
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height)
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.stroke();
     break;
    case 'beanBag':
     break;
    default:
      alert('component not defined')
  }

}

function highlight(canvas,hightlight) {
  var context = canvas.getContext('2d');
  switch(hightlight) {
    case 0:
    default:
      return;
      break;
    case 1:
      higlightColor = 'red';
      break;
    case 2:
      higlightColor = 'pink';
      break;
  }

  var context = canvas.getContext('2d');

  context.beginPath();
  context.rect(0, 0, canvas.width, canvas.height)
  //context.arc(canvas.width/2, canvas.height/2, canvas.width/2, 0, 2 * Math.PI, false);
  //context.lineWidth = 2*hightlight;
  context.fillStyle = higlightColor;
  context.fill();

  context.strokeStyle = higlightColor;
  context.stroke();

  return true;
}

function clear(canvas) {
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

function getComponenType(canvas) {
  return canvas.id.split(':')[0]
}
