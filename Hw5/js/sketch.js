let sounds = new Tone.Players({

  "Hello": "sounds/HELLO.mp3",
  "Hi": "sounds/Hi.mp3",
  "Haha": "sounds/HAHA.mp3",
  "Laugh": "sounds/LAUGH.mp3",
  "Yay": "sounds/YAY.mp3",
  "Party": "sounds/PARTY.mp3"

})

const pitch = new Tone.PitchShift().toDestination();

let soundNames = ["Hello", "Hi", "Haha", "Laugh", "Yay", "Party"];
let buttons = [];

let dSlider;
let fSlider;
let pSlider;

function setup() {
  createCanvas(400, 400);
  sounds.connect(pitch);

  soundNames.forEach((word, index) => {
    buttons[index] = createButton(word);
    buttons[index].position(0, 50 + index*50);
    buttons[index].mousePressed( () => buttonSound(word))
  })

  dSlider = createSlider(0., 1., 0.5, 0.05);
  dSlider.position(200, 100);
  dSlider.mouseReleased( () => {
    pitch.delayTime.value = dSlider.value();
  })

  fSlider = createSlider(0., 1., 0.5, 0.05);
  fSlider.position(200, 200);
  fSlider.mouseReleased( () => {
    pitch.feedback.value = fSlider.value();
  })

  pSlider = createSlider(-10, 10, 0, 1);
  pSlider.position(200, 300);
  pSlider.mouseReleased( () => {
    pitch.pitch = pSlider.value();
  })



}

function draw() {
  background(220, 120, 180);
  textSize(32)
  text('Spooky Sound Sampler', 50, 25);
  textSize(15)
  text('Adjust the delay', 200, 100);
  text('Adjust the feedback', 200, 200);
  text('Adjust the pitch', 200, 300);

}

function buttonSound(wHichSound) {
    sounds.player(wHichSound).start();
}