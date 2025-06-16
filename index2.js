class TooDamnTragicEffects {
  constructor() {
    this.rippleCanvas = document.getElementById('rippleCanvas');
    this.trailCanvas = document.getElementById('trailCanvas');
    this.rippleContainer = document.getElementById('rippleContainer');
    
    this.rippleCtx = this.rippleCanvas.getContext('2d');
    this.trailCtx = this.trailCanvas.getContext('2d');
    
    // Enable smoothing for better quality
    this.trailCtx.imageSmoothingEnabled = true;
    this.trailCtx.imageSmoothingQuality = 'high';
    this.rippleCtx.imageSmoothingEnabled = true;
    this.rippleCtx.imageSmoothingQuality = 'high';
    
    // Mouse tracking with interpolation
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseHistory = [];
    this.maxHistoryLength = 10;
    
    // Smooth trail particles with consistent density
    this.trailParticles = [];
    this.turbulenceParticles = [];
    this.maxTrailParticles = 80;
    this.particleSpacing = 8; // Distance between particles for consistent density
    this.lastParticleDistance = 0;
    
    // Ripple effects
    this.ripples = [];
    this.lastRippleTime = 0;
    this.rippleDelay = 150; // Increased delay to reduce artifacts
    
    // Optimized settings for smooth trails
    this.settings = {
      waterRipple: {
        scale: 4.0, // Reduced to minimize artifacts
        strength: 3.0,
        viscosity: 0.35,
        decay: 0.85,
        chromaticDisp: 0.3,
        intensity: 3.0,
        speed: 0.6,
        momentum: 6.0
      },
      mouseDraw: {
        radius: 0.45,
        strength: 0.75, // Reduced for smoother fade
        turbulence: 0.4,
        tint: '#0082F7',
        colorMix: 0.4,
        bloom: 0.3, // Reduced bloom to prevent artifacts
        tail: 0.7, // Increased for smoother trail
        distortion: 0.0,
        blendMode: 'screen',
        fadeSpeed: 0.02, // Slower fade for smoother transitions
        minOpacity: 0.1,
        maxOpacity: 0.9
      }
    };
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.startAnimation();
  }
  
  setupCanvas() {
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      this.rippleCanvas.width = width;
      this.rippleCanvas.height = height;
      this.trailCanvas.width = width;
      this.trailCanvas.height = height;
      
      // Clear any residual artifacts
      this.trailCtx.clearRect(0, 0, width, height);
      this.rippleCtx.clearRect(0, 0, width, height);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
  
  setupEventListeners() {
    // Mouse movement with smooth interpolation
    document.addEventListener('mousemove', (e) => {
      this.updateMousePosition(e.clientX, e.clientY);
      this.createSmoothTrail();
      this.createControlledTurbulence();
    });
    
    // Click for controlled ripples only
    document.addEventListener('click', (e) => {
      this.createWaterRipple(e.clientX, e.clientY, true);
    });
    
    // Reduced frequency ripple creation
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - this.lastRippleTime > this.rippleDelay) {
        const velocity = this.getMouseVelocity();
        if (velocity > 3) { // Only create ripples when moving
          this.createWaterRipple(e.clientX, e.clientY, false);
          this.lastRippleTime = now;
        }
      }
    });
  }
  
  updateMousePosition(x, y) {
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    this.mouseX = x;
    this.mouseY = y;
    
    // Maintain mouse history for smooth interpolation
    this.mouseHistory.push({ x, y, time: Date.now() });
    if (this.mouseHistory.length > this.maxHistoryLength) {
      this.mouseHistory.shift();
    }
  }
  
  getMouseVelocity() {
    if (this.mouseHistory.length < 2) return 0;
    
    const recent = this.mouseHistory[this.mouseHistory.length - 1];
    const previous = this.mouseHistory[this.mouseHistory.length - 2];
    
    const dx = recent.x - previous.x;
    const dy = recent.y - previous.y;
    const dt = recent.time - previous.time;
    
    return Math.sqrt(dx * dx + dy * dy) / Math.max(dt, 1);
  }
  
  createSmoothTrail() {
    const distance = Math.sqrt(
      Math.pow(this.mouseX - this.lastMouseX, 2) + 
      Math.pow(this.mouseY - this.lastMouseY, 2)
    );
    
    this.lastParticleDistance += distance;
    
    // Create particles at consistent intervals for smooth trail
    while (this.lastParticleDistance >= this.particleSpacing) {
      const progress = (this.lastParticleDistance - this.particleSpacing) / distance;
      const interpolatedX = this.lastMouseX + (this.mouseX - this.lastMouseX) * (1 - progress);
      const interpolatedY = this.lastMouseY + (this.mouseY - this.lastMouseY) * (1 - progress);
      
      this.createTrailParticle(interpolatedX, interpolatedY);
      this.lastParticleDistance -= this.particleSpacing;
    }
  }
  
  createTrailParticle(x, y) {
    const velocity = this.getMouseVelocity();
    const baseSize = 6 + Math.min(velocity * 0.5, 8);
    
    const particle = {
      x,
      y,
      vx: (this.mouseX - this.lastMouseX) * 0.05,
      vy: (this.mouseY - this.lastMouseY) * 0.05,
      life: 1.0,
      maxLife: 1500 + Math.random() * 1000, // Longer life for smoother fade
      size: baseSize,
      originalSize: baseSize,
      color: this.settings.mouseDraw.tint,
      startTime: Date.now(),
      opacity: this.settings.mouseDraw.maxOpacity
    };
    
    this.trailParticles.push(particle);
    
    // Maintain consistent particle count
    if (this.trailParticles.length > this.maxTrailParticles) {
      this.trailParticles.shift();
    }
  }
  
  createControlledTurbulence() {
    const velocity = this.getMouseVelocity();
    
    // Only create turbulence at higher velocities to reduce artifacts
    if (velocity > 8 && Math.random() < 0.3) {
      const particleCount = Math.min(Math.floor(velocity * this.settings.mouseDraw.turbulence * 0.05), 3);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 25;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        this.turbulenceParticles.push({
          x: this.mouseX + (Math.random() - 0.5) * 10,
          y: this.mouseY + (Math.random() - 0.5) * 10,
          dx,
          dy,
          size: 2 + Math.random() * 4,
          lifetime: 800 + Math.random() * 1200,
          startTime: Date.now(),
          opacity: 0.6
        });
      }
    }
    
    // Limit turbulence particles to prevent accumulation
    if (this.turbulenceParticles.length > 30) {
      this.turbulenceParticles.splice(0, this.turbulenceParticles.length - 30);
    }
  }
  
  createWaterRipple(x, y, isClick = false) {
    // Reduced ripple creation to minimize artifacts
    if (!isClick && Math.random() > 0.7) return;
    
    const ripple = document.createElement('div');
    ripple.className = 'water-ripple';
    
    const baseSize = isClick ? 400 : 250;
    const size = baseSize * this.settings.waterRipple.scale * 0.08;
    const duration = (1500 + Math.random() * 800) * this.settings.waterRipple.decay;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.setProperty('--size', size + 'px');
    ripple.style.setProperty('--duration', duration + 'ms');
    
    this.rippleContainer.appendChild(ripple);
    
    // Clean removal
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
    
    // Reduced canvas ripple intensity
    if (isClick) {
      this.createCanvasRipple(x, y, size * 0.3, duration, isClick);
    }
  }
  
  createCanvasRipple(x, y, maxSize, duration, isClick) {
    const ripple = {
      x,
      y,
      radius: 0,
      maxRadius: maxSize,
      opacity: isClick ? 0.4 : 0.2,
      startTime: Date.now(),
      duration,
      color: this.settings.mouseDraw.tint,
      strength: this.settings.waterRipple.strength * 0.05
    };
    
    this.ripples.push(ripple);
  }
  
  updateTrailParticles() {
    const now = Date.now();
    
    this.trailParticles = this.trailParticles.filter(particle => {
      const age = now - particle.startTime;
      const lifeProgress = age / particle.maxLife;
      
      if (lifeProgress >= 1) return false;
      
      // Smooth exponential fade
      particle.life = Math.pow(1 - lifeProgress, 2);
      particle.opacity = this.settings.mouseDraw.minOpacity + 
                        (this.settings.mouseDraw.maxOpacity - this.settings.mouseDraw.minOpacity) * particle.life;
      
      // Smooth size transition
      particle.size = particle.originalSize * (0.3 + particle.life * 0.7);
      
      // Gentle momentum with viscosity
      particle.x += particle.vx * this.settings.waterRipple.momentum * 0.05;
      particle.y += particle.vy * this.settings.waterRipple.momentum * 0.05;
      
      particle.vx *= this.settings.waterRipple.viscosity;
      particle.vy *= this.settings.waterRipple.viscosity;
      
      return true;
    });
  }

  updateTurbulenceParticles() {
    const now = Date.now();

    this.turbulenceParticles = this.turbulenceParticles.filter(p => {
      const age = now - p.startTime;
      const progress = age / p.lifetime;
      if (progress >= 1) return false;
      
      // Smooth movement and fade
      p.currentX = p.x + p.dx * progress * 0.8;
      p.currentY = p.y + p.dy * progress * 0.8;
      p.alpha = p.opacity * Math.pow(1 - progress, 2);
      p.currentSize = p.size * (1 - progress * 0.5);
      
      return true;
    });
  }
  
  updateRipples() {
    const now = Date.now();
    
    this.ripples = this.ripples.filter(ripple => {
      const age = now - ripple.startTime;
      const progress = age / ripple.duration;
      
      if (progress >= 1) return false;
      
      ripple.radius = ripple.maxRadius * progress;
      ripple.opacity = (1 - progress) * ripple.strength;
      
      return true;
    });
  }
  
  drawTrailParticles() {
    // Use composite operation for smooth blending
    this.trailCtx.globalCompositeOperation = 'screen';
    
    this.trailParticles.forEach((particle, index) => {
      const alpha = particle.opacity;
      const size = particle.size;
      
      // Create smooth gradient with proper falloff
      const gradient = this.trailCtx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, size * 1.5
      );
      
      gradient.addColorStop(0, `rgba(0, 130, 247, ${alpha})`);
      gradient.addColorStop(0.4, `rgba(0, 130, 247, ${alpha * 0.6})`);
      gradient.addColorStop(0.8, `rgba(0, 130, 247, ${alpha * 0.2})`);
      gradient.addColorStop(1, `rgba(0, 130, 247, 0)`);
      
      this.trailCtx.fillStyle = gradient;
      this.trailCtx.beginPath();
      this.trailCtx.arc(particle.x, particle.y, size * 1.5, 0, Math.PI * 2);
      this.trailCtx.fill();
      
      // Subtle bloom for leading particles
      if (index > this.trailParticles.length - 10 && this.settings.mouseDraw.bloom > 0) {
        this.trailCtx.shadowColor = particle.color;
        this.trailCtx.shadowBlur = size * this.settings.mouseDraw.bloom * 2;
        this.trailCtx.globalAlpha = alpha * 0.3;
        this.trailCtx.fill();
        this.trailCtx.shadowBlur = 0;
        this.trailCtx.globalAlpha = 1;
      }
    });
    
    this.trailCtx.globalCompositeOperation = 'source-over';
  }

  drawTurbulenceParticles() {
    this.trailCtx.globalCompositeOperation = 'screen';
    
    this.turbulenceParticles.forEach(p => {
      if (p.alpha > 0.05) { // Only draw visible particles
        const gradient = this.trailCtx.createRadialGradient(
          p.currentX, p.currentY, 0,
          p.currentX, p.currentY, p.currentSize * 2
        );
        
        gradient.addColorStop(0, `rgba(0, 130, 247, ${p.alpha})`);
        gradient.addColorStop(0.6, `rgba(0, 130, 247, ${p.alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(0, 130, 247, 0)`);
        
        this.trailCtx.fillStyle = gradient;
        this.trailCtx.beginPath();
        this.trailCtx.arc(p.currentX, p.currentY, p.currentSize * 2, 0, Math.PI * 2);
        this.trailCtx.fill();
      }
    });
    
    this.trailCtx.globalCompositeOperation = 'source-over';
  }
  
  drawRipples() {
    this.rippleCtx.globalCompositeOperation = 'screen';
    
    this.ripples.forEach(ripple => {
      if (ripple.opacity > 0.05) {
        const gradient = this.rippleCtx.createRadialGradient(
          ripple.x, ripple.y, ripple.radius * 0.9,
          ripple.x, ripple.y, ripple.radius
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.9, `rgba(0, 130, 247, ${ripple.opacity * 0.3})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${ripple.opacity * 0.5})`);
        
        this.rippleCtx.strokeStyle = gradient;
        this.rippleCtx.lineWidth = 1.5;
        this.rippleCtx.beginPath();
        this.rippleCtx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        this.rippleCtx.stroke();
      }
    });
    
    this.rippleCtx.globalCompositeOperation = 'source-over';
  }
  
  animate() {
    // Clear with slight fade for smoother trails
    this.trailCtx.globalCompositeOperation = 'source-over';
    this.trailCtx.fillStyle = `rgba(0, 0, 0, ${this.settings.mouseDraw.fadeSpeed})`;
    this.trailCtx.fillRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
    
    // Clear ripple canvas completely to prevent artifacts
    this.rippleCtx.clearRect(0, 0, this.rippleCanvas.width, this.rippleCanvas.height);
    
    this.updateTrailParticles();
    this.updateTurbulenceParticles();
    this.updateRipples();
    this.drawTrailParticles();
    this.drawTurbulenceParticles();
    this.drawRipples();
    
    requestAnimationFrame(() => this.animate());
  }
  
  startAnimation() {
    this.animate();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TooDamnTragicEffects();
});

// Simplified custom cursor without artifacts
let cursorTimeout;
document.addEventListener('mousemove', (e) => {
  clearTimeout(cursorTimeout);
  
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 130, 247, 0.6), transparent 70%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    animation: cursorFade 0.8s ease-out forwards;
  `;
  
  document.body.appendChild(cursor);
  
  cursorTimeout = setTimeout(() => {
    if (cursor.parentNode) {
      cursor.parentNode.removeChild(cursor);
    }
  }, 800);
});

// Optimized cursor animation
const style = document.createElement('style');
style.textContent = `
  @keyframes cursorFade {
    0% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(0.8);
    }
    50% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.2);
    }
  }
`;
document.head.appendChild(style);