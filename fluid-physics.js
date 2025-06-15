class FluidPhysics {
  constructor() {
    this.canvas = document.getElementById('fluidCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.bubbleContainer = document.getElementById('bubbleContainer');
    this.dropletContainer = document.getElementById('dropletContainer');
    this.centralGlue = document.getElementById('centralGlue');
    this.navContainer = document.getElementById('navContainer');
    
    this.sections = [];
    this.fluidStrands = [];
    this.bubbles = [];
    this.droplets = [];
    
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    
    this.centerX = window.innerWidth / 2;
    this.centerY = window.innerHeight / 2;
    
    this.physicsActive = false;
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    this.setupCanvas();
    this.setupSections();
    this.setupEventListeners();
    this.createInitialBubbles();
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
        currentX: rect.left + rect.width / 2,
        currentY: rect.top + rect.height / 2,
        targetX: rect.left + rect.width / 2,
        targetY: rect.top + rect.height / 2,
        velocityX: 0,
        velocityY: 0,
        size: Math.max(rect.width, rect.height),
        isStretching: false,
        stretchIntensity: 0,
        maxStretch: this.getMaxStretch(direction),
        restoreForce: 0.02,
        damping: 0.95,
        mass: 1 + index * 0.2
      };
      
      this.sections.push(section);
      this.addPhysicsEffects(element);
    });
  }
  
  getMaxStretch(direction) {
    const baseStretch = Math.min(window.innerWidth, window.innerHeight) * 0.3;
    return baseStretch;
  }
  
  addPhysicsEffects(element) {
    // Add caustic light effect
    const causticLight = document.createElement('div');
    causticLight.className = 'caustic-light';
    element.appendChild(causticLight);
    
    // Add surface tension effect
    const surfaceTension = document.createElement('div');
    surfaceTension.className = 'surface-tension';
    element.appendChild(surfaceTension);
    
    // Add refraction overlay
    const refractionOverlay = document.createElement('div');
    refractionOverlay.className = 'refraction-overlay';
    element.appendChild(refractionOverlay);
  }
  
  setupEventListeners() {
    // Mouse movement for lighting effects
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.updateLighting();
    });
    
    // Navigation show event
    const nav = document.querySelector('.nav');
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          if (nav.classList.contains('show')) {
            this.startPhysics();
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
  
  updateLighting() {
    // Update central glue lighting
    const glueRect = this.centralGlue.getBoundingClientRect();
    const glueCenterX = glueRect.left + glueRect.width / 2;
    const glueCenterY = glueRect.top + glueRect.height / 2;
    
    const lightX = ((this.mouseX - glueCenterX) / glueRect.width + 1) * 50;
    const lightY = ((this.mouseY - glueCenterY) / glueRect.height + 1) * 50;
    
    this.centralGlue.style.setProperty('--light-x', `${Math.max(0, Math.min(100, lightX))}%`);
    this.centralGlue.style.setProperty('--light-y', `${Math.max(0, Math.min(100, lightY))}%`);
    
    // Update section caustic lighting
    this.sections.forEach(section => {
      const causticLight = section.element.querySelector('.caustic-light');
      if (causticLight) {
        const rect = section.element.getBoundingClientRect();
        const mouseXPercent = ((this.mouseX - rect.left) / rect.width) * 100;
        const mouseYPercent = ((this.mouseY - rect.top) / rect.height) * 100;
        
        causticLight.style.setProperty('--mouse-x', `${mouseXPercent}%`);
        causticLight.style.setProperty('--mouse-y', `${mouseYPercent}%`);
      }
    });
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
    
    // Calculate escape direction
    switch (direction) {
      case 'top-left':
        targetX = this.centerX - section.maxStretch;
        targetY = this.centerY - section.maxStretch;
        break;
      case 'top-right':
        targetX = this.centerX + section.maxStretch;
        targetY = this.centerY - section.maxStretch;
        break;
      case 'bottom-left':
        targetX = this.centerX - section.maxStretch;
        targetY = this.centerY + section.maxStretch;
        break;
      case 'bottom-right':
        targetX = this.centerX + section.maxStretch;
        targetY = this.centerY + section.maxStretch;
        break;
    }
    
    section.targetX = targetX;
    section.targetY = targetY;
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
      }
    });
  }
  
  createInitialBubbles() {
    for (let i = 0; i < 8; i++) {
      this.createBubble();
    }
  }
  
  createBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    const size = Math.random() * 20 + 10;
    const x = this.centerX + (Math.random() - 0.5) * 200;
    const y = this.centerY + (Math.random() - 0.5) * 200;
    
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    bubble.style.left = `${x}px`;
    bubble.style.top = `${y}px`;
    bubble.style.animationDelay = `${Math.random() * 3}s`;
    bubble.style.animationDuration = `${3 + Math.random() * 2}s`;
    
    this.bubbleContainer.appendChild(bubble);
    
    // Remove bubble after animation
    setTimeout(() => {
      if (bubble.parentNode) {
        bubble.parentNode.removeChild(bubble);
      }
    }, 8000);
    
    this.bubbles.push({
      element: bubble,
      x,
      y,
      size,
      life: 8000
    });
  }
  
  createDroplet(x, y) {
    const droplet = document.createElement('div');
    droplet.className = 'droplet';
    
    const size = Math.random() * 4 + 4;
    const fallDuration = 2 + Math.random() * 3;
    
    droplet.style.left = `${x}px`;
    droplet.style.top = `${y}px`;
    droplet.style.width = `${size}px`;
    droplet.style.height = `${size * 1.5}px`;
    droplet.style.animationDuration = `${fallDuration}s`;
    
    this.dropletContainer.appendChild(droplet);
    
    // Remove droplet after animation
    setTimeout(() => {
      if (droplet.parentNode) {
        droplet.parentNode.removeChild(droplet);
      }
    }, fallDuration * 1000);
  }
  
  createFluidStrand(section) {
    const strand = document.createElement('div');
    strand.className = 'fluid-strand';
    
    const centerX = this.centerX;
    const centerY = this.centerY;
    const sectionX = section.currentX;
    const sectionY = section.currentY;
    
    const distance = Math.sqrt(
      Math.pow(sectionX - centerX, 2) + Math.pow(sectionY - centerY, 2)
    );
    
    const angle = Math.atan2(sectionY - centerY, sectionX - centerX);
    const angleDeg = (angle * 180) / Math.PI;
    
    const width = Math.max(2, 8 - (distance / 50));
    const opacity = Math.max(0.2, 1 - (distance / 300));
    
    strand.style.left = `${centerX}px`;
    strand.style.top = `${centerY}px`;
    strand.style.width = `${width}px`;
    strand.style.height = `${distance}px`;
    strand.style.transformOrigin = '50% 0%';
    strand.style.transform = `rotate(${angleDeg + 90}deg)`;
    strand.style.opacity = opacity;
    strand.style.setProperty('--strand-angle', `${angleDeg}deg`);
    
    document.body.appendChild(strand);
    
    // Create droplets along the strand
    if (Math.random() > 0.7 && distance > 100) {
      const dropletX = centerX + (sectionX - centerX) * (0.3 + Math.random() * 0.4);
      const dropletY = centerY + (sectionY - centerY) * (0.3 + Math.random() * 0.4);
      this.createDroplet(dropletX, dropletY);
    }
    
    return {
      element: strand,
      section,
      distance,
      angle
    };
  }
  
  updatePhysics() {
    if (!this.physicsActive) return;
    
    // Clear existing strands
    this.fluidStrands.forEach(strand => {
      if (strand.element.parentNode) {
        strand.element.parentNode.removeChild(strand.element);
      }
    });
    this.fluidStrands = [];
    
    // Update section physics
    this.sections.forEach(section => {
      if (section.isStretching) {
        // Calculate forces
        const distanceToTarget = Math.sqrt(
          Math.pow(section.targetX - section.currentX, 2) +
          Math.pow(section.targetY - section.currentY, 2)
        );
        
        const distanceToCenter = Math.sqrt(
          Math.pow(section.currentX - this.centerX, 2) +
          Math.pow(section.currentY - this.centerY, 2)
        );
        
        // Stretching force (towards target)
        const stretchForceX = (section.targetX - section.currentX) * 0.01;
        const stretchForceY = (section.targetY - section.currentY) * 0.01;
        
        // Restore force (towards center, increases with distance)
        const restoreIntensity = Math.min(distanceToCenter / section.maxStretch, 1);
        const restoreForceX = (this.centerX - section.currentX) * section.restoreForce * restoreIntensity;
        const restoreForceY = (this.centerY - section.currentY) * section.restoreForce * restoreIntensity;
        
        // Apply forces
        section.velocityX += (stretchForceX + restoreForceX) / section.mass;
        section.velocityY += (stretchForceY + restoreForceY) / section.mass;
        
        // Apply damping
        section.velocityX *= section.damping;
        section.velocityY *= section.damping;
        
        // Update position
        section.currentX += section.velocityX;
        section.currentY += section.velocityY;
        
        // Update element position
        const rect = section.element.getBoundingClientRect();
        const offsetX = section.currentX - (rect.left + rect.width / 2);
        const offsetY = section.currentY - (rect.top + rect.height / 2);
        
        section.element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(var(--scale,1))`;
        
        // Create fluid strand
        const strand = this.createFluidStrand(section);
        this.fluidStrands.push(strand);
        
        // Check if section should start returning
        if (distanceToCenter > section.maxStretch * 0.8) {
          section.isStretching = false;
          section.restoreForce = 0.05; // Increase restore force for return journey
        }
      } else {
        // Return to original position
        const distanceToOriginal = Math.sqrt(
          Math.pow(section.originalX - section.currentX, 2) +
          Math.pow(section.originalY - section.currentY, 2)
        );
        
        if (distanceToOriginal > 5) {
          const returnForceX = (section.originalX - section.currentX) * 0.03;
          const returnForceY = (section.originalY - section.currentY) * 0.03;
          
          section.velocityX += returnForceX / section.mass;
          section.velocityY += returnForceY / section.mass;
          section.velocityX *= 0.9;
          section.velocityY *= 0.9;
          
          section.currentX += section.velocityX;
          section.currentY += section.velocityY;
          
          const rect = section.element.getBoundingClientRect();
          const offsetX = section.currentX - (rect.left + rect.width / 2);
          const offsetY = section.currentY - (rect.top + rect.height / 2);
          
          section.element.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(var(--scale,1))`;
          
          // Create fluid strand during return
          const strand = this.createFluidStrand(section);
          this.fluidStrands.push(strand);
        } else {
          // Settled back to original position
          section.element.style.transform = 'translate(0, 0) scale(var(--scale,1))';
          section.currentX = section.originalX;
          section.currentY = section.originalY;
          section.velocityX = 0;
          section.velocityY = 0;
        }
      }
    });
    
    // Create new bubbles occasionally
    if (Math.random() > 0.98) {
      this.createBubble();
    }
    
    // Create viscous flow effects
    if (Math.random() > 0.95) {
      this.createViscousFlow();
    }
  }
  
  createViscousFlow() {
    const flow = document.createElement('div');
    flow.className = 'viscous-flow';
    
    const x = this.centerX + (Math.random() - 0.5) * 100;
    const y = this.centerY + (Math.random() - 0.5) * 100;
    const length = 50 + Math.random() * 100;
    
    flow.style.left = `${x}px`;
    flow.style.top = `${y}px`;
    flow.style.setProperty('--flow-length', `${length}px`);
    flow.style.animationDuration = `${1 + Math.random()}s`;
    
    document.body.appendChild(flow);
    
    setTimeout(() => {
      if (flow.parentNode) {
        flow.parentNode.removeChild(flow);
      }
    }, 2000);
  }
  
  startAnimation() {
    const animate = () => {
      this.updatePhysics();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Clean up elements
    this.fluidStrands.forEach(strand => {
      if (strand.element.parentNode) {
        strand.element.parentNode.removeChild(strand.element);
      }
    });
    
    this.bubbles.forEach(bubble => {
      if (bubble.element.parentNode) {
        bubble.element.parentNode.removeChild(bubble.element);
      }
    });
  }
}

// Initialize fluid physics when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for the navigation to be ready
  setTimeout(() => {
    window.fluidPhysics = new FluidPhysics();
  }, 1500);
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  if (window.fluidPhysics) {
    window.fluidPhysics.destroy();
  }
});