let spriteSheetFilenames = ["Red Bug.png", "Blue Bug.png", "Royal Bug.png", "Medic Bug.png"];
let spriteSheets = [];
let animations = [];
let speedMod = 0;

const GameState = {
  Start: "Start",
  Playing: "Playing",
  GameOver: "GameOver"
};

let game = {score: 0, maxScore: 0, maxTime: 30, elapsedTime: 0, totalSprites: 15, state: GameState.Start, squashed: 0, onePoint: 0, threePoint: 1,  fivePoint: 2, lossBug: 3};

function preload(){
  for(let i = 0; i < spriteSheetFilenames.length; i++){
    spriteSheets[i] = loadImage("assets/" + spriteSheetFilenames[i]);
  }
}

function setup() {
  createCanvas(600, 600);
  imageMode(CENTER);
  angleMode(DEGREES);
  bg = loadImage('assets/Grass.jpg');
  
  reset();
}

function reset() {
  game.elapsedTime = 0;
  game.score = 0;
  game.totalSprites = random(30, 50);
  game.squashed = 0;
  speedMod = 0;
  animations = [];
  for(let i = 0; i < game.totalSprites; i++){
    animations[i] = new Bug(random(spriteSheets), 32, 32, random(100, 500), random(100, 500), 4, random(0.5, 1), 6, random([0, 1]));
  }
}

function draw() {
  switch(game.state) {
    case GameState.Playing:
      imageMode(CORNER);  
      background(bg);

      imageMode(CENTER);

      for(let i = 0; i < animations.length; i++) {
        animations[i].draw();


      }
      fill(255);
      textSize(30);
      text("Score: " + game.score, 470 , 50);
      let currentTime = game.maxTime - game.elapsedTime;
      text("Time Left: " + ceil(currentTime), 500, 25);
      
      text("Bugs Squashed: " + game.squashed, 140, 25);
      game.elapsedTime += deltaTime / 1000;

      if(currentTime < 0)
        game.state = GameState.GameOver;
      break;
    case GameState.GameOver:
      game.maxScore = max(game.score, game.maxScore);

      background(0);
      fill(255);
      textSize(40);
      textAlign(CENTER);
      text("Game Over!", 300, 250);
      textSize(35);
      text("Score: " + game.score, 300, 300);
      text("Max Score: " + game.maxScore, 300, 330);
      break;
    case GameState.Start:
      background(0);
      fill(255);
      textSize(50);
      textAlign(CENTER);
      text("Bug Squish",300,250);
      textSize(30);
      text("Press Any Key to Start",300,350);
      textSize(20);
      text("Red = 1 Blue = 3  Purple = 5  White =  - 5", 300, 400);
      break;
  }
}

function keyPressed(){
  switch(game.state) {
    case GameState.Start:
      game.state = GameState.Playing;
      break;
    case GameState.GameOver:
      reset();
      game.state = GameState.Playing;
      break;
  }
}

function mousePressed() {
  switch(game.state) {
    case GameState.Playing:
      for (let i=0; i < animations.length; i++) {
        let contains = animations[i].contains(mouseX,mouseY);
        if (contains) {
          if (animations[i].moving != 0) {
            animations[i].stop();
            game.squashed += 1;
            speedMod += .15
            for(let i = 0; i < animations.length; i++) {
                animations[i].speedUp(speedMod);
              }
            if (animations[i].spritesheet === spriteSheets[game.fivePoint]){
                game.score += 5;
                game.squashed += 1;
            }
            else if(animations[i].spritesheet === spriteSheets[game.threePoint]){
                game.score += 3;
            }
            else if(animations[i].spritesheet === spriteSheets[game.onePoint]){
                game.score += 1;
            }
            else{
                game.score -= 5;
            }
                
          }
        }
      }
      break;
    }
}

class Bug {
  constructor(spritesheet, sw, sh, dx, dy, animationLength, speed, framerate, vertical = false) {
    this.spritesheet = spritesheet;
    this.sw = sw;
    this.sh = sh;
    this.dx = dx;
    this.dy = dy;
    this.u = 0;
    this.v = 0;
    this.animationLength = animationLength;
    this.currentFrame = 0;
    this.moving = 1;
    this.xDirection = 1;
    this.speed = speed;
    this.defaultSpeed = speed;
    this.framerate = framerate;
    this.vertical = vertical;
  }

  draw()  {
    if(this.moving != 0){
      this.u = (this.currentFrame % this.animationLength);
    }
    push();
    translate(this.dx, this.dy);
    if(!this.vertical){
        rotate(90); 
    }
    else
        rotate(180);
    scale( 1, this.xDirection);
       
    

     image(this.spritesheet, 0, 0, this.sw, this.sh, this.u*this.sw, this.v*this.sh, this.sw, this.sh);
     pop();

    let proportionalFramerate = round(frameRate() / this.framerate);
    if (frameCount % proportionalFramerate == 0) {
       this.currentFrame++;
     }
    
    if (this.vertical) {
       this.dy += this.moving*this.speed;
       this.move(this.dy,this.sw / 4,height - this.sw / 4);
    }
     else {
       this.dx += this.moving*this.speed;
       this.move(this.dx,this.sw / 4,width - this.sw / 4);
     }

    
  }
  
  move(position,lowerBounds,upperBounds) {
    if (position > upperBounds) {
      this.moveLeft();
    } else if (position < lowerBounds) {
      this.moveRight();
    }
  }

  moveRight() {
    this.moving = 1;
    this.xDirection = 1;
    this.v = 0;
  }

  moveLeft() {
    this.moving = -1;
    this.xDirection = -1;
    this.v = 0;
  }

  contains(x, y){
    let insideX = x >= this.dx - 10 && x <= this.dx + 10;
    let insideY = y >= this.dy - 20 && y <= this.dy + 20;
    return insideX && insideY;
  }

  stop() {
    this.moving = 0;
    this.u = 4;
  }

  speedUp(mod){
    this.speed = this.defaultSpeed;
    this.speed += mod;

  }


}