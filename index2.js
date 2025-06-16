class TooDamnTragicEffects {
  constructor() {
    this.rippleCanvas = document.getElementById('rippleCanvas');
    this.trailCanvas = document.getElementById('trailCanvas');
    this.rippleContainer = document.getElementById('rippleContainer');
    this.textContainer = document.querySelector('.text-container');
    
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
    
    // Enhanced trail particles with 50% increased density
    this.trailParticles = [];
    this.turbulenceParticles = [];
    this.maxTrailParticles = 180; // Increased from 120 (50% increase)
    this.particleSpacing = 4; // Reduced from 6 for higher density
    this.lastParticleDistance = 0;
    
    // Perlin noise for organic movement
    this.noiseOffset = 0;
    this.noiseScale = 0.005;
    this.turbulenceStrength = 2.5;
    
    // Enhanced ripple effects with text distortion
    this.ripples = [];
    this.lastRippleTime = 0;
    this.rippleDelay = 100; // Slightly faster ripple generation
    this.activeRipples = []; // Track ripples for text distortion
    
    // Dynamic fade variations with faster turbulence fade
    this.baseFadeSpeed = 0.018; // Slightly faster base fade
    this.turbulenceFadeSpeed = 0.035; // Much faster turbulence fade
    this.fadeVariationRange = { min: 0.8, max: 1.2 };
    
    // Position jitter settings
    this.jitterRange = { min: -2.5, max: 2.5 };
    
    // Enhanced settings for dynamic trails
    this.settings = {
      waterRipple: {
        scale: 5.5, // Increased scale
        strength: 5.0, // Increased strength
        viscosity: 0.22, // Slightly reduced for more fluid motion
        decay: 0.8, // Increased decay for longer-lasting effects
        chromaticDisp: 0.6, // Enhanced chromatic dispersion
        intensity: 5.0, // Increased intensity
        speed: 0.8, // Slightly faster
        momentum: 9.0, // Increased momentum
        amplitudeVariation: { min: 0.6, max: 2.2 }, // Enhanced variation
        frequencyVariation: { min: 0.8, max: 2.0 }, // Enhanced variation
        turbulenceDuration: 4000, // Doubled from 2000ms
        textDistortionRange: 150 // Distance for text distortion
      },
      mouseDraw: {
        radius: 0.6, // Slightly increased
        strength: 0.9, // Increased strength
        turbulence: 0.7, // Enhanced turbulence
        tint: '#0082F7',
        colorMix: 0.55, // Enhanced color mixing
        bloom: 0.5, // Enhanced bloom
        tail: 0.85, // Longer tail
        distortion: 0.18, // Enhanced distortion
        blendMode: 'screen',
        fadeSpeed: this.baseFadeSpeed,
        minOpacity: 0.1, // Slightly higher minimum
        maxOpacity: 0.98, // Higher maximum
        organicMovement: 0.35, // Enhanced organic movement
        edgeSoftness: 2.0 // Increased edge softness
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
      this.updateTextDistortion(e.clientX, e.clientY);
    });
    
    // Click for enhanced ripples
    document.addEventListener('click', (e) => {
      this.createRemadeRipple(e.clientX, e.clientY, true);
    });
    
    // Enhanced ripple creation with variations
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - this.lastRippleTime > this.rippleDelay) {
        const velocity = this.getMouseVelocity();
        if (velocity > 2.0) { // Slightly lower threshold
          this.createRemadeRipple(e.clientX, e.clientY, false);
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
  
  // Text distortion based on nearby ripples
  updateTextDistortion(mouseX, mouseY) {
    if (!this.textContainer) return;
    
    const textRect = this.textContainer.getBoundingClientRect();
    const textCenterX = textRect.left + textRect.width / 2;
    const textCenterY = textRect.top + textRect.height / 2;
    
    // Calculate distance from mouse to text center
    const distance = Math.sqrt(
      Math.pow(mouseX - textCenterX, 2) + 
      Math.pow(mouseY - textCenterY, 2)
    );
    
    // Apply distortion based on distance and active ripples
    const maxDistance = this.settings.waterRipple.textDistortionRange;
    let distortionIntensity = 0;
    
    if (distance < maxDistance) {
      distortionIntensity = 1 - (distance / maxDistance);
    }
    
    // Check for active ripples near text
    this.activeRipples.forEach(ripple => {
      const rippleDistance = Math.sqrt(
        Math.pow(ripple.x - textCenterX, 2) + 
        Math.pow(ripple.y - textCenterY, 2)
      );
      
      if (rippleDistance < ripple.currentRadius + 100) {
        const rippleIntensity = (1 - ripple.progress) * 0.5;
        distortionIntensity = Math.max(distortionIntensity, rippleIntensity);
      }
    });
    
    // Apply distortion classes
    this.textContainer.classList.remove('text-distort-light', 'text-distort-medium', 'text-distort-heavy');
    
    if (distortionIntensity > 0.7) {
      this.textContainer.classList.add('text-distort-heavy');
    } else if (distortionIntensity > 0.4) {
      this.textContainer.classList.add('text-distort-medium');
    } else if (distortionIntensity > 0.1) {
      this.textContainer.classList.add('text-distort-light');
    }
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
    
    // Create particles with higher density and randomized dispersion
    while (this.lastParticleDistance >= this.particleSpacing) {
      const progress = (this.lastParticleDistance - this.particleSpacing) / distance;
      const interpolatedX = this.lastMouseX + (this.mouseX - this.lastMouseX) * (1 - progress);
      const interpolatedY = this.lastMouseY + (this.mouseY - this.lastMouseY) * (1 - progress);
      
      // Enhanced randomized dispersion while maintaining flow direction
      const dispersionAngle = Math.atan2(this.mouseY - this.lastMouseY, this.mouseX - this.lastMouseX) + 
                             (Math.random() - 0.5) * 0.3; // Slightly reduced for better coherence
      const dispersionDistance = (Math.random() - 0.5) * 6; // Reduced for higher density
      
      const finalX = interpolatedX + Math.cos(dispersionAngle) * dispersionDistance;
      const finalY = interpolatedY + Math.sin(dispersionAngle) * dispersionDistance;
      
      this.createAdvancedTrailParticle(finalX, finalY);
      this.lastParticleDistance -= this.particleSpacing;
    }
  }
  
  createAdvancedTrailParticle(x, y) {
    const velocity = this.getMouseVelocity();
    const baseSize = 4.5 + Math.min(velocity * 0.7, 12); // Slightly larger particles
    
    // Random fade variation
    const fadeVariation = this.fadeVariationRange.min + 
                         Math.random() * (this.fadeVariationRange.max - this.fadeVariationRange.min);
    
    const particle = {
      x,
      y,
      originalX: x,
      originalY: y,
      vx: (this.mouseX - this.lastMouseX) * 0.045,
      vy: (this.mouseY - this.lastMouseY) * 0.045,
      life: 1.0,
      maxLife: 1400 + Math.random() * 1800, // Longer life for better trails
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
    
    // Maintain particle count with increased limit
    if (this.trailParticles.length > this.maxTrailParticles) {
      this.trailParticles.shift();
    }
  }
  
  createAdvancedTurbulence() {
    const velocity = this.getMouseVelocity();
    
    // Enhanced turbulence with Perlin noise and increased generation
    if (velocity > 5 && Math.random() < 0.5) { // Increased probability
      const particleCount = Math.min(Math.floor(velocity * this.settings.mouseDraw.turbulence * 0.1), 7); // More particles
      
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = 15 + Math.random() * 40; // Increased range
        
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
          x: this.mouseX + (Math.random() - 0.5) * 18,
          y: this.mouseY + (Math.random() - 0.5) * 18,
          dx,
          dy,
          size: 2 + Math.random() * 6, // Slightly larger
          lifetime: this.settings.waterRipple.turbulenceDuration + Math.random() * 1000, // Doubled duration
          startTime: Date.now(),
          opacity: 0.5 + Math.random() * 0.4, // Higher opacity
          noiseOffset: Math.random() * 1000,
          spiralPhase: Math.random() * Math.PI * 2,
          fastFade: false // Flag for normal vs fast fade
        });
      }
    }
    
    // Limit turbulence particles with higher count
    if (this.turbulenceParticles.length > 60) { // Increased from 40
      this.turbulenceParticles.splice(0, this.turbulenceParticles.length - 60);
    }
  }
  
  // Completely remade ripple system
  createRemadeRipple(x, y, isClick = false) {
    if (!isClick && Math.random() > 0.5) return; // Increased probability
    
    const velocity = this.getMouseVelocity();
    const intensityMultiplier = isClick ? 1.5 : (0.8 + velocity * 0.1);
    
    // Create multiple ripple types for enhanced effect
    this.createPrimaryRipple(x, y, intensityMultiplier);
    this.createSecondaryRipple(x, y, intensityMultiplier);
    this.createChromaticRipple(x, y, intensityMultiplier);
    
    // Create turbulence glow with doubled duration
    if (isClick || velocity > 4) {
      this.createTurbulenceGlow(x, y, intensityMultiplier);
    }
    
    // Enhanced canvas ripple
    this.createEnhancedCanvasRipple(x, y, intensityMultiplier, isClick);
  }
  
  createPrimaryRipple(x, y, intensity) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-primary';
    
    const baseSize = 400 * intensity;
    const duration = (2000 + Math.random() * 1000) * this.settings.waterRipple.decay;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.setProperty('--size', baseSize + 'px');
    ripple.style.setProperty('--duration', duration + 'ms');
    
    this.rippleContainer.appendChild(ripple);
    
    // Track for text distortion
    this.activeRipples.push({
      x, y, 
      maxRadius: baseSize / 2,
      currentRadius: 0,
      startTime: Date.now(),
      duration,
      progress: 0
    });
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
  }
  
  createSecondaryRipple(x, y, intensity) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-secondary';
    
    const baseSize = 350 * intensity;
    const duration = (2500 + Math.random() * 800) * this.settings.waterRipple.decay;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.setProperty('--size', baseSize + 'px');
    ripple.style.setProperty('--duration', duration + 'ms');
    
    this.rippleContainer.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
  }
  
  createChromaticRipple(x, y, intensity) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-chromatic';
    
    const baseSize = 300 * intensity;
    const duration = (3000 + Math.random() * 1200) * this.settings.waterRipple.decay;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.setProperty('--size', baseSize + 'px');
    ripple.style.setProperty('--duration', duration + 'ms');
    
    this.rippleContainer.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
  }
  
  createTurbulenceGlow(x, y, intensity) {
    const glow = document.createElement('div');
    glow.className = 'turbulence-glow';
    
    const baseSize = 500 * intensity;
    const duration = this.settings.waterRipple.turbulenceDuration + Math.random() * 1000; // Doubled duration
    
    glow.style.left = x + 'px';
    glow.style.top = y + 'px';
    glow.style.setProperty('--size', baseSize + 'px');
    glow.style.setProperty('--duration', duration + 'ms');
    
    this.rippleContainer.appendChild(glow);
    
    setTimeout(() => {
      if (glow.parentNode) {
        glow.parentNode.removeChild(glow);
      }
    }, duration);
  }
  
  createEnhancedCanvasRipple(x, y, intensity, isClick) {
    const ripple = {
      x,
      y,
      radius: 0,
      maxRadius: (isClick ? 200 : 150) * intensity,
      opacity: (isClick ? 0.6 : 0.35) * intensity,
      startTime: Date.now(),
      duration: (1800 + Math.random() * 1000) * this.settings.waterRipple.decay,
      color: this.settings.mouseDraw.tint,
      strength: this.settings.waterRipple.strength * 0.1 * intensity,
      frequency: 0.8 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      type: isClick ? 'click' : 'move'
    };
    
    this.ripples.push(ripple);
  }
  
  updateTrailParticles() {
    const now = Date.now();
    this.noiseOffset += 0.012; // Slightly faster noise evolution
    
    this.trailParticles = this.trailParticles.filter(particle => {
      const age = now - particle.startTime;
      const lifeProgress = age / particle.maxLife;
      
      if (lifeProgress >= 1) return false;
      
      // Dynamic fade with random variations
      const fadeProgress = lifeProgress * particle.fadeRate;
      particle.life = Math.pow(1 - Math.min(fadeProgress, 1), 1.6); // Slightly faster fade curve
      particle.opacity = this.settings.mouseDraw.minOpacity + 
                        (this.settings.mouseDraw.maxOpacity - this.settings.mouseDraw.minOpacity) * particle.life;
      
      // Smooth size transition with slight randomization
      const sizeVariation = 0.85 + Math.sin(age * 0.006 + particle.jitterPhase) * 0.15; // Enhanced variation
      particle.size = particle.originalSize * (0.25 + particle.life * 0.75) * sizeVariation;
      
      // Add enhanced turbulence using Perlin noise
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
      
      // Enhanced position jitter
      const jitterX = (Math.random() - 0.5) * (this.jitterRange.max - this.jitterRange.min) * particle.life * 1.2;
      const jitterY = (Math.random() - 0.5) * (this.jitterRange.max - this.jitterRange.min) * particle.life * 1.2;
      
      // Apply movement with enhanced micro-distortions
      particle.x += particle.vx * this.settings.waterRipple.momentum * 0.07 + turbulenceX + jitterX;
      particle.y += particle.vy * this.settings.waterRipple.momentum * 0.07 + turbulenceY + jitterY;
      
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
      
      // Add enhanced spiral motion with Perlin noise
      const noiseValue = this.noise(
        p.x * this.noiseScale + p.noiseOffset,
        p.y * this.noiseScale + p.noiseOffset,
        this.noiseOffset
      );
      
      const spiralRadius = progress * 25; // Increased spiral radius
      const spiralAngle = p.spiralPhase + progress * Math.PI * 5 + noiseValue * 2.5; // Enhanced spiral
      
      p.currentX = p.x + p.dx * progress * 0.8 + Math.cos(spiralAngle) * spiralRadius * 0.4;
      p.currentY = p.y + p.dy * progress * 0.8 + Math.sin(spiralAngle) * spiralRadius * 0.4;
      
      // Faster fade-out for turbulence glow as requested
      const fadeRate = p.fastFade ? this.turbulenceFadeSpeed : 1.8;
      p.alpha = p.opacity * Math.pow(1 - progress, fadeRate) * (0.7 + Math.sin(progress * Math.PI * 4) * 0.3);
      p.currentSize = p.size * (1.1 - progress * 0.4); // Slightly larger size variation
      
      return true;
    });
  }
  
  updateRipples() {
    const now = Date.now();
    
    // Update active ripples for text distortion
    this.activeRipples = this.activeRipples.filter(ripple => {
      const age = now - ripple.startTime;
      ripple.progress = age / ripple.duration;
      ripple.currentRadius = ripple.maxRadius * ripple.progress;
      
      return ripple.progress < 1;
    });
    
    this.ripples = this.ripples.filter(ripple => {
      const age = now - ripple.startTime;
      const progress = age / ripple.duration;
      
      if (progress >= 1) return false;
      
      // Enhanced ripple with frequency variations
      const waveProgress = progress * ripple.frequency;
      ripple.radius = ripple.maxRadius * waveProgress;
      
      // Enhanced variable opacity with wave interference
      const waveIntensity = Math.sin(waveProgress * Math.PI * 3 + ripple.phase) * 0.4 + 0.6;
      const typeMultiplier = ripple.type === 'click' ? 1.2 : 1.0;
      ripple.opacity = (1 - progress) * ripple.strength * waveIntensity * typeMultiplier;
      
      return true;
    });
  }
  
  drawTrailParticles() {
    // Enhanced composite operation for fluid appearance
    this.trailCtx.globalCompositeOperation = 'screen';
    
    this.trailParticles.forEach((particle, index) => {
      const alpha = particle.opacity;
      const size = particle.size;
      
      // Enhanced soft-edged gradient with improved blending
      const gradient = this.trailCtx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, size * this.settings.mouseDraw.edgeSoftness
      );
      
      gradient.addColorStop(0, `rgba(0, 130, 247, ${alpha})`);
      gradient.addColorStop(0.25, `rgba(0, 130, 247, ${alpha * 0.9})`);
      gradient.addColorStop(0.5, `rgba(0, 130, 247, ${alpha * 0.6})`);
      gradient.addColorStop(0.75, `rgba(0, 130, 247, ${alpha * 0.3})`);
      gradient.addColorStop(0.9, `rgba(0, 130, 247, ${alpha * 0.1})`);
      gradient.addColorStop(1, `rgba(0, 130, 247, 0)`);
      
      this.trailCtx.fillStyle = gradient;
      this.trailCtx.beginPath();
      this.trailCtx.arc(particle.x, particle.y, size * this.settings.mouseDraw.edgeSoftness, 0, Math.PI * 2);
      this.trailCtx.fill();
      
      // Enhanced bloom for leading particles
      if (index > this.trailParticles.length - 20 && this.settings.mouseDraw.bloom > 0) { // More particles get bloom
        this.trailCtx.shadowColor = particle.color;
        this.trailCtx.shadowBlur = size * this.settings.mouseDraw.bloom * 3.5; // Enhanced bloom
        this.trailCtx.globalAlpha = alpha * 0.5; // Stronger bloom
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
      if (p.alpha > 0.02) { // Lower threshold for more visible particles
        // Enhanced turbulence with softer edges
        const gradient = this.trailCtx.createRadialGradient(
          p.currentX, p.currentY, 0,
          p.currentX, p.currentY, p.currentSize * 3 // Larger gradient
        );
        
        gradient.addColorStop(0, `rgba(0, 130, 247, ${p.alpha})`);
        gradient.addColorStop(0.3, `rgba(0, 130, 247, ${p.alpha * 0.7})`);
        gradient.addColorStop(0.6, `rgba(0, 130, 247, ${p.alpha * 0.4})`);
        gradient.addColorStop(0.85, `rgba(0, 130, 247, ${p.alpha * 0.15})`);
        gradient.addColorStop(1, `rgba(0, 130, 247, 0)`);
        
        this.trailCtx.fillStyle = gradient;
        this.trailCtx.beginPath();
        this.trailCtx.arc(p.currentX, p.currentY, p.currentSize * 3, 0, Math.PI * 2);
        this.trailCtx.fill();
      }
    });
    
    this.trailCtx.globalCompositeOperation = 'source-over';
  }
  
  drawRipples() {
    this.rippleCtx.globalCompositeOperation = 'screen';
    
    this.ripples.forEach(ripple => {
      if (ripple.opacity > 0.02) {
        // Enhanced ripple with variable thickness and improved gradients
        const gradient = this.rippleCtx.createRadialGradient(
          ripple.x, ripple.y, ripple.radius * 0.8,
          ripple.x, ripple.y, ripple.radius
        );
        
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.6, `rgba(0, 130, 247, ${ripple.opacity * 0.5})`);
        gradient.addColorStop(0.8, `rgba(255, 255, 255, ${ripple.opacity * 0.8})`);
        gradient.addColorStop(0.95, `rgba(0, 130, 247, ${ripple.opacity * 0.4})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${ripple.opacity * 0.2})`);
        
        this.rippleCtx.strokeStyle = gradient;
        this.rippleCtx.lineWidth = 2 + Math.sin(ripple.phase) * 0.8; // Enhanced line width variation
        this.rippleCtx.beginPath();
        this.rippleCtx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        this.rippleCtx.stroke();
      }
    });
    
    this.rippleCtx.globalCompositeOperation = 'source-over';
  }
  
  animate() {
    // Enhanced dynamic fade with variations
    const currentFadeSpeed = this.baseFadeSpeed * (0.85 + Math.sin(Date.now() * 0.0008) * 0.15);
    
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
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 130, 247, 0.9), rgba(0, 130, 247, 0.4) 60%, transparent 80%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    animation: enhancedCursorFade 1.2s ease-out forwards;
    filter: blur(0.3px);
    box-shadow: 0 0 8px rgba(0, 130, 247, 0.4);
  `;
  
  document.body.appendChild(cursor);
  
  cursorTimeout = setTimeout(() => {
    if (cursor.parentNode) {
      cursor.parentNode.removeChild(cursor);
    }
  }, 1200);
});

// Enhanced cursor animation
const style = document.createElement('style');
style.textContent = `
  @keyframes enhancedCursorFade {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(0.5);
      filter: blur(0px);
    }
    25% {
      opacity: 0.8;
      transform: translate(-50%, -50%) scale(1);
      filter: blur(0.3px);
    }
    50% {
      opacity: 0.6;
      transform: translate(-50%, -50%) scale(1.1);
      filter: blur(0.6px);
    }
    75% {
      opacity: 0.3;
      transform: translate(-50%, -50%) scale(1.3);
      filter: blur(1px);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.6);
      filter: blur(1.5px);
    }
  }
`;
document.head.appendChild(style);