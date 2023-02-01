function setup() {
    createCanvas(500, 500);
    strokeWeight(8);
    stroke(255);
  }
  
  function draw() {
    background(0, 0, 153);
  
    fill(0, 153, 0);
    ellipse(250, 250, 250, 250);
  
    fill(255, 0, 0);
    translate(250, 250);
    rotate(60);
    //rotate(frameCount / 50.0);
    star(0, 0, 50, 125, 5);
  }
  
  function star(x, y, radius1, radius2, npoints) {
    let angle = TWO_PI / npoints;
    let halfAngle = angle / 2.0;
    beginShape();
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = x + cos(a) * radius2;
      let sy = y + sin(a) * radius2;
      vertex(sx, sy);
      sx = x + cos(a + halfAngle) * radius1;
      sy = y + sin(a + halfAngle) * radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
  }

  