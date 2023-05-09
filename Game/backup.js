
let sounds = new Tone.Players({
  "Break": "sounds/Squash.wav",
  "Power": "sounds/powerUp.wav",
  "Soft": "sounds/Blip.wav"
}).toDestination();

const GameState = {
    Start: "Start",
    Playing: "Playing",
    GameOver: "GameOver"
};

let game = {score: 0, maxScore: 0, state: GameState.Start, ballCount: 1};

let leftWall, roof, rightWall, floor;
let extra, start;
let p1, ball, powerUp, bricks; 

let midi;
let synth, menuSong, gameSong, endSong;
//let menuMelody = ["C3", ["E3", "G3", "D3", "C3"], "A3", "B2", "C2", "E3", ["A2", "G2"], "C4"];
let menuMelody = [[null, "C4", "E4", "C4"], [ null, "C4"], "E4", [null, "A3", "C4", "A3"], [ null, "A3"], "C4", [null, "F3", "A3", "F3"], [ null, "F3"], "A3", [null, "G3", "B3", "G3"], [ null, "G3"], ["G3", "A3", "B3"], ["D4", "E4"], "C4"];
let gameMelody = [["C4", "G3", "D#4", "E4", "C4", null, "G3", "C4"], [null, "G3", "D#4", "E4", "C4", "D#3", "D#3", "D#3"], ["C4", "G3", "D4#", "E4", "C4", null, "A#3", "G3"], null, ["C4", "D4", "D#4", "D4", "C4", "A3", "G3", "F3"], [null, null, "A5", "C6", "D6", "A5", null, null], ["C4", "D4", "D#4", "D4", "C4", "A3", "G3", "F3"], [null, null, "A5", "C6", "C#6", "C#5", null, null]];
let endMelody = [[null, "C4", "D4", "C4", "D4", "C4", "D4", "C4"], ["D4", "C4", "D4", "E4", null, "C4", "C4", "C4"], [null, "G#3", "G#3", "G#3", "G#3", "G#3", "A#3", "G#3"], ["G3", "G3", "A3", "B3", "B3", "B3", "B3", "B3"], [null, "C4", "D4", "C4", "D4", "C4", "D4", "C4"], ["D4", "C4", "D4", "E4", null, "C4", "C4", "C4"], ["G#3", "C4", "C4", "C4", "D4", "C4", "B3", "C4"], null ];


let port;
let writer;
let reader;
let slider; 
let clicked = false;
let xInput, yInput;
let joySwitch, buttonPress;
let sensorData = {};
const encoder = new TextEncoder();
const decorder = new TextDecoder();

function setup() {
    createCanvas(800, 600);

    if ("serial" in navigator) {
      // The Web Serial API is supported.
      let button = createButton("connect");
      button.position(0, 600);
      button.mousePressed(connect);
    }

    synth = new Tone.Synth({
    oscillator: {
      type: "triangle"
    },
    envelope: {
      attack: 0.05,
      decay: 0.5,
      sustain: 1,
      release: 5
    }
  }).toDestination();

    bricks = new Group();
    bricks.collider = 'n'; 
    bricks.mass = 100;
	  bricks.w = 40;
	  bricks.h = 25;
	  bricks.tile = '=';

    menuSong = new Tone.Sequence(function(time, note) {
    synth.triggerAttackRelease(note, 0.2);
    }, menuMelody, '4n');
    gameSong = new Tone.Sequence(function(time, note) {
    synth.triggerAttackRelease(note, 0.2);
    }, gameMelody, '1n');
    endSong = new Tone.Sequence(function(time, note) {
    synth.triggerAttackRelease(note, 0.2);
    }, endMelody, '1n');
    Tone.Transport.bpm.value = 120;
    Tone.Transport.start();

    synth.volume.value = -15;

    reset();
}

