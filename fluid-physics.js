class FluidPhysics3D {
  constructor() {
    this.canvas = document.getElementById('fluidCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.particleContainer = document.getElementById('particleContainer');
    this.navContainer = document.getElementById('navContainer');
    
    // Physics properties
    this.particles = [];
    this.metaballs = [];
    this.strands = [];
    this.bubbles = [];
    this.droplets = [];
    
    this.sections = [];
    this.centerX = window.innerWidth / 2;
    this.centerY = window.innerHeight / 2;
    this.centerZ = 0;
    
    this.mouseX = this.centerX;
    this.mouseY = this.centerY;
    
    this.physicsActive = false;
    this.animationId = null;
    
    // Fluid properties
    this.viscosity = 0.98;
    this.elasticity = 0.15;
    this.cohesion = 0.8;
    this.adhesion = 0.6;
    this.surfaceTension = 0.7;
    this.particleCount = 150;
    this.maxStrandDistance = 120;
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.setupSections();
    this.setupEventListeners();
    this.createParticleSystem();
    this.startAnimation();
  }
  
  setupCanvas() {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.centerX = window.innerWidth / 2;
      this.centerY = window.innerHeight / 2;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }
  
  setupSections() {
    const sectionElements = document.querySelectorAll('.section');
    
    sectionElements.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const direction = element.getAttribute('data-direction');
      
      const section = {
        element,
        index,
        direction,
        originalX: rect.left + rect.width / 2,
        originalY: rect.top + rect.height / 2,
        originalZ: 0,
        currentX: rect.left + rect.width / 2,
        currentY: rect.top + rect.height / 2,
        currentZ: 0,
        targetX: rect.left + rect.width / 2,
        targetY: rect.top + rect.height / 2,
        targetZ: 0,
        velocityX: 0,
        velocityY: 0,
        velocityZ: 0,
        size: Math.max(rect.width, rect.height),
        isStretching: false,
        stretchIntensity: 0,
        maxStretch: this.getMaxStretch(direction),
        restoreForce: 0.02,
        damping: 0.95,
        mass: 1 + index * 0.3,
        radius: Math.max(rect.width, rect.height) / 2
      };
      
      this.sections.push(section);
      this.add3DEffects(element);
    });
  }
  
  getMaxStretch(direction) {
    const baseStretch = Math.min(window.innerWidth, window.innerHeight) * 0.4;
    return baseStretch;
  }
  
  add3DEffects(element) {
    // Add caustic light effect
    const causticLight = document.createElement('div');
    causticLight.className = 'caustic-light-3d';
    element.appendChild(causticLight);
    
    // Add surface tension effect
    const surfaceTension = document.createElement('div');
    surfaceTension.className = 'surface-tension-3d';
    element.appendChild(surfaceTension);
    
    // Add refraction overlay
    const refractionOverlay = document.createElement('div');
    refractionOverlay.className = 'refraction-3d';
    element.appendChild(refractionOverlay);
  }
  
  setupEventListeners() {
    // Mouse movement for 3D lighting effects
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.update3DLighting();
    });
    
    // Navigation show event
    const nav = document.querySelector('.nav');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (nav.classList.contains('show')) {
            setTimeout(() => {
              this.startPhysics();
            }, 1000);
          }
        }
      });
    });
    
    observer.observe(nav, { attributes: true });
    
    // Window resize
    window.addEventListener('resize', () => {
      this.updateSectionPositions();
    });
  }
  
  update3DLighting() {
    // Update section 3D lighting
    this.sections.forEach(section => {
      const causticLight = section.element.querySelector('.caustic-light-3d');
      const refraction = section.element.querySelector('.refraction-3d');
      
      if (causticLight) {
        const rect = section.element.getBoundingClientRect();
        const mouseXPercent = ((this.mouseX - rect.left) / rect.width) * 100;
        const mouseYPercent = ((this.mouseY - rect.top) / rect.height) * 100;
        
        // Calculate 3D rotation based on mouse position
        const rotateX = (mouseYPercent - 50) * 0.2;
        const rotateY = (mouseXPercent - 50) * 0.2;
        const z = Math.abs(mouseXPercent - 50) + Math.abs(mouseYPercent - 50);
        
        causticLight.style.setProperty('--mx', `${mouseXPercent}%`);
        causticLight.style.setProperty('--my', `${mouseYPercent}%`);
        causticLight.style.setProperty('--rx', `${rotateX}deg`);
        causticLight.style.setProperty('--ry', `${rotateY}deg`);
        causticLight.style.setProperty('--z', `${z * 0.1}px`);
        
        // Show caustic light when mouse is near
        const distance = Math.sqrt(
          Math.pow(this.mouseX - (rect.left + rect.width / 2), 2) +
          Math.pow(this.mouseY - (rect.top + rect.height / 2), 2)
        );
        causticLight.style.opacity = Math.max(0, 1 - distance / 200);
      }
      
      if (refraction) {
        const angle = Math.atan2(this.mouseY - section.currentY, this.mouseX - section.currentX) * 180 / Math.PI;
        refraction.style.setProperty('--angle', `${angle}deg`);
        refraction.style.setProperty('--rz', `${angle * 0.1}deg`);
      }
    });
  }
  
  createParticleSystem() {
    // Create fluid particles around the center
    for (let i = 0; i < this.particleCount; i++) {
      const angle = (i / this.particleCount) * Math.PI * 2;
      const radius = 50 + Math.random() * 100;
      const height = (Math.random() - 0.5) * 100;
      
      const particle = {
        id: i,
        x: this.centerX + Math.cos(angle) * radius,
        y: this.centerY + Math.sin(angle) * radius,
        z: height,
        vx: 0,
        vy: 0,
        vz: 0,
        originalX: this.centerX + Math.cos(angle) * radius,
        originalY: this.centerY + Math.sin(angle) * radius,
        originalZ: height,
        size: 4 + Math.random() * 8,
        mass: 0.5 + Math.random() * 0.5,
        element: this.createParticleElement(),
        connections: [],
        density: 1,
        pressure: 0
      };
      
      this.particles.push(particle);
      this.particleContainer.appendChild(particle.element);
    }
    
    // Create metaballs for fluid connection visualization
    this.createMetaballs();
    
    // Create initial bubbles
    this.createBubbles();
  }
  
  createParticleElement() {
    const particle = document.createElement('div');
    particle.className = 'fluid-particle';
    return particle;
  }
  
  createMetaballs() {
    const metaballContainer = document.createElement('div');
    metaballContainer.className = 'metaball-container';
    this.particleContainer.appendChild(metaballContainer);
    
    for (let i = 0; i < 20; i++) {
      const metaball = document.createElement('div');
      metaball.className = 'metaball';
      metaballContainer.appendChild(metaball);
      
      this.metaballs.push({
        element: metaball,
        x: this.centerX,
        y: this.centerY,
        z: 0,
        size: 20 + Math.random() * 40,
        targetX: this.centerX,
        targetY: this.centerY,
        targetZ: 0
      });
    }
  }
  
  createBubbles() {
    for (let i = 0; i < 12; i++) {
      this.createBubble();
    }
  }
  
  createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble-3d';
    
    const size = 12 + Math.random() * 24;
    const x = this.centerX + (Math.random() - 0.5) * 300;
    const y = this.centerY + (Math.random() - 0.5) * 300;
    const z = (Math.random() - 0.5) * 100;
    
    const rx = Math.random() * 360;
    const ry = Math.random() * 360;
    const duration = 3 + Math.random() * 4;
    
    bubble.style.setProperty('--size', `${size}px`);
    bubble.style.setProperty('--x', `${x}px`);
    bubble.style.setProperty('--y', `${y}px`);
    bubble.style.setProperty('--z', `${z}px`);
    bubble.style.setProperty('--rx', `${rx}deg`);
    bubble.style.setProperty('--ry', `${ry}deg`);
    bubble.style.setProperty('--duration', `${duration}s`);
    
    this.particleContainer.appendChild(bubble);
    
    // Remove bubble after animation
    setTimeout(() => {
      if (bubble.parentNode) {
        bubble.parentNode.removeChild(bubble);
      }
    }, duration * 1000);
    
    this.bubbles.push({
      element: bubble,
      x, y, z, size,
      life: duration * 1000
    });
  }
  
  createDroplet(x, y, z) {
    const droplet = document.createElement('div');
    droplet.className = 'droplet-3d';
    
    const width = 4 + Math.random() * 6;
    const height = width * 1.5;
    const duration = 2 + Math.random() * 3;
    
    const rx = Math.random() * 360;
    const ry = Math.random() * 360;
    const rz = Math.random() * 360;
    
    droplet.style.setProperty('--width', `${width}px`);
    droplet.style.setProperty('--height', `${height}px`);
    droplet.style.setProperty('--x', `${x}px`);
    droplet.style.setProperty('--y', `${y}px`);
    droplet.style.setProperty('--z', `${z}px`);
    droplet.style.setProperty('--rx', `${rx}deg`);
    droplet.style.setProperty('--ry', `${ry}deg`);
    droplet.style.setProperty('--rz', `${rz}deg`);
    droplet.style.setProperty('--duration', `${duration}s`);
    
    this.particleContainer.appendChild(droplet);
    
    // Remove droplet after animation
    setTimeout(() => {
      if (droplet.parentNode) {
        droplet.parentNode.removeChild(droplet);
      }
    }, duration * 1000);
  }
  
  create3DStrand(from, to, intensity) {
    const strand = document.createElement('div');
    strand.className = 'fluid-strand-3d';
    
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dz = to.z - from.z;
    
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const width = Math.max(2, 8 * intensity);
    
    // Calculate 3D rotation
    const rx = Math.atan2(dz, dy) * 180 / Math.PI;
    const ry = Math.atan2(dx, dz) * 180 / Math.PI;
    const rz = Math.atan2(dy, dx) * 180 / Math.PI;
    
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const midZ = (from.z + to.z) / 2;
    
    strand.style.setProperty('--x', `${midX}px`);
    strand.style.setProperty('--y', `${midY}px`);
    strand.style.setProperty('--z', `${midZ}px`);
    strand.style.setProperty('--width', `${width}px`);
    strand.style.setProperty('--height', `${length}px`);
    strand.style.setProperty('--rx', `${rx}deg`);
    strand.style.setProperty('--ry', `${ry}deg`);
    strand.style.setProperty('--rz', `${rz}deg`);
    strand.style.setProperty('--opacity', intensity);
    strand.style.setProperty('--angle', `${rz}deg`);
    
    this.particleContainer.appendChild(strand);
    
    return {
      element: strand,
      from,
      to,
      length,
      intensity
    };
  }
  
  startPhysics() {
    this.physicsActive = true;
    this.sections.forEach(section => {
      section.element.classList.add('physics-active');
      this.initiateSectionMovement(section);
    });
  }
  
  initiateSectionMovement(section) {
    const direction = section.direction;
    let targetX = this.centerX;
    let targetY = this.centerY;
    let targetZ = 0;
    
    // Calculate escape direction in 3D
    switch (direction) {
      case 'top-left':
        targetX = this.centerX - section.maxStretch;
        targetY = this.centerY - section.maxStretch;
        targetZ = -50;
        break;
      case 'top-right':
        targetX = this.centerX + section.maxStretch;
        targetY = this.centerY - section.maxStretch;
        targetZ = 50;
        break;
      case 'bottom-left':
        targetX = this.centerX - section.maxStretch;
        targetY = this.centerY + section.maxStretch;
        targetZ = 50;
        break;
      case 'bottom-right':
        targetX = this.centerX + section.maxStretch;
        targetY = this.centerY + section.maxStretch;
        targetZ = -50;
        break;
    }
    
    section.targetX = targetX;
    section.targetY = targetY;
    section.targetZ = targetZ;
    section.isStretching = true;
  }
  
  updateSectionPositions() {
    this.sections.forEach(section => {
      const rect = section.element.getBoundingClientRect();
      section.originalX = rect.left + rect.width / 2;
      section.originalY = rect.top + rect.height / 2;
      
      if (!section.isStretching) {
        section.currentX = section.originalX;
        section.currentY = section.originalY;
        section.currentZ = 0;
      }
    });
  }
  
  updateFluidPhysics() {
    if (!this.physicsActive) return;
    
    // Clear existing strands
    this.strands.forEach(strand => {
      if (strand.element.parentNode) {
        strand.element.parentNode.removeChild(strand.element);
      }
    });
    this.strands = [];
    
    // Update section physics
    this.sections.forEach(section => {
      if (section.isStretching) {
        // Calculate forces
        const distanceToTarget = Math.sqrt(
          Math.pow(section.targetX - section.currentX, 2) +
          Math.pow(section.targetY - section.currentY, 2) +
          Math.pow(section.targetZ - section.currentZ, 2)
        );
        
        const distanceToCenter = Math.sqrt(
          Math.pow(section.currentX - this.centerX, 2) +
          Math.pow(section.currentY - this.centerY, 2) +
          Math.pow(section.currentZ - this.centerZ, 2)
        );
        
        // Stretching force (towards target)
        const stretchForceX = (section.targetX - section.currentX) * 0.008;
        const stretchForceY = (section.targetY - section.currentY) * 0.008;
        const stretchForceZ = (section.targetZ - section.currentZ) * 0.008;
        
        // Restore force (towards center, increases with distance)
        const restoreIntensity = Math.min(distanceToCenter / section.maxStretch, 1);
        const restoreForceX = (this.centerX - section.currentX) * section.restoreForce * restoreIntensity;
        const restoreForceY = (this.centerY - section.currentY) * section.restoreForce * restoreIntensity;
        const restoreForceZ = (this.centerZ - section.currentZ) * section.restoreForce * restoreIntensity;
        
        // Apply forces
        section.velocityX += (stretchForceX + restoreForceX) / section.mass;
        section.velocityY += (stretchForceY + restoreForceY) / section.mass;
        section.velocityZ += (stretchForceZ + restoreForceZ) / section.mass;
        
        // Apply damping
        section.velocityX *= section.damping;
        section.velocityY *= section.damping;
        section.velocityZ *= section.damping;
        
        // Update position
        section.currentX += section.velocityX;
        section.currentY += section.velocityY;
        section.currentZ += section.velocityZ;
        
        // Update element position with 3D transform
        const rect = section.element.getBoundingClientRect();
        const offsetX = section.currentX - (rect.left + rect.width / 2);
        const offsetY = section.currentY - (rect.top + rect.height / 2);
        const offsetZ = section.currentZ;
        
        section.element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, ${offsetZ}px) scale(var(--scale,1))`;
        
        // Create 3D fluid strand
        const strandIntensity = Math.max(0.2, 1 - distanceToCenter / section.maxStretch);
        const strand = this.create3DStrand(
          { x: this.centerX, y: this.centerY, z: this.centerZ },
          { x: section.currentX, y: section.currentY, z: section.currentZ },
          strandIntensity
        );
        this.strands.push(strand);
        
        // Create droplets when strand is stretched
        if (Math.random() > 0.92 && distanceToCenter > 80) {
          const dropletX = this.centerX + (section.currentX - this.centerX) * (0.3 + Math.random() * 0.4);
          const dropletY = this.centerY + (section.currentY - this.centerY) * (0.3 + Math.random() * 0.4);
          const dropletZ = this.centerZ + (section.currentZ - this.centerZ) * (0.3 + Math.random() * 0.4);
          this.createDroplet(dropletX, dropletY, dropletZ);
        }
        
        // Check if section should start returning
        if (distanceToCenter > section.maxStretch * 0.85) {
          section.isStretching = false;
          section.restoreForce = 0.04; // Increase restore force for return journey
        }
      } else {
        // Return to original position
        const distanceToOriginal = Math.sqrt(
          Math.pow(section.originalX - section.currentX, 2) +
          Math.pow(section.originalY - section.currentY, 2) +
          Math.pow(section.originalZ - section.currentZ, 2)
        );
        
        if (distanceToOriginal > 8) {
          const returnForceX = (section.originalX - section.currentX) * 0.025;
          const returnForceY = (section.originalY - section.currentY) * 0.025;
          const returnForceZ = (section.originalZ - section.currentZ) * 0.025;
          
          section.velocityX += returnForceX / section.mass;
          section.velocityY += returnForceY / section.mass;
          section.velocityZ += returnForceZ / section.mass;
          section.velocityX *= 0.92;
          section.velocityY *= 0.92;
          section.velocityZ *= 0.92;
          
          section.currentX += section.velocityX;
          section.currentY += section.velocityY;
          section.currentZ += section.velocityZ;
          
          const rect = section.element.getBoundingClientRect();
          const offsetX = section.currentX - (rect.left + rect.width / 2);
          const offsetY = section.currentY - (rect.top + rect.height / 2);
          const offsetZ = section.currentZ;
          
          section.element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, ${offsetZ}px) scale(var(--scale,1))`;
          
          // Create fluid strand during return
          const strandIntensity = Math.max(0.1, distanceToOriginal / 100);
          const strand = this.create3DStrand(
            { x: this.centerX, y: this.centerY, z: this.centerZ },
            { x: section.currentX, y: section.currentY, z: section.currentZ },
            strandIntensity
          );
          this.strands.push(strand);
        } else {
          // Settled back to original position
          section.element.style.transform = 'translate3d(0, 0, 0) scale(var(--scale,1))';
          section.currentX = section.originalX;
          section.currentY = section.originalY;
          section.currentZ = 0;
          section.velocityX = 0;
          section.velocityY = 0;
          section.velocityZ = 0;
        }
      }
    });
    
    // Update particle system
    this.updateParticles();
    
    // Update metaballs
    this.updateMetaballs();
    
    // Create new bubbles occasionally
    if (Math.random() > 0.995) {
      this.createBubble();
    }
  }
  
  updateParticles() {
    // Calculate particle interactions and fluid dynamics
    this.particles.forEach((particle, i) => {
      // Reset forces
      let fx = 0, fy = 0, fz = 0;
      
      // Attraction to center (surface tension)
      const centerDist = Math.sqrt(
        Math.pow(particle.x - this.centerX, 2) +
        Math.pow(particle.y - this.centerY, 2) +
        Math.pow(particle.z - this.centerZ, 2)
      );
      
      if (centerDist > 0) {
        const centerForce = this.surfaceTension * 0.1;
        fx += (this.centerX - particle.x) / centerDist * centerForce;
        fy += (this.centerY - particle.y) / centerDist * centerForce;
        fz += (this.centerZ - particle.z) / centerDist * centerForce;
      }
      
      // Particle-particle interactions
      this.particles.forEach((other, j) => {
        if (i !== j) {
          const dx = other.x - particle.x;
          const dy = other.y - particle.y;
          const dz = other.z - particle.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (dist > 0 && dist < 30) {
            // Cohesion force
            const cohesionForce = this.cohesion * 0.01;
            fx += dx / dist * cohesionForce;
            fy += dy / dist * cohesionForce;
            fz += dz / dist * cohesionForce;
            
            // Repulsion force (prevent overlap)
            if (dist < 15) {
              const repulsionForce = 0.5 / (dist * dist);
              fx -= dx / dist * repulsionForce;
              fy -= dy / dist * repulsionForce;
              fz -= dz / dist * repulsionForce;
            }
          }
        }
      });
      
      // Section attraction (when physics is active)
      if (this.physicsActive) {
        this.sections.forEach(section => {
          const sectionDist = Math.sqrt(
            Math.pow(particle.x - section.currentX, 2) +
            Math.pow(particle.y - section.currentY, 2) +
            Math.pow(particle.z - section.currentZ, 2)
          );
          
          if (sectionDist < section.radius + 50) {
            const sectionForce = this.adhesion * 0.02;
            fx += (section.currentX - particle.x) / sectionDist * sectionForce;
            fy += (section.currentY - particle.y) / sectionDist * sectionForce;
            fz += (section.currentZ - particle.z) / sectionDist * sectionForce;
          }
        });
      }
      
      // Apply forces
      particle.vx += fx;
      particle.vy += fy;
      particle.vz += fz;
      
      // Apply viscosity
      particle.vx *= this.viscosity;
      particle.vy *= this.viscosity;
      particle.vz *= this.viscosity;
      
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.z += particle.vz;
      
      // Update particle element
      particle.element.style.setProperty('--x', `${particle.x}px`);
      particle.element.style.setProperty('--y', `${particle.y}px`);
      particle.element.style.setProperty('--z', `${particle.z}px`);
      particle.element.style.setProperty('--size', `${particle.size}px`);
    });
  }
  
  updateMetaballs() {
    // Update metaball positions to follow particle clusters
    this.metaballs.forEach((metaball, i) => {
      // Find nearby particles
      const nearbyParticles = this.particles.filter(particle => {
        const dist = Math.sqrt(
          Math.pow(particle.x - metaball.x, 2) +
          Math.pow(particle.y - metaball.y, 2) +
          Math.pow(particle.z - metaball.z, 2)
        );
        return dist < 80;
      });
      
      if (nearbyParticles.length > 0) {
        // Calculate center of mass
        let avgX = 0, avgY = 0, avgZ = 0;
        nearbyParticles.forEach(particle => {
          avgX += particle.x;
          avgY += particle.y;
          avgZ += particle.z;
        });
        avgX /= nearbyParticles.length;
        avgY /= nearbyParticles.length;
        avgZ /= nearbyParticles.length;
        
        // Move metaball towards center of mass
        metaball.targetX = avgX;
        metaball.targetY = avgY;
        metaball.targetZ = avgZ;
      } else {
        // Move towards center
        metaball.targetX = this.centerX + (Math.random() - 0.5) * 100;
        metaball.targetY = this.centerY + (Math.random() - 0.5) * 100;
        metaball.targetZ = (Math.random() - 0.5) * 50;
      }
      
      // Smooth movement
      metaball.x += (metaball.targetX - metaball.x) * 0.1;
      metaball.y += (metaball.targetY - metaball.y) * 0.1;
      metaball.z += (metaball.targetZ - metaball.z) * 0.1;
      
      // Update metaball element
      metaball.element.style.setProperty('--x', `${metaball.x}px`);
      metaball.element.style.setProperty('--y', `${metaball.y}px`);
      metaball.element.style.setProperty('--z', `${metaball.z}px`);
      metaball.element.style.setProperty('--size', `${metaball.size}px`);
    });
  }
  
  startAnimation() {
    const animate = () => {
      this.updateFluidPhysics();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Clean up elements
    this.strands.forEach(strand => {
      if (strand.element.parentNode) {
        strand.element.parentNode.removeChild(strand.element);
      }
    });
    
    this.bubbles.forEach(bubble => {
      if (bubble.element.parentNode) {
        bubble.element.parentNode.removeChild(bubble.element);
      }
    });
    
    this.particles.forEach(particle => {
      if (particle.element.parentNode) {
        particle.element.parentNode.removeChild(particle.element);
      }
    });
  }
}

// Initialize 3D fluid physics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for the navigation to be ready
  setTimeout(() => {
    window.fluidPhysics3D = new FluidPhysics3D();
  }, 1000);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (window.fluidPhysics3D) {
    window.fluidPhysics3D.destroy();
  }
});