angular.module('baoApp.color',[])

function setColor(gameName) {
  var gameColor = {}

  gameColor.handBorder = 'grey';
  gameColor.handFilling = 'yellow'
  switch (gameName) {
    /*
    Bean colors are defined from a "cental" RGB value
    and a random shift in each color component.
    The shift value oscillates between null and
    the beanComponentShift value.
    The random value is multiplied by the _contrast variable
    */

    case 'Omweso':
    gameColor.board = 'white';
    gameColor.beanRed = 120;
    gameColor.beanRedShift = 20;
    gameColor.beanGreen = 30;
    gameColor.beanGreenShift = 10;
    gameColor.beanBlue = 10;
    gameColor.beanBlueShift = 10;
    gameColor.contrast = 20

    gameColor.beanBorder = 'red'
        break;
    case 'Bao la kujifunza':
    case 'Bao la kiswahili':
    case 'Congkak':
    case 'Hawalis':
    case 'Tchuka Ruma':
    default:
      gameColor.board = 'sandybrown';
      gameColor.beanRed = 20;
      gameColor.beanRedShift = 20;
      gameColor.beanGreen = 40;
      gameColor.beanGreenShift = 10;
      gameColor.beanBlue = 120;
      gameColor.beanBlueShift = 10;
      gameColor.contrast = 20

      gameColor.beanBorder = 'black'
  }
  return gameColor;
}

function setBeanColor(gameColor){
    var rComponent,gComponent,bComponent;
    var contrast=7;

    rComponent=gameColor.beanRed+contrast*Math.floor(Math.random()*gameColor.beanRedShift);
    gComponent=gameColor.beanGreen+contrast*Math.floor(Math.random()*gameColor.beanGreenShift);
    bComponent=gameColor.beanBlue+contrast*Math.floor(Math.random()*gameColor.beanBlueShift);
    return rgbToHex(rComponent,gComponent,bComponent);
  }
