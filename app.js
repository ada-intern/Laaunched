let counter = 10;
let started = false;

const launchBtn = document.getElementById("launch-btn");
const countdownEl = document.getElementById("countdown");
const ring = document.getElementById("ring-progress");
const countWrapper = document.getElementById("count-wrapper");
const redirectText = document.getElementById("redirect-text");
const flash = document.getElementById("flash");
const rocket = document.getElementById("rocket");

let interval;

/* -----------------------------------------
        VOICE COUNTDOWN
----------------------------------------- */
function speakNumber(num) {
  window.speechSynthesis.cancel();

  let text =
    num > 1 ? `${num}` : num === 1 ? "One... Ignition starting." : "Launch!";

  const msg = new SpeechSynthesisUtterance(text);
  msg.rate = 0.85;

  setTimeout(() => speechSynthesis.speak(msg), 150);
}

/* -----------------------------------------
   Shockwave effect at rocket ignition
----------------------------------------- */
function createShockwave() {
  const wave = document.createElement("div");
  wave.classList.add("shockwave");
  countWrapper.appendChild(wave);

  setTimeout(() => wave.remove(), 700);
}
function shakeScreen() {
  document.body.classList.add("shaking-screen");
  setTimeout(() => document.body.classList.remove("shaking-screen"), 200);
}
if (counter === 1) {
  rocket.classList.remove("hidden");
  rocket.classList.add("shake");

  // Shockwave blast
  createShockwave();
  shakeScreen();

  setTimeout(() => rocket.classList.add("fire"), 400);

  setTimeout(() => {
    rocket.classList.remove("shake");
    launching = true;
    rocketSpeed = 1.0;
    rocketY = 0;
    animateRocket();
  }, 900);
}

/* -----------------------------------------
        LAUNCH BUTTON
----------------------------------------- */
launchBtn.addEventListener("click", () => {
  if (started) return;

  started = true;
  launchBtn.style.display = "none";
  countWrapper.classList.remove("hidden");
  redirectText.classList.remove("hidden");

  startCountdown();
});

/* -----------------------------------------
        ROCKET MOVEMENT PHYSICS
----------------------------------------- */
let rocketY = 0;
let rocketSpeed = 0.6;
let launching = false;

function animateRocket() {
  if (!launching) return;

  // After half screen → speed boost
  if (Math.abs(rocketY) > window.innerHeight * 0.5) {
    rocketSpeed *= 1.04;
    createExplosion(window.innerWidth / 2, window.innerHeight / 2);
  }

  rocketY -= rocketSpeed;
  rocket.style.top = `calc(100% + ${rocketY}px)`;

  // Create spark trail
  createSparks();

  // Grand Explosion
  if (Math.abs(rocketY) > window.innerHeight * 1.2) {
    createExplosion(window.innerWidth / 2, 200);
  }

  if (Math.abs(rocketY) < window.innerHeight * 1.6) {
    requestAnimationFrame(animateRocket);
  }
  if (Math.abs(rocketY) > window.innerHeight * 1.3) {
    createExplosion(window.innerWidth / 2, 200);
    createExplosion(window.innerWidth / 2 - 120, 250);
    createExplosion(window.innerWidth / 2 + 120, 250);
  }
}

/* -----------------------------------------
        COUNTDOWN MAIN LOGIC
----------------------------------------- */
function startCountdown() {
  speakNumber(counter);

  interval = setInterval(() => {
    counter--;
    countdownEl.textContent = counter;
    speakNumber(counter);

    // Updated for new ring size (circumference = 2 * π * 120 ≈ 754)
    const circumference = 754;
    ring.style.strokeDashoffset = circumference - (counter / 10) * circumference;

    flash.classList.add("flash-animate");
    setTimeout(() => flash.classList.remove("flash-animate"), 300);

    // At 1 → LAUNCH
    if (counter === 1) {
      rocket.classList.remove("hidden");
      rocket.classList.add("shake");

      // Shockwave blast
      createShockwave();
      shakeScreen();

      setTimeout(() => rocket.classList.add("fire"), 400);

      setTimeout(() => {
        rocket.classList.remove("shake");
        launching = true;
        rocketSpeed = 1.0;
        rocketY = 0;
        animateRocket();
      }, 900);
    }

    // Speedups
    if (counter <= 5 && launching) rocketSpeed += 0.18;
    if (counter <= 2 && launching) rocketSpeed += 0.4;
    if (counter === 0 && launching) rocketSpeed += 1.5;

    // Redirect
    if (counter <= 0) {
      clearInterval(interval);
      speechSynthesis.cancel();

      // Fade out counter
      countWrapper.classList.add("fade-out");

      setTimeout(() => {
        window.location.href = "https://careeryatraa.com/";
      }, 1500);
    }
  }, 1000);
}

/* -----------------------------------------
        SIMPLE SPARK PARTICLES (🔥🔥🔥)
----------------------------------------- */
const sparksCanvas = document.getElementById("sparks");
const sparksCtx = sparksCanvas.getContext("2d");

function resizeSparks() {
  sparksCanvas.width = innerWidth;
  sparksCanvas.height = innerHeight;
}
resizeSparks();

let sparks = [];

function createSparks() {
  for (let i = 0; i < 6; i++) {
    sparks.push({
      x: window.innerWidth / 2 + (Math.random() * 40 - 20),
      y: parseFloat(rocket.style.top),
      speedX: Math.random() * 2 - 1,
      speedY: Math.random() * -3 - 1,
      size: Math.random() * 4 + 2,
      alpha: 1,
    });
  }
}

function animateSparks() {
  sparksCtx.clearRect(0, 0, innerWidth, innerHeight);

  sparks = sparks.filter((s) => s.alpha > 0);

  sparks.forEach((s) => {
    s.x += s.speedX;
    s.y += s.speedY;
    s.alpha -= 0.03;

    sparksCtx.fillStyle = `rgba(255,200,50,${s.alpha})`;
    sparksCtx.beginPath();
    sparksCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    sparksCtx.fill();
  });

  requestAnimationFrame(animateSparks);
}
animateSparks();

/* -----------------------------------------
        FIRECRACKER EXPLOSIONS (✨🔵🟡🔴)
----------------------------------------- */
const explosionCanvas = document.getElementById("explosions");
const explosionCtx = explosionCanvas.getContext("2d");

function resizeExplosions() {
  explosionCanvas.width = innerWidth;
  explosionCanvas.height = innerHeight;
}
resizeExplosions();

let explosions = [];

function createExplosion(x, y) {
  for (let i = 0; i < 40; i++) {
    explosions.push({
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 4 + 2,
      size: Math.random() * 4 + 2,
      alpha: 1,
      color: randomColor(),
    });
  }
}

function animateExplosions() {
  explosionCtx.clearRect(0, 0, innerWidth, innerHeight);

  explosions = explosions.filter((p) => p.alpha > 0);

  explosions.forEach((p) => {
    p.x += Math.cos(p.angle) * p.speed;
    p.y += Math.sin(p.angle) * p.speed;
    p.alpha -= 0.02;

    explosionCtx.fillStyle = `rgba(${p.color},${p.alpha})`;
    explosionCtx.beginPath();
    explosionCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    explosionCtx.fill();
  });

  requestAnimationFrame(animateExplosions);
}
animateExplosions();

function randomColor() {
  const colors = [
    "255,50,50",
    "255,200,50",
    "50,150,255",
    "50,255,120",
    "255,255,255",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/* -----------------------------------------
         CONFETTI (YOUR ORIGINAL CODE)
----------------------------------------- */
const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resizeCanvas();

let confettiPieces = [];

function randomConfettiColor() {
  const colors = [
    "#FFD700",
    "#FF4C4C",
    "#4CFF8F",
    "#4CA6FF",
    "#FF8F4C",
    "#FFFFFF",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function ConfettiPiece() {
  this.x = Math.random() * canvas.width;
  this.y = Math.random() * -canvas.height;
  this.size = Math.random() * 8 + 3;
  this.speed = Math.random() * 3 + 1;
  this.color = randomConfettiColor();
  this.tilt = Math.random() * 4 - 2;

  this.update = function () {
    this.y += this.speed;
    this.x += this.tilt;

    if (this.y > canvas.height + 20) {
      this.y = -10;
      this.x = Math.random() * canvas.width;
    }
  };

  this.draw = function () {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size * 1.5);
  };
}

for (let i = 0; i < 300; i++) confettiPieces.push(new ConfettiPiece());

(function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateConfetti);
})();
