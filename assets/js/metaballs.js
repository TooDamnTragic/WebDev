// Metaballs animation for the index page background
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('metaballs');
  if (!container) return;

  // Configuration - Tripled amount, random colors, increased glow, blur and opacity
  const config = {
    numBalls: 18, // Tripled from 6 to 18
    minRadius: 40,
    maxRadius: 120,
    speed: 0.6,
    // Expanded color palette with higher opacity values
    colorPalette: [
      'rgba(102, 126, 234, 0.95)',  // Blue - increased opacity
      'rgba(118, 75, 162, 0.95)',   // Purple - increased opacity
      'rgba(0, 123, 255, 0.95)',    // Light blue - increased opacity
      'rgba(255, 99, 132, 0.95)',   // Pink - increased opacity
      'rgba(255, 206, 84, 0.95)',   // Yellow - increased opacity
      'rgba(75, 192, 192, 0.95)',   // Teal - increased opacity
      'rgba(153, 102, 255, 0.95)',  // Violet - increased opacity
      'rgba(255, 159, 64, 0.95)',   // Orange - increased opacity
      'rgba(199, 199, 199, 0.9)',   // Light gray - increased opacity
      'rgba(83, 102, 255, 0.95)',   // Indigo - increased opacity
      'rgba(255, 99, 255, 0.95)',   // Magenta - increased opacity
      'rgba(99, 255, 132, 0.95)',   // Green - increased opacity
      'rgba(255, 192, 203, 0.9)',   // Light pink - increased opacity
      'rgba(173, 216, 230, 0.9)',   // Light blue - increased opacity
      'rgba(240, 234, 214, 0.85)',  // Cream - increased opacity
      'rgba(255, 215, 0, 0.9)',     // Gold - increased opacity
      'rgba(50, 205, 50, 0.9)',     // Lime green - increased opacity
      'rgba(255, 20, 147, 0.95)'    // Deep pink - increased opacity
    ]
  };

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  // Set canvas styles - Enhanced blur and opacity
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  canvas.style.filter = 'blur(8px) brightness(1.2) saturate(1.3)'; // Increased blur and enhanced effects
  canvas.style.opacity = '0.9'; // Increased overall opacity
  canvas.style.imageRendering = 'auto'; // Allow smooth rendering for blur

  // Metaball class
  class Metaball {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * config.speed;
      this.vy = (Math.random() - 0.5) * config.speed;
      this.radius = config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
      
      // Randomize color from expanded palette with higher opacity
      this.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
      
      // Add color variation for more randomness
      this.hueShift = Math.random() * 60 - 30; // Random hue shift
      this.glowIntensity = 0.85 + Math.random() * 0.15; // Higher base glow intensity
      this.baseOpacity = 0.8 + Math.random() * 0.2; // Higher base opacity
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
      // Enhanced glow effect with multiple layers and higher opacity
      const glowRadius = this.radius * 2.2; // Increased glow radius for more blur
      
      // Outer glow layer with higher opacity
      const outerGlow = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, glowRadius
      );
      outerGlow.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${this.baseOpacity})`));
      outerGlow.addColorStop(0.2, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.8})`));
      outerGlow.addColorStop(0.4, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.6})`));
      outerGlow.addColorStop(0.6, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.4})`));
      outerGlow.addColorStop(0.8, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.2})`));
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      // Draw outer glow
      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Main gradient with enhanced glow and opacity
      const mainGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius * 1.5
      );
      mainGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${this.baseOpacity})`));
      mainGradient.addColorStop(0.3, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.9})`));
      mainGradient.addColorStop(0.6, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.6})`));
      mainGradient.addColorStop(0.8, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.3})`));
      mainGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Bright inner core with enhanced intensity and opacity
      const coreGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius * 0.7
      );
      coreGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, '1.0)'));
      coreGradient.addColorStop(0.4, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.95})`));
      coreGradient.addColorStop(0.7, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.8})`));
      coreGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${this.glowIntensity * 0.4})`));

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.7, 0, Math.PI * 2);
      ctx.fill();

      // Ultra-bright center point with higher opacity
      const centerGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius * 0.25
      );
      centerGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, '1.0)'));
      centerGradient.addColorStop(0.5, this.color.replace(/[\d\.]+\)$/g, '0.95)'));
      centerGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, '0.8)'));

      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.25, 0, Math.PI * 2);
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
    ctx.imageSmoothingEnabled = true; // Enable smoothing for better blur effect
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Enhanced blend mode for more vibrant glow with higher opacity
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 1.0; // Maximum alpha for full opacity

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

  // Enhanced mouse interaction with opacity changes
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Stronger attraction to mouse with enhanced opacity and glow
    metaballs.forEach((ball, index) => {
      const dx = mouseX - ball.x;
      const dy = mouseY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 300) { // Increased interaction radius
        const force = (300 - distance) / 300 * 0.005;
        ball.vx += dx * force;
        ball.vy += dy * force;
        
        // Enhance glow and opacity when near mouse
        ball.glowIntensity = Math.min(1.0, ball.glowIntensity + 0.02);
        ball.baseOpacity = Math.min(1.0, ball.baseOpacity + 0.01);
        
        // Limit velocity
        const maxVel = config.speed * 3;
        ball.vx = Math.max(-maxVel, Math.min(maxVel, ball.vx));
        ball.vy = Math.max(-maxVel, Math.min(maxVel, ball.vy));
      } else {
        // Gradually reduce glow when away from mouse but maintain high opacity
        ball.glowIntensity = Math.max(0.85, ball.glowIntensity - 0.003);
        ball.baseOpacity = Math.max(0.8, ball.baseOpacity - 0.002);
      }
    });
  });

  // Color randomization over time with opacity variations
  setInterval(() => {
    metaballs.forEach(ball => {
      // Occasionally change color for dynamic effect
      if (Math.random() < 0.025) { // Slightly higher chance for more variation
        ball.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
        ball.glowIntensity = 0.85 + Math.random() * 0.15;
        ball.baseOpacity = 0.8 + Math.random() * 0.2;
      }
    });
  }, 80); // Faster color changes

  // Cleanup function
  window.addEventListener('beforeunload', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});