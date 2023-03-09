let synth;
let filt;
let sequence1;
let start = false;

let bgMelody = ["C5", "E5"];
function setup(){
  createCanvas(400, 400);
  bg = loadImage('assets/Coin.png');
  
  synth = new Tone.Synth({
    oscillator: {
      type: "square"
      },
      envelope: {
        attack: 0.15,
        decay: 0.15,
        sustain: .5,
        release: 1
      },
      modulation: {
        type: "square"
      },
      modulationEnvelope: {
        attack: 0.002,
        decay: 0.2,
        sustain: 0,
        release: 0.2
      }
  }).toDestination();

sequence1 = new Tone.Sequence(function(time, note) { 
  synth.triggerAttackRelease(note, 0.2);
  console.log(note, time);
}, bgMelody, '64n'); 


Tone.Transport.bpm.value = 80; 
Tone.Transport.start(); 

createButton("Coin")
    .position(175, 200)
    .mousePressed(() => {
      sequence1.start();
    start = true;
    console.log('lets go!')
    setTimeout(function(){
    sequence1.stop()
    start = false;
  }, 200);});
}


filt = new Tone.Filter({
  type : 'lowpass' ,
  frequency : 350 ,
  rolloff : -12 ,
  Q : 1 ,
  }).toDestination();;

function draw(){
  if(start === true){
    background(bg);
  }
  else{
    background(220, 120, 180);
  }

  textSize(32);
  text("Coin Jumpscare", 80, 100);
  
}


