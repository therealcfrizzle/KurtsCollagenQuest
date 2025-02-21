{\rtf1\ansi\ansicpg1252\cocoartf2820
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fmodern\fcharset0 Courier;}
{\colortbl;\red255\green255\blue255;\red0\green0\blue0;}
{\*\expandedcolortbl;;\cssrgb\c0\c0\c0;}
\margl1440\margr1440\vieww22160\viewh25340\viewkind0
\deftab720
\pard\pardeftab720\partightenfactor0

\f0\fs26\fsmilli13333 \cf0 \expnd0\expndtw0\kerning0
\outl0\strokewidth0 \strokec2 const canvas = document.getElementById('gameCanvas');\
const ctx = canvas.getContext('2d');\
\
// Game variables\
let player = \{\
    x: 50,\
    y: 450,\
    width: 40,\
    height: 60,\
    vel: 5,\
    jumpVel: 10,\
    isJumping: false,\
    jumpCount: 10,\
    boost: false,\
    boostTimer: 0\
\};\
const BOOST_DURATION = 200;\
\
\pard\pardeftab720\partightenfactor0

\fs26\fsmilli13333 \cf0 \outl0\strokewidth0 let beer = \{ x: 300, y: 450, width: 38, height: 46, active: true \};\
let collagen = \{ x: 500, y: 450, width: 43, height: 58, active: true \};\
let platform = \{ x: 200, y: 400, width: 400, height: 40 \};
\fs26\fsmilli13333 \outl0\strokewidth0 \strokec2 \
\pard\pardeftab720\partightenfactor0
\cf0 \
// Game states\
const INTRO = 0, PLAYING = 1, WIN = 2;\
let gameState = INTRO;\
\
// Story text\
const introText = [\
    "Kurt's Collagen Quest",\
    "",\
    "Uncle Kurt, co-founder of Vital Proteins,",\
    "is on a mission! Synth-O-Tron Corp has",\
    "hijacked the world's collagen supply,",\
    "replacing it with fake junk.",\
    "",\
    "Armed with beer and grit, Kurt must",\
    "collect collagen vials and stop them!",\
    "",\
    "Press SPACE to start."\
];\
const objectiveText = "Find the collagen vial!";\
const winText = [\
    "Victory!",\
    "Kurt saved the collagen supply!",\
    "Synth-O-Tron is toast.",\
    "Press Q to quit."\
];\
\
// Font styling\
ctx.font = "24px Arial";\
const titleFont = "bold 36px Arial";\
\
// Load images\
const kurtImg = new Image();\
kurtImg.src = 'kurt.png';\
const beerImg = new Image();\
beerImg.src = 'beer.png';\
const collagenImg = new Image();\
collagenImg.src = 'collagen.png';\
const platformImg = new Image();\
platformImg.src = 'platform.png';\
\
let imagesLoaded = 0;\
function checkImagesLoaded() \{\
    imagesLoaded++;\
    if (imagesLoaded === 5) update(); // Start game when all 5 images are loaded\
\}\
kurtImg.onload = checkImagesLoaded;\
beerImg.onload = checkImagesLoaded;\
collagenImg.onload = checkImagesLoaded;\
platformImg.onload = checkImagesLoaded;\
\
// Input handling\
let keys = \{\};\
window.addEventListener('keydown', (e) => keys[e.key] = true);\
window.addEventListener('keyup', (e) => keys[e.key] = false);\
\
// Collision detection\
function checkCollision(rect1, rect2) \{\
    return (rect1.x < rect2.x + rect2.width &&\
            rect1.x + rect1.width > rect2.x &&\
            rect1.y < rect2.y + rect2.height &&\
            rect1.y + rect1.height > rect2.y);\
\}\
\
// Game loop\
function update() \{\
    if (gameState === INTRO) \{\
        ctx.fillStyle = 'black';\
        ctx.fillRect(0, 0, canvas.width, canvas.height);\
        ctx.fillStyle = 'white';\
        introText.forEach((line, i) => \{\
            ctx.font = i === 0 ? titleFont : "24px Arial";\
            const textWidth = ctx.measureText(line).width;\
            ctx.fillText(line, canvas.width / 2 - textWidth / 2, 50 + i * 40);\
        \});\
        if (keys[' ']) gameState = PLAYING;\
    \} else if (gameState === PLAYING) \{\
        // Movement\
        if (keys['ArrowLeft'] && player.x > player.vel) player.x -= player.vel;\
        if (keys['ArrowRight'] && player.x < canvas.width - player.width - player.vel) player.x += player.vel;\
        if (!player.isJumping && keys[' ']) \{\
            player.isJumping = true;\
        \}\
        if (player.isJumping) \{\
            if (player.jumpCount >= -10) \{\
                player.y -= (player.jumpCount * Math.abs(player.jumpCount)) * 0.5;\
                player.jumpCount--;\
            \} else \{\
                player.isJumping = false;\
                player.jumpCount = 10;\
            \}\
        \}\
\
        // Gravity\
        if (player.y + player.height < canvas.height - 10) player.y += 5;\
        if (checkCollision(player, platform)) \{\
            if (player.y + player.height > platform.y) \{\
                player.y = platform.y - player.height;\
                player.isJumping = false;\
                player.jumpCount = 10;\
            \}\
        \} else if (player.y + player.height > canvas.height - 10) \{\
            player.y = canvas.height - player.height - 10;\
        \}\
\
        // Beer power-up\
        if (beer.active && checkCollision(player, beer)) \{\
            beer.active = false;\
            player.boost = true;\
            player.boostTimer = BOOST_DURATION;\
            player.vel = 10;\
        \}\
        if (player.boost) \{\
            player.boostTimer--;\
            if (player.boostTimer <= 0) \{\
                player.boost = false;\
                player.vel = 5;\
            \}\
        \}\
\
        // Collagen collection\
        if (collagen.active && checkCollision(player, collagen)) \{\
            collagen.active = false;\
            gameState = WIN;\
        \}\
\
        // Draw game\
        ctx.fillStyle = 'black';\
        ctx.fillRect(0, 0, canvas.width, canvas.height);\
        ctx.drawImage(platformImg, platform.x, platform.y, platform.width, platform.height);\
        ctx.drawImage(kurtImg, player.x, player.y, player.width, player.height);\
        if (beer.active) \{\
            ctx.drawImage(beerImg, beer.x, beer.y, beer.width, beer.height);\
        \}\
        if (collagen.active) \{\
            ctx.drawImage(collagenImg, collagen.x, collagen.y, collagen.width, collagen.height);\
        \}\
        ctx.fillStyle = 'white';\
        ctx.font = "24px Arial";\
        ctx.fillText(objectiveText, 10, 30);\
    \} else if (gameState === WIN) \{\
        ctx.fillStyle = 'black';\
        ctx.fillRect(0, 0, canvas.width, canvas.height);\
        ctx.fillStyle = 'white';\
        winText.forEach((line, i) => \{\
            ctx.font = i === 0 ? titleFont : "24px Arial";\
            const textWidth = ctx.measureText(line).width;\
            ctx.fillText(line, canvas.width / 2 - textWidth / 2, 200 + i * 40);\
        \});\
        if (keys['q']) window.close(); // Note: window.close() may not work in all browsers\
    \}\
\
    requestAnimationFrame(update);\
\}\
\
update();\
}