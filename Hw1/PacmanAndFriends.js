function setup() {
  createCanvas(1200, 600);
  noStroke();
}

function draw() {
  background(0);

  //Pacman
  fill(255, 255, 51);
  ellipse(300, 300, 400, 400);
  fill(0);
  triangle(100, 150, 300, 300, 100, 450);

  //Blinky
  fill(255, 51, 51);
  arc(800, 300, 400, 400, PI, TAU);
  rect(600, 300, 400, 200);
  
  fill(255);
  ellipse(700, 300, 125, 125);
  ellipse(900, 300, 125, 125);

  fill(0, 102, 204)
  ellipse(700, 300, 75, 75);
  ellipse(900, 300, 75, 75);



}
