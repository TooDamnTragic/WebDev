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
    // Enhanced firefly color palette - more yellow tints
    colorPalette: [
      'rgba(255, 255, 150, 0.9)',   // Bright yellow
      'rgba(255, 245, 120, 0.85)',  // Golden yellow
      'rgba(255, 235, 100, 0.8)',   // Warm yellow
      'rgba(255, 250, 180, 0.9)',   // Light yellow
      'rgba(255, 255, 200, 0.7)',   // Pale yellow
      'rgba(255, 240, 140, 0.85)',  // Amber yellow
      'rgba(255, 220, 110, 0.8)',   // Deep yellow
      'rgba(255, 255, 170, 0.9)'    // Soft yellow
    ]
  };

  // Create canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  // Set canvas styles - Enhanced glow for fireflies
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '1000';
  canvas.style.filter = 'blur(1px)'; // Minimal blur for soft glow
  canvas.style.opacity = '0.8';

  // Firefly class with enhanced fluttering movement patterns
  class Firefly {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      
      // Enhanced firefly movement - more fluttering
      this.baseVx = (Math.random() - 0.5) * config.baseSpeed;
      this.baseVy = (Math.random() - 0.5) * config.baseSpeed;
      this.vx = this.baseVx;
      this.vy = this.baseVy;
      
      this.radius = config.minRadius + Math.random() * (config.maxRadius - config.minRadius);
      
      // Enhanced firefly colors (more yellow tints)
      this.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
      
      // Firefly behavior properties
      this.brightness = 0.4 + Math.random() * 0.6; // Slightly brighter
      this.flickerSpeed = 0.03 + Math.random() * 0.04; // Faster flicker
      this.flickerPhase = Math.random() * Math.PI * 2; // Random starting phase
      
      // Enhanced fluttering movement patterns
      this.wanderAngle = Math.random() * Math.PI * 2; // Direction of wandering
      this.wanderSpeed = 0.02 + Math.random() * 0.03; // Faster direction changes
      this.pauseTimer = 0; // Timer for pausing movement
      this.pauseDuration = Math.random() * 80 + 40; // Shorter pauses (0.7-2 seconds)
      this.isPaused = false;
      
      // Enhanced floating motion (more flutter-like)
      this.floatPhase = Math.random() * Math.PI * 2;
      this.floatAmplitude = 1.0 + Math.random() * 1.5; // More pronounced floating
      this.floatSpeed = 0.015 + Math.random() * 0.020; // Faster floating
      
      // More frequent bursts of speed (firefly darting)
      this.burstTimer = 0;
      this.burstDuration = 0;
      this.inBurst = false;
      
      // Additional flutter properties
      this.flutterPhase = Math.random() * Math.PI * 2;
      this.flutterSpeed = 0.08 + Math.random() * 0.12; // Quick flutter
      this.flutterAmplitude = 0.8 + Math.random() * 1.2;
    }

    update() {
      // Update flicker phase for brightness animation
      this.flickerPhase += this.flickerSpeed;
      
      // Update floating motion
      this.floatPhase += this.floatSpeed;
      
      // Update flutter motion
      this.flutterPhase += this.flutterSpeed;
      
      // Enhanced wandering behavior with flutter
      if (!this.isPaused && !this.inBurst) {
        // More erratic direction changes (flutter-like)
        this.wanderAngle += (Math.random() - 0.5) * this.wanderSpeed * 2;
        
        // Add flutter to movement
        const flutterX = Math.sin(this.flutterPhase) * this.flutterAmplitude * 0.1;
        const flutterY = Math.cos(this.flutterPhase * 1.3) * this.flutterAmplitude * 0.1;
        
        // Update velocity based on wander angle with flutter
        this.vx = Math.cos(this.wanderAngle) * config.baseSpeed * 0.8 + flutterX;
        this.vy = Math.sin(this.wanderAngle) * config.baseSpeed * 0.8 + flutterY;
        
        // Add enhanced floating motion (vertical bobbing with flutter)
        this.vy += Math.sin(this.floatPhase) * this.floatAmplitude * 0.15;
        this.vx += Math.cos(this.floatPhase * 0.7) * this.flutterAmplitude * 0.08;
      }
      
      // Handle pausing behavior (fireflies pause less frequently)
      this.pauseTimer++;
      if (this.pauseTimer >= this.pauseDuration) {
        this.isPaused = !this.isPaused;
        this.pauseTimer = 0;
        
        if (this.isPaused) {
          // Shorter pause durations
          this.pauseDuration = Math.random() * 120 + 20; // 0.3-2 seconds
          this.vx = 0;
          this.vy = 0;
        } else {
          // Resume movement for shorter durations (more active)
          this.pauseDuration = Math.random() * 200 + 80; // 1.3-4.7 seconds
          
          // More frequent bursts of movement
          if (Math.random() < 0.4) { // 40% chance instead of 30%
            this.inBurst = true;
            this.burstDuration = 20 + Math.random() * 25; // 0.3-0.75 second burst
            this.burstTimer = 0;
          }
        }
      }
      
      // Handle burst movement (firefly darting)
      if (this.inBurst) {
        this.burstTimer++;
        const burstMultiplier = 4 + Math.random() * 3; // 4-7x speed
        
        // Add random direction changes during burst
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
      // Calculate dynamic brightness (enhanced flickering)
      const flicker = Math.sin(this.flickerPhase) * 0.4 + 0.6; // 0.2 to 1.0 range
      const currentBrightness = this.brightness * flicker;
      
      // Enhanced firefly glow - more pronounced
      const glowRadius = this.radius * 5; // Larger glow radius
      
      // Outer soft glow (more yellow)
      const outerGlow = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, glowRadius
      );
      outerGlow.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.9})`));
      outerGlow.addColorStop(0.3, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.5})`));
      outerGlow.addColorStop(0.6, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.3})`));
      outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = outerGlow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Main firefly body (brighter)
      const bodyRadius = this.radius * 2.5;
      const bodyGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, bodyRadius
      );
      bodyGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${Math.min(1.0, currentBrightness * 1.1)})`));
      bodyGradient.addColorStop(0.5, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.8})`));
      bodyGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.4})`));

      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, bodyRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bright center (the firefly's light) - more intense
      const centerGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.radius
      );
      centerGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, `${Math.min(1.0, currentBrightness * 1.3)})`));
      centerGradient.addColorStop(0.7, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.9})`));
      centerGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${currentBrightness * 0.5})`));

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

    // Use 'lighter' blend mode for enhanced firefly glow effect
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

  // Enhanced firefly behavior changes
  setInterval(() => {
    fireflies.forEach(firefly => {
      // More frequent brightness pattern changes
      if (Math.random() < 0.03) {
        firefly.brightness = 0.4 + Math.random() * 0.6;
        firefly.flickerSpeed = 0.03 + Math.random() * 0.04;
      }
      
      // More frequent movement pattern changes
      if (Math.random() < 0.02) {
        firefly.wanderSpeed = 0.02 + Math.random() * 0.03;
        firefly.floatAmplitude = 1.0 + Math.random() * 1.5;
        firefly.floatSpeed = 0.015 + Math.random() * 0.020;
        firefly.flutterSpeed = 0.08 + Math.random() * 0.12;
        firefly.flutterAmplitude = 0.8 + Math.random() * 1.2;
      }
      
      // Occasionally change color (different firefly species)
      if (Math.random() < 0.008) {
        firefly.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
      }
    });
  }, 100);

  // Cleanup function
  window.addEventListener('beforeunload', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});