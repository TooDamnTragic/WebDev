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
      
      // Enhanced randomization for glow and softness properties
      this.hueShift = Math.random() * 60 - 30; // Random hue shift
      this.glowIntensity = 0.6 + Math.random() * 0.4; // More varied glow intensity (0.6-1.0)
      this.baseOpacity = 0.7 + Math.random() * 0.3; // More varied base opacity (0.7-1.0)
      
      // New randomized properties for glow and softness
      this.glowRadius = 1.8 + Math.random() * 0.8; // Randomized glow radius multiplier (1.8-2.6)
      this.softness = 0.5 + Math.random() * 1.0; // Randomized softness factor (0.5-1.5)
      this.glowLayers = Math.floor(Math.random() * 3) + 2; // Random number of glow layers (2-4)
      this.pulseSpeed = 0.01 + Math.random() * 0.03; // Random pulsing speed (0.01-0.04)
      this.pulseAmplitude = 0.1 + Math.random() * 0.2; // Random pulse amplitude (0.1-0.3)
      
      // Animation properties for dynamic glow changes
      this.glowPhase = Math.random() * Math.PI * 2; // Random starting phase for glow animation
      this.softnessPhase = Math.random() * Math.PI * 2; // Random starting phase for softness animation
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
      
      // Update animation phases for dynamic glow and softness
      this.glowPhase += this.pulseSpeed;
      this.softnessPhase += this.pulseSpeed * 0.7; // Slightly different speed for variety
    }

    draw() {
      // Calculate dynamic glow and softness based on animation phases
      const dynamicGlowIntensity = this.glowIntensity + Math.sin(this.glowPhase) * this.pulseAmplitude;
      const dynamicSoftness = this.softness + Math.sin(this.softnessPhase) * 0.3;
      const dynamicGlowRadius = this.glowRadius + Math.cos(this.glowPhase * 0.5) * 0.2;
      
      // Enhanced glow effect with randomized properties and multiple layers
      const glowRadius = this.radius * dynamicGlowRadius;
      
      // Draw multiple glow layers with randomized properties
      for (let layer = 0; layer < this.glowLayers; layer++) {
        const layerRadius = glowRadius * (1 + layer * 0.3);
        const layerOpacity = dynamicGlowIntensity * (1 - layer * 0.2);
        
        const layerGlow = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, layerRadius
        );
        
        // Create gradient stops with randomized softness
        const stops = Math.floor(4 + Math.random() * 3); // 4-6 gradient stops
        for (let i = 0; i <= stops; i++) {
          const stop = i / stops;
          const adjustedStop = Math.pow(stop, dynamicSoftness); // Apply softness curve
          const opacity = layerOpacity * (1 - adjustedStop);
          layerGlow.addColorStop(adjustedStop, this.color.replace(/[\d\.]+\)$/g, `${Math.max(0, opacity)})`));
        }
        layerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        // Draw glow layer
        ctx.fillStyle = layerGlow;
        ctx.beginPath();
        ctx.arc(this.x, this.y, layerRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main gradient with enhanced randomized properties
      const mainRadius = this.radius * (1.2 + dynamicSoftness * 0.3);
      const mainGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, mainRadius
      );
      
      // Create main gradient with randomized softness curve
      const mainStops = Math.floor(3 + Math.random() * 2); // 3-4 stops for main gradient
      for (let i = 0; i <= mainStops; i++) {
        const stop = i / mainStops;
        const adjustedStop = Math.pow(stop, dynamicSoftness * 0.8);
        const opacity = this.baseOpacity * (1 - adjustedStop * 0.7);
        mainGradient.addColorStop(adjustedStop, this.color.replace(/[\d\.]+\)$/g, `${Math.max(0, opacity)})`));
      }
      mainGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = mainGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, mainRadius, 0, Math.PI * 2);
      ctx.fill();

      // Bright inner core with randomized intensity and softness
      const coreRadius = this.radius * (0.4 + dynamicSoftness * 0.3);
      const coreGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, coreRadius
      );
      
      const coreIntensity = Math.min(1.0, dynamicGlowIntensity * 1.2);
      coreGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, '1.0)'));
      coreGradient.addColorStop(0.3, this.color.replace(/[\d\.]+\)$/g, `${coreIntensity * 0.95})`));
      coreGradient.addColorStop(0.6, this.color.replace(/[\d\.]+\)$/g, `${coreIntensity * 0.8})`));
      coreGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${coreIntensity * 0.4})`));

      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      // Ultra-bright center point with randomized properties
      const centerRadius = this.radius * (0.15 + dynamicSoftness * 0.1);
      const centerGradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, centerRadius
      );
      
      const centerIntensity = Math.min(1.0, dynamicGlowIntensity * 1.5);
      centerGradient.addColorStop(0, this.color.replace(/[\d\.]+\)$/g, '1.0)'));
      centerGradient.addColorStop(0.5, this.color.replace(/[\d\.]+\)$/g, `${centerIntensity * 0.95})`));
      centerGradient.addColorStop(1, this.color.replace(/[\d\.]+\)$/g, `${centerIntensity * 0.8})`));

      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, centerRadius, 0, Math.PI * 2);
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

  // Color and property randomization over time with enhanced variations
  setInterval(() => {
    metaballs.forEach(ball => {
      // Occasionally change color and properties for dynamic effect
      if (Math.random() < 0.03) { // Slightly higher chance for more variation
        ball.color = config.colorPalette[Math.floor(Math.random() * config.colorPalette.length)];
        ball.glowIntensity = 0.6 + Math.random() * 0.4;
        ball.baseOpacity = 0.7 + Math.random() * 0.3;
        
        // Randomize glow and softness properties
        ball.glowRadius = 1.8 + Math.random() * 0.8;
        ball.softness = 0.5 + Math.random() * 1.0;
        ball.glowLayers = Math.floor(Math.random() * 3) + 2;
        ball.pulseSpeed = 0.01 + Math.random() * 0.03;
        ball.pulseAmplitude = 0.1 + Math.random() * 0.2;
      }
      
      // Gradually evolve glow and softness properties over time
      if (Math.random() < 0.1) {
        ball.glowIntensity += (Math.random() - 0.5) * 0.02;
        ball.glowIntensity = Math.max(0.6, Math.min(1.0, ball.glowIntensity));
        
        ball.softness += (Math.random() - 0.5) * 0.05;
        ball.softness = Math.max(0.5, Math.min(1.5, ball.softness));
        
        ball.glowRadius += (Math.random() - 0.5) * 0.02;
        ball.glowRadius = Math.max(1.8, Math.min(2.6, ball.glowRadius));
      }
    });
  }, 60); // Faster property changes for more dynamic effect

  // Cleanup function
  window.addEventListener('beforeunload', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});