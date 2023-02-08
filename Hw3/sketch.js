let guySheet;
let greenSheet;
let kirbSheet;
let limeSheet;
let ninjaSheet;
let vanSheet;
let bg;
let guyWalk;
let greenWalk;
let kirbWalk;
let limeWalk;
let ninjaWalk;
let vanWalk;

function preload(){
  guySheet = loadImage('assets/SpelunkyGuy.png');
  greenSheet = loadImage('assets/Green.png');
  kirbSheet = loadImage('assets/Kirby.png');
  limeSheet = loadImage('assets/Lime.png');
  ninjaSheet = loadImage('assets/Ninja.png');
  vanSheet = loadImage('assets/Van Helsing.png');
}

function setup() {
  bg = loadImage('assets/department.png')
  createCanvas(1560, 904);
  

  guyWalk = new WalkingAnimation(guySheet, 80, 80, 450, 425, 8);
  greenWalk = new WalkingAnimation(greenSheet, 80, 80 , 850, 425, 8);
  kirbWalk = new WalkingAnimation(kirbSheet, 128, 128, 1100, 500, 8);
  limeWalk = new WalkingAnimation(limeSheet, 80, 80, 500, 650, 8);
  ninjaWalk = new WalkingAnimation(ninjaSheet, 80, 80 , 900, 700, 8);
  vanWalk = new WalkingAnimation(vanSheet, 80, 80, 1200, 450, 8);
  
}

function draw() {
  imageMode(CORNER);
  background(bg);

  imageMode(CENTER);
  guyWalk.draw();
  greenWalk.draw();
  kirbWalk.draw();
  limeWalk.draw();
  ninjaWalk.draw();
  vanWalk.draw();

}

function keyPressed(){
  guyWalk.keyPressed();
  greenWalk.keyPressed();
  kirbWalk.keyPressed();
  limeWalk.keyPressed();
  ninjaWalk.keyPressed();
  vanWalk.keyPressed();
}

function keyReleased(){
  guyWalk.keyReleased();
  greenWalk.keyReleased();
  kirbWalk.keyReleased();
  limeWalk.keyReleased();
  ninjaWalk.keyReleased();
  vanWalk.keyReleased();
}

class WalkingAnimation {
  constructor(spritesheet, sw, sh, dx, dy, animationLength) {
    this.spritesheet = spritesheet;
    this.sw = sw;
    this.sh = sh;
    this.dx = dx;
    this.dy = dy;
    this.u = 0;
    this.v = 0;
    this.animationLength = animationLength;
    this.currentFrame = 0;
    this.moving = 0;
    this.xDirection = 1;
  }

  draw()  {

    if(this.moving != 0){
      this.u = (this.currentFrame % this.animationLength) + 1;
    }
    else
      this.u = 0;

    push();
    translate(this.dx, this.dy);
    scale(this.xDirection, 1);

    image(this.spritesheet, 0, 0, this.sw, this.sh, this.u*this.sw, this.v*this.sh, this.sw, this.sh);
    pop();

    if (frameCount % 6 == 0){
      this.currentFrame++;
    }
    
    this.dx += this.moving;

    
  }
  
  keyPressed(){
    if (keyCode === RIGHT_ARROW){
      this.moving = 1;
      this.xDirection = 1;
      this.currentFrame = 1;
    }
    
    else if(keyCode === LEFT_ARROW){
      this.moving = -1;
      this.xDirection = -1;
      this.currentFrame = 1;
    }
  }
  
  keyReleased(){
    if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW){
      this.moving = 0;
    }
  }
}
