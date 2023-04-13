let port;
let writer;
let reader;
let slider; 
let dialData; 
let clicked = false;
let colorValue = 220;
const encoder = new TextEncoder();
const decorder = new TextDecoder();

function setup() {
  createCanvas(400, 400);

  
  if ("serial" in navigator) {
    // The Web Serial API is supported.
    let button = createButton("connect");
    button.position(0,0);
    button.mousePressed(connect);
  }
}


function draw() {
  background(colorValue, 0, colorValue);

  if (reader) {
    serialRead();
  }

  if (writer) {
    if(clicked)
      writer.write( new Uint8Array([ 255 ]));
    else
      writer.write( new Uint8Array([ 0 ]));

  }

  //console.log(clicked);
}

function mousePressed(){
  clicked = !clicked;
}

async function connect() {
  port = await navigator.serial.requestPort();

  await port.open({ baudRate: 9600 });

  writer = port.writable.getWriter();

  reader = port.readable.pipeThrough(new TextDecoderStream())
  .pipeThrough(new TransformStream(new LineBreakTransformer()))
  .getReader();
}

async function serialRead() {
  while(true) {
    const { value, done } = await reader.read();
    if (done) {
      reader.releaseLock();
      break;
    }
    colorValue = round(map(value, 0, 1023, 0, 255));
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
