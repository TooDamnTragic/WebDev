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
    this.maxHistoryLength = 15;
    
    // Enhanced trail particles with turbulence
    this.trailParticles = [];
    this.turbulenceParticles = [];
    this.maxTrailParticles = 120;
    this.particleSpacing = 6; // Tighter spacing for smoother trails
    this.lastParticleDistance = 0;
    
    // Perlin noise for organic movement
    this.noiseOffset = 0;
    this.noiseScale = 0.005;
    this.turbulenceStrength = 2.5;
    
    // Enhanced ripple effects
    this.ripples = [];
    this.lastRippleTime = 0;
    this.rippleDelay = 120;
    
    // Dynamic fade variations
    this.baseFadeSpeed = 0.015;
    this.fadeVariationRange = { min: 0.8, max: 1.2 };
    
    // Position jitter settings
    this.jitterRange = { min: -2.5, max: 2.5 };
    
    // Enhanced settings for dynamic trails
    this.settings = {
      waterRipple: {
        scale: 5.0,
        strength: 4.5,
        viscosity: 0.25,
        decay: 0.75,
        chromaticDisp: 0.5,
        intensity: 4.5,
        speed: 0.75,
        momentum: 8.0,
        amplitudeVariation: { min: 0.5, max: 2.0 },
        frequencyVariation: { min: 0.7, max: 1.8 }
      },
      mouseDraw: {
        radius: 0.55,
        strength: 0.85,
        turbulence: 0.65,
        tint: '#0082F7',
        colorMix: 0.5,
        bloom: 0.45,
        tail: 0.8,
        distortion: 0.15,
        blendMode: 'screen',
        fadeSpeed: this.baseFadeSpeed,
        minOpacity: 0.08,
        maxOpacity: 0.95,
        organicMovement: 0.3,
        edgeSoftness: 1.8
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
    // Mouse movement with enhanced interpolation
    document.addEventListener('mousemove', (e) => {
      this.updateMousePosition(e.clientX, e.clientY);
      this.createEnhancedTrail();
      this.createAdvancedTurbulence();
    });
    
    // Click for enhanced ripples
    document.addEventListener('click', (e) => {
      this.createDynamicRipple(e.clientX, e.clientY, true);
    });
    
    // Enhanced ripple creation with variations
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - this.lastRippleTime > this.rippleDelay) {
        const velocity = this.getMouseVelocity();
        if (velocity > 2.5) {
          this.createDynamicRipple(e.clientX, e.clientY, false);
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
    
    // Enhanced mouse history for better interpolation
    this.mouseHistory.push({ 
      x, y, 
      time: Date.now(),
      velocity: this.getMouseVelocity()
    });
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
    const dt = Math.max(recent.time - previous.time, 1);
    
    return Math.sqrt(dx * dx + dy * dy) / dt;
  }
  
  // Simple Perlin-like noise function
  noise(x, y, z = 0) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const Z = Math.floor(z) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    z -= Math.floor(z);
    
    const u = this.fade(x);
    const v = this.fade(y);
    const w = this.fade(z);
    
    const A = this.p[X] + Y;
    const AA = this.p[A] + Z;
    const AB = this.p[A + 1] + Z;
    const B = this.p[X + 1] + Y;
    const BA = this.p[B] + Z;
    const BB = this.p[B + 1] + Z;
    
    return this.lerp(w, 
      this.lerp(v, 
        this.lerp(u, this.grad(this.p[AA], x, y, z), this.grad(this.p[BA], x - 1, y, z)),
        this.lerp(u, this.grad(this.p[AB], x, y - 1, z), this.grad(this.p[BB], x - 1, y - 1, z))
      ),
      this.lerp(v,
        this.lerp(u, this.grad(this.p[AA + 1], x, y, z - 1), this.grad(this.p[BA + 1], x - 1, y, z - 1)),
        this.lerp(u, this.grad(this.p[AB + 1], x, y - 1, z - 1), this.grad(this.p[BB + 1], x - 1, y - 1, z - 1))
      )
    );
  }
  
  fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  lerp(t, a, b) { return a + t * (b - a); }
  grad(hash, x, y, z) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  // Initialize permutation table for noise
  get p() {
    if (!this._p) {
      this._p = [];
      const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
      for (let i = 0; i < 256; i++) {
        this._p[256 + i] = this._p[i] = permutation[i];
      }
    }
    return this._p;
  }
  
  createEnhancedTrail() {
    const distance = Math.sqrt(
      Math.pow(this.mouseX - this.lastMouseX, 2) + 
      Math.pow(this.mouseY - this.lastMouseY, 2)
    );
    
    this.lastParticleDistance += distance;
    
    // Create particles with randomized dispersion
    while (this.lastParticleDistance >= this.particleSpacing) {
      const progress = (this.lastParticleDistance - this.particleSpacing) / distance;
      const interpolatedX = this.lastMouseX + (this.mouseX - this.lastMouseX) * (1 - progress);
      const interpolatedY = this.lastMouseY + (this.mouseY - this.lastMouseY) * (1 - progress);
      
      // Add randomized dispersion while maintaining flow direction
      const dispersionAngle = Math.atan2(this.mouseY - this.lastMouseY, this.mouseX - this.lastMouseX) + 
                             (Math.random() - 0.5) * 0.4; // ±0.2 radians variation
      const dispersionDistance = (Math.random() - 0.5) * 8;
      
      const finalX = interpolatedX + Math.cos(dispersionAngle) * dispersionDistance;
      const finalY = interpolatedY + Math.sin(dispersionAngle) * dispersionDistance;
      
      this.createAdvancedTrailParticle(finalX, finalY);
      this.lastParticleDistance -= this.particleSpacing;
    }
  }
  
  createAdvancedTrailParticle(x, y) {
    const velocity = this.getMouseVelocity();
    const baseSize = 5 + Math.min(velocity * 0.6, 10);
    
    // Random fade variation
    const fadeVariation = this.fadeVariationRange.min + 
                         Math.random() * (this.fadeVariationRange.max - this.fadeVariationRange.min);
    
    const particle = {
      x,
      y,
      originalX: x,
      originalY: y,
      vx: (this.mouseX - this.lastMouseX) * 0.04,
      vy: (this.mouseY - this.lastMouseY) * 0.04,
      life: 1.0,
      maxLife: 1200 + Math.random() * 1500,
      size: baseSize,
      originalSize: baseSize,
      color: this.settings.mouseDraw.tint,
      startTime: Date.now(),
      opacity: this.settings.mouseDraw.maxOpacity,
      fadeRate: fadeVariation,
      noiseOffsetX: Math.random() * 1000,
      noiseOffsetY: Math.random() * 1000,
      jitterPhase: Math.random() * Math.PI * 2,
      organicOffset: Math.random() * 100
    };
    
    this.trailParticles.push(particle);
    
    // Maintain particle count
    if (this.trailParticles.length > this.maxTrailParticles) {
      this.trailParticles.shift();
    }
  }
  
  createAdvancedTurbulence() {
    const velocity = this.getMouseVelocity();
    
    // Enhanced turbulence with Perlin noise
    if (velocity > 6 && Math.random() < 0.4) {
      const particleCount = Math.min(Math.floor(velocity * this.settings.mouseDraw.turbulence * 0.08), 5);
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 12 + Math.random() * 35;
        
        // Add Perlin noise to turbulence direction
        const noiseValue = this.noise(
          this.mouseX * this.noiseScale + this.noiseOffset,
          this.mouseY * this.noiseScale + this.noiseOffset,
          Date.now() * 0.001
        );
        
        const turbulenceAngle = angle + noiseValue * this.turbulenceStrength;
        const dx = Math.cos(turbulenceAngle) * distance;
        const dy = Math.sin(turbulenceAngle) * distance;

        this.turbulenceParticles.push({
          x: this.mouseX + (Math.random() - 0.5) * 15,
          y: this.mouseY + (Math.random() - 0.5) * 15,
          dx,
          dy,
          size: 1.5 + Math.random() * 5,
          lifetime: 600 + Math.random() * 1400,
          startTime: Date.now(),
          opacity: 0.4 + Math.random() * 0.4,
          noiseOffset: Math.random() * 1000,
          spiralPhase: Math.random() * Math.PI * 2
        });
      }
    }
    
    // Limit turbulence particles
    if (this.turbulenceParticles.length > 40) {
      this.turbulenceParticles.splice(0, this.turbulenceParticles.length - 40);
    }
  }
  
  createDynamicRipple(x, y, isClick = false) {
    if (!isClick && Math.random() > 0.6) return;
    
    const ripple = document.createElement('div');
    ripple.className = 'water-ripple';
    
    // Variable amplitude and frequency
    const amplitudeVar = this.settings.waterRipple.amplitudeVariation.min + 
                        Math.random() * (this.settings.waterRipple.amplitudeVariation.max - 
                        this.settings.waterRipple.amplitudeVariation.min);
    
    const frequencyVar = this.settings.waterRipple.frequencyVariation.min + 
                        Math.random() * (this.settings.waterRipple.frequencyVariation.max - 
                        this.settings.waterRipple.frequencyVariation.min);
    
    const baseSize = isClick ? 450 : 280;
    const size = baseSize * this.settings.waterRipple.scale * 0.1 * amplitudeVar;
    const duration = (1200 + Math.random() * 1000) * this.settings.waterRipple.decay * frequencyVar;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.setProperty('--size', size + 'px');
    ripple.style.setProperty('--duration', duration + 'ms');
    
    // Add random rotation for organic feel
    ripple.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
    
    this.rippleContainer.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
    
    // Enhanced canvas ripple
    this.createEnhancedCanvasRipple(x, y, size * 0.4, duration, isClick, amplitudeVar);
  }
  
  createEnhancedCanvasRipple(x, y, maxSize, duration, isClick, amplitude) {
    const ripple = {
      x,
      y,
      radius: 0,
      maxRadius: maxSize,
      opacity: (isClick ? 0.5 : 0.25) * amplitude,
      startTime: Date.now(),
      duration,
      color: this.settings.mouseDraw.tint,
      strength: this.settings.waterRipple.strength * 0.08 * amplitude,
      frequency: 0.7 + Math.random() * 1.1,
      phase: Math.random() * Math.PI * 2
    };
    
    this.ripples.push(ripple);
  }
  
  updateTrailParticles() {
    const now = Date.now();
    this.noiseOffset += 0.01;
    
    this.trailParticles = this.trailParticles.filter(particle => {
      const age = now - particle.startTime;
      const lifeProgress = age / particle.maxLife;
      
      if (lifeProgress >= 1) return false;
      
      // Dynamic fade with random variations
      const fadeProgress = lifeProgress * particle.fadeRate;
      particle.life = Math.pow(1 - Math.min(fadeProgress, 1), 1.8);
      particle.opacity = this.settings.mouseDraw.minOpacity + 
                        (this.settings.mouseDraw.maxOpacity - this.settings.mouseDraw.minOpacity) * particle.life;
      
      // Smooth size transition with slight randomization
      const sizeVariation = 0.9 + Math.sin(age * 0.005 + particle.jitterPhase) * 0.1;
      particle.size = particle.originalSize * (0.2 + particle.life * 0.8) * sizeVariation;
      
      // Add subtle turbulence using Perlin noise
      const noiseX = this.noise(
        particle.originalX * this.noiseScale + particle.noiseOffsetX,
        particle.originalY * this.noiseScale + particle.noiseOffsetY,
        this.noiseOffset
      );
      const noiseY = this.noise(
        particle.originalX * this.noiseScale + particle.noiseOffsetX + 100,
        particle.originalY * this.noiseScale + particle.noiseOffsetY + 100,
        this.noiseOffset
      );
      
      const turbulenceX = noiseX * this.settings.mouseDraw.organicMovement * particle.life;
      const turbulenceY = noiseY * this.settings.mouseDraw.organicMovement * particle.life;
      
      // Position jitter (±2-3 pixels)
      const jitterX = (Math.random() - 0.5) * (this.jitterRange.max - this.jitterRange.min) * particle.life;
      const jitterY = (Math.random() - 0.5) * (this.jitterRange.max - this.jitterRange.min) * particle.life;
      
      // Apply movement with micro-distortions
      particle.x += particle.vx * this.settings.waterRipple.momentum * 0.06 + turbulenceX + jitterX;
      particle.y += particle.vy * this.settings.waterRipple.momentum * 0.06 + turbulenceY + jitterY;
      
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
      
      // Add spiral motion with Perlin noise
      const noiseValue = this.noise(
        p.x * this.noiseScale + p.noiseOffset,
        p.y * this.noiseScale + p.noiseOffset,
        this.noiseOffset
      );
      
      const spiralRadius = progress * 20;
      const spiralAngle = p.spiralPhase + progress * Math.PI * 4 + noiseValue * 2;
      
      p.currentX = p.x + p.dx * progress * 0.7 + Math.cos(spiralAngle) * spiralRadius * 0.3;
      p.currentY = p.y + p.dy * progress * 0.7 + Math.sin(spiralAngle) * spiralRadius * 0.3;
      
      // Enhanced fade with variations
      p.alpha = p.opacity * Math.pow(1 - progress, 1.5) * (0.8 + Math.sin(progress * Math.PI * 3) * 0.2);
      p.currentSize = p.size * (1 - progress * 0.3);
      
      return true;
    });
  }
  
  updateRipples() {
    const now = Date.now();
    
    this.ripples = this.ripples.filter(ripple => {
      const age = now - ripple.startTime;
      const progress = age / ripple.duration;
      
      if (progress >= 1) return false;
      
      // Enhanced ripple with frequency variations
      const waveProgress = progress * ripple.frequency;
      ripple.radius = ripple.maxRadius * waveProgress;
      
      // Variable opacity with wave interference
      const waveIntensity = Math.sin(waveProgress * Math.PI * 2 + ripple.phase) * 0.3 + 0.7;
      ripple.opacity = (1 - progress) * ripple.strength * waveIntensity;
      
      return true;
    });
  }
  
  drawTrailParticles() {
    // Enhanced composite operation for fluid appearance
    this.trailCtx.globalCompositeOperation = 'screen';
    
    this.trailParticles.forEach((particle, index) => {
      const alpha = particle.opacity;
      const size = particle.size;
      
      // Soft-edged gradient with enhanced blending
      const gradient = this.trailCtx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, size * this.settings.mouseDraw.edgeSoftness
      );
      
      gradient.addColorStop(0, `rgba(0, 130, 247, ${alpha})`);
      gradient.addColorStop(0.3, `rgba(0, 130, 247, ${alpha * 0.8})`);
      gradient.addColorStop(0.6, `rgba(0, 130, 247, ${alpha * 0.4})`);
      gradient.addColorStop(0.85, `rgba(0, 130, 247, ${alpha * 0.1})`);
      gradient.addColorStop(1, `rgba(0, 130, 247, 0)`);
      
      this.trailCtx.fillStyle = gradient;
      this.trailCtx.beginPath();
      this.trailCtx.arc(particle.x, particle.y, size * this.settings.mouseDraw.edgeSoftness, 0, Math.PI * 2);
      this.trailCtx.fill();
      
      // Enhanced bloom for leading particles
      if (index > this.trailParticles.length - 15 && this.settings.mouseDraw.bloom > 0) {
        this.trailCtx.shadowColor = particle.color;
        this.trailCtx.shadowBlur = size * this.settings.mouseDraw.bloom * 3;
        this.trailCtx.globalAlpha = alpha * 0.4;
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
      if (p.alpha > 0.03) {
        // Enhanced turbulence with soft edges
        const gradient = this.trailCtx.createRadialGradient(
          p.currentX, p.currentY, 0,
          p.currentX, p.currentY, p.currentSize * 2.5
        );
        
        gradient.addColorStop(0, `rgba(0, 130, 247, ${p.alpha})`);
        gradient.addColorStop(0.4, `rgba(0, 130, 247, ${p.alpha * 0.6})`);
        gradient.addColorStop(0.8, `rgba(0, 130, 247, ${p.alpha * 0.2})`);
        gradient.addColorStop(1, `rgba(0, 130, 247, 0)`);
        
        this.trailCtx.fillStyle = gradient;
        this.trailCtx.beginPath();
        this.trailCtx.arc(p.currentX, p.currentY, p.currentSize * 2.5, 0, Math.PI * 2);
        this.trailCtx.fill();
      }
    });
    
    this.trailCtx.globalCompositeOperation = 'source-over';
  }
  
  drawRipples() {
    this.rippleCtx.globalCompositeOperation = 'screen';
    
    this.ripples.forEach(ripple => {
      if (ripple.opacity > 0.03) {
        // Enhanced ripple with variable thickness
        const gradient = this.rippleCtx.createRadialGradient(
          ripple.x, ripple.y, ripple.radius * 0.85,
          ripple.x, ripple.y, ripple.radius
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.7, `rgba(0, 130, 247, ${ripple.opacity * 0.4})`);
        gradient.addColorStop(0.9, `rgba(255, 255, 255, ${ripple.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(0, 130, 247, ${ripple.opacity * 0.3})`);
        
        this.rippleCtx.strokeStyle = gradient;
        this.rippleCtx.lineWidth = 1.5 + Math.sin(ripple.phase) * 0.5;
        this.rippleCtx.beginPath();
        this.rippleCtx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        this.rippleCtx.stroke();
      }
    });
    
    this.rippleCtx.globalCompositeOperation = 'source-over';
  }
  
  animate() {
    // Dynamic fade with slight variations
    const currentFadeSpeed = this.baseFadeSpeed * (0.9 + Math.sin(Date.now() * 0.001) * 0.1);
    
    this.trailCtx.globalCompositeOperation = 'source-over';
    this.trailCtx.fillStyle = `rgba(0, 0, 0, ${currentFadeSpeed})`;
    this.trailCtx.fillRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
    
    // Clear ripple canvas
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

// Enhanced custom cursor with organic movement
let cursorTimeout;
document.addEventListener('mousemove', (e) => {
  clearTimeout(cursorTimeout);
  
  const cursor = document.createElement('div');
  cursor.style.cssText = `
    position: fixed;
    left: ${e.clientX}px;
    top: ${e.clientY}px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 130, 247, 0.8), rgba(0, 130, 247, 0.3) 60%, transparent 80%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    animation: enhancedCursorFade 1s ease-out forwards;
    filter: blur(0.5px);
  `;
  
  document.body.appendChild(cursor);
  
  cursorTimeout = setTimeout(() => {
    if (cursor.parentNode) {
      cursor.parentNode.removeChild(cursor);
    }
  }, 1000);
});

// Enhanced cursor animation
const style = document.createElement('style');
style.textContent = `
  @keyframes enhancedCursorFade {
    0% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(0.6);
      filter: blur(0px);
    }
    30% {
      opacity: 0.7;
      transform: translate(-50%, -50%) scale(1);
      filter: blur(0.5px);
    }
    70% {
      opacity: 0.4;
      transform: translate(-50%, -50%) scale(1.2);
      filter: blur(1px);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.5);
      filter: blur(1.5px);
    }
  }
`;
document.head.appendChild(style);