angular.module('baoApp.graphics',[])

function drawBeans(beans, canvas){
  if (beans) {
    for (var i=0; i<beans.length; i++){
      drawBean(beans[i],canvas)
    }
  }
}

function drawBean(bean,canvas){
  var context = canvas.getContext('2d');
  context.beginPath();
  context.arc(bean.x, bean.y, 5, 0, 2 * Math.PI, false);
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

function clearHouse(canvas) {
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}
