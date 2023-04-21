
let spriteSheetFilenames = ["Red Bug.png", "Blue Bug.png", "Royal Bug.png", "Medic Bug.png"];
let spriteSheets = [];
let animations = [];
let speedMod = 0;

let sounds = new Tone.Players({
  "Squash": "sounds/Squash.wav",
  "NiceSquash": "sounds/NiceSquash.wav",
  "BadSquash": "sounds/badSquash.wav"
}).toDestination();


let soundNames = ["Squash", "BadSquash"];

let midi;
let synth, menuSong, gameSong, gameEndSong, endSong;
//let menuMelody = ["C3", ["E3", "G3", "D3", "C3"], "A3", "B2", "C2", "E3", ["A2", "G2"], "C4"];
let menuMelody = [[null, "C4", "E4", "C4"], [ null, "C4"], "E4", [null, "A3", "C4", "A3"], [ null, "A3"], "C4", [null, "F3", "A3", "F3"], [ null, "F3"], "A3", [null, "G3", "B3", "G3"], [ null, "G3"], ["G3", "A3", "B3"], ["D4", "E4"], "C4"];
let gameMelody = [["C4", "G3", "D#4", "E4", "C4", null, "G3", "C4"], [null, "G3", "D#4", "E4", "C4", "D#3", "D#3", "D#3"], ["C4", "G3", "D4#", "E4", "C4", null, "A#3", "G3"], null, ["C4", "D4", "D#4", "D4", "C4", "A3", "G3", "F3"], [null, null, "A5", "C6", "D6", "A5", null, null], ["C4", "D4", "D#4", "D4", "C4", "A3", "G3", "F3"], [null, null, "A5", "C6", "C#6", "C#5", null, null]];
let gameEndMelody = [["C4", "G3", "D#4", "E4", "C4", null, "G3", "C4"], [null, "G3", "D#4", "E4", "C4", "D#3", "D#3", "D#3"], ["C4", "G3", "D4#", "E4", "C4", null, "A#3", "G3"], null, ["C4", "D4", "D#4", "D4", "C4", "A3", "G3", "F3"], [null, null, "A5", "C6", "D6", "A5", null, null], ["C4", "D4", "D#4", "D4", "C4", "A3", "G3", "F3"], [null, null, "A5", "C6", "C#6", "C#5", null, null]];
let endMelody = [[null, "C4", "D4", "C4", "D4", "C4", "D4", "C4"], ["D4", "C4", "D4", "E4", null, "C4", "C4", "C4"], [null, "G#3", "G#3", "G#3", "G#3", "G#3", "A#3", "G#3"], ["G3", "G3", "A3", "B3", "B3", "B3", "B3", "B3"], [null, "C4", "D4", "C4", "D4", "C4", "D4", "C4"], ["D4", "C4", "D4", "E4", null, "C4", "C4", "C4"], ["G#3", "C4", "C4", "C4", "D4", "C4", "B3", "C4"], null ];

let speedUp = false;

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

  if ("serial" in navigator) {
    // The Web Serial API is supported.
    let button = createButton("connect");
    button.position(0, 600);
    button.mousePressed(connect);
  }

  bg = loadImage('assets/Grass.jpg');


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



  menuSong = new Tone.Sequence(function(time, note) {
    synth.triggerAttackRelease(note, 0.2);
  }, menuMelody, '4n');
  gameSong = new Tone.Sequence(function(time, note) {
    synth.triggerAttackRelease(note, 0.2);
  }, gameMelody, '1n');
  gameEndSong = new Tone.Sequence(function(time, note) {
    synth.triggerAttackRelease(note, 0.2);
  }, gameEndMelody, '2n');
  endSong = new Tone.Sequence(function(time, note) {
    synth.triggerAttackRelease(note, 0.2);
  }, endMelody, '1n');
  Tone.Transport.bpm.value = 120;
  Tone.Transport.start();

  synth.volume.value = -15;
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

  switch(game.state) {
    case GameState.Playing:
      imageMode(CORNER);  
      background(bg);
      push();
      if(buttonPress == 1 || joySwitch == 0){
        fill('red');
        square(map(xInput, 0, 255, 0, width), map(yInput, 0, 255, 0, height), 10);
        for (let i=0; i < animations.length; i++) {
          let contains = animations[i].contains(map(xInput, 0, 255, 0, width),map(yInput, 0, 255, 0, height));
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
                  sounds.player("NiceSquash").start();
                  clicked = true;
                  setTimeout(() => { clicked = false; }, 500);
              }
              else if(animations[i].spritesheet === spriteSheets[game.threePoint]){
                  game.score += 3;
                  sounds.player("Squash").start();
                  clicked = true;
                  setTimeout(() => { clicked = false; }, 500);
              }
              else if(animations[i].spritesheet === spriteSheets[game.onePoint]){
                  game.score += 1;
                  sounds.player("Squash").start();
                  clicked = true;
                  setTimeout(() => { clicked = false; }, 500);
              }
              else{
                  game.score -= 5;
                  sounds.player("BadSquash").start();
              }
                  
            }
          }
        }
      }
      else{
        noFill
        square(map(xInput, 0, 255, 0, width), map(yInput, 0, 255, 0, height), 10);
      }
      pop();

      imageMode(CENTER);
      endSong.stop();
      menuSong.stop();
      if(speedUp == false)
        gameSong.start();
      else
        gameEndSong.start();
      

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
      
      if(currentTime <= 10 && speedUp == false){
        speedUp = true;
        gameSong.stop();
      }
      
      if(currentTime < 0){
        console.log("Game ended");
        game.state = GameState.GameOver;
      }
        
      break;
    case GameState.GameOver:
      speedUp = false;
      gameEndSong.stop();
      endSong.start();
      game.maxScore = max(game.score, game.maxScore);

      background(0);
      fill(255);
      textSize(40);
      textAlign(CENTER);
      text("Game Over!", 300, 250);
      textSize(35);
      text("Score: " + game.score, 300, 340);
      text("Max Score: " + game.maxScore, 300, 370);
      text("Press Any Key or the Joystick to reset",300,450);
      if(joySwitch == 0){
        reset();
        game.state = GameState.Playing;
      }
      break;
    case GameState.Start:
      background(0);
      fill(255);
      textSize(50);
      textAlign(CENTER);
      text("Bug Squish",300,250);
      textSize(30);
      text("Press Any Key or the Joystick to start",300,350);
      textSize(20);
      text("Red = 1 Blue = 3  Purple = 5  White =  - 5", 300, 400);
      Tone.start();
      menuSong.start();
      if(joySwitch == 0){
        game.state = GameState.Playing;
      }
      break;
  }
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
                sounds.player("NiceSquash").start();
            }
            else if(animations[i].spritesheet === spriteSheets[game.threePoint]){
                game.score += 3;
                sounds.player("Squash").start();
            }
            else if(animations[i].spritesheet === spriteSheets[game.onePoint]){
                game.score += 1;
                sounds.player("Squash").start();
            }
            else{
                game.score -= 5;
                sounds.player("BadSquash").start();
            }
                
          }
        }
      }
      break;
    }
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

