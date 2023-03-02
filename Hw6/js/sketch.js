let pSlider;
let wahSlider;
let hSlider;
let volume;

const reverb = new Tone.JCReverb(0.4).toDestination();
const pitch = new Tone.PitchShift().toDestination();
const autoWah = new Tone.AutoWah(50, 6, -30).toDestination();
const synth = new Tone.AMSynth().chain(pitch, autoWah);


let notes = {

  'a': 'C4',
  's': 'D4',
  'd': 'E4',
  'f': 'F4',
  'g': 'G4',
  'h': 'A4',
  'j': 'B4',
  'k': 'C5'

}

function setup() {
  createCanvas(400, 400);
  reverb.toDestination();

  pSlider = createSlider(-12, 12, 0, 2);
  pSlider.position(25, 200);
  pSlider.mouseReleased( () => {
    pitch.pitch = pSlider.value();
  })

  wahSlider = createSlider(0, 12, 6, 1);
  wahSlider.position(225, 200);
  wahSlider.mouseReleased( () => {
    autoWah.Q.value = wahSlider.value();
  })

  hSlider = createSlider(0, 6, 3, 1);
  hSlider.position(225, 300);
  hSlider.mouseReleased( () => {
    synth.harmonicity.value = hSlider.value();
  })

  volume = createSlider(-18, 6, -6, 1);
  volume.position(25, 300);
  volume.mouseReleased( () => {
    synth.volume.value = volume.value();
  })

}

function draw() {
  background(220, 120, 180);

  textSize(32)
  text('Random Synth', 80, 100);

  textSize(15)
  text("a=C4 | s=D4 | d=E4 | f=F4 | g=G4 | h=A4 | j=B4 | k=C5", 20, 150)
  text('Pitch', 75, 200);
  text('autoWah', 260, 200);
  text('Volume', 65, 300);
  text('Harmonicity', 250, 300);

}

function keyPressed() {
  let whatNote = notes[key]
  synth.triggerAttackRelease(whatNote, "8n");
}