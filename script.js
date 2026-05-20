"use strict";
/* ═══════════════════════════════════════════════════════
   script.ts — Cosmic Popper (mini‑game) — FIXED COLORS
   
   COMPILE:  npx tsc script.ts --target ES2020 --module ES2020
   (typescript уже установлен в вашем проекте)
   ═══════════════════════════════════════════════════════ */
// ── Game state ─────────────────────────
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let width = window.innerWidth;
let height = window.innerHeight;
let dpr = Math.min(window.devicePixelRatio || 1, 2);
let bubbles = [];
let particles = [];
let score = 0;
let lives = 3;
let gameRunning = false;
let spawnTimer = 0;
let difficultyLevel = 1;
let frameCount = 0;
// UI elements
const scoreDisplay = document.getElementById('scoreDisplay');
const livesDisplay = document.getElementById('livesDisplay');
const startScreen = document.getElementById('startScreen');
const gameoverScreen = document.getElementById('gameoverScreen');
const finalScoreSpan = document.getElementById('finalScore');
// ── Helper functions ───────────────────
function random(min, max) {
    return Math.random() * (max - min) + min;
}
function randomColor() {
    // ⚡ исправлено: теперь через запятую, чтобы работало в rgba()
    const palette = [
        '255, 140, 80', // orange
        '80, 200, 255', // cyan
        '255, 100, 180', // pink
        '120, 255, 160', // mint
        '200, 150, 255', // lavender
        '255, 210, 70', // gold
    ];
    return palette[Math.floor(Math.random() * palette.length)];
}
// ── Bubble creation ────────────────────
function spawnBubble() {
    const radius = random(18, 38);
    const x = random(radius, width - radius);
    const baseSpeed = 0.8 + difficultyLevel * 0.25;
    const speed = baseSpeed + random(-0.2, 0.4);
    const color = randomColor();
    bubbles.push({
        x,
        y: height + radius + 10,
        radius,
        speed,
        color,
        pulsePhase: random(0, Math.PI * 2),
        alive: true,
    });
}
// ── Particle burst on pop ─────────────
function burstParticles(x, y, color) {
    const count = 12 + Math.floor(Math.random() * 10);
    for (let i = 0; i < count; i++) {
        const angle = random(0, Math.PI * 2);
        const speed = random(1.5, 5.5);
        particles.push({
            x,
            y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            maxLife: random(0.4, 0.9),
            color,
            size: random(2, 5.5),
        });
    }
}
// ── Pop a bubble ──────────────────────
function popBubble(index) {
    const b = bubbles[index];
    if (!b || !b.alive)
        return;
    b.alive = false;
    burstParticles(b.x, b.y, b.color);
    const sizeBonus = Math.floor((40 - b.radius) * 0.5);
    const speedBonus = Math.floor(b.speed * 2);
    const gained = 10 + Math.max(0, sizeBonus) + speedBonus;
    score += gained;
    updateScoreDisplay();
}
// ── Update UI ─────────────────────────
function updateScoreDisplay() {
    scoreDisplay.textContent = score.toString();
}
function updateLivesDisplay() {
    livesDisplay.textContent = '❤️'.repeat(Math.max(0, lives));
}
// ── Lose a life ───────────────────────
function loseLife() {
    lives--;
    updateLivesDisplay();
    if (lives <= 0) {
        endGame();
    }
}
// ── End game ──────────────────────────
function endGame() {
    gameRunning = false;
    finalScoreSpan.textContent = score.toString();
    gameoverScreen.classList.remove('hidden');
}
// ── Reset game ────────────────────────
function resetGame() {
    bubbles = [];
    particles = [];
    score = 0;
    lives = 3;
    difficultyLevel = 1;
    spawnTimer = 0;
    frameCount = 0;
    updateScoreDisplay();
    updateLivesDisplay();
    gameoverScreen.classList.add('hidden');
    startScreen.classList.add('hidden');
}
// ── Start game ────────────────────────
function startGame() {
    resetGame();
    gameRunning = true;
    for (let i = 0; i < 4; i++) {
        spawnBubble();
    }
}
// ── Update logic ──────────────────────
function update() {
    if (!gameRunning)
        return;
    frameCount++;
    if (frameCount % 600 === 0) {
        difficultyLevel = Math.min(difficultyLevel + 1, 15);
    }
    const spawnRate = Math.max(15, 40 - difficultyLevel * 2);
    spawnTimer++;
    if (spawnTimer >= spawnRate) {
        spawnTimer = 0;
        spawnBubble();
        if (Math.random() < 0.35)
            spawnBubble();
    }
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (!b.alive) {
            bubbles.splice(i, 1);
            continue;
        }
        b.y -= b.speed;
        b.pulsePhase += 0.04;
        if (b.y + b.radius < -10) {
            bubbles.splice(i, 1);
            loseLife();
        }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.02;
        if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
        }
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.size *= 0.99;
    }
}
// ── Draw ──────────────────────────────
function draw() {
    ctx.clearRect(0, 0, width, height);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0a0c1f');
    bgGrad.addColorStop(0.7, '#131a30');
    bgGrad.addColorStop(1, '#1e2440');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
    for (const b of bubbles) {
        if (!b.alive)
            continue;
        const pulse = 1 + Math.sin(b.pulsePhase) * 0.06;
        const r = b.radius * pulse;
        const rgb = b.color; // e.g. "255, 100, 180"
        // Outer glow
        const glow = ctx.createRadialGradient(b.x, b.y, r * 0.4, b.x, b.y, r * 1.8);
        glow.addColorStop(0, `rgba(${rgb}, 0.35)`); // теперь валидный цвет
        glow.addColorStop(0.5, `rgba(${rgb}, 0.1)`);
        glow.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r * 1.8, 0, Math.PI * 2);
        ctx.fill();
        // Main bubble
        const mainGrad = ctx.createRadialGradient(b.x - r * 0.25, b.y - r * 0.3, r * 0.1, b.x, b.y, r);
        mainGrad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
        mainGrad.addColorStop(0.3, `rgba(${rgb}, 0.9)`);
        mainGrad.addColorStop(1, `rgba(${rgb}, 0.5)`);
        ctx.fillStyle = mainGrad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(b.x - r * 0.3, b.y - r * 0.35, r * 0.2, 0, Math.PI * 2);
        ctx.fill();
    }
    for (const p of particles) {
        const alpha = p.life / p.maxLife;
        ctx.fillStyle = `rgba(${p.color}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
}
// ── Animation loop ────────────────────
function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}
// ── Input handling ────────────────────
function handleClick(clientX, clientY) {
    if (!gameRunning)
        return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = width / rect.width;
    const scaleY = height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i];
        if (!b.alive)
            continue;
        const dx = x - b.x;
        const dy = y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= b.radius * 1.1) {
            popBubble(i);
            return;
        }
    }
}
function onMouseDown(e) {
    e.preventDefault();
    handleClick(e.clientX, e.clientY);
}
function onTouchStart(e) {
    e.preventDefault();
    if (e.touches.length > 0) {
        handleClick(e.touches[0].clientX, e.touches[0].clientY);
    }
}
// ── Resize handler ────────────────────
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}
// ── Init ──────────────────────────────
function init() {
    resize();
    updateLivesDisplay();
    updateScoreDisplay();
    startScreen.classList.remove('hidden');
    gameoverScreen.classList.add('hidden');
    document.getElementById('startBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
    });
    document.getElementById('restartBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        startGame();
    });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('resize', resize);
    canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    animate();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
}
else {
    init();
}
