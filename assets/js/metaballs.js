// Metaballs animation for the index page background
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('metaballs');
  if (!container) return;

  // Configuration - Tripled amount, random colors, increased glow
  const config = {
    numBalls: 18, // Tripled from 6 to 18
    minRadius: 40,
    maxRadius: 120,
    speed: 0.6,
    // Expanded color palette with more variety
    colorPalette: [
      'rgba(102, 126, 234, 0.9)',  // Blue
      'rgba(118, 75, 162, 0.9)',   // Purple
      'rgba(0, 123, 255, 0.9)',    // Light blue
      'rgba(255, 99, 132, 0.9)',   // Pink
      'rgba(255, 206, 84, 0.9)',   // Yellow
      'rgba(75, 192, 192, 0.9)',   // Teal
      'rgba(153, 102, 255, 0.9)',  // Violet
      'rgba(255, 159, 64, 0.9)',   // Orange
      'rgba(199, 199, 199, 0.8)',  // Light gray
      'rgba(83, 102, 255, 0.9)',   // Indigo
      'rgba(255, 99, 255, 0.9)',   // Magenta
      'rgba(99, 255, 132, 0.9)',   // Green
      'rgba(255, 192, 203, 0.8)',  // Light pink
      'rgba(173, 216, 230, 0.8)',  // Light blue
      'rgba(240, 234, 214, 0.7)',  // Cream
      'rgba(255, 215, 0, 0.8)',    // Gold
      'rgba(50, 205, 50, 0.8)',    // Lime green
      'rgba(255, 20, 147, 0.9)'    // Deep pink
    ]
  };

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  // Set canvas styles - Bring to top and remove any blur
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  canvas.style.filter = 'none';
  canvas.style.imageRendering = 'crisp-edges';

  // Metaball class
  class Metaball {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * config.speed;
      this.vy = (Math.random() - 0.5) * config.speed;
      this.radius = config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
      
      // Randomize color from expanded palette
      this.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
      
      // Add color variation for more randomness
      this.hueShift = Math.random() * 60 - 30; // Random hue shift
      this.glowIntensity = 0.7 + Math.random() * 0.3; // Random glow intensity
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      // Bounce off edges
      if (this.x <= this.radius || this.x >= canvas.width - this.radius) {
        this.vx *= -1;
      }
      if (this.y <= this.radius || this.y >= canvas.height - this.radius) {
        this.vy *= -1;
      }

      // Keep within bounds
      this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
      this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
    }

    draw() {
      // Enhanced glow effect with multiple layers
      const glowRadius = this.radius * 1.8; // Increased glow radius
      
      // Outer glow layer
      const outerGlow = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, glowRadius
      );
      outerGlow.addColorStop(0, this.color);
      outerGlow.addColorStop(0.3, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.6})`));
      outerGlow.addColorStop(0.6, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.3})`));
      outerGlow.addColorStop(0.8, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.1})`));
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Draw outer glow
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Main gradient with enhanced glow
      const mainGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius * 1.2
      );
      mainGradient.addColorStop(0, this.color);
      mainGradient.addColorStop(0.4, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.8})`));
      mainGradient.addColorStop(0.7, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.4})`));
      mainGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Bright inner core with enhanced intensity
      const coreGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius * 0.5
      );
      coreGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, '1.0)'));
      coreGradient.addColorStop(0.6, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity})`));
      coreGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.6})`));

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Ultra-bright center point
      ctx.fillStyle = this.color.replace(/[\d\.]+\)$/g, '1.0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.15, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create metaballs - now 18 instead of 6
  const metaballs = [];
  for (let i = 0; i < config.numBalls; i++) {
    metaballs.push(new Metaball());
  }

  // Resize canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = false;
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Enhanced blend mode for more vibrant glow
    ctx.globalCompositeOperation = 'screen';

    metaballs.forEach(ball => {
      ball.update();
      ball.draw();
    });

    requestAnimationFrame(animate);
  }

  // Initialize
  resizeCanvas();
  animate();

  // Handle resize
  window.addEventListener('resize', resizeCanvas);

  // Enhanced mouse interaction
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Stronger attraction to mouse with color shifting
    metaballs.forEach((ball, index) => {
      const dx = mouseX - ball.x;
      const dy = mouseY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 250) {
        const force = (250 - distance) / 250 * 0.004;
        ball.vx += dx * force;
        ball.vy += dy * force;
        
        // Enhance glow when near mouse
        ball.glowIntensity = Math.min(1.0, ball.glowIntensity + 0.01);
        
        // Limit velocity
        const maxVel = config.speed * 2.5;
        ball.vx = Math.max(-maxVel, Math.min(maxVel, ball.vx));
        ball.vy = Math.max(-maxVel, Math.min(maxVel, ball.vy));
      } else {
        // Gradually reduce glow when away from mouse
        ball.glowIntensity = Math.max(0.7, ball.glowIntensity - 0.005);
      }
    });
  });

  // Color randomization over time
  setInterval(() => {
    metaballs.forEach(ball => {
      // Occasionally change color for dynamic effect
      if (Math.random() < 0.02) { // 2% chance per interval
        ball.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
        ball.glowIntensity = 0.7 + Math.random() * 0.3;
      }
    });
  }, 100);

  // Cleanup function
  window.addEventListener('beforeunload', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});