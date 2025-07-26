// Animated background for the index page. In dark mode a swarm of fireflies is
// shown. In light mode the particles morph into birds flying over a calm sea.
// Bird shapes are based on PNGs in assets/media/index; only their alpha masks
// are used so the resulting silhouettes are drawn with a solid colour.

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('metaballs');
  if (!container) return;

  const fireflyConfig = {
    num: 25,
    minRadius: 3,
    maxRadius: 8,
    baseSpeed: 0.3,
    colors: [
      'rgba(255, 255, 100, 0.95)',
      'rgba(255, 240, 80, 0.9)',
      'rgba(255, 235, 60, 0.85)',
      'rgba(255, 250, 120, 0.9)',
      'rgba(255, 220, 50, 0.8)',
      'rgba(255, 245, 90, 0.85)',
      'rgba(255, 210, 40, 0.8)',
      'rgba(255, 255, 130, 0.9)'
    ]
  };

  const birdConfig = {
    num: 20,
    baseSpeed: 0.5,
    images: [
      'assets/media/index/17-172458_bird-flying-transparent-flying-bird-png.png',
      'assets/media/index/39-395999_image-flying-birds-png-in-hd.png',
      'assets/media/index/70-701241_free-png-birds-png-images-transparent-png-birds.png',
      'assets/media/index/8cEb9bjXi.png'
    ]
  };

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  canvas.style.filter = 'blur(1px)';
  canvas.style.opacity = '0.8';

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = true;
  }

  // ----- Bird image preparation -----
  function loadBirdImages() {
    const promises = birdConfig.images.map(src => new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 48;
        const scale = maxDim / Math.max(img.width, img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const off = document.createElement('canvas');
        off.width = w;
        off.height = h;
        const ictx = off.getContext('2d');
        ictx.drawImage(img, 0, 0, w, h);
        ictx.globalCompositeOperation = 'source-in';
        ictx.fillStyle = '#222';
        ictx.fillRect(0, 0, w, h);
        resolve(off);
      };
      img.src = src;
    }));
    return Promise.all(promises);
  }

  // ----- Firefly class -----
  class Firefly {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.baseVx = (Math.random() - 0.5) * fireflyConfig.baseSpeed;
      this.baseVy = (Math.random() - 0.5) * fireflyConfig.baseSpeed;
      this.vx = this.baseVx;
      this.vy = this.baseVy;
      this.radius = fireflyConfig.minRadius + Math.random() * (fireflyConfig.maxRadius - fireflyConfig.minRadius);
      this.color = fireflyConfig.colors[Math.floor(Math.random() * fireflyConfig.colors.length)];
      this.brightness = 0.4 + Math.random() * 0.6;
      this.flickerSpeed = 0.03 + Math.random() * 0.04;
      this.flickerPhase = Math.random() * Math.PI * 2;
      this.wanderAngle = Math.random() * Math.PI * 2;
      this.wanderSpeed = 0.02 + Math.random() * 0.03;
      this.pauseTimer = 0;
      this.pauseDuration = Math.random() * 80 + 40;
      this.isPaused = false;
      this.floatPhase = Math.random() * Math.PI * 2;
      this.floatAmplitude = 1.0 + Math.random() * 1.5;
      this.floatSpeed = 0.015 + Math.random() * 0.020;
      this.burstTimer = 0;
      this.burstDuration = 0;
      this.inBurst = false;
      this.flutterPhase = Math.random() * Math.PI * 2;
      this.flutterSpeed = 0.08 + Math.random() * 0.12;
      this.flutterAmplitude = 0.8 + Math.random() * 1.2;
    }
    update() {
      this.flickerPhase += this.flickerSpeed;
      this.floatPhase += this.floatSpeed;
      this.flutterPhase += this.flutterSpeed;
      if (!this.isPaused && !this.inBurst) {
        this.wanderAngle += (Math.random() - 0.5) * this.wanderSpeed * 2;
        const flutterX = Math.sin(this.flutterPhase) * this.flutterAmplitude * 0.1;
        const flutterY = Math.cos(this.flutterPhase * 1.3) * this.flutterAmplitude * 0.1;
        this.vx = Math.cos(this.wanderAngle) * fireflyConfig.baseSpeed * 0.8 + flutterX;
        this.vy = Math.sin(this.wanderAngle) * fireflyConfig.baseSpeed * 0.8 + flutterY;
        this.vy += Math.sin(this.floatPhase) * this.floatAmplitude * 0.15;
        this.vx += Math.cos(this.floatPhase * 0.7) * this.flutterAmplitude * 0.08;
      }
      this.pauseTimer++;
      if (this.pauseTimer >= this.pauseDuration) {
        this.isPaused = !this.isPaused;
        this.pauseTimer = 0;
        if (this.isPaused) {
          this.pauseDuration = Math.random() * 120 + 20;
          this.vx = 0;
          this.vy = 0;
        } else {
          this.pauseDuration = Math.random() * 200 + 80;
          if (Math.random() < 0.4) {
            this.inBurst = true;
            this.burstDuration = 20 + Math.random() * 25;
            this.burstTimer = 0;
          }
        }
      }
      if (this.inBurst) {
        this.burstTimer++;
        const burstMultiplier = 4 + Math.random() * 3;
        if (Math.random() < 0.3) {
          this.wanderAngle += (Math.random() - 0.5) * 0.5;
        }
        this.vx = this.baseVx * burstMultiplier;
        this.vy = this.baseVy * burstMultiplier;
        if (this.burstTimer >= this.burstDuration) {
          this.inBurst = false;
          this.burstTimer = 0;
        }
      }
      this.x += this.vx;
      this.y += this.vy;
      const margin = 50;
      if (this.x < margin) { this.wanderAngle = Math.abs(this.wanderAngle); this.x = margin; }
      if (this.x > canvas.width - margin) { this.wanderAngle = Math.PI - Math.abs(this.wanderAngle); this.x = canvas.width - margin; }
      if (this.y < margin) { this.wanderAngle = Math.PI / 2 + (this.wanderAngle % (Math.PI / 2)); this.y = margin; }
      if (this.y > canvas.height - margin) { this.wanderAngle = -Math.PI / 2 + (this.wanderAngle % (Math.PI / 2)); this.y = canvas.height - margin; }
    }
    draw() {
      const flicker = Math.sin(this.flickerPhase) * 0.4 + 0.6;
      const currentBrightness = this.brightness * flicker;
      const glowRadius = this.radius * 5;
      const outerGlow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
      outerGlow.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.9})`));
      outerGlow.addColorStop(0.3, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.5})`));
      outerGlow.addColorStop(0.6, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.3})`));
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();
      const bodyRadius = this.radius * 2.5;
      const bodyGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, bodyRadius);
      bodyGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${Math.min(1.0, currentBrightness * 1.1)})`));
      bodyGradient.addColorStop(0.5, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.8})`));
      bodyGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.4})`));
      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, bodyRadius, 0, Math.PI * 2);
      ctx.fill();
      const centerGradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      centerGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${Math.min(1.0, currentBrightness * 1.3)})`));
      centerGradient.addColorStop(0.7, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.9})`));
      centerGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.5})`));
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ----- Bird class -----
  class Bird {
    constructor(images) {
      this.img = images[Math.floor(Math.random() * images.length)];
      this.size = 20 + Math.random() * 15;
      this.x = Math.random() * canvas.width;
      this.y = canvas.height * (0.1 + Math.random() * 0.5);
      const dir = Math.random() < 0.5 ? -1 : 1;
      this.vx = dir * (birdConfig.baseSpeed + Math.random() * 0.3);
      this.vy = (Math.random() - 0.5) * 0.3;
      this.rotation = Math.random() * Math.PI * 2;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += (Math.random() - 0.5) * 0.01;
      if (this.x > canvas.width + this.size) this.x = -this.size;
      if (this.x < -this.size) this.x = canvas.width + this.size;
      if (this.y > canvas.height * 0.6 || this.y < canvas.height * 0.1) this.vy *= -1;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.drawImage(this.img, -this.size / 2, -this.size / 2, this.size, this.size);
      ctx.restore();
    }
  }

  // ----- State management -----
  let fireflies = [];
  let birds = [];
  let birdImages = [];
  let mode = document.documentElement.classList.contains('light-mode') ? 'birds' : 'fireflies';

  function initFireflies() {
    fireflies = [];
    for (let i = 0; i < fireflyConfig.num; i++) fireflies.push(new Firefly());
  }

  function initBirds() {
    birds = [];
    for (let i = 0; i < birdConfig.num; i++) birds.push(new Bird(birdImages));
  }

  function switchMode(newMode) {
    mode = newMode;
    if (mode === 'birds') {
      initBirds();
      canvas.style.background =
        'linear-gradient(#fdf4e4 0%, #a4d8ff 80%)'; // simple sea/sky hint
      ctx.globalCompositeOperation = 'source-over';
    } else {
      initFireflies();
      canvas.style.background = 'none';
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (mode === 'birds') {
      ctx.globalCompositeOperation = 'source-over';
      birds.forEach(b => { b.update(); b.draw(); });
    } else {
      ctx.globalCompositeOperation = 'lighter';
      fireflies.forEach(f => { f.update(); f.draw(); });
    }
    requestAnimationFrame(animate);
  }

  loadBirdImages().then(images => {
    birdImages = images;
    resize();
    if (mode === 'birds') initBirds(); else initFireflies();
    animate();
  });

  window.addEventListener('resize', () => {
    resize();
  });

  // respond to theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const isLight = document.documentElement.classList.contains('light-mode');
      switchMode(isLight ? 'birds' : 'fireflies');
    });
  }
});