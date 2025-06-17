class FullScreenWaterSurface {
  constructor() {
    this.waterCanvas = document.getElementById('waterSurface');
    this.trailCanvas = document.getElementById('trailCanvas');
    this.distortionLayer = document.getElementById('distortionLayer');
    this.glueLayer = document.getElementById('glueLayer');
    this.textContainer = document.querySelector('.text-container');
    this.container = document.querySelector('.container');
    
    this.waterCtx = this.waterCanvas.getContext('2d');
    this.trailCtx = this.trailCanvas.getContext('2d');
    
    // Enable high-quality rendering
    this.waterCtx.imageSmoothingEnabled = true;
    this.waterCtx.imageSmoothingQuality = 'high';
    this.trailCtx.imageSmoothingEnabled = true;
    this.trailCtx.imageSmoothingQuality = 'high';
    
    // Water physics grid
    this.gridWidth = Math.ceil(window.innerWidth / 8);
    this.gridHeight = Math.ceil(window.innerHeight / 8);
    this.cellSize = 8;
    
    // Water surface height map
    this.heightMap = [];
    this.velocityMap = [];
    this.previousHeightMap = [];
    
    // Initialize water surface
    this.initializeWaterSurface();
    
    // Mouse tracking
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.mouseVelocity = 0;
    this.mouseHistory = [];
    
    // Trail particles
    this.trailParticles = [];
    this.maxTrailParticles = 200;
    this.particleSpacing = 3;
    this.lastParticleDistance = 0;
    
    // Water ripples
    this.waterRipples = [];
    this.activeDistortions = [];
    this.lastRippleTime = 0;
    this.rippleDelay = 80;
    
    // Glue system
    this.glueStrands = [];
    this.glueDroplets = [];
    this.glueAdhesionPoints = [];
    this.activeGlueConnections = [];
    this.lastGlueTime = 0;
    this.glueDelay = 150;
    this.maxGlueDistance = 80;
    this.glueViscosity = 0.95;
    
    // Physics constants
    this.waterPhysics = {
      damping: 0.985,
      tension: 0.025,
      propagation: 0.5,
      viscosity: 0.98,
      amplitude: 15,
      frequency: 0.8,
      decay: 0.92,
      surfaceTension: 0.15,
      waveSpeed: 1.2,
      distortionRadius: 120,
      maxDistortion: 8
    };
    
    // Glue physics
    this.gluePhysics = {
      adhesionStrength: 0.8,
      surfaceTension: 0.6,
      viscosity: 0.95,
      elasticity: 0.3,
      breakingPoint: 120,
      formationTime: 800,
      maxOpacity: 0.6,
      minStrandWidth: 2,
      maxStrandWidth: 8
    };
    
    // Noise for organic movement
    this.noiseOffset = 0;
    this.noiseScale = 0.003;
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.setupEventListeners();
    this.createCausticPatterns();
    this.startAnimation();
  }
  
  setupCanvas() {
    const resizeCanvas = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      this.waterCanvas.width = width;
      this.waterCanvas.height = height;
      this.trailCanvas.width = width;
      this.trailCanvas.height = height;
      
      this.gridWidth = Math.ceil(width / this.cellSize);
      this.gridHeight = Math.ceil(height / this.cellSize);
      
      this.initializeWaterSurface();
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
  
  initializeWaterSurface() {
    this.heightMap = [];
    this.velocityMap = [];
    this.previousHeightMap = [];
    
    for (let y = 0; y < this.gridHeight; y++) {
      this.heightMap[y] = [];
      this.velocityMap[y] = [];
      this.previousHeightMap[y] = [];
      
      for (let x = 0; x < this.gridWidth; x++) {
        this.heightMap[y][x] = 0;
        this.velocityMap[y][x] = 0;
        this.previousHeightMap[y][x] = 0;
      }
    }
  }
  
  setupEventListeners() {
    // Mouse movement
    document.addEventListener('mousemove', (e) => {
      this.updateMousePosition(e.clientX, e.clientY);
      this.createWaterDisturbance(e.clientX, e.clientY, false);
      this.createTrailParticles();
      this.updateGlueSystem();
      this.updateGlobalDistortion();
    });
    
    // Click for major disturbance
    document.addEventListener('click', (e) => {
      this.createWaterDisturbance(e.clientX, e.clientY, true);
      this.createMajorRipple(e.clientX, e.clientY);
      this.createGlueAdhesion(e.clientX, e.clientY);
    });
    
    // Touch events for mobile
    document.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.updateMousePosition(touch.clientX, touch.clientY);
      this.createWaterDisturbance(touch.clientX, touch.clientY, false);
      this.updateGlueSystem();
    });
    
    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.createWaterDisturbance(touch.clientX, touch.clientY, true);
      this.createMajorRipple(touch.clientX, touch.clientY);
      this.createGlueAdhesion(touch.clientX, touch.clientY);
    });
  }
  
  updateMousePosition(x, y) {
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    this.mouseX = x;
    this.mouseY = y;
    
    // Calculate velocity
    const dx = x - this.lastMouseX;
    const dy = y - this.lastMouseY;
    this.mouseVelocity = Math.sqrt(dx * dx + dy * dy);
    
    // Update mouse history
    this.mouseHistory.push({ x, y, time: Date.now() });
    if (this.mouseHistory.length > 10) {
      this.mouseHistory.shift();
    }
  }
  
  updateGlueSystem() {
    const now = Date.now();
    
    // Only create glue if mouse is moving slowly (realistic adhesive behavior)
    if (this.mouseVelocity > 2 && this.mouseVelocity < 15 && now - this.lastGlueTime > this.glueDelay) {
      this.createGlueStrand();
      this.lastGlueTime = now;
    }
    
    // Update existing glue elements
    this.updateGlueStrands();
    this.updateGlueDroplets();
    this.updateGlueConnections();
  }
  
  createGlueStrand() {
    if (this.mouseHistory.length < 3) return;
    
    const recent = this.mouseHistory.slice(-3);
    const start = recent[0];
    const end = recent[recent.length - 1];
    
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + 
      Math.pow(end.y - start.y, 2)
    );
    
    if (distance < 10 || distance > this.maxGlueDistance) return;
    
    const strand = document.createElement('div');
    strand.className = 'glue-strand';
    
    // Calculate strand properties
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * 180 / Math.PI;
    const centerX = (start.x + end.x) / 2;
    const centerY = (start.y + end.y) / 2;
    
    // Realistic strand width based on velocity and distance
    const baseWidth = this.gluePhysics.minStrandWidth;
    const velocityFactor = Math.min(this.mouseVelocity * 0.3, 4);
    const distanceFactor = Math.max(1, distance * 0.05);
    const width = Math.min(baseWidth + velocityFactor, this.gluePhysics.maxStrandWidth);
    
    // Strand opacity based on formation conditions
    const opacity = Math.min(
      this.gluePhysics.maxOpacity * (1 - distance / this.maxGlueDistance),
      this.gluePhysics.maxOpacity
    );
    
    strand.style.left = centerX + 'px';
    strand.style.top = centerY + 'px';
    strand.style.width = width + 'px';
    strand.style.height = distance + 'px';
    strand.style.transform = `translate(-50%, -50%) rotate(${angle + 90}deg)`;
    strand.style.setProperty('--angle', angle + 'deg');
    strand.style.setProperty('--duration', this.gluePhysics.formationTime + 'ms');
    strand.style.setProperty('--final-opacity', opacity);
    
    // Add subtle sheen effect
    const sheen = document.createElement('div');
    sheen.className = 'glue-sheen';
    sheen.style.setProperty('--angle', (angle + 45) + 'deg');
    sheen.style.setProperty('--duration', (this.gluePhysics.formationTime * 2) + 'ms');
    strand.appendChild(sheen);
    
    this.glueLayer.appendChild(strand);
    
    // Track strand for physics
    this.glueStrands.push({
      element: strand,
      startX: start.x,
      startY: start.y,
      endX: end.x,
      endY: end.y,
      centerX,
      centerY,
      length: distance,
      width,
      angle,
      opacity,
      startTime: Date.now(),
      isStretching: false,
      stretchFactor: 1,
      life: 1
    });
    
    // Remove strand after natural lifetime
    setTimeout(() => {
      this.removeGlueStrand(strand);
    }, this.gluePhysics.formationTime + 3000 + Math.random() * 2000);
  }
  
  createGlueDroplet(x, y, size = null) {
    const droplet = document.createElement('div');
    droplet.className = 'glue-droplet';
    
    const dropletSize = size || (4 + Math.random() * 8);
    const opacity = Math.min(0.6, dropletSize * 0.08);
    const duration = 1000 + Math.random() * 1000;
    
    droplet.style.left = x + 'px';
    droplet.style.top = y + 'px';
    droplet.style.setProperty('--size', dropletSize + 'px');
    droplet.style.setProperty('--duration', duration + 'ms');
    droplet.style.setProperty('--final-opacity', opacity);
    
    this.glueLayer.appendChild(droplet);
    
    this.glueDroplets.push({
      element: droplet,
      x, y,
      size: dropletSize,
      opacity,
      startTime: Date.now(),
      duration,
      life: 1
    });
    
    // Remove droplet after lifetime
    setTimeout(() => {
      this.removeGlueDroplet(droplet);
    }, duration + 2000);
  }
  
  createGlueAdhesion(x, y) {
    const adhesion = document.createElement('div');
    adhesion.className = 'glue-adhesion';
    
    const size = 8 + Math.random() * 12;
    const opacity = 0.4 + Math.random() * 0.3;
    const duration = 1500 + Math.random() * 1000;
    
    adhesion.style.left = x + 'px';
    adhesion.style.top = y + 'px';
    adhesion.style.setProperty('--size', size + 'px');
    adhesion.style.setProperty('--duration', duration + 'ms');
    adhesion.style.setProperty('--final-opacity', opacity);
    
    // Add surface tension effect
    const surfaceTension = document.createElement('div');
    surfaceTension.className = 'glue-surface-tension';
    surfaceTension.style.width = (size * 3) + 'px';
    surfaceTension.style.height = (size * 3) + 'px';
    surfaceTension.style.left = x + 'px';
    surfaceTension.style.top = y + 'px';
    surfaceTension.style.setProperty('--duration', (duration * 1.5) + 'ms');
    
    this.glueLayer.appendChild(adhesion);
    this.glueLayer.appendChild(surfaceTension);
    
    this.glueAdhesionPoints.push({
      element: adhesion,
      surfaceTension,
      x, y,
      size,
      opacity,
      startTime: Date.now(),
      duration,
      life: 1
    });
    
    // Create small droplets around adhesion point
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const offsetX = x + (Math.random() - 0.5) * size * 2;
        const offsetY = y + (Math.random() - 0.5) * size * 2;
        this.createGlueDroplet(offsetX, offsetY, 3 + Math.random() * 4);
      }, i * 200);
    }
    
    // Remove adhesion after lifetime
    setTimeout(() => {
      this.removeGlueAdhesion(adhesion, surfaceTension);
    }, duration + 3000);
  }
  
  updateGlueStrands() {
    const now = Date.now();
    
    this.glueStrands = this.glueStrands.filter(strand => {
      const age = now - strand.startTime;
      const lifeProgress = age / (strand.duration || 5000);
      
      if (lifeProgress >= 1) {
        this.removeGlueStrand(strand.element);
        return false;
      }
      
      // Check if strand should stretch based on mouse proximity
      const distanceToMouse = Math.sqrt(
        Math.pow(this.mouseX - strand.centerX, 2) + 
        Math.pow(this.mouseY - strand.centerY, 2)
      );
      
      if (distanceToMouse < 50 && this.mouseVelocity > 8) {
        if (!strand.isStretching) {
          strand.isStretching = true;
          strand.element.style.animation = `glueStrandStretch 1s ease-out forwards`;
        }
        
        strand.stretchFactor = Math.min(1.5, strand.stretchFactor + 0.02);
        
        // Break strand if stretched too much
        if (strand.stretchFactor > 1.4) {
          strand.element.style.animation = `glueStrandBreak 0.8s ease-out forwards`;
          setTimeout(() => {
            this.removeGlueStrand(strand.element);
          }, 800);
          return false;
        }
      }
      
      return true;
    });
  }
  
  updateGlueDroplets() {
    const now = Date.now();
    
    this.glueDroplets = this.glueDroplets.filter(droplet => {
      const age = now - droplet.startTime;
      const lifeProgress = age / droplet.duration;
      
      if (lifeProgress >= 1) {
        this.removeGlueDroplet(droplet.element);
        return false;
      }
      
      droplet.life = 1 - lifeProgress;
      return true;
    });
  }
  
  updateGlueConnections() {
    // Create connections between nearby glue elements
    this.glueStrands.forEach((strand, i) => {
      this.glueDroplets.forEach(droplet => {
        const distance = Math.sqrt(
          Math.pow(droplet.x - strand.centerX, 2) + 
          Math.pow(droplet.y - strand.centerY, 2)
        );
        
        if (distance < 30 && Math.random() > 0.98) {
          // Create small connecting strand
          this.createGlueStrand();
        }
      });
    });
  }
  
  removeGlueStrand(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    this.glueStrands = this.glueStrands.filter(s => s.element !== element);
  }
  
  removeGlueDroplet(element) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    this.glueDroplets = this.glueDroplets.filter(d => d.element !== element);
  }
  
  removeGlueAdhesion(element, surfaceTension) {
    if (element && element.parentNode) {
      element.parentNode.removeChild(element);
    }
    if (surfaceTension && surfaceTension.parentNode) {
      surfaceTension.parentNode.removeChild(surfaceTension);
    }
    this.glueAdhesionPoints = this.glueAdhesionPoints.filter(a => a.element !== element);
  }
  
  createWaterDisturbance(x, y, isClick = false) {
    const gridX = Math.floor(x / this.cellSize);
    const gridY = Math.floor(y / this.cellSize);
    
    if (gridX < 0 || gridX >= this.gridWidth || gridY < 0 || gridY >= this.gridHeight) return;
    
    const intensity = isClick ? this.waterPhysics.amplitude * 2 : 
                     Math.min(this.mouseVelocity * 0.5, this.waterPhysics.amplitude);
    
    const radius = isClick ? 8 : Math.min(4 + this.mouseVelocity * 0.1, 6);
    
    // Apply disturbance in a circular pattern
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const targetX = gridX + dx;
        const targetY = gridY + dy;
        
        if (targetX >= 0 && targetX < this.gridWidth && 
            targetY >= 0 && targetY < this.gridHeight) {
          
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const falloff = 1 - (distance / radius);
            const disturbance = intensity * falloff * falloff;
            
            this.heightMap[targetY][targetX] += disturbance;
            this.velocityMap[targetY][targetX] += disturbance * 0.3;
          }
        }
      }
    }
    
    // Create visual ripples
    const now = Date.now();
    if (now - this.lastRippleTime > this.rippleDelay || isClick) {
      this.createVisualRipple(x, y, intensity, isClick);
      this.lastRippleTime = now;
    }
    
    // Track distortion for text effects
    this.activeDistortions.push({
      x, y,
      intensity: intensity * 0.1,
      radius: this.waterPhysics.distortionRadius,
      startTime: now,
      duration: isClick ? 3000 : 1500,
      isClick
    });
  }
  
  createVisualRipple(x, y, intensity, isClick) {
    // Primary water ripple
    const ripple = document.createElement('div');
    ripple.className = 'water-ripple';
    
    const size = (isClick ? 600 : 400) + intensity * 10;
    const duration = (isClick ? 4000 : 3000) + Math.random() * 1000;
    
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.setProperty('--size', size + 'px');
    ripple.style.setProperty('--duration', duration + 'ms');
    
    this.container.appendChild(ripple);
    
    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, duration);
    
    // Secondary wave
    setTimeout(() => {
      const wave = document.createElement('div');
      wave.className = 'water-wave';
      
      const waveSize = size * 0.8;
      const waveDuration = duration * 1.2;
      
      wave.style.left = x + 'px';
      wave.style.top = y + 'px';
      wave.style.setProperty('--size', waveSize + 'px');
      wave.style.setProperty('--duration', waveDuration + 'ms');
      
      this.container.appendChild(wave);
      
      setTimeout(() => {
        if (wave.parentNode) {
          wave.parentNode.removeChild(wave);
        }
      }, waveDuration);
    }, 200);
    
    // Water displacement
    if (isClick || intensity > 5) {
      setTimeout(() => {
        const displacement = document.createElement('div');
        displacement.className = 'water-displacement';
        
        const dispSize = size * 0.6;
        const dispDuration = duration * 0.8;
        
        displacement.style.left = x + 'px';
        displacement.style.top = y + 'px';
        displacement.style.setProperty('--size', dispSize + 'px');
        displacement.style.setProperty('--duration', dispDuration + 'ms');
        
        this.container.appendChild(displacement);
        
        setTimeout(() => {
          if (displacement.parentNode) {
            displacement.parentNode.removeChild(displacement);
          }
        }, dispDuration);
      }, 100);
    }
  }
  
  createMajorRipple(x, y) {
    // Create multiple concentric ripples for major disturbances
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createVisualRipple(
          x + (Math.random() - 0.5) * 20,
          y + (Math.random() - 0.5) * 20,
          this.waterPhysics.amplitude * (1 - i * 0.3),
          true
        );
      }, i * 300);
    }
  }
  
  createCausticPatterns() {
    const caustic = document.createElement('div');
    caustic.className = 'caustic-pattern';
    this.container.appendChild(caustic);
    
    // Create water reflection layer
    const reflection = document.createElement('div');
    reflection.className = 'water-reflection';
    this.container.appendChild(reflection);
    
    // Create glue layer
    this.glueLayer = document.createElement('div');
    this.glueLayer.id = 'glueLayer';
    this.container.appendChild(this.glueLayer);
    
    // Update reflection based on mouse position
    document.addEventListener('mousemove', (e) => {
      reflection.style.setProperty('--mx', (e.clientX / window.innerWidth * 100) + '%');
      reflection.style.setProperty('--my', (e.clientY / window.innerHeight * 100) + '%');
      reflection.style.opacity = Math.min(this.mouseVelocity * 0.02, 0.3);
    });
  }
  
  createTrailParticles() {
    const distance = Math.sqrt(
      Math.pow(this.mouseX - this.lastMouseX, 2) + 
      Math.pow(this.mouseY - this.lastMouseY, 2)
    );
    
    this.lastParticleDistance += distance;
    
    while (this.lastParticleDistance >= this.particleSpacing) {
      const progress = (this.lastParticleDistance - this.particleSpacing) / distance;
      const x = this.lastMouseX + (this.mouseX - this.lastMouseX) * (1 - progress);
      const y = this.lastMouseY + (this.mouseY - this.lastMouseY) * (1 - progress);
      
      this.trailParticles.push({
        x,
        y,
        vx: (this.mouseX - this.lastMouseX) * 0.02,
        vy: (this.mouseY - this.lastMouseY) * 0.02,
        life: 1.0,
        maxLife: 1200 + Math.random() * 800,
        size: 3 + Math.min(this.mouseVelocity * 0.1, 8),
        startTime: Date.now(),
        opacity: 0.8,
        noiseOffset: Math.random() * 1000
      });
      
      this.lastParticleDistance -= this.particleSpacing;
    }
    
    if (this.trailParticles.length > this.maxTrailParticles) {
      this.trailParticles.shift();
    }
  }
  
  updateWaterPhysics() {
    // Store previous state
    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        this.previousHeightMap[y][x] = this.heightMap[y][x];
      }
    }
    
    // Update water surface using wave equation
    for (let y = 1; y < this.gridHeight - 1; y++) {
      for (let x = 1; x < this.gridWidth - 1; x++) {
        // Calculate Laplacian (second derivative)
        const laplacian = 
          this.previousHeightMap[y-1][x] + 
          this.previousHeightMap[y+1][x] + 
          this.previousHeightMap[y][x-1] + 
          this.previousHeightMap[y][x+1] - 
          4 * this.previousHeightMap[y][x];
        
        // Wave equation: acceleration = tension * laplacian
        const acceleration = this.waterPhysics.tension * laplacian;
        
        // Update velocity
        this.velocityMap[y][x] += acceleration;
        this.velocityMap[y][x] *= this.waterPhysics.damping;
        
        // Update height
        this.heightMap[y][x] += this.velocityMap[y][x];
        
        // Apply surface tension
        this.heightMap[y][x] *= (1 - this.waterPhysics.surfaceTension * 0.001);
      }
    }
    
    // Apply boundary conditions (absorbing boundaries)
    for (let x = 0; x < this.gridWidth; x++) {
      this.heightMap[0][x] *= 0.8;
      this.heightMap[this.gridHeight - 1][x] *= 0.8;
      this.velocityMap[0][x] *= 0.8;
      this.velocityMap[this.gridHeight - 1][x] *= 0.8;
    }
    
    for (let y = 0; y < this.gridHeight; y++) {
      this.heightMap[y][0] *= 0.8;
      this.heightMap[y][this.gridWidth - 1] *= 0.8;
      this.velocityMap[y][0] *= 0.8;
      this.velocityMap[y][this.gridWidth - 1] *= 0.8;
    }
  }
  
  updateGlobalDistortion() {
    const now = Date.now();
    
    // Clean up old distortions
    this.activeDistortions = this.activeDistortions.filter(d => 
      now - d.startTime < d.duration
    );
    
    // Calculate total distortion affecting text
    let totalDistortion = 0;
    const textRect = this.textContainer.getBoundingClientRect();
    const textCenterX = textRect.left + textRect.width / 2;
    const textCenterY = textRect.top + textRect.height / 2;
    
    this.activeDistortions.forEach(distortion => {
      const distance = Math.sqrt(
        Math.pow(distortion.x - textCenterX, 2) + 
        Math.pow(distortion.y - textCenterY, 2)
      );
      
      if (distance < distortion.radius) {
        const progress = (now - distortion.startTime) / distortion.duration;
        const falloff = 1 - (distance / distortion.radius);
        const intensity = distortion.intensity * (1 - progress) * falloff;
        totalDistortion += intensity;
      }
    });
    
    // Apply distortion classes to text
    this.textContainer.classList.remove(
      'water-distort-light', 
      'water-distort-medium', 
      'water-distort-heavy', 
      'water-distort-extreme'
    );
    
    if (totalDistortion > 3) {
      this.textContainer.classList.add('water-distort-extreme');
    } else if (totalDistortion > 2) {
      this.textContainer.classList.add('water-distort-heavy');
    } else if (totalDistortion > 1) {
      this.textContainer.classList.add('water-distort-medium');
    } else if (totalDistortion > 0.3) {
      this.textContainer.classList.add('water-distort-light');
    }
    
    // Apply global distortion to distortion layer
    const globalDistortion = Math.min(totalDistortion * 0.5, 2);
    this.distortionLayer.style.backdropFilter = `blur(${globalDistortion}px)`;
    
    // Show glue layer when there's interaction
    const glueOpacity = Math.min(this.mouseVelocity * 0.05, 1);
    this.glueLayer.style.opacity = glueOpacity;
  }
  
  updateTrailParticles() {
    const now = Date.now();
    this.noiseOffset += 0.01;
    
    this.trailParticles = this.trailParticles.filter(particle => {
      const age = now - particle.startTime;
      const lifeProgress = age / particle.maxLife;
      
      if (lifeProgress >= 1) return false;
      
      // Update particle physics
      particle.life = 1 - lifeProgress;
      particle.opacity = 0.8 * particle.life;
      particle.size *= 0.998;
      
      // Add organic movement
      const noiseX = this.noise(
        particle.x * this.noiseScale + particle.noiseOffset,
        particle.y * this.noiseScale,
        this.noiseOffset
      );
      const noiseY = this.noise(
        particle.x * this.noiseScale,
        particle.y * this.noiseScale + particle.noiseOffset,
        this.noiseOffset + 100
      );
      
      particle.vx += noiseX * 0.1;
      particle.vy += noiseY * 0.1;
      particle.vx *= this.waterPhysics.viscosity;
      particle.vy *= this.waterPhysics.viscosity;
      
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      return true;
    });
  }
  
  // Simple noise function
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
    
    return this.lerp(w, 
      this.lerp(v, 
        this.lerp(u, this.grad(X + Y + Z, x, y, z), 
                     this.grad(X + Y + Z + 1, x - 1, y, z)),
        this.lerp(u, this.grad(X + Y + Z + 1, x, y - 1, z), 
                     this.grad(X + Y + Z + 2, x - 1, y - 1, z))
      ),
      this.lerp(v,
        this.lerp(u, this.grad(X + Y + Z + 1, x, y, z - 1), 
                     this.grad(X + Y + Z + 2, x - 1, y, z - 1)),
        this.lerp(u, this.grad(X + Y + Z + 2, x, y - 1, z - 1), 
                     this.grad(X + Y + Z + 3, x - 1, y - 1, z - 1))
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
  
  drawWaterSurface() {
    this.waterCtx.clearRect(0, 0, this.waterCanvas.width, this.waterCanvas.height);
    
    // Draw water height map as displacement
    const imageData = this.waterCtx.createImageData(this.waterCanvas.width, this.waterCanvas.height);
    const data = imageData.data;
    
    for (let y = 0; y < this.waterCanvas.height; y++) {
      for (let x = 0; x < this.waterCanvas.width; x++) {
        const gridX = Math.floor(x / this.cellSize);
        const gridY = Math.floor(y / this.cellSize);
        
        if (gridX < this.gridWidth && gridY < this.gridHeight) {
          const height = this.heightMap[gridY][gridX];
          const intensity = Math.abs(height) * 8;
          
          const index = (y * this.waterCanvas.width + x) * 4;
          
          // Create water-like coloring
          data[index] = Math.min(255, intensity * 0.3); // Red
          data[index + 1] = Math.min(255, intensity * 0.8); // Green
          data[index + 2] = Math.min(255, intensity * 1.2); // Blue
          data[index + 3] = Math.min(255, intensity * 0.4); // Alpha
        }
      }
    }
    
    this.waterCtx.putImageData(imageData, 0, 0);
  }
  
  drawTrailParticles() {
    this.trailCtx.globalCompositeOperation = 'screen';
    
    this.trailParticles.forEach(particle => {
      if (particle.opacity > 0.02) {
        const gradient = this.trailCtx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 2
        );
        
        gradient.addColorStop(0, `rgba(0, 130, 247, ${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(0, 130, 247, ${particle.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(0, 130, 247, 0)`);
        
        this.trailCtx.fillStyle = gradient;
        this.trailCtx.beginPath();
        this.trailCtx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
        this.trailCtx.fill();
      }
    });
    
    this.trailCtx.globalCompositeOperation = 'source-over';
  }
  
  animate() {
    // Clear trail canvas with fade
    this.trailCtx.globalCompositeOperation = 'source-over';
    this.trailCtx.fillStyle = 'rgba(0, 0, 0, 0.02)';
    this.trailCtx.fillRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);
    
    // Update physics
    this.updateWaterPhysics();
    this.updateTrailParticles();
    this.updateGlobalDistortion();
    
    // Render
    this.drawWaterSurface();
    this.drawTrailParticles();
    
    requestAnimationFrame(() => this.animate());
  }
  
  startAnimation() {
    this.animate();
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FullScreenWaterSurface();
});

// DISABLED: Enhanced custom cursor (commented out for now)
/*
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
    background: radial-gradient(circle, rgba(255, 255, 255, 0.8), rgba(0, 130, 247, 0.6) 60%, transparent 80%);
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    animation: waterCursorFade 1s ease-out forwards;
    filter: blur(0.2px);
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.3);
  `;
  
  document.body.appendChild(cursor);
  
  cursorTimeout = setTimeout(() => {
    if (cursor.parentNode) {
      cursor.parentNode.removeChild(cursor);
    }
  }, 1000);
});

// Water cursor animation
const style = document.createElement('style');
style.textContent = `
  @keyframes waterCursorFade {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(0.3);
      filter: blur(0px);
    }
    20% {
      opacity: 0.9;
      transform: translate(-50%, -50%) scale(1);
      filter: blur(0.2px);
    }
    60% {
      opacity: 0.5;
      transform: translate(-50%, -50%) scale(1.2);
      filter: blur(0.4px);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(1.5);
      filter: blur(0.6px);
    }
  }
`;
document.head.appendChild(style);
*/