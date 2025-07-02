// Metaballs animation for the index page background
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('metaballs');
  if (!container) return;

  // Configuration
  const config = {
    numBalls: 6,
    minRadius: 40,
    maxRadius: 80,
    speed: 0.5,
    colors: [
      'rgba(102, 126, 234, 0.3)',
      'rgba(118, 75, 162, 0.3)',
      'rgba(0, 123, 255, 0.3)',
      'rgba(255, 255, 255, 0.1)',
      'rgba(240, 234, 214, 0.2)',
      'rgba(102, 126, 234, 0.2)'
    ]
  };

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  // Set canvas styles - Bring to top
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000'; // Bring metaballs to the top

  // Metaball class
  class Metaball {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * config.speed;
      this.vy = (Math.random() - 0.5) * config.speed;
      this.radius = config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
      this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
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
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      gradient.addColorStop(0, this.color);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create metaballs
  const metaballs = [];
  for (let i = 0; i < config.numBalls; i++) {
    metaballs.push(new Metaball());
  }

  // Resize canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set blend mode for metaball effect
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

  // Mouse interaction - add subtle movement influence
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Subtle attraction to mouse
    metaballs.forEach(ball => {
      const dx = mouseX - ball.x;
      const dy = mouseY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) {
        const force = (200 - distance) / 200 * 0.001;
        ball.vx += dx * force;
        ball.vy += dy * force;
        
        // Limit velocity
        const maxVel = config.speed * 2;
        ball.vx = Math.max(-maxVel, Math.min(maxVel, ball.vx));
        ball.vy = Math.max(-maxVel, Math.min(maxVel, ball.vy));
      }
    });
  });

  // Cleanup function
  window.addEventListener('beforeunload', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});