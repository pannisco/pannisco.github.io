const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const flashes = [];

const TILE_SIZE = 100;
const ROWS = 8;
const COLS = 14;

let score = 0;

const backgroundMusic = new Audio('sounds/base.mp3');
backgroundMusic.loop = true;
backgroundMusic.volume = 0.5;  // opzionale, per regolare il volume
backgroundMusic.play();

const masterImg = new Image();
masterImg.src = 'images/master.png'; // 100x100 px

const ghostImg = new Image();
ghostImg.src = 'images/ghost1.png'; // 100x100 px

const playerImg = new Image();
playerImg.src = 'images/player.png'; // 100x100 px

const bulletImg = new Image();
bulletImg.src = 'images/bullet.png'; // 100x100 px
const spawnSound = new Audio('sounds/spawn.mp3');
const shootSound = new Audio('sounds/shoot.mp3');
const hitSound = new Audio('sounds/hit.mp3');
const gameoverSound = new Audio('sounds/gameover.mp3');

function playSound(sound) {
  const s = new Audio(sound.src); // nuova istanza ogni volta
  s.play();
}

function createFlash(x, y) {
  flashes.push({ timer: 0.1 }); // durata breve, 0.1 secondi
}

function updateFlashes(deltaTime) {
  for (let i = flashes.length - 1; i >= 0; i--) {
    flashes[i].timer -= deltaTime * 0.001;
    if (flashes[i].timer <= 0) {
      flashes.splice(i, 1);
    }
  }
}


function drawFlashes() {
  flashes.forEach(f => {
    ctx.save();
    ctx.fillStyle = `rgba(255, 165, 0, ${f.timer * 10})`; // arancione trasparente che svanisce
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  });
}



// Stati gioco
const master = {
  x: 0,
  y: 1,
  speed: 0.3,
  dir: 1 // 1 = destra, -1 = sinistra
};

const player = {
  x: 6,
  y: 7,
  speed: 0,
  maxSpeed: 0.5,
  dir: 0 // -1 sinistra, 0 fermo, 1 destra
};

let ghosts = [];
let bullets = [];

let lastGhostSpawnTime = 0;

const scoreDiv = document.getElementById('score');

// --- CONTROLLI TASTIERA ---

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') player.dir = -1;
  else if (e.key === 'ArrowRight') player.dir = 1;
  else if (e.key === ' ' || e.key === 'Enter') shootBullet();
});

document.addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' && player.dir === -1) player.dir = 0;
  if (e.key === 'ArrowRight' && player.dir === 1) player.dir = 0;
});

// --- PULSANTE SPARO MOBILE ---

const fireBtn = document.getElementById('fireBtn');
fireBtn.addEventListener('touchstart', e => {
  e.preventDefault();
  shootBullet();
});
fireBtn.addEventListener('mousedown', e => {
  e.preventDefault();
  shootBullet();
});

// --- JOYSTICK MOBILE ---

const joystickContainer = document.getElementById('joystickContainer');
const joystick = document.getElementById('joystick');

let joystickActive = false;
let joystickStartX = 0;
let joystickCurrentX = 0;

function setPlayerDirectionFromJoystick() {
  const diffX = joystickCurrentX - joystickStartX;
  if (diffX > 20) player.dir = 1;
  else if (diffX < -20) player.dir = -1;
  else player.dir = 0;
}

joystick.addEventListener('touchstart', e => {
  e.preventDefault();
  joystickActive = true;
  joystickStartX = e.touches[0].clientX;
  joystickCurrentX = joystickStartX;
});
joystick.addEventListener('touchmove', e => {
  if (!joystickActive) return;
  joystickCurrentX = e.touches[0].clientX;
  setPlayerDirectionFromJoystick();

  // Sposta visual joystick
  let offset = Math.min(Math.max(joystickCurrentX - joystickStartX, -30), 30);
  joystick.style.transform = `translateX(${offset}px)`;
});
joystick.addEventListener('touchend', e => {
  joystickActive = false;
  player.dir = 0;
  joystick.style.transform = 'translateX(0)';
});

// --- FUNZIONI GIOCO ---

function shootBullet() {
  bullets.push({ x: player.x, y: player.y - 0.7, speed: 1.2 });
  shootSound.play();
}

function update(deltaTime) {
  updateFlashes(deltaTime);
  // Master si muove lentamente a destra e sinistra
  master.x += master.speed * master.dir;
  if (master.x > COLS - 1) {
    master.x = COLS - 1;
    master.dir = -1;
  }
  if (master.x < 0) {
    master.x = 0;
    master.dir = 1;
  }

  // Aumenta lentamente velocità master
  master.speed += 0.00002;

  // Spawn fantasmi ogni tot tempo, aumentando con punteggio
  const now = performance.now();
  if (now - lastGhostSpawnTime > 4000 - Math.min(score * 150, 3000)) {
  lastGhostSpawnTime = now;
  ghosts.push({ x: master.x, y: master.y, speed: 0.03 + score * 0.005 });
  spawnSound.play();
}

  // Muovi player in base a dir e velocità max
  player.speed += (player.dir * 0.05 - player.speed) * 0.2; // smoothing accelerazione
  player.x += player.speed;
  if (player.x < 0) {
    player.x = 0;
    player.speed = 0;
  }
  if (player.x > COLS - 1) {
    player.x = COLS - 1;
    player.speed = 0;
  }

  // Muovi fantasmi verso il basso
  for (let i = ghosts.length - 1; i >= 0; i--) {
    ghosts[i].y += ghosts[i].speed * deltaTime * 0.06;
    // Collisione con player
    if (
      Math.abs(ghosts[i].x - player.x) < 0.7 &&
      Math.abs(ghosts[i].y - player.y) < 0.7
    ) {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      gameoverSound.play();
      alert('Sei stato morso da un sorcio! Game Over.');
      window.location.reload();
      return;
    }
    // Fantasma scappa (gioco perso)
    if (ghosts[i].y > ROWS) {
      gameoverSound.play();
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
      alert('Un sorcio è andato a casa di Enul. Hai perso!!');
      window.location.reload();
      return;
    }
  }

  // Muovi proiettili verso l'alto
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].y -= bullets[i].speed * deltaTime * 0.1;
    if (bullets[i].y < 0) {
      bullets.splice(i, 1);
      continue;
    }
    // Controlla collisione con fantasmi
    for (let j = ghosts.length - 1; j >= 0; j--) {
      if (
          Math.abs(bullets[i].x - ghosts[j].x) < 0.6 &&
          Math.abs(bullets[i].y - ghosts[j].y) < 0.6
        ) {
          ghosts.splice(j, 1);
          bullets.splice(i, 1);
          score++;
          hitSound.play();
          createFlash(); // flash globale
          scoreDiv.textContent = 'Punteggio: ' + score;
          break;
        }
    }
  }
}

function draw() {
 ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Prima disegna lo sfondo, per non coprire il flash
  ctx.fillStyle = '#222';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Poi disegna il flash sopra lo sfondo
  drawFlashes();
  // Sfondo

  // Master
  ctx.drawImage(masterImg, master.x * TILE_SIZE, master.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

  // Player
  ctx.drawImage(playerImg, player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

  // Fantasmi
  ghosts.forEach(g => {
    ctx.drawImage(ghostImg, g.x * TILE_SIZE, g.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  });

  // Proiettili
  bullets.forEach(b => {
    ctx.drawImage(bulletImg, b.x * TILE_SIZE, b.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  });
}

// Game loop con delta time
let lastTime = 0;
function gameLoop(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  update(deltaTime);
  draw();

  requestAnimationFrame(gameLoop);
}

// Avvia gioco quando immagini caricate
let imagesLoaded = 0;
[masterImg, ghostImg, playerImg, bulletImg].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === 4) {
      gameLoop();
    }
  };
});