function reset() {

    game.ballCount = 1;
    game.score = 0;

    new Tiles(
		[
			'===============',
			'===============',
			'===============',
			'===============', 
			'===============',
			'...............',
			'...............',
			'...............'
		],
		100,
		60,
		bricks.w + 2,
		bricks.h + 2
	);

    

    leftWall = new Sprite();
    leftWall.collider = 'n';
    leftWall.h = 600;
    leftWall.w = 5;
    leftWall.color = 'purple';
    leftWall.pos = {x: 2, y: 300};

    roof = new Sprite();
    roof.collider = 'n';
    roof.h = 30;
    roof.w = 800;
    roof.color = 'purple';
    roof.pos = {x: 400, y: 10};

    rightWall = new Sprite();
    rightWall.collider = 'n';
    rightWall.h = 600;
    rightWall.w = 5;
    rightWall.color = 'purple';
    rightWall.pos = {x: 798, y: 300};

    floor = new Sprite();
    floor.collider = 'n';
    floor.h = 5;
    floor.w = 800;
    floor.color = 'red';
    floor.pos = {x: 400, y: 598};

    extra = false;
    start = false;

    p1 = new Sprite();
    p1.collider = 'n';
    p1.h = 10
    p1.w = 50;
    p1.pos = {x: 400,y: 500}

    ball = new Group();
    ball.collider = 'n';
    ball.diameter = 10;
    new ball.Sprite(400, 490);

    powerUp = new Group()
    powerUp.w = 20;
    powerUp.h = 20;
    powerUp.rotation = 45;
    powerUp.vel.y = 2;

    ball.overlaps(bricks, destroy);
    ball.overlaps(p1, paddleBounce);
    ball.overlaps(leftWall, leftBounce);
    ball.overlaps(rightWall, rightBounce);
    ball.overlaps(roof, roofBounce);
    ball.overlaps(ball, ballBounce);
    ball.overlaps(floor, loseBall);
    powerUp.overlaps(p1, extraBall);

  }

  function destroy(ball, brick){
    //sounds.player("Break").start();
    game.score++;
    if(random(0, 9) >= 7)
        new powerUp.Sprite(brick.x, brick.y);
    brick.remove();
    clicked = true;
    setTimeout(() => { clicked = false; }, 500);
    ball.vel.y = -ball.vel.y;
    ball.vel.x = random(-5, 5);
    //ball.vel.y = -(ball.vel.y / abs(ball.vel.y)) *7;
  }

  function paddleBounce(ball){
    ball.vel.y = -ball.vel.y;
    sounds.player("Soft").start();
  }

  function leftBounce(ball){
    ball.vel.x = -ball.vel.x;
    sounds.player("Soft").start();
  }

  function rightBounce(ball){
    ball.vel.x = -ball.vel.x;
    sounds.player("Soft").start();
  }

  function roofBounce(ball){
    ball.vel.y = -ball.vel.y;
    ball.vel.x = random(-5, 5);
    sounds.player("Soft").start();
  }

  function ballBounce(ball, randomBall){
    ball.vel.y = -ball.vel.y;
    ball.vel.x = random(-5, 5);
    randomBall.vel.y = -ball.vel.y;
    randomBall.vel.x = random(-5, 5);
  }

  function extraBall(powerUp){
    powerUp.remove();
    game.ballCount++;
    extra = true;
  }

  function loseBall(ball){
    game.ballCount--;
  }



  
  function draw() {
    background(0);
    roof.textSize = 25;
    roof.text = "Score: " + game.score + "\t\t\t Balls: " + game.ballCount;

    if (reader) {
      serialRead();
    }
      
    if (writer) {
      if(clicked)
        writer.write( new Uint8Array([ 65 ]));
      else
        writer.write( new Uint8Array([ 0 ]));
    }
  
    buttonPress = sensorData.Press;
    joySwitch = sensorData.Switch;
    xInput = sensorData.Xaxis;
    yInput = sensorData.Yaxis;

    switch(game.state){
        case GameState.Playing:
            endSong.stop();
            menuSong.stop();
            gameSong.start();
            //fill(255);
            //textSize(30);
            if(game.ballCount == 0 || game.score == 75){
                allSprites.remove();
                //bricks.removeAll();
                game.state = GameState.GameOver;
            }
            break;
        case GameState.GameOver:
            gameSong.stop();
            endSong.start();
            game.maxScore = max(game.score, game.maxScore);
            background(0);
            fill(255);
            textSize(40);
            textAlign(CENTER);
            if(game.score == 75)
                text("You WIN!!!", 500, 300);
            text("Game Over!", 400, 250);
            textSize(35);
            text("Score: " + game.score, 400, 300);
            text("Max Score: " + game.maxScore, 400, 330);
            if(kb.presses("space") || buttonPress == 1){
                reset();
                game.state = GameState.Playing;
            }
            break;
        case GameState.Start:
            background(0);
            fill(255);
            textSize(50);
            textAlign(CENTER);
            text("Demon BreakOut",400,250);
            textSize(30);
            text("Press Space to Start",400,350);
            Tone.start();
            menuSong.start();
            if(kb.presses("space") || buttonPress == 1)
                game.state = GameState.Playing;
            break;
            
    }

    if(start == false){
        ball.x = p1.x;
    }

    if((kb.presses("space") || buttonPress == 1) && start == false){
        ball.vel.y = -5 ;
        start = true;
    }

    if(extra){
        new ball.Sprite(p1.x, p1.y - 10).vel.y = -5;
        sounds.player("Power").start();
        extra = false;
    }

    if(xInput >= 130 && p1.x < 780){
      p1.vel.x = map(xInput, 130, 255, 1, 10);
      //p1.vel.x = 7;
      //console.log(map(xInput, 130, 255, 1, 7));
    }
    else if(xInput <= 120 && p1.x > 10){
      p1.vel.x = map(xInput, 120, 0, -1, -10);
      //p1.vel.x = -7;
      //console.log(map(xInput, -128, -6, 1, 7));
    }

    else if((kb.pressing('right')) && p1.x < 780)
        p1.vel.x = 7
    else if((kb.pressing('left')) && p1.x > 10)
        p1.vel.x = -7;
    else
        p1.vel.x = 0;
  }

  async function serialRead() {
    while(true) {
      const { value, done } = await reader.read();
      if (done) {
        reader.releaseLock();
        break;
      }
      console.log(value);
      sensorData = JSON.parse(value);
    }
  }
  
  async function connect() {
    port = await navigator.serial.requestPort();
  
    await port.open({ baudRate: 57600 });
  
    writer = port.writable.getWriter();
  
    reader = port.readable.pipeThrough(new TextDecoderStream())
    .pipeThrough(new TransformStream(new LineBreakTransformer()))
    .getReader();
  }

  class LineBreakTransformer {
    constructor() {
      // A container for holding stream data until a new line.
      this.chunks = "";
    }
  
    transform(chunk, controller) {
      // Append new chunks to existing chunks.
      this.chunks += chunk;
      // For each line breaks in chunks, send the parsed lines out.
      const lines = this.chunks.split("\n");
      this.chunks = lines.pop();
      lines.forEach((line) => controller.enqueue(line));
    }
  
    flush(controller) {
      // When the stream is closed, flush any remaining chunks out.
      controller.enqueue(this.chunks);
    }
  }
          