function setup() {
  createCanvas(1200, 800);
  background(255);
  //frameRate(165);
}

let selected = 0;

function draw() {

  stroke("black");
  strokeWeight(2);
  fill("red");
  rect(0, 0, 50, 50);

  fill("orange");
  rect(0, 50, 50, 50);

  fill("yellow");
  rect(0, 100, 50, 50);

  fill("green");
  rect(0, 150, 50, 50);

  fill("cyan");
  rect(0, 200, 50, 50);

  fill("blue");
  rect(0, 250, 50, 50);

  fill("magenta");
  rect(0, 300, 50, 50);

  fill("brown");
  rect(0, 350, 50, 50);

  fill("white");
  rect(0, 400, 50, 50);

  fill("black");
  rect(0, 450, 50, 50);

  if(mouseIsPressed){
    
    if(mouseX <= 50 && mouseY <= 50){
      selected = "red";
    }

    else if(mouseX <= 50 && (mouseY >= 50 && mouseY <= 100)){
      selected = "orange";
    }

    else if(mouseX <= 50 && (mouseY >= 100 && mouseY <= 150)){
      selected = "yellow";
    }

    else if(mouseX <= 50 && (mouseY >= 150 && mouseY <= 200)){
      selected = "green";
    }

    else if(mouseX <= 50 && (mouseY >= 200 && mouseY <= 250)){
      selected = "cyan";
    }

    else if(mouseX <= 50 && (mouseY >= 250 && mouseY <= 300)){
      selected = "blue";
    }

    else if(mouseX <= 50 && (mouseY >= 300 && mouseY <= 350)){
      selected = "magenta";
    }

    else if(mouseX <= 50 && (mouseY >= 350 && mouseY <= 400)){
      selected = "brown";
    }

    else if(mouseX <= 50 && (mouseY >= 400 && mouseY <= 450)){
      selected = "white";
    }

    else if(mouseX <= 50 && (mouseY >= 450 && mouseY <= 500)){
      selected = "black";
    }

    
    else{
      stroke(selected);
      strokeWeight(20);
      line(mouseX, mouseY, pmouseX, pmouseY);
    }
  }
}