function playMenuMidi() {
  // const name = midi.name
  //get the tracks
  menu.tracks.forEach(track => {
    //tracks have notes and controlChanges
  
    //notes are an array
    const notes = track.notes
    notes.forEach(note => {
      //note.midi, note.time, note.duration, note.name
      synth.triggerAttackRelease(note.name, note.duration, note.time)
    })
  
    // //the control changes are an object
    // //the keys are the CC number
    // track.controlChanges[64]
    // //they are also aliased to the CC number's common name (if it has one)
    // track.controlChanges.sustain.forEach(cc => {
    //   // cc.ticks, cc.value, cc.time
    // })
  
    //the track also has a channel and instrument
    //track.instrument.name
  })}
  

// Menu Music
let menu = {
    "header": {
      "keySignatures": [
        {
          "key": "C",
          "scale": "major",
          "ticks": 0
        }
      ],
      "meta": [],
      "name": "",
      "ppq": 1024,
      "tempos": [
        {
          "bpm": 150,
          "ticks": 0
        },
        {
          "bpm": 124.000248000496,
          "ticks": 0
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 0
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 2048
        },
        {
          "bpm": 122.98811934767102,
          "ticks": 2304
        },
        {
          "bpm": 122.46072582472196,
          "ticks": 2560
        },
        {
          "bpm": 121.991387408049,
          "ticks": 2816
        },
        {
          "bpm": 120.99530739866138,
          "ticks": 3072
        },
        {
          "bpm": 120.46862294324924,
          "ticks": 3328
        },
        {
          "bpm": 119.99928000431997,
          "ticks": 3584
        },
        {
          "bpm": 119.4719340514924,
          "ticks": 3840
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 4352
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 10240
        },
        {
          "bpm": 122.98811934767102,
          "ticks": 10496
        },
        {
          "bpm": 122.46072582472196,
          "ticks": 10752
        },
        {
          "bpm": 121.991387408049,
          "ticks": 11008
        },
        {
          "bpm": 120.99530739866138,
          "ticks": 11264
        },
        {
          "bpm": 120.46862294324924,
          "ticks": 11520
        },
        {
          "bpm": 119.99928000431997,
          "ticks": 11776
        },
        {
          "bpm": 119.4719340514924,
          "ticks": 12032
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 12544
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 18432
        },
        {
          "bpm": 122.98811934767102,
          "ticks": 18688
        },
        {
          "bpm": 122.46072582472196,
          "ticks": 18944
        },
        {
          "bpm": 121.991387408049,
          "ticks": 19200
        },
        {
          "bpm": 120.99530739866138,
          "ticks": 19456
        },
        {
          "bpm": 120.46862294324924,
          "ticks": 19712
        },
        {
          "bpm": 119.99928000431997,
          "ticks": 19968
        },
        {
          "bpm": 119.4719340514924,
          "ticks": 20224
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 20736
        },
        {
          "bpm": 124.000248000496,
          "ticks": 32767
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 32768
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 34816
        },
        {
          "bpm": 122.98811934767102,
          "ticks": 35072
        },
        {
          "bpm": 122.46072582472196,
          "ticks": 35328
        },
        {
          "bpm": 121.991387408049,
          "ticks": 35584
        },
        {
          "bpm": 120.99530739866138,
          "ticks": 35840
        },
        {
          "bpm": 120.46862294324924,
          "ticks": 36096
        },
        {
          "bpm": 119.99928000431997,
          "ticks": 36352
        },
        {
          "bpm": 119.4719340514924,
          "ticks": 36608
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 37120
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 43008
        },
        {
          "bpm": 122.98811934767102,
          "ticks": 43264
        },
        {
          "bpm": 122.46072582472196,
          "ticks": 43520
        },
        {
          "bpm": 121.991387408049,
          "ticks": 43776
        },
        {
          "bpm": 120.99530739866138,
          "ticks": 44032
        },
        {
          "bpm": 120.46862294324924,
          "ticks": 44288
        },
        {
          "bpm": 119.99928000431997,
          "ticks": 44544
        },
        {
          "bpm": 119.4719340514924,
          "ticks": 44800
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 45312
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 51200
        },
        {
          "bpm": 122.98811934767102,
          "ticks": 51456
        },
        {
          "bpm": 122.46072582472196,
          "ticks": 51712
        },
        {
          "bpm": 121.991387408049,
          "ticks": 51968
        },
        {
          "bpm": 120.99530739866138,
          "ticks": 52224
        },
        {
          "bpm": 120.46862294324924,
          "ticks": 52480
        },
        {
          "bpm": 119.99928000431997,
          "ticks": 52736
        },
        {
          "bpm": 119.4719340514924,
          "ticks": 52992
        },
        {
          "bpm": 123.98410523770852,
          "ticks": 53504
        }
      ],
      "timeSignatures": [
        {
          "ticks": 0,
          "timeSignature": [
            4,
            4
          ],
          "measures": 0
        }
      ]
    },
    "tracks": [
      {
        "channel": 0,
        "controlChanges": {
          "6": [
            {
              "number": 6,
              "ticks": 4,
              "time": 0.00189036328125,
              "value": 0.09448818897637795
            },
            {
              "number": 6,
              "ticks": 32772,
              "time": 15.560154301757814,
              "value": 0.09448818897637795
            }
          ],
          "7": [
            {
              "number": 7,
              "ticks": 0,
              "time": 0,
              "value": 0.7952755905511811
            },
            {
              "number": 7,
              "ticks": 0,
              "time": 0,
              "value": 0.8661417322834646
            }
          ],
          "10": [
            {
              "number": 10,
              "ticks": 0,
              "time": 0,
              "value": 0.7007874015748031
            }
          ],
          "38": [
            {
              "number": 38,
              "ticks": 5,
              "time": 0.0023629541015625,
              "value": 0
            },
            {
              "number": 38,
              "ticks": 32773,
              "time": 15.560626892578126,
              "value": 0
            }
          ],
          "100": [
            {
              "number": 100,
              "ticks": 3,
              "time": 0.0014177724609375,
              "value": 0
            },
            {
              "number": 100,
              "ticks": 32771,
              "time": 15.559681710937502,
              "value": 0
            }
          ],
          "101": [
            {
              "number": 101,
              "ticks": 3,
              "time": 0.0014177724609375,
              "value": 0
            },
            {
              "number": 101,
              "ticks": 32771,
              "time": 15.559681710937502,
              "value": 0
            }
          ]
        },
        "pitchBends": [],
        "instrument": {
          "family": "piano",
          "number": 1,
          "name": "bright acoustic piano"
        },
        "name": "Piano",
        "notes": [
          {
            "duration": 0.015122906249999998,
            "durationTicks": 32,
            "midi": 70,
            "name": "A#4",
            "ticks": 10,
            "time": 0.004725908203125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.015122906249999998,
            "durationTicks": 32,
            "midi": 71,
            "name": "B4",
            "ticks": 10,
            "time": 0.004725908203125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.2117206875,
            "durationTicks": 448,
            "midi": 72,
            "name": "C5",
            "ticks": 64,
            "time": 0.0302458125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09451816406250002,
            "durationTicks": 200,
            "midi": 67,
            "name": "G4",
            "ticks": 546,
            "time": 0.258034587890625,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 1054,
            "time": 0.498110724609375,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312498,
            "durationTicks": 202,
            "midi": 76,
            "name": "E5",
            "ticks": 1559,
            "time": 0.7367690888671875,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312498,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 2069,
            "time": 0.9777904072265625,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09540013574218742,
            "durationTicks": 197,
            "midi": 67,
            "name": "G4",
            "ticks": 3084,
            "time": 1.46207117578125,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09716855175781247,
            "durationTicks": 199,
            "midi": 72,
            "name": "C5",
            "ticks": 3589,
            "time": 1.7071869208984374,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09451816406250035,
            "durationTicks": 200,
            "midi": 67,
            "name": "G4",
            "ticks": 4642,
            "time": 2.2179025878906247,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 5150,
            "time": 2.457978724609375,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312487,
            "durationTicks": 202,
            "midi": 76,
            "name": "E5",
            "ticks": 5655,
            "time": 2.6966370888671873,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312487,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 6165,
            "time": 2.9376584072265626,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.7164476835937497,
            "durationTicks": 1516,
            "midi": 63,
            "name": "D#4",
            "ticks": 6675,
            "time": 3.1786797255859374,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.11058625195312466,
            "durationTicks": 234,
            "midi": 72,
            "name": "C5",
            "ticks": 8196,
            "time": 3.89749036328125,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09451816406249947,
            "durationTicks": 200,
            "midi": 67,
            "name": "G4",
            "ticks": 8738,
            "time": 4.153634587890625,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 9246,
            "time": 4.393710724609375,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 76,
            "name": "E5",
            "ticks": 9751,
            "time": 4.632369088867187,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 10261,
            "time": 4.873390407226562,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09540013574218786,
            "durationTicks": 197,
            "midi": 70,
            "name": "A#4",
            "ticks": 11276,
            "time": 5.35767117578125,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.0971685517578127,
            "durationTicks": 199,
            "midi": 67,
            "name": "G4",
            "ticks": 11781,
            "time": 5.6027869208984376,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 13342,
            "time": 6.353578724609375,
            "velocity": 0.3543307086614173
          },
          {
            "duration": 0.10775070703125067,
            "durationTicks": 228,
            "midi": 60,
            "name": "C4",
            "ticks": 13342,
            "time": 6.353578724609375,
            "velocity": 0.3543307086614173
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 13342,
            "time": 6.353578724609375,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.7164476835937501,
            "durationTicks": 1516,
            "midi": 58,
            "name": "A#3",
            "ticks": 14867,
            "time": 7.074279725585938,
            "velocity": 0.47244094488188976
          },
          {
            "duration": 0.7164476835937501,
            "durationTicks": 1516,
            "midi": 60,
            "name": "C4",
            "ticks": 14867,
            "time": 7.074279725585938,
            "velocity": 0.47244094488188976
          },
          {
            "duration": 0.5666363935546874,
            "durationTicks": 1199,
            "midi": 64,
            "name": "E4",
            "ticks": 14867,
            "time": 7.074279725585938,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.06049162500000094,
            "durationTicks": 128,
            "midi": 70,
            "name": "A#4",
            "ticks": 16128,
            "time": 7.67021675,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.06049162499999916,
            "durationTicks": 128,
            "midi": 71,
            "name": "B4",
            "ticks": 16256,
            "time": 7.730708375000001,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1517016533203126,
            "durationTicks": 321,
            "midi": 72,
            "name": "C5",
            "ticks": 16388,
            "time": 7.79309036328125,
            "velocity": 0.4645669291338583
          },
          {
            "duration": 0.09451816406249947,
            "durationTicks": 200,
            "midi": 74,
            "name": "D5",
            "ticks": 16930,
            "time": 8.049234587890625,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 17438,
            "time": 8.289310724609376,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 74,
            "name": "D5",
            "ticks": 17943,
            "time": 8.527969088867188,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 18453,
            "time": 8.768990407226562,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09425853613281276,
            "durationTicks": 197,
            "midi": 69,
            "name": "A4",
            "ticks": 18963,
            "time": 9.011103174804687,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09540013574218698,
            "durationTicks": 197,
            "midi": 67,
            "name": "G4",
            "ticks": 19468,
            "time": 9.25327117578125,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.0971685517578127,
            "durationTicks": 199,
            "midi": 65,
            "name": "F4",
            "ticks": 19973,
            "time": 9.498386920898438,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 81,
            "name": "A5",
            "ticks": 21534,
            "time": 10.249178724609378,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 84,
            "name": "C6",
            "ticks": 22039,
            "time": 10.48783708886719,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 86,
            "name": "D6",
            "ticks": 22549,
            "time": 10.728858407226564,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 84,
            "name": "C6",
            "ticks": 23059,
            "time": 10.96987972558594,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.11058625195312466,
            "durationTicks": 234,
            "midi": 72,
            "name": "C5",
            "ticks": 24580,
            "time": 11.688690363281252,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09451816406249947,
            "durationTicks": 200,
            "midi": 74,
            "name": "D5",
            "ticks": 25122,
            "time": 11.944834587890627,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 25630,
            "time": 12.184910724609377,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 74,
            "name": "D5",
            "ticks": 26135,
            "time": 12.42356908886719,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 26645,
            "time": 12.664590407226564,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 69,
            "name": "A4",
            "ticks": 27155,
            "time": 12.905611725585938,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 67,
            "name": "G4",
            "ticks": 27660,
            "time": 13.144270089843753,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09404557324218743,
            "durationTicks": 199,
            "midi": 65,
            "name": "F4",
            "ticks": 28165,
            "time": 13.382928454101565,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 81,
            "name": "A5",
            "ticks": 29726,
            "time": 14.120642724609377,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 84,
            "name": "C6",
            "ticks": 30231,
            "time": 14.35930108886719,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 85,
            "name": "C#6",
            "ticks": 30741,
            "time": 14.600322407226564,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 73,
            "name": "C#5",
            "ticks": 31251,
            "time": 14.84134372558594,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.015122906249999346,
            "durationTicks": 32,
            "midi": 70,
            "name": "A#4",
            "ticks": 32778,
            "time": 15.56298984667969,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.015122906249999346,
            "durationTicks": 32,
            "midi": 71,
            "name": "B4",
            "ticks": 32778,
            "time": 15.56298984667969,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.21172068749999973,
            "durationTicks": 448,
            "midi": 72,
            "name": "C5",
            "ticks": 32832,
            "time": 15.588509750976565,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09451816406249947,
            "durationTicks": 200,
            "midi": 67,
            "name": "G4",
            "ticks": 33314,
            "time": 15.81629852636719,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 33822,
            "time": 16.05637466308594,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 76,
            "name": "E5",
            "ticks": 34327,
            "time": 16.295033027343752,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 34837,
            "time": 16.53605434570313,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09540013574218875,
            "durationTicks": 197,
            "midi": 67,
            "name": "G4",
            "ticks": 35852,
            "time": 17.020335114257815,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09716855175781092,
            "durationTicks": 199,
            "midi": 72,
            "name": "C5",
            "ticks": 36357,
            "time": 17.265450859375,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09451816406249947,
            "durationTicks": 200,
            "midi": 67,
            "name": "G4",
            "ticks": 37410,
            "time": 17.776166526367188,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 37918,
            "time": 18.016242663085936,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312709,
            "durationTicks": 202,
            "midi": 76,
            "name": "E5",
            "ticks": 38423,
            "time": 18.25490102734375,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 38933,
            "time": 18.495922345703125,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 63,
            "name": "D#4",
            "ticks": 39443,
            "time": 18.7369436640625,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.11058625195312288,
            "durationTicks": 234,
            "midi": 72,
            "name": "C5",
            "ticks": 40964,
            "time": 19.455754301757814,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09451816406250302,
            "durationTicks": 200,
            "midi": 67,
            "name": "G4",
            "ticks": 41506,
            "time": 19.711898526367186,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 42014,
            "time": 19.951974663085938,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 76,
            "name": "E5",
            "ticks": 42519,
            "time": 20.19063302734375,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 43029,
            "time": 20.431654345703127,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09540013574218875,
            "durationTicks": 197,
            "midi": 70,
            "name": "A#4",
            "ticks": 44044,
            "time": 20.915935114257813,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09716855175781092,
            "durationTicks": 199,
            "midi": 67,
            "name": "G4",
            "ticks": 44549,
            "time": 21.161050859375,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 46110,
            "time": 21.911842663085935,
            "velocity": 0.3543307086614173
          },
          {
            "duration": 0.10775070703125067,
            "durationTicks": 228,
            "midi": 60,
            "name": "C4",
            "ticks": 46110,
            "time": 21.911842663085935,
            "velocity": 0.3543307086614173
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 46110,
            "time": 21.911842663085935,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 58,
            "name": "A#3",
            "ticks": 47635,
            "time": 22.6325436640625,
            "velocity": 0.47244094488188976
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 60,
            "name": "C4",
            "ticks": 47635,
            "time": 22.6325436640625,
            "velocity": 0.47244094488188976
          },
          {
            "duration": 0.5666363935546848,
            "durationTicks": 1199,
            "midi": 64,
            "name": "E4",
            "ticks": 47635,
            "time": 22.6325436640625,
            "velocity": 0.5511811023622047
          },
          {
            "duration": 0.060491624999997384,
            "durationTicks": 128,
            "midi": 70,
            "name": "A#4",
            "ticks": 48896,
            "time": 23.228480688476562,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.06049162500000094,
            "durationTicks": 128,
            "midi": 71,
            "name": "B4",
            "ticks": 49024,
            "time": 23.28897231347656,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1517016533203126,
            "durationTicks": 321,
            "midi": 72,
            "name": "C5",
            "ticks": 49156,
            "time": 23.351354301757812,
            "velocity": 0.4645669291338583
          },
          {
            "duration": 0.09451816406249947,
            "durationTicks": 200,
            "midi": 74,
            "name": "D5",
            "ticks": 49698,
            "time": 23.607498526367188,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 50206,
            "time": 23.847574663085936,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 74,
            "name": "D5",
            "ticks": 50711,
            "time": 24.08623302734375,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 51221,
            "time": 24.327254345703125,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09425853613281276,
            "durationTicks": 197,
            "midi": 69,
            "name": "A4",
            "ticks": 51731,
            "time": 24.56936711328125,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09540013574218875,
            "durationTicks": 197,
            "midi": 67,
            "name": "G4",
            "ticks": 52236,
            "time": 24.81153511425781,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09716855175781092,
            "durationTicks": 199,
            "midi": 65,
            "name": "F4",
            "ticks": 52741,
            "time": 25.056650859374997,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 81,
            "name": "A5",
            "ticks": 54302,
            "time": 25.807442663085933,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312709,
            "durationTicks": 202,
            "midi": 84,
            "name": "C6",
            "ticks": 54807,
            "time": 26.046101027343745,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 86,
            "name": "D6",
            "ticks": 55317,
            "time": 26.28712234570312,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.0931003916015598,
            "durationTicks": 197,
            "midi": 84,
            "name": "C6",
            "ticks": 55827,
            "time": 26.528143664062497,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.11058625195312288,
            "durationTicks": 234,
            "midi": 72,
            "name": "C5",
            "ticks": 57348,
            "time": 27.24695430175781,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09451816406250302,
            "durationTicks": 200,
            "midi": 74,
            "name": "D5",
            "ticks": 57890,
            "time": 27.503098526367182,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 75,
            "name": "D#5",
            "ticks": 58398,
            "time": 27.743174663085934,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 74,
            "name": "D5",
            "ticks": 58903,
            "time": 27.981833027343747,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 72,
            "name": "C5",
            "ticks": 59413,
            "time": 28.222854345703123,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 69,
            "name": "A4",
            "ticks": 59923,
            "time": 28.463875664062495,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 67,
            "name": "G4",
            "ticks": 60428,
            "time": 28.702534028320308,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09404557324218743,
            "durationTicks": 199,
            "midi": 65,
            "name": "F4",
            "ticks": 60933,
            "time": 28.94119239257812,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 81,
            "name": "A5",
            "ticks": 62494,
            "time": 29.678906663085932,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 84,
            "name": "C6",
            "ticks": 62999,
            "time": 29.91756502734375,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 85,
            "name": "C#6",
            "ticks": 63509,
            "time": 30.15858634570312,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 73,
            "name": "C#5",
            "ticks": 64019,
            "time": 30.399607664062497,
            "velocity": 0.5039370078740157
          }
        ],
        "endOfTrackTicks": 65537
      },
      {
        "channel": 1,
        "controlChanges": {
          "6": [
            {
              "number": 6,
              "ticks": 4,
              "time": 0.00189036328125,
              "value": 0.09448818897637795
            },
            {
              "number": 6,
              "ticks": 32772,
              "time": 15.560154301757814,
              "value": 0.09448818897637795
            }
          ],
          "7": [
            {
              "number": 7,
              "ticks": 0,
              "time": 0,
              "value": 0.7952755905511811
            },
            {
              "number": 7,
              "ticks": 0,
              "time": 0,
              "value": 0.8031496062992126
            }
          ],
          "10": [
            {
              "number": 10,
              "ticks": 0,
              "time": 0,
              "value": 0.33858267716535434
            }
          ],
          "38": [
            {
              "number": 38,
              "ticks": 5,
              "time": 0.0023629541015625,
              "value": 0
            },
            {
              "number": 38,
              "ticks": 32773,
              "time": 15.560626892578126,
              "value": 0
            }
          ],
          "100": [
            {
              "number": 100,
              "ticks": 3,
              "time": 0.0014177724609375,
              "value": 0
            },
            {
              "number": 100,
              "ticks": 32771,
              "time": 15.559681710937502,
              "value": 0
            }
          ],
          "101": [
            {
              "number": 101,
              "ticks": 3,
              "time": 0.0014177724609375,
              "value": 0
            },
            {
              "number": 101,
              "ticks": 32771,
              "time": 15.559681710937502,
              "value": 0
            }
          ]
        },
        "pitchBends": [],
        "instrument": {
          "family": "piano",
          "number": 1,
          "name": "bright acoustic piano"
        },
        "name": "Instrument2",
        "notes": [
          {
            "duration": 0.10775070703124999,
            "durationTicks": 228,
            "midi": 48,
            "name": "C3",
            "ticks": 10,
            "time": 0.004725908203125,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 1054,
            "time": 0.498110724609375,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.07892266699218753,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 1054,
            "time": 0.498110724609375,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 1054,
            "time": 0.498110724609375,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312498,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 1559,
            "time": 0.7367690888671875,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312498,
            "durationTicks": 202,
            "midi": 55,
            "name": "G3",
            "ticks": 2069,
            "time": 0.9777904072265625,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09540013574218742,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 3084,
            "time": 1.46207117578125,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.08087219628906239,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 3084,
            "time": 1.46207117578125,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09540013574218742,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 3084,
            "time": 1.46207117578125,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09716855175781247,
            "durationTicks": 199,
            "midi": 55,
            "name": "G3",
            "ticks": 3589,
            "time": 1.7071869208984374,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.11476283203124993,
            "durationTicks": 234,
            "midi": 48,
            "name": "C3",
            "ticks": 4100,
            "time": 1.9572605078124998,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 5150,
            "time": 2.457978724609375,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.0789226669921872,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 5150,
            "time": 2.457978724609375,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 5150,
            "time": 2.457978724609375,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312487,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 5655,
            "time": 2.6966370888671873,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312487,
            "durationTicks": 202,
            "midi": 46,
            "name": "A#2",
            "ticks": 6165,
            "time": 2.9376584072265626,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.7164476835937497,
            "durationTicks": 1516,
            "midi": 53,
            "name": "F3",
            "ticks": 6675,
            "time": 3.1786797255859374,
            "velocity": 0.4251968503937008
          },
          {
            "duration": 0.7164476835937497,
            "durationTicks": 1516,
            "midi": 57,
            "name": "A3",
            "ticks": 6675,
            "time": 3.1786797255859374,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.11058625195312466,
            "durationTicks": 234,
            "midi": 48,
            "name": "C3",
            "ticks": 8196,
            "time": 3.89749036328125,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 9246,
            "time": 4.393710724609375,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.0789226669921872,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 9246,
            "time": 4.393710724609375,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156247,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 9246,
            "time": 4.393710724609375,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 9751,
            "time": 4.632369088867187,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 55,
            "name": "G3",
            "ticks": 10261,
            "time": 4.873390407226562,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09540013574218786,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 11276,
            "time": 5.35767117578125,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.08087219628906261,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 11276,
            "time": 5.35767117578125,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09540013574218786,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 11276,
            "time": 5.35767117578125,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.0971685517578127,
            "durationTicks": 199,
            "midi": 55,
            "name": "G3",
            "ticks": 11781,
            "time": 5.6027869208984376,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.11476283203124993,
            "durationTicks": 234,
            "midi": 48,
            "name": "C3",
            "ticks": 12292,
            "time": 5.8528605078125,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09546334570312442,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 13847,
            "time": 6.592237088867188,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 46,
            "name": "A#2",
            "ticks": 14357,
            "time": 6.8332584072265625,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.7164476835937501,
            "durationTicks": 1516,
            "midi": 54,
            "name": "F#3",
            "ticks": 14867,
            "time": 7.074279725585938,
            "velocity": 0.6141732283464567
          },
          {
            "duration": 0.11058625195312555,
            "durationTicks": 234,
            "midi": 53,
            "name": "F3",
            "ticks": 16388,
            "time": 7.79309036328125,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 17438,
            "time": 8.289310724609376,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 17438,
            "time": 8.289310724609376,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 53,
            "name": "F3",
            "ticks": 17943,
            "time": 8.527969088867188,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 18453,
            "time": 8.768990407226562,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09540013574218698,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 19468,
            "time": 9.25327117578125,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09540013574218698,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 19468,
            "time": 9.25327117578125,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.11476283203124993,
            "durationTicks": 234,
            "midi": 53,
            "name": "F3",
            "ticks": 20484,
            "time": 9.748460507812501,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 21534,
            "time": 10.249178724609378,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 21534,
            "time": 10.249178724609378,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 53,
            "name": "F3",
            "ticks": 22039,
            "time": 10.48783708886719,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 46,
            "name": "A#2",
            "ticks": 22549,
            "time": 10.728858407226564,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 48,
            "name": "C3",
            "ticks": 23059,
            "time": 10.96987972558594,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.11058625195312466,
            "durationTicks": 234,
            "midi": 53,
            "name": "F3",
            "ticks": 24580,
            "time": 11.688690363281252,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 25630,
            "time": 12.184910724609377,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 25630,
            "time": 12.184910724609377,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 53,
            "name": "F3",
            "ticks": 26135,
            "time": 12.42356908886719,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 26645,
            "time": 12.664590407226564,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 27660,
            "time": 13.144270089843753,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 27660,
            "time": 13.144270089843753,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.11058625195312644,
            "durationTicks": 234,
            "midi": 53,
            "name": "F3",
            "ticks": 28676,
            "time": 13.624422363281251,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 29726,
            "time": 14.120642724609377,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156158,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 29726,
            "time": 14.120642724609377,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 53,
            "name": "F3",
            "ticks": 30231,
            "time": 14.35930108886719,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312531,
            "durationTicks": 202,
            "midi": 47,
            "name": "B2",
            "ticks": 30741,
            "time": 14.600322407226564,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 49,
            "name": "C#3",
            "ticks": 31251,
            "time": 14.84134372558594,
            "velocity": 0.4251968503937008
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 54,
            "name": "F#3",
            "ticks": 31251,
            "time": 14.84134372558594,
            "velocity": 0.4251968503937008
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 59,
            "name": "B3",
            "ticks": 31251,
            "time": 14.84134372558594,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.1077507070312489,
            "durationTicks": 228,
            "midi": 48,
            "name": "C3",
            "ticks": 32778,
            "time": 15.56298984667969,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 33822,
            "time": 16.05637466308594,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.07892266699218808,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 33822,
            "time": 16.05637466308594,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 33822,
            "time": 16.05637466308594,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 34327,
            "time": 16.295033027343752,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 55,
            "name": "G3",
            "ticks": 34837,
            "time": 16.53605434570313,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09540013574218875,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 35852,
            "time": 17.020335114257815,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.08087219628906084,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 35852,
            "time": 17.020335114257815,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09540013574218875,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 35852,
            "time": 17.020335114257815,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09716855175781092,
            "durationTicks": 199,
            "midi": 55,
            "name": "G3",
            "ticks": 36357,
            "time": 17.265450859375,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.11476283203124993,
            "durationTicks": 234,
            "midi": 48,
            "name": "C3",
            "ticks": 36868,
            "time": 17.515524446289064,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 37918,
            "time": 18.016242663085936,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.07892266699218808,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 37918,
            "time": 18.016242663085936,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 37918,
            "time": 18.016242663085936,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312709,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 38423,
            "time": 18.25490102734375,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 46,
            "name": "A#2",
            "ticks": 38933,
            "time": 18.495922345703125,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 53,
            "name": "F3",
            "ticks": 39443,
            "time": 18.7369436640625,
            "velocity": 0.4251968503937008
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 57,
            "name": "A3",
            "ticks": 39443,
            "time": 18.7369436640625,
            "velocity": 0.5039370078740157
          },
          {
            "duration": 0.11058625195312288,
            "durationTicks": 234,
            "midi": 48,
            "name": "C3",
            "ticks": 40964,
            "time": 19.455754301757814,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 42014,
            "time": 19.951974663085938,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.07892266699218808,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 42014,
            "time": 19.951974663085938,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 42014,
            "time": 19.951974663085938,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 42519,
            "time": 20.19063302734375,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 55,
            "name": "G3",
            "ticks": 43029,
            "time": 20.431654345703127,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09540013574218875,
            "durationTicks": 197,
            "midi": 58,
            "name": "A#3",
            "ticks": 44044,
            "time": 20.915935114257813,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.08087219628906084,
            "durationTicks": 167,
            "midi": 60,
            "name": "C4",
            "ticks": 44044,
            "time": 20.915935114257813,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09540013574218875,
            "durationTicks": 197,
            "midi": 64,
            "name": "E4",
            "ticks": 44044,
            "time": 20.915935114257813,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09716855175781092,
            "durationTicks": 199,
            "midi": 55,
            "name": "G3",
            "ticks": 44549,
            "time": 21.161050859375,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.11476283203124993,
            "durationTicks": 234,
            "midi": 48,
            "name": "C3",
            "ticks": 45060,
            "time": 21.41112444628906,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09546334570312709,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 46615,
            "time": 22.150501027343747,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 46,
            "name": "A#2",
            "ticks": 47125,
            "time": 22.391522345703123,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 54,
            "name": "F#3",
            "ticks": 47635,
            "time": 22.6325436640625,
            "velocity": 0.6141732283464567
          },
          {
            "duration": 0.11058625195312288,
            "durationTicks": 234,
            "midi": 53,
            "name": "F3",
            "ticks": 49156,
            "time": 23.351354301757812,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 50206,
            "time": 23.847574663085936,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 50206,
            "time": 23.847574663085936,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 53,
            "name": "F3",
            "ticks": 50711,
            "time": 24.08623302734375,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 51221,
            "time": 24.327254345703125,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09540013574218875,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 52236,
            "time": 24.81153511425781,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09540013574218875,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 52236,
            "time": 24.81153511425781,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.11476283203124993,
            "durationTicks": 234,
            "midi": 53,
            "name": "F3",
            "ticks": 53252,
            "time": 25.30672444628906,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 54302,
            "time": 25.807442663085933,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 54302,
            "time": 25.807442663085933,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312709,
            "durationTicks": 202,
            "midi": 53,
            "name": "F3",
            "ticks": 54807,
            "time": 26.046101027343745,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 46,
            "name": "A#2",
            "ticks": 55317,
            "time": 26.28712234570312,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 48,
            "name": "C3",
            "ticks": 55827,
            "time": 26.528143664062497,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.11058625195312288,
            "durationTicks": 234,
            "midi": 53,
            "name": "F3",
            "ticks": 57348,
            "time": 27.24695430175781,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 58398,
            "time": 27.743174663085934,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 58398,
            "time": 27.743174663085934,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 53,
            "name": "F3",
            "ticks": 58903,
            "time": 27.981833027343747,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 48,
            "name": "C3",
            "ticks": 59413,
            "time": 28.222854345703123,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 60428,
            "time": 28.702534028320308,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 60428,
            "time": 28.702534028320308,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.11058625195312644,
            "durationTicks": 234,
            "midi": 53,
            "name": "F3",
            "ticks": 61444,
            "time": 29.18268630175781,
            "velocity": 0.5275590551181102
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 57,
            "name": "A3",
            "ticks": 62494,
            "time": 29.678906663085932,
            "velocity": 0.4330708661417323
          },
          {
            "duration": 0.09310039160156336,
            "durationTicks": 197,
            "midi": 60,
            "name": "C4",
            "ticks": 62494,
            "time": 29.678906663085932,
            "velocity": 0.5433070866141733
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 53,
            "name": "F3",
            "ticks": 62999,
            "time": 29.91756502734375,
            "velocity": 0.4881889763779528
          },
          {
            "duration": 0.09546334570312354,
            "durationTicks": 202,
            "midi": 47,
            "name": "B2",
            "ticks": 63509,
            "time": 30.15858634570312,
            "velocity": 0.5118110236220472
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 49,
            "name": "C#3",
            "ticks": 64019,
            "time": 30.399607664062497,
            "velocity": 0.4251968503937008
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 54,
            "name": "F#3",
            "ticks": 64019,
            "time": 30.399607664062497,
            "velocity": 0.4251968503937008
          },
          {
            "duration": 0.7164476835937492,
            "durationTicks": 1516,
            "midi": 59,
            "name": "B3",
            "ticks": 64019,
            "time": 30.399607664062497,
            "velocity": 0.5039370078740157
          }
        ],
        "endOfTrackTicks": 65537
      }
    ]
  }