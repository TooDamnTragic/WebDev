class TooDamnTragicEffects {
  constructor() {
    this.rippleCanvas = document.getElementById('rippleCanvas');
    this.trailCanvas = document.getElementById('trailCanvas');
    this.rippleContainer = document.getElementById('rippleContainer');
    
    this.rippleCtx = this.rippleCanvas.getContext('2d');
    this.trailCtx = this.trailCanvas.getContext('2d');
    
    // Mouse tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    
    // Trail particles
    this.trailParticles = [];
    this.turbulenceParticles = [];
    this.maxTrailParticles = 50;
    
    // Ripple effects
    this.ripples = [];
    this.lastRippleTime = 0;
    this.rippleDelay = 100; // ms between ripples
    
    // Settings based on Unicorn Studio config
    this.settings = {
      waterRipple: {
        scale: 6.0,
        strength: 5.0,
        viscosity: 0.25,
        decay: 0.75,
        chromaticDisp: 0.5,
        intensity: 5.0,
        speed: 0.75,
        momentum: 10.0
      },
      mouseDraw: {
        radius: 0.57,
        strength: 0.91,
        turbulence: 0.61,
        tint: '#0082F7',
        colorMix: 0.5,
        bloom: 0.5,
        tail: 0.5,
        distortion: 0.0,
        blendMode: 'screen'
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
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
  
  setupEventListeners() {
    // Mouse movement tracking
    document.addEventListener('mousemove', (e) => {
      this.lastMouseX = this.mouseX;
      this.lastMouseY = this.mouseY;
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      this.createGlowTrail();
      this.createTurbulenceParticles();
    });
    
    // Click for stronger ripples
    document.addEventListener('click', (e) => {
      this.createWaterRipple(e.clientX, e.clientY, true);
      this.createChromaticRipple(e.clientX, e.clientY);
    });
    
    // Continuous ripple creation on movement
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - this.lastRippleTime > this.rippleDelay) {
        this.createWaterRipple(e.clientX, e.clientY, false);
        this.lastRippleTime = now;
      }
    });
  }
  
  createWaterRipple(x, y, isClick = false) {
    const ripple = document.createElement('div');
    ripple.className = 'water-ripple';
    
    const baseSize = isClick ? 600 : 400;
    const size = baseSize * this.settings.waterRipple.scale * 0.1;
    const duration = (2000 + Math.random() * 1000) * this.settings.waterRipple.decay;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.setProperty('--size', size + 'px');
    ripple.style.setProperty('--duration', duration + 'ms');
    
    this.rippleContainer.appendChild(ripple);
    
    // Remove after animation
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
    
    // Create additional ripple effect
    this.createCanvasRipple(x, y, size, duration, isClick);
  }
  
  createCanvasRipple(x, y, maxSize, duration, isClick) {
    const ripple = {
      x,
      y,
      radius: 0,
      maxRadius: maxSize * 0.5,
      opacity: isClick ? 0.8 : 0.4,
      startTime: Date.now(),
      duration,
      color: this.settings.mouseDraw.tint,
      strength: this.settings.waterRipple.strength * 0.1
    };
    
    this.ripples.push(ripple);
  }
  
 createChromaticRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'chromatic-ripple';
    
    const size = 300 * this.settings.waterRipple.chromaticDisp;
    const duration = 2500;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.setProperty('--size', size + 'px');
    ripple.style.setProperty('--duration', duration + 'ms');
    
    this.rippleContainer.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
  }
  
  createGlowTrail() {
    const particle = {
      x: this.mouseX,
      y: this.mouseY,
      vx: (this.mouseX - this.lastMouseX) * 0.1,
      vy: (this.mouseY - this.lastMouseY) * 0.1,
      life: 1.0,
      maxLife: 2000 + Math.random() * 1000,
      size: 8 + Math.random() * 12,
      color: this.settings.mouseDraw.tint,
      startTime: Date.now()
    };
    
    this.trailParticles.push(particle);
    
    // Limit particle count
    if (this.trailParticles.length > this.maxTrailParticles) {
      this.trailParticles.shift();
    }
    
    // Particle will be rendered on canvas only
  }
  
  createTurbulenceParticles() {
    const velocity = Math.sqrt(
      Math.pow(this.mouseX - this.lastMouseX, 2) + 
      Math.pow(this.mouseY - this.lastMouseY, 2)
    );
    
    if (velocity > 5) {
      const particleCount = Math.floor(velocity * this.settings.mouseDraw.turbulence * 0.1);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 40;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;

        const size = 2 + Math.random() * 6;
        const lifetime = 1000 + Math.random() * 2000;

        this.turbulenceParticles.push({
          x: this.mouseX,
          y: this.mouseY,
          dx,
          dy,
          size,
          lifetime,
          startTime: Date.now()
        });
      }
    }
  }
  
  updateTrailParticles() {
    const now = Date.now();
    
    this.trailParticles = this.trailParticles.filter(particle => {
      const age = now - particle.startTime;
      particle.life = 1 - (age / particle.maxLife);
      
      if (particle.life <= 0) return false;
      
      // Update position with momentum
      particle.x += particle.vx * this.settings.waterRipple.momentum * 0.1;
      particle.y += particle.vy * this.settings.waterRipple.momentum * 0.1;
      
      // Apply viscosity
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
      p.currentX = p.x + p.dx * progress;
      p.currentY = p.y + p.dy * progress;
      p.alpha = 1 - progress;
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
    this.trailCtx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
    
    this.trailParticles.forEach(particle => {
      const alpha = particle.life * this.settings.mouseDraw.strength;
      const size = particle.size * (0.5 + particle.life * 0.5);
      
      // Create gradient
      const gradient = this.trailCtx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, size
      );
      
      gradient.addColorStop(0, `rgba(0, 130, 247, ${alpha})`);
      gradient.addColorStop(0.5, `rgba(0, 130, 247, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(0, 130, 247, 0)`);
      
      this.trailCtx.fillStyle = gradient;
      this.trailCtx.beginPath();
      this.trailCtx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
      this.trailCtx.fill();
      
      // Add bloom effect
      if (this.settings.mouseDraw.bloom > 0) {
        this.trailCtx.shadowColor = particle.color;
        this.trailCtx.shadowBlur = size * this.settings.mouseDraw.bloom;
        this.trailCtx.fill();
        this.trailCtx.shadowBlur = 0;
      }
    });
  }

  drawTurbulenceParticles() {
    this.turbulenceParticles.forEach(p => {
      const size = p.size;
      this.trailCtx.fillStyle = `rgba(0, 130, 247, ${p.alpha})`;
      this.trailCtx.beginPath();
      this.trailCtx.arc(p.currentX, p.currentY, size, 0, Math.PI * 2);
      this.trailCtx.fill();
    });
  }
  
  drawRipples() {
    this.ripples.forEach(ripple => {
      const alpha = ripple.opacity;
      
      // Create ripple gradient
      const gradient = this.rippleCtx.createRadialGradient(
        ripple.x, ripple.y, ripple.radius * 0.8,
        ripple.x, ripple.y, ripple.radius
      );
      
      gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
      gradient.addColorStop(0.8, `rgba(0, 130, 247, ${alpha * 0.3})`);
      gradient.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.6})`);
      
      this.rippleCtx.strokeStyle = gradient;
      this.rippleCtx.lineWidth = 2;
      this.rippleCtx.beginPath();
      this.rippleCtx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
      this.rippleCtx.stroke();
    });
  }
  
  animate() {
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

// Add custom cursor
document.addEventListener('mousemove', (e) => {
  // Create custom cursor effect
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 130, 247, 0.8), transparent);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    animation: cursorPulse 1s ease-out forwards;
  `;
  
  document.body.appendChild(cursor);
  
  setTimeout(() => {
    if (cursor.parentNode) {
      cursor.parentNode.removeChild(cursor);
    }
  }, 1000);
});

// Add cursor pulse animation
const style = document.createElement('style');
style.textContent = `
  @keyframes cursorPulse {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(2);
    }
  }
`;
document.head.appendChild(style);