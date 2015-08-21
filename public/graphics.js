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

      angle=Math.random()*360;
      do {
        distanceFromCentre=distanceFromCentre+distanceIncrement;
        var count = 0;
        do {
          overlap=false;

          angle= angle + 5*count;
          if ((angle==90)||((angle==270))) { //avoid infinite tagent
            angle = angle +1
          };
          radAngle=(angle*(Math.PI/180));
          rX=Math.cos(radAngle);
          rY=Math.sin(radAngle);

          var beanDistance;
          bean.x=distanceFromCentre*rX;
          bean.y=distanceFromCentre*rY;
          for (var i=0; i<beans.length; i++){
             beanDistance=Math.sqrt((square(beans[i].x-bean.x))
                                        +  square(beans[i].y-bean.y));
              if (beanDistance <= logicalBeanDiameter) {
                  overlap=true;
              }
          }

          if (overlap == false) {
            return bean
          }
          count = count + 1;
        } while (count < 72)
      } while (distanceFromCentre < (potRadius-logicalBeanDiameter))
      alert('Didn\'t find a place')

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

function paintGame(board, hand, beanBag, store, gameColor){
//alert('paint beanBag')
  if (beanBag) {
    for (var i=0; i<beanBag.length; i++) {
      paintComponent(beanBag[i],gameColor)
    }
  }
  if (store) {
    for (var i=0; i<store.length; i++) {
      paintComponent(store[i],gameColor)
    }
  }
//  alert('paintHands' + hand[0].highlight + ',' + hand[1].highlight)

  //alert('paintHands' +hand.length)
  for (var i=0; i<hand.length; i++) {
    paintComponent(hand[i],gameColor)
  }
//alert('paintHouses')
  for (var k=0; k<board.field.length; k++) {
    //alert('field ' + k + ' ' + board.field[k].id)
   for (var i=0; i<board.field[k].row.length; i++) {
      //alert('row ' + board.field[k].row[i].id)
      for (var j=0; j<board.field[k].row[i].house.length; j++) {
        //alert('house' + board.field[k].row[i].house[j].id)
        paintComponent(board.field[k].row[i].house[j],gameColor)
      }

    }
  }

}

function paintComponent(component,gameColor) {
  if (!component.canvasId) {
    alert('canvasId not defined')
    return
  }

  var canvas = document.getElementById(component.canvasId);

  if (canvas) {
    clear(canvas)
    highlight(canvas, component.highlight)
    var context = canvas.getContext('2d');

    switch(getComponenType(canvas)) {
      case 'store':
      case 'house':
      context.beginPath();
      //context.rect(0, 0, canvas.width, canvas.height)
      context.arc(canvas.width/2, canvas.height/2, (canvas.width/2-4), 0, 2 * Math.PI, false);
      context.lineWidth = 3;
      context.strokeStyle = 'brown';
      context.stroke();
        break;
      case 'hand':

       drawHand(context,getComponenId(canvas),gameColor)
       break;
      case 'beanBag':
       break;
      default:
        alert('component not defined')
    }

    if (component.beans.length) {
      //alert('beans found')
      drawBeans(component.beans,canvas)

    }
  }
}

function drawHand(context,handId,gameColor) {
  switch (handId) {
    case '0':
      var fingerWitdth = 15;
      var leftPadding = 5;
      var fingerBase = [120, 87, 80, 85, 110]
      var fingerHeight = [50,40,40,35]
      var thumAngleA = 0.75*Math.PI;
      var thumAngleB = -0.20*Math.PI;
      var thumWidth = 20;
      var thumLengthA = 15;
      var thumLengthB = 40;
      var palmBezierPointY = 180;
      break;
    case '1':
      var fingerWitdth = -15;
      var leftPadding = 95;
      var fingerBase = [200-120, 200-87, 200-80, 200-85, 200-110]
      var fingerHeight = [-50,-40,-40,-35]
      var thumAngleA = 0.75*Math.PI;
      var thumAngleB = -0.20*Math.PI;
      var thumWidth = -20;
      var thumLengthA = -15;
      var thumLengthB = -40;
      var palmBezierPointY = 20;
      break;
    default:
     alert('Wrong hand Id' + handId )
     return;
  }

  context.beginPath();

  context.lineWidth = 3;
  context.moveTo(leftPadding, fingerBase[0]);
  /*
  draw fingers
  */
  for (var i=0; i<4; i++) {
    context.lineTo(leftPadding+i*fingerWitdth, fingerBase[i]-fingerHeight[i]);
    context.bezierCurveTo(leftPadding+i*fingerWitdth, fingerBase[i]-fingerHeight[i]-fingerWitdth,
                          leftPadding+(i+1)*fingerWitdth, fingerBase[i]-fingerHeight[i]-fingerWitdth,
                          leftPadding+(i+1)*fingerWitdth, fingerBase[i]-fingerHeight[i]);
    context.lineTo(leftPadding+(i+1)*fingerWitdth, fingerBase[i+1])

  }
  /*
  draw thum
*/

  var thumPointA = {x: leftPadding+4*fingerWitdth+getVector(thumAngleA,thumLengthA).x ,
                    y: fingerBase[4]+ getVector(thumAngleA,thumLengthA).y
                    }
  context.lineTo(thumPointA.x,thumPointA.y );
  var thumPointB = {x: thumPointA.x + getVector(thumAngleA-Math.PI/2,thumWidth).x,
             y: thumPointA.y + getVector(thumAngleA-Math.PI/2,thumWidth).y
            }
  /*
  Draw thum tip
  */
  context.bezierCurveTo(thumPointA.x + getVector(thumAngleA,thumWidth).x ,
                        thumPointA.y + getVector(thumAngleA,thumWidth).y,
                        thumPointB.x + getVector(thumAngleB,-thumWidth).x,
                        thumPointB.y + getVector(thumAngleB,-thumWidth).y,
                        thumPointB.x,thumPointB.y );
  context.lineTo(thumPointB.x + getVector(thumAngleB,thumLengthB).x,
                thumPointB.y + getVector(thumAngleB,thumLengthB).y);

  /*
  draw bottom of hand*/
  context.bezierCurveTo(thumPointB.x + getVector(thumAngleB,1.55*thumLengthB).x,
                        thumPointB.y + getVector(thumAngleB,1.55*thumLengthB).y,
                        leftPadding,
                        palmBezierPointY,
                        leftPadding,
                        fingerBase[0]
                        )

  /*
  fill hand
  */
  context.fillStyle = gameColor.handFilling;
  context.fill();

  context.strokeStyle = gameColor.handBorder ;

  context.stroke();
}
function drawRightHand(context,handId,gameColor) {

  context.beginPath();

  context.lineWidth = 3;
  context.moveTo(leftPadding, fingerBase[0]);
  /*
  draw fingers
  */
  for (var i=0; i<4; i++) {
    context.lineTo(leftPadding+i*fingerWitdth, fingerBase[i]-fingerHeight[i]);
    context.bezierCurveTo(leftPadding+i*fingerWitdth, fingerBase[i]-fingerHeight[i]-fingerWitdth,
                          leftPadding+(i+1)*fingerWitdth, fingerBase[i]-fingerHeight[i]-fingerWitdth,
                          leftPadding+(i+1)*fingerWitdth, fingerBase[i]-fingerHeight[i]);
    context.lineTo(leftPadding+(i+1)*fingerWitdth, fingerBase[i+1])

  }
  /*
  draw thum
*/

  var thumPointA = {x: leftPadding+4*fingerWitdth+getVector(thumAngleA,thumLengthA).x ,
                    y: fingerBase[4]+ getVector(thumAngleA,thumLengthA).y
                    }
  context.lineTo(thumPointA.x,thumPointA.y );
  var thumPointB = {x: thumPointA.x + getVector(thumAngleA-Math.PI/2,thumWidth).x,
             y: thumPointA.y + getVector(thumAngleA-Math.PI/2,thumWidth).y
            }
  /*
  Draw thum tip
  */
  context.bezierCurveTo(thumPointA.x + getVector(thumAngleA,thumWidth).x ,
                        thumPointA.y + getVector(thumAngleA,thumWidth).y,
                        thumPointB.x + getVector(thumAngleB,-thumWidth).x,
                        thumPointB.y + getVector(thumAngleB,-thumWidth).y,
                        thumPointB.x,thumPointB.y );
  context.lineTo(thumPointB.x + getVector(thumAngleB,thumLengthB).x,
                thumPointB.y + getVector(thumAngleB,thumLengthB).y);

  /*
  draw bottom of hand*/
  context.bezierCurveTo(thumPointB.x + getVector(thumAngleB,1.55*thumLengthB).x,
                        thumPointB.y + getVector(thumAngleB,1.55*thumLengthB).y,
                        leftPadding,
                        180,
                        leftPadding,
                        fingerBase[0]
                        )

  /*
  fill hand
  */
  context.fillStyle = gameColor.handFilling;
  context.fill();

  context.strokeStyle = gameColor.handBorder ;

  context.stroke();
}

function getVector(alpha,length) {
  return {x:length * Math.sin(alpha) , y: length*Math.cos(alpha)}
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

function getComponenId(canvas) {
  return canvas.id.split(':')[1]
}
