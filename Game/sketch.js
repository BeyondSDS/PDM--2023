let p1, p2;
let play, quit;
let attack, magic, defend, flee;
let p1Health, p2Health, p1HealthBar, p2HealthBar;
let p1Magic, p1MagicBar;
let attackOverlay, p1Overlay, p2Overlay;
let textOverlay;
let test = 'What will our Hero do?';

let p1Turn, p2Turn;
p1Turn = true;
p2Turn = false;

let maxHp, hp, mapMp, mp, atk, def, lvl;
atk = 10;
def = 10;
maxHp = 100;
maxMp = 20;
lvl = 1;

let cursor, turtle;

const GameState = {
  Start: "Start",
  Playing: "Playing",
  GameOver: "GameOver"
};

let state = GameState.Start;

//let game = {state: GameState.Start};



function setup() {
  createCanvas(700, 600);

  hp = maxHp;
  mp = maxMp;
  //world.gravity.y = 10;

  //play = new Sprite(300, 200, 150, 50, 'none');
  //play.text = "PLAY"
  //play.color = 'red';

  //quit = new Sprite(300, 300, 150, 50, 'none');
  //quit.text = "QUIT"
  //quit.color = 'red';
  

  p1 = new Sprite();
  p1.diameter = 150;
  p1.pos = {x: 125, y: 275};

  p2 = new Sprite();
  p2.h = 150
  p2.w = 150;
  p2.pos = {x: 550, y: 150};
  enemy = new Enemy(p2, "Square", 100, 10, 10);



  p2Health = new Sprite(275, 70, 250, 20, 'none');
  p2Health.stroke = 'black';
  p2Health.color = 'white';

  p2HealthBar = new Sprite(275, 70, 250, 20, 'static');
  p2HealthBar.color = 'green';



  p1Health = new Sprite(500, 415, 250, 20, 'none');
  p1Health.stroke = 'black';
  p1Health.color = 'white';

  p1HealthBar = new Sprite(500, 415, 250, 20, 'none');
  p1HealthBar.color = 'green';

  p1Magic = new Sprite(500, 445, 250, 20, 'none');
  p1Magic.stroke = 'black';
  p1Magic.color = 'white';

  p1MagicBar = new Sprite(500, 445, 250, 20, 'none');
  p1MagicBar.color = 'blue';





  attackOverlay = new Sprite(450, 525, 400, 125, 'none');
  attackOverlay.stroke = 'red';
  attackOverlay.color = 'white';

  attack = new Sprite(350, 500, 150, 50, 'none');
  attack.text = "ATTACK";
  attack.color = 'yellow';

  magic = new Sprite(550, 500, 150, 50, 'none');
  magic.text = "MAGIC";
  magic.color = 'white';

  defend = new Sprite(350, 555, 150, 50, 'none');
  defend.text = "DEFEND";
  defend.color = 'white';

  flee = new Sprite(550, 555, 150, 50, 'none');
  flee.text = "FLEE";
  flee.color = 'white';




  cursor = new Sprite(0, 0, [
		[15, 5],
		[-15, 5],
		[0, -10]
	]);
  cursor.pos = {x: attack.x - 50, y: attack.y};


}

function draw() {
  clear();
  background(220);
  //clear(); // try removing this line and see what happens!
  //textSize(25);
  //text(hp + "/" + maxHp, 25, 375, 200, 250);

  //Player 2 overlay
  rect(10, 30, 400, 60);
  textSize(20);
  text(enemy.getName(), 20, 35, 100, 100)
  text(enemy.getHp() + "/" + 100, 75, 60, 100, 100)


  //Player 1 overlay
  rect(250, 370, 400, 90);
  textSize(20);
  text(hp + "/" + maxHp, 300, 405, 200, 250);
  text(mp + "/" + maxMp, 320, 435, 200, 250);


  //text overlay
  rect(15, 365, 225, 225);
  textSize(25);
  text("Hero", 255, 375, 100, 100);
  text("Level: " + lvl, 525, 375, 100, 100);
  text(test, 25, 375, 200, 250);


  
  if(kb.presses('up')){
    if(cursor.x == defend.x - 50){
      cursor.pos = {x: attack.x - 50, y: attack.y};
      attack.color = 'yellow';
      defend.color = 'white';
      }
    if(cursor.x == flee.x - 50){
      cursor.pos = {x: magic.x - 50, y: magic.y};
      magic.color = 'yellow';
      flee.color = 'white';
      }
    }

  if(kb.presses('down')){
    if(cursor.x == attack.x - 50){
      cursor.pos = {x: defend.x - 50, y: defend.y};
      defend.color = 'yellow';
      attack.color = 'white';
      }
    if(cursor.x == magic.x - 50){
      cursor.pos = {x: flee.x - 50, y: flee.y};
      flee.color = 'yellow';
      magic.color = 'white';
      }
    } 

  if(kb.presses('right')){
    if(cursor.y == attack.y){
      cursor.pos = {x: magic.x - 50, y: magic.y}
      magic.color = 'yellow';
      attack.color = 'white';
      }
    if(cursor.y == defend.y){
      cursor.pos = {x: flee.x - 50, y: flee.y};
      flee.color = 'yellow';
      defend.color = 'white';
      }
    }

  if(kb.presses('left')){
    if(cursor.y == flee.y){
      cursor.pos = {x: defend.x - 50, y: defend.y};
      defend.color = 'yellow';
      flee.color = 'white';
      }
    if(cursor.y == magic.y){
      cursor.pos = {x: attack.x - 50, y: attack.y};
      attack.color = 'yellow';
      magic.color = 'white';
      }
    }



  if(kb.presses('space')){
     

    if(cursor.x == attack.x - 50 && cursor.y == attack.y){
      console.log("ATTACK");
      p2HealthBar.w -= 10;
      p2HealthBar.x -= 5
    }

    if(cursor.x == defend.x - 50 && cursor.y == defend.y){
      console.log("DEFEND");
    }

    if(cursor.x == magic.x - 50 && cursor.y == magic.y){
      console.log("MAGIC");
    }

    if(cursor.x == flee.x - 50 && cursor.y == flee.y){
      console.log("FLEE");
    }
  }
}

class Enemy {
  constructor(sprite, name,  hp, atk, def){
    this.sprite = sprite;
    this.name = name;
    this.hp = hp;
    this.atk = atk;
    this.def = def;
  }

  getAtk()
  {
    return this.atk;
  }

  getDef(){
    return this.def;
  }

  getHp(){
    return this.hp;
  }

  getName(){
    return this.name;
  }

  getSprite(){
    return this.sprite;
  }


}
