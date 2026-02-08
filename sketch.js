// Breath Nebula — p5.js
// Move mouse: change flow direction
// Click: burst particles

let particles = [];
let bursts = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  background(0);

  // initial particles
  for (let i = 0; i < 700; i++) {
    particles.push(new Particle(random(width), random(height), random(360)));
  }
}

function draw() {
  // translucent fade for trails
  noStroke();
  fill(0, 0, 0, 6);
  rect(0, 0, width, height);

  // flow field direction from mouse
  let cx = map(mouseX, 0, width, -1, 1);
  let cy = map(mouseY, 0, height, -1, 1);

  // update particles
  for (let p of particles) {
    p.flow(cx, cy);
    p.update();
    p.draw();
  }

  // burst rings
  for (let i = bursts.length - 1; i >= 0; i--) {
    bursts[i].update();
    bursts[i].draw();
    if (bursts[i].dead()) bursts.splice(i, 1);
  }

  // subtle vignette
  vignette();
}

function mousePressed() {
  bursts.push(new Burst(mouseX, mouseY));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

class Particle {
  constructor(x, y, h) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(random(0.2, 1.2));
    this.h = h;
    this.a = random(25, 70);
    this.size = random(0.7, 2.2);
    this.life = random(120, 340);
  }

  flow(cx, cy) {
    // a smooth angle field: sin/cos + mouse bias
    let n = noise(this.pos.x * 0.002, this.pos.y * 0.002, frameCount * 0.004);
    let ang = n * TWO_PI * 2.2 + atan2(cy, cx);
    let dir = p5.Vector.fromAngle(ang).mult(0.35);
    this.vel.add(dir);
    this.vel.limit(2.4);
  }

  update() {
    this.pos.add(this.vel);
    this.life -= 1;

    // wrap around edges
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.y < 0) this.pos.y = height;
    if (this.pos.y > height) this.pos.y = 0;

    // respawn
    if (this.life <= 0) {
      this.pos.set(random(width), random(height));
      this.vel = p5.Vector.random2D().mult(random(0.2, 1.2));
      this.h = random(360);
      this.a = random(25, 70);
      this.size = random(0.7, 2.2);
      this.life = random(120, 340);
    }

    // gentle hue drift
    this.h = (this.h + 0.35) % 360;
  }

  draw() {
    stroke(this.h, 80, 100, this.a);
    strokeWeight(this.size);
    point(this.pos.x, this.pos.y);
  }
}

class Burst {
  constructor(x, y) {
    this.center = createVector(x, y);
    this.r = 0;
    this.speed = random(4, 7);
    this.alpha = 90;
    this.h = random(360);
    this.dots = [];
    let count = int(random(60, 120));
    for (let i = 0; i < count; i++) {
      let ang = map(i, 0, count, 0, TWO_PI);
      this.dots.push({
        ang,
        wobble: random(0.6, 1.8),
        offset: random(-8, 8),
      });
    }
  }

  update() {
    this.r += this.speed;
    this.alpha *= 0.97;
    this.speed *= 0.985;
  }

  draw() {
    noFill();
    for (let d of this.dots) {
      let rr = this.r + sin(frameCount * 0.08 + d.ang * 3) * d.offset;
      let x = this.center.x + cos(d.ang) * rr;
      let y = this.center.y + sin(d.ang) * rr;

      stroke(this.h, 90, 100, this.alpha);
      strokeWeight(d.wobble);
      point(x, y);
    }
  }

  dead() {
    return this.alpha < 2;
  }
}

function vignette() {
  // quick radial darkening using a few large translucent ellipses
  noStroke();
  for (let i = 0; i < 6; i++) {
    let a = 6 + i * 2;
    fill(0, 0, 0, a);
    ellipse(width / 2, height / 2, width * (1.2 + i * 0.18), height * (1.2 + i * 0.18));
  }
}
