// Firefly animation for the index page background
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('metaballs');
  if (!container) return;

  // Configuration - Firefly-specific settings
  const config = {
    numFireflies: 25, // More fireflies for a magical effect
    minRadius: 3,     // Much smaller - firefly size
    maxRadius: 8,     // Small variation in firefly sizes
    baseSpeed: 0.3,   // Slower base movement
    // Firefly color palette - whites and warm yellows
    colorPalette: [
      'rgba(255, 255, 240, 0.9)',   // Ivory white
      'rgba(255, 255, 224, 0.85)',  // Light yellow
      'rgba(255, 250, 205, 0.8)',   // Lemon chiffon
      'rgba(255, 248, 220, 0.9)',   // Cornsilk
      'rgba(255, 255, 255, 0.7)',   // Pure white
      'rgba(255, 253, 208, 0.85)',  // Cream
      'rgba(255, 245, 238, 0.8)',   // Seashell
      'rgba(255, 239, 213, 0.9)'    // Papaya whip
    ]
  };

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  // Set canvas styles - Subtle glow for fireflies
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  canvas.style.filter = 'blur(1px)'; // Minimal blur for soft glow
  canvas.style.opacity = '0.8';

  // Firefly class with natural movement patterns
  class Firefly {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      
      // Natural firefly movement - slow, wandering, with pauses
      this.baseVx = (Math.random() - 0.5) * config.baseSpeed;
      this.baseVy = (Math.random() - 0.5) * config.baseSpeed;
      this.vx = this.baseVx;
      this.vy = this.baseVy;
      
      this.radius = config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
      
      // Firefly-specific colors (whites and warm yellows)
      this.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
      
      // Firefly behavior properties
      this.brightness = 0.3 + Math.random() * 0.7; // Random initial brightness
      this.flickerSpeed = 0.02 + Math.random() * 0.03; // How fast it flickers
      this.flickerPhase = Math.random() * Math.PI * 2; // Random starting phase
      
      // Natural movement patterns
      this.wanderAngle = Math.random() * Math.PI * 2; // Direction of wandering
      this.wanderSpeed = 0.01 + Math.random() * 0.02; // How fast direction changes
      this.pauseTimer = 0; // Timer for pausing movement
      this.pauseDuration = Math.random() * 120 + 60; // How long to pause (1-3 seconds at 60fps)
      this.isPaused = false;
      
      // Floating motion (up and down like real fireflies)
      this.floatPhase = Math.random() * Math.PI * 2;
      this.floatAmplitude = 0.5 + Math.random() * 1.0;
      this.floatSpeed = 0.008 + Math.random() * 0.012;
      
      // Occasional burst of speed (like real fireflies)
      this.burstTimer = 0;
      this.burstDuration = 0;
      this.inBurst = false;
    }

    update() {
      // Update flicker phase for brightness animation
      this.flickerPhase += this.flickerSpeed;
      
      // Update floating motion
      this.floatPhase += this.floatSpeed;
      
      // Natural wandering behavior
      if (!this.isPaused && !this.inBurst) {
        // Gradually change direction (wandering)
        this.wanderAngle += (Math.random() - 0.5) * this.wanderSpeed;
        
        // Update velocity based on wander angle
        this.vx = Math.cos(this.wanderAngle) * config.baseSpeed * 0.7;
        this.vy = Math.sin(this.wanderAngle) * config.baseSpeed * 0.7;
        
        // Add floating motion (vertical bobbing)
        this.vy += Math.sin(this.floatPhase) * this.floatAmplitude * 0.1;
      }
      
      // Handle pausing behavior (fireflies often pause)
      this.pauseTimer++;
      if (this.pauseTimer >= this.pauseDuration) {
        this.isPaused = !this.isPaused;
        this.pauseTimer = 0;
        
        if (this.isPaused) {
          // Pause for a random duration
          this.pauseDuration = Math.random() * 180 + 30; // 0.5-3 seconds
          this.vx = 0;
          this.vy = 0;
        } else {
          // Resume movement for a random duration
          this.pauseDuration = Math.random() * 300 + 120; // 2-7 seconds
          
          // Occasionally do a quick burst of movement
          if (Math.random() < 0.3) {
            this.inBurst = true;
            this.burstDuration = 30 + Math.random() * 30; // 0.5-1 second burst
            this.burstTimer = 0;
          }
        }
      }
      
      // Handle burst movement
      if (this.inBurst) {
        this.burstTimer++;
        const burstMultiplier = 3 + Math.random() * 2; // 3-5x speed
        this.vx = this.baseVx * burstMultiplier;
        this.vy = this.baseVy * burstMultiplier;
        
        if (this.burstTimer >= this.burstDuration) {
          this.inBurst = false;
          this.burstTimer = 0;
        }
      }
      
      // Update position
      this.x += this.vx;
      this.y += this.vy;

      // Gentle edge behavior - fireflies tend to stay away from edges
      const margin = 50;
      if (this.x < margin) {
        this.wanderAngle = Math.abs(this.wanderAngle); // Turn right
        this.x = margin;
      }
      if (this.x > canvas.width - margin) {
        this.wanderAngle = Math.PI - Math.abs(this.wanderAngle); // Turn left
        this.x = canvas.width - margin;
      }
      if (this.y < margin) {
        this.wanderAngle = Math.PI / 2 + (this.wanderAngle % (Math.PI / 2)); // Turn down
        this.y = margin;
      }
      if (this.y > canvas.height - margin) {
        this.wanderAngle = -Math.PI / 2 + (this.wanderAngle % (Math.PI / 2)); // Turn up
        this.y = canvas.height - margin;
      }
    }

    draw() {
      // Calculate dynamic brightness (flickering like real fireflies)
      const flicker = Math.sin(this.flickerPhase) * 0.3 + 0.7; // 0.4 to 1.0
      const currentBrightness = this.brightness * flicker;
      
      // Firefly glow - small and soft
      const glowRadius = this.radius * 4; // Small glow radius
      
      // Outer soft glow
      const outerGlow = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, glowRadius
      );
      outerGlow.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.8})`));
      outerGlow.addColorStop(0.3, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.4})`));
      outerGlow.addColorStop(0.6, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.2})`));
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Main firefly body
      const bodyRadius = this.radius * 2;
      const bodyGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, bodyRadius
      );
      bodyGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness})`));
      bodyGradient.addColorStop(0.5, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.7})`));
      bodyGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.3})`));

      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, bodyRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bright center (the firefly's light)
      const centerGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      centerGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${Math.min(1.0, currentBrightness * 1.2)})`));
      centerGradient.addColorStop(0.7, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.8})`));
      centerGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.4})`));

      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create fireflies
  const fireflies = [];
  for (let i = 0; i < config.numFireflies; i++) {
    fireflies.push(new Firefly());
  }

  // Resize canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.imageSmoothingEnabled = true;
  }

  // Animation loop
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Use 'lighter' blend mode for firefly glow effect
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1.0;

    fireflies.forEach(firefly => {
      firefly.update();
      firefly.draw();
    });

    requestAnimationFrame(animate);
  }

  // Initialize
  resizeCanvas();
  animate();

  // Handle resize
  window.addEventListener('resize', resizeCanvas);

  // Occasional firefly behavior changes
  setInterval(() => {
    fireflies.forEach(firefly => {
      // Occasionally change brightness patterns
      if (Math.random() < 0.02) {
        firefly.brightness = 0.3 + Math.random() * 0.7;
        firefly.flickerSpeed = 0.02 + Math.random() * 0.03;
      }
      
      // Occasionally change movement patterns
      if (Math.random() < 0.01) {
        firefly.wanderSpeed = 0.01 + Math.random() * 0.02;
        firefly.floatAmplitude = 0.5 + Math.random() * 1.0;
        firefly.floatSpeed = 0.008 + Math.random() * 0.012;
      }
      
      // Very rarely, change color slightly (different firefly species)
      if (Math.random() < 0.005) {
        firefly.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
      }
    });
  }, 100);

  // Cleanup function
  window.addEventListener('beforeunload', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});