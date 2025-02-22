const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load all images
const kurtImages = [];
for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `kurt_run${i}.png`;
    kurtImages.push(img);
}
const kurtImagesLeft = [];
for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `kurt_run_left${i}.png`;
    kurtImagesLeft.push(img);
}
const darkKurtImages = [];
for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `dark_kurt_run${i}.png`;
    darkKurtImages.push(img);
}
const darkKurtImagesLeft = [];
for (let i = 1; i <= 4; i++) {
    const img = new Image();
    img.src = `dark_kurt_run_left${i}.png`;
    darkKurtImagesLeft.push(img);
}
const collagenImg = new Image(); collagenImg.src = 'collagen.png';
const heartImg = new Image(); heartImg.src = 'heart.png';
const backgroundImages = [
    new Image(), new Image(), new Image()
];
backgroundImages[0].src = 'background.png';
backgroundImages[1].src = 'bone_broth_badlands.png';
backgroundImages[2].src = 'galactic_gelatin.png';
const platformImg = new Image(); platformImg.src = 'platform.png';
const synthotronImg = new Image(); synthotronImg.src = 'synthotron.png';
const synthotronHitImg = new Image(); synthotronHitImg.src = 'synthotron_hit.png';
const synthotronExplodeImages = [];
for (let i = 1; i <= 6; i++) {
    const img = new Image();
    img.src = `synthotron_explode${i}.png`;
    synthotronExplodeImages.push(img);
}
const decayOrbImg = new Image(); decayOrbImg.src = 'decay_orb.png';
const collagenStickPackImg = new Image(); collagenStickPackImg.src = 'collagen_stick_pack.png';
const kurtSpaceshipImg = new Image(); kurtSpaceshipImg.src = 'kurt_spaceship.png';
const victoryBackgroundImg = new Image(); victoryBackgroundImg.src = 'victory_background.png';

// Load audio
const chugSound = new Audio('chug.wav');
const jumpSound = new Audio('jump.wav');
const levelMusic = [
    new Audio('level1_music.mp3'),
    new Audio('level2_music.mp3'),
    new Audio('level3_music.mp3')
];
const darkKurtTheme = new Audio('dark_kurt_theme.mp3');
const synthotronHitSound = new Audio('synthotron_hit.wav');
const synthotronExplodeSound = new Audio('synthotron_explode.wav');
const victoryMusic = new Audio('victory_music.mp3');
victoryMusic.loop = true; // Optional: Loop for 15s duration
const introSynthotronSound = new Audio('intro_synthotron.wav'); // Intro audio
let hasPlayedIntro = false; // Flag to play audio once

// Game objects
const kurt = {
    x: 100,
    y: 700,
    width: 123,
    height: 351,
    speed: 5,
    vy: 0,
    gravity: 0.5,
    jump: -15,
    hearts: 10,
    frame: 0,
    animationSpeed: 0.2,
    isDarkKurt: false,
    collagenCollected: 0,
    throwCooldown: 0,
    facing: "right",
    isMoving: false
};

const platformLayouts = [
    [ // Level 1
        { x: 400, y: 650, width: 200, height: 20 },
        { x: 800, y: 600, width: 200, height: 20 },
        { x: 1200, y: 550, width: 200, height: 20 }
    ],
    [ // Level 2
        { x: 300, y: 700, width: 200, height: 20 },
        { x: 600, y: 600, width: 200, height: 20 },
        { x: 1000, y: 650, width: 200, height: 20 },
        { x: 1400, y: 550, width: 200, height: 20 }
    ],
    [ // Level 3
        { x: 200, y: 750, width: 200, height: 20 },
        { x: 500, y: 650, width: 200, height: 20 },
        { x: 800, y: 550, width: 200, height: 20 },
        { x: 1100, y: 600, width: 200, height: 20 },
        { x: 1400, y: 500, width: 200, height: 20 }
    ]
];

const synthotron = {
    x: 1600,
    y: 874,
    width: 150,
    height: 150,
    xSpeed: 2,
    ySpeed: 3,
    xDirection: -1,
    yDirection: -1,
    health: 10,
    hitTimer: 0,
    explodeFrame: 0,
    explodeTimer: 0,
    isExploding: false
};

// Victory spaceship animation
let spaceshipX = -300; // Start off-screen left for 300px width

let level = 1;
let collagen = [];
let obstacles = [];
let stickPacks = [];
let score = 0;
let gameOver = false;
let gameStarted = false;
let levelTransition = false;
let preIntroScene = true; // New pre-intro state
let introScene = false;   // Intro with Synthotron
let gameWon = false;
let transitionTimer = 0;
let darkKurtMessageTimer = 0; // Timer for "Dark Kurt Unlocked" message

// Level names and goals
const levelNames = ["Collagen Canyon", "Bone Broth Badlands", "Galactic Gelatin"];
const levelGoals = [
    "Defeat Synthotron (10 hits)!",
    "Defeat Synthotron (20 hits)!",
    "Defeat Synthotron (30 hits)!"
];

// Game controls
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        if (preIntroScene) {
            preIntroScene = false;
            introScene = true; // Move to Synthotron intro
        } else if (introScene) {
            introScene = false;
            introSynthotronSound.pause(); // Stop intro audio
            introSynthotronSound.currentTime = 0; // Reset to start
            hasPlayedIntro = false; // Reset flag
        } else if (!gameStarted) {
            gameStarted = true;
        } else if (levelTransition) {
            levelTransition = false;
            transitionTimer = 0;
            score = 0;
            synthotron.health = level === 2 ? 20 : 30;
            synthotron.width = level === 2 ? 175 : 200;
            synthotron.height = level === 2 ? 175 : 200;
            kurt.x = 100;
            kurt.isDarkKurt = false;
            kurt.collagenCollected = 0;
            kurt.throwCooldown = 0;
            darkKurtTheme.pause();
        } else if (gameWon) {
            level = 1;
            score = 0;
            kurt.hearts = 10;
            kurt.isDarkKurt = false;
            kurt.collagenCollected = 0;
            kurt.throwCooldown = 0;
            gameWon = false;
            preIntroScene = true; // Return to pre-intro
            introScene = false;
            gameOver = false;
            gameStarted = false;
            synthotron.health = 10;
            synthotron.width = 150;
            synthotron.height = 150;
            darkKurtTheme.pause();
            victoryMusic.pause();
            spaceshipX = -300;
        }
    }
    if (e.key === 'Shift' && kurt.throwCooldown <= 0) {
        const direction = kurt.facing === "right" ? 1 : -1;
        const spawnX = kurt.facing === "right" ? kurt.x + kurt.width : kurt.x;
        if (kurt.isDarkKurt) {
            stickPacks.push({ 
                x: spawnX, 
                y: kurt.y + kurt.height / 2, 
                speed: 10 * direction, 
                rotation: 0,
                width: 20,
                height: 74,
                angle: 0
            });
            stickPacks.push({ 
                x: spawnX, 
                y: kurt.y + kurt.height / 2, 
                speed: 10 * direction, 
                rotation: 0,
                width: 20,
                height: 74,
                angle: Math.PI / 12 * direction
            });
            stickPacks.push({ 
                x: spawnX, 
                y: kurt.y + kurt.height / 2, 
                speed: 10 * direction, 
                rotation: 0,
                width: 20,
                height: 74,
                angle: -Math.PI / 12 * direction
            });
            kurt.throwCooldown = 6;
        } else {
            stickPacks.push({ 
                x: spawnX, 
                y: kurt.y + kurt.height / 2, 
                speed: 10 * direction, 
                rotation: 0,
                width: 20,
                height: 74,
                angle: 0
            });
            kurt.throwCooldown = 12;
        }
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

function spawnCollagen() {
    if (Math.random() < 0.001) {
        collagen.push({
            x: Math.random() * (canvas.width - 50),
            y: -67,
            width: 50,
            height: 67,
            speed: 3
        });
    }
}

function spawnObstacle() {
    let obstacleFrequency = level === 1 ? 0.005 : level === 2 ? 0.008 : 0.010;
    let obstacleSpeed = level === 1 ? 5 : level === 2 ? 7 : 9;
    let obstacleY = level === 1 ? 974 : (synthotron.y + synthotron.height / 2);
    if (Math.random() < obstacleFrequency) {
        obstacles.push({
            x: synthotron.x,
            y: obstacleY,
            width: 50,
            height: 50,
            speed: obstacleSpeed
        });
    }
}

function update() {
    if (!gameStarted || levelTransition || preIntroScene || introScene || gameWon) {
        return;
    }

    // Kurt movement and facing
    kurt.isMoving = false;
    if (keys['ArrowRight']) {
        kurt.x += kurt.speed;
        kurt.facing = "right";
        kurt.isMoving = true;
    }
    if (keys['ArrowLeft']) {
        kurt.x -= kurt.speed;
        kurt.facing = "left";
        kurt.isMoving = true;
    }
    if (keys[' '] && kurt.vy === 0) {
        kurt.vy = kurt.jump;
        jumpSound.play();
        kurt.isMoving = true;
    }

    // Apply gravity
    kurt.vy += kurt.gravity;
    kurt.y += kurt.vy;

    // Platform collision
    platformLayouts[level - 1].forEach(platform => {
        if (kurt.x + kurt.width > platform.x && 
            kurt.x < platform.x + platform.width &&
            kurt.y + kurt.height > platform.y &&
            kurt.y + kurt.height < platform.y + platform.height &&
            kurt.vy > 0) {
            kurt.y = platform.y - kurt.height;
            kurt.vy = 0;
        }
    });

    // Ground collision
    if (kurt.y > 700) {
        kurt.y = 700;
        kurt.vy = 0;
    }

    // Synthotron movement (stop if exploding)
    if (!synthotron.isExploding) {
        synthotron.x += synthotron.xSpeed * synthotron.xDirection;
        let upperLimit = level === 1 ? 874 : 500;
        synthotron.y += synthotron.ySpeed * synthotron.yDirection;
        if (synthotron.x <= canvas.width/2) synthotron.xDirection = 1;
        if (synthotron.x >= 1600) synthotron.xDirection = -1;
        if (synthotron.y <= upperLimit) synthotron.yDirection = 1;
        if (synthotron.y >= 874) synthotron.yDirection = -1;
        if (level === 1) synthotron.y = 874;
    }

    // Synthotron hit flash and explosion
    if (synthotron.hitTimer > 0) synthotron.hitTimer--;
    if (synthotron.isExploding) {
        synthotron.explodeTimer++;
        synthotron.explodeFrame = Math.floor(synthotron.explodeTimer / 10);
        if (synthotron.explodeTimer >= 60) { // 1s explosion
            synthotron.isExploding = false;
            gameWon = true;
            levelMusic.forEach(m => m.pause()); // Stop all level music
            victoryMusic.play(); // Start victory music after explosion
            spaceshipX = -300;   // Reset spaceship position
        }
    }

    // Animation
    if (kurt.isMoving) {
        kurt.frame += kurt.animationSpeed;
        if (kurt.frame >= 4) kurt.frame = 0;
    } else {
        kurt.frame = 0;
    }

    // Throw cooldown
    if (kurt.throwCooldown > 0) kurt.throwCooldown--;

    // Collagen falling
    collagen.forEach((c, i) => {
        c.y += c.speed;
        if (checkCollision(kurt, c)) {
            collagen.splice(i, 1);
            chugSound.play();
            score += 10;
            kurt.collagenCollected++;
            if (kurt.collagenCollected >= 3 && !kurt.isDarkKurt) {
                kurt.isDarkKurt = true; // Immediate transformation
                levelMusic.forEach(m => m.pause());
                darkKurtTheme.play(); // Start Dark Kurt music
                darkKurtMessageTimer = 180; // Show message for 3s (180 frames at 60 FPS)
            }
        }
        if (c.y > canvas.height) collagen.splice(i, 1);
    });

    // Obstacle movement and collision
    obstacles.forEach((o, i) => {
        o.x -= o.speed;
        if (checkCollision(kurt, o)) {
            obstacles.splice(i, 1);
            kurt.hearts--;
            if (kurt.hearts <= 0) gameOver = true;
        }
        if (o.x < -o.width) obstacles.splice(i, 1);
    });

    // Stick pack movement and collision
    stickPacks.forEach((s, i) => {
        s.x += s.speed * Math.cos(s.angle);
        s.y += s.speed * Math.sin(s.angle);
        s.rotation += 0.2;
        if (checkCollision(s, synthotron)) {
            stickPacks.splice(i, 1);
            synthotron.health--;
            synthotron.hitTimer = 12;
            synthotronHitSound.play();
            if (synthotron.health <= 0 && level < 3) {
                level++;
                levelTransition = true;
                collagen = [];
                obstacles = [];
                stickPacks = [];
            } else if (synthotron.health <= 0 && level === 3) {
                synthotron.isExploding = true;
                synthotron.explodeTimer = 0;
                synthotron.explodeFrame = 0;
                synthotronHitSound.pause();
                synthotronExplodeSound.play();
                collagen = [];
                obstacles = [];
                stickPacks = [];
            }
        }
        if (s.x > canvas.width || s.x < 0 || s.y > canvas.height || s.y < 0) stickPacks.splice(i, 1);
    });

    // Update Dark Kurt message timer
    if (darkKurtMessageTimer > 0) darkKurtMessageTimer--;
}

function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + (obj1.width || 20) > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + (obj1.height || 74) > obj2.y;
}

function draw() {
    if (preIntroScene) {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Press Space Bar to Continue", canvas.width/2, canvas.height/2);
        return;
    }

    if (introScene) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(synthotronImg, canvas.width/2 - 225, canvas.height/2 - 225, 450, 450); // 50% bigger (300 -> 450)
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Press Space to Begin", canvas.width/2, canvas.height/2 + 300);
        if (!hasPlayedIntro) { // Play audio once
            introSynthotronSound.play().catch(error => {
                console.warn("Intro audio failed to play:", error);
            });
            hasPlayedIntro = true;
        }
        return;
    }

    ctx.drawImage(backgroundImages[level - 1], 0, 0, canvas.width, canvas.height);

    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Kurt's Collagen Quest", canvas.width/2, canvas.height/2 - 200);
        ctx.font = '40px Arial';
        ctx.fillText("Help Kurt save the universe from Synthotron!", canvas.width/2, canvas.height/2 - 100);
        ctx.fillText(levelGoals[0], canvas.width/2, canvas.height/2);
        ctx.fillText("Shift = Throw Stick Packs, Lightning = -1 heart", canvas.width/2, canvas.height/2 + 50);
        ctx.fillText("Press Space to Start", canvas.width/2, canvas.height/2 + 150);
        return;
    }

    if (levelTransition) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(levelNames[level - 1], canvas.width/2, canvas.height/2 - 100);
        ctx.font = '40px Arial';
        ctx.fillText(levelGoals[level - 1], canvas.width/2, canvas.height/2);
        ctx.fillText("Press Space to Start", canvas.width/2, canvas.height/2 + 100);
        transitionTimer++;
        return;
    }

    if (gameWon) {
        ctx.drawImage(victoryBackgroundImg, 0, 0, canvas.width, canvas.height); // Victory PNG background
        spaceshipX += 5; // Animate spaceship in draw
        if (spaceshipX > canvas.width) spaceshipX = -300;
        ctx.drawImage(kurtSpaceshipImg, spaceshipX, canvas.height/2 - 50, 300, 100); // 300x100, oriented right
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Victory!", canvas.width/2, canvas.height/2 - 150);
        ctx.font = '40px Arial';
        ctx.fillText("Kurt flies off to new adventures!", canvas.width/2, canvas.height/2 + 100);
        ctx.fillText(`Final Score: ${score}`, canvas.width/2, canvas.height/2 + 150);
        ctx.fillText("Press Space to Play Again", canvas.width/2, canvas.height/2 + 200);
        return;
    }

    // Platforms
    platformLayouts[level - 1].forEach(platform => {
        ctx.drawImage(platformImg, platform.x, platform.y, platform.width, platform.height);
    });

    // Kurt
    const currentImages = kurt.isDarkKurt 
        ? (kurt.facing === "right" ? darkKurtImages : darkKurtImagesLeft)
        : (kurt.facing === "right" ? kurtImages : kurtImagesLeft);
    ctx.drawImage(currentImages[Math.floor(kurt.frame)], kurt.x, kurt.y, kurt.width, kurt.height);

    // Synthotron (flash or explode)
    let synthotronImage = synthotronImg;
    if (synthotron.hitTimer > 0) synthotronImage = synthotronHitImg;
    else if (synthotron.isExploding) {
        synthotronImage = synthotronExplodeImages[Math.min(synthotron.explodeFrame, 5)];
    }
    ctx.drawImage(synthotronImage, synthotron.x, synthotron.y, synthotron.width, synthotron.height);

    // Collagen
    collagen.forEach(c => {
        ctx.drawImage(collagenImg, c.x, c.y, c.width, c.height);
    });

    // Obstacles (Decay Orbs)
    obstacles.forEach(o => {
        ctx.drawImage(decayOrbImg, o.x, o.y, o.width, o.height);
    });

    // Stick Packs with rotation
    stickPacks.forEach(s => {
        ctx.save();
        ctx.translate(s.x + 10, s.y + 37);
        ctx.rotate(s.rotation);
        ctx.drawImage(collagenStickPackImg, -10, -37, 20, 74);
        ctx.restore();
    });

    // Hearts
    for (let i = 0; i < kurt.hearts; i++) {
        ctx.drawImage(heartImg, 20 + i * 60, 20, 50, 50);
    }

    // Collagen Tracker
    for (let i = 0; i < Math.min(kurt.collagenCollected, 3); i++) {
        ctx.drawImage(collagenImg, 20 + i * 60, 80, 50, 67);
    }

    // Score, Level, and Synthotron Health
    ctx.fillStyle = 'black';
    ctx.fillRect(canvas.width - 250, 10, 240, 150);
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.fillText(`Score: ${score}`, canvas.width - 230, 50);
    ctx.fillText(`Level: ${level}`, canvas.width - 230, 100);
    ctx.fillText(`Synthotron: ${synthotron.health}`, canvas.width - 230, 150);

    // Dark Kurt Unlocked message
    if (darkKurtMessageTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(canvas.width/2 - 200, canvas.height/2 - 50, 400, 100);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText("Dark Kurt Unlocked", canvas.width/2, canvas.height/2);
    }

    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '60px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over!', canvas.width/2 - 150, canvas.height/2);
    }
}

function gameLoop() {
    if (gameStarted && !levelTransition && !preIntroScene && !introScene && !gameWon) {
        levelMusic.forEach((music, i) => {
            if (i === level - 1 && level <= 3 && !kurt.isDarkKurt) music.play();
            else music.pause();
        });
        if (kurt.isDarkKurt) darkKurtTheme.play();
        else darkKurtTheme.pause();
    } else {
        darkKurtTheme.pause();
    }

    if (gameStarted && !gameOver && !levelTransition && !preIntroScene && !introScene && !gameWon) {
        spawnCollagen();
        spawnObstacle();
        update();
    }
    draw();
    requestAnimationFrame(gameLoop);
}

Promise.all([
    ...kurtImages,
    ...kurtImagesLeft,
    ...darkKurtImages,
    ...darkKurtImagesLeft,
    collagenImg,
    heartImg,
    ...backgroundImages,
    platformImg,
    synthotronImg,
    synthotronHitImg,
    ...synthotronExplodeImages,
    decayOrbImg,
    collagenStickPackImg,
    kurtSpaceshipImg,
    victoryBackgroundImg
].map(img => new Promise((resolve) => {
    img.onload = resolve;
    img.onerror = () => {
        console.warn(`Failed to load ${img.src}, continuing anyway`);
        resolve();
    };
}))).then(() => {
    // Preload intro audio and start game loop
    introSynthotronSound.addEventListener('canplaythrough', () => {
        gameLoop();
    }, { once: true });
    introSynthotronSound.load(); // Trigger loading
}).catch((error) => {
    console.error('Error loading assets:', error);
    gameLoop(); // Fallback to start game anyway
});