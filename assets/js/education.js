document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.item');
  const info = document.getElementById('info');
  const infoExtra = document.getElementById('info-extra');
  const infoImage = document.getElementById('info-image');
  const infoImageLink = document.getElementById('info-image-link');
  const infoText = document.getElementById('info-text');
  const infoExtraImage = document.getElementById('info-extra-image');
  const infoExtraImageLink = document.getElementById('info-extra-image-link');
  const infoExtraText = document.getElementById('info-extra-text');
  const infoClose = document.getElementById('info-close');
  const infoExtraClose = document.getElementById('info-extra-close');
  const body = document.body;
  const defaultBg = getComputedStyle(body).background;
  
  const gravityItems = document.querySelectorAll('.gravity-item');
  const curricularSection = document.getElementById('curricular-section');
  const extracurricularSection = document.getElementById('extracurricular-section');
  const gravityContainer = document.querySelector('.gravity-container');
  
  // Mobile detection
  const isMobile = () => window.innerWidth <= 768;
  
  // Multiple popup management
  const activePopups = new Set();
  const popupTimeouts = new Map();
  
  // Google Gravity Physics System - Enhanced Implementation
  let gravityActive = false;
  let gravityTriggered = false;
  const gravityPhysics = [];
  let mouseX = 0;
  let mouseY = 0;
  let draggedItem = null;
  let dragOffset = { x: 0, y: 0 };
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseVelocityX = 0;
  let mouseVelocityY = 0;
  
  // Physics constants - matching Google Gravity behavior
  const GRAVITY = 0.8;
  const FRICTION = 0.98;
  const BOUNCE_DAMPING = 0.7;
  const DRAG_DAMPING = 0.95;
  const MIN_VELOCITY = 0.1;
  
  // Debounce function for performance
  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Image loading with skeleton
  const handleImageLoad = (img, skeleton) => {
    img.addEventListener('load', () => {
      skeleton.style.display = 'none';
      img.style.opacity = '1';
    });
    
    img.addEventListener('error', () => {
      skeleton.style.display = 'none';
      img.style.opacity = '0.5';
      img.alt = 'Image failed to load';
    });
  };

  // Initialize image loading for all images
  const initializeImages = () => {
    // Desktop info panel images
    const infoImageSkeleton = document.querySelector('#info-image-wrapper .image-skeleton');
    const infoExtraImageSkeleton = document.querySelector('#info-extra-image-wrapper .image-skeleton');
    if (infoImageSkeleton) {
      handleImageLoad(infoImage, infoImageSkeleton);
    }
    if (infoExtraImageSkeleton) {
      handleImageLoad(infoExtraImage, infoExtraImageSkeleton);
    }
    
    // Mobile images
    document.querySelectorAll('.mobile-image').forEach(img => {
      const skeleton = img.parentElement.querySelector('.image-skeleton');
      if (skeleton) {
        handleImageLoad(img, skeleton);
      }
    });
  };

  // Show info function with overlapping support
  const showInfo = (item, isExtracurricular = false) => {
    if (isMobile()) return; // Skip on mobile
    
    const img = item.getAttribute('data-image');
    const text = item.getAttribute('data-text');
    const color = item.getAttribute('data-color');
    const link = item.getAttribute('data-link');
    
    const currentInfo = isExtracurricular ? infoExtra : info;
    const currentInfoImage = isExtracurricular ? infoExtraImage : infoImage;
    const currentInfoLink = isExtracurricular ? infoExtraImageLink : infoImageLink;
    const currentInfoText = isExtracurricular ? infoExtraText : infoText;
    
    const popupId = isExtracurricular ? 'extra' : 'main';
    
    // Clear any existing timeout for this popup
    if (popupTimeouts.has(popupId)) {
      clearTimeout(popupTimeouts.get(popupId));
      popupTimeouts.delete(popupId);
    }
    
    // Add to active popups
    activePopups.add(popupId);
    
    if (img) {
      const skeleton = currentInfo.querySelector('.image-skeleton');
      if (skeleton) {
        skeleton.style.display = 'block';
      }
      currentInfoImage.style.opacity = '0';
      currentInfoImage.src = img;
      if (currentInfoLink) {
        if (link) {
          currentInfoLink.href = link;
          currentInfoLink.style.pointerEvents = 'auto';
        } else {
          currentInfoLink.removeAttribute('href');
          currentInfoLink.style.pointerEvents = 'none';
        }
      }
    }
    
    if (text) currentInfoText.textContent = text;
    
    // Only change background if no other popups are active or this is the first one
    if (color && (activePopups.size === 1 || !body.classList.contains('dimmed'))) {
      body.style.background = `linear-gradient(to bottom, ${color}, rgb(0, 255, 136))`;
    }
    
    body.classList.add('dimmed');
    
    if (item.classList.contains('left')) {
      currentInfo.classList.add('right');
    } else {
      currentInfo.classList.remove('right');
    }
    
    void currentInfo.offsetWidth; // force reflow
    currentInfo.classList.add('visible');
    
    const offset = item.offsetTop + item.offsetHeight / 2 - currentInfo.offsetHeight / 2;
    currentInfo.style.top = offset + 'px';
  };

  // Hide info function with overlapping support
  const hideInfo = (isExtracurricular = false, immediate = false) => {
    if (isMobile()) return; // Skip on mobile
    
    const currentInfo = isExtracurricular ? infoExtra : info;
    const popupId = isExtracurricular ? 'extra' : 'main';
    
    if (immediate) {
      // Clear any existing timeout
      if (popupTimeouts.has(popupId)) {
        clearTimeout(popupTimeouts.get(popupId));
        popupTimeouts.delete(popupId);
      }
      
      // Remove from active popups
      activePopups.delete(popupId);
      
      currentInfo.classList.remove('visible');
      currentInfo.classList.remove('right');
      void currentInfo.offsetWidth;
      
      // Only remove dimmed state if no other popups are active
      if (activePopups.size === 0) {
        body.classList.remove('dimmed');
        body.style.background = defaultBg;
      }
    } else {
      // Set timeout for delayed hiding
      const timeoutId = setTimeout(() => {
        activePopups.delete(popupId);
        
        currentInfo.classList.remove('visible');
        currentInfo.classList.remove('right');
        void currentInfo.offsetWidth;
        
        // Only remove dimmed state if no other popups are active
        if (activePopups.size === 0) {
          body.classList.remove('dimmed');
          body.style.background = defaultBg;
        }
        
        popupTimeouts.delete(popupId);
      }, 2000); // 2 second delay
      
      popupTimeouts.set(popupId, timeoutId);
    }
  };

  // Toggle mobile info
  const toggleMobileInfo = (item) => {
    const mobileInfo = item.querySelector('.mobile-info');
    const isExpanded = item.classList.contains('expanded');
    
    // Close all other expanded items
    items.forEach(otherItem => {
      if (otherItem !== item) {
        otherItem.classList.remove('expanded');
        otherItem.setAttribute('aria-expanded', 'false');
      }
    });
    
    if (isExpanded) {
      item.classList.remove('expanded');
      item.setAttribute('aria-expanded', 'false');
    } else {
      item.classList.add('expanded');
      item.setAttribute('aria-expanded', 'true');
      
      // Scroll item into view
      setTimeout(() => {
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 300);
    }
  };

  // Enhanced Google Gravity Physics Implementation
  const initializeGoogleGravity = () => {
    if (isMobile()) return; // Skip gravity on mobile for performance

    const gravityContainer = document.querySelector('.gravity-container');
    if (!gravityContainer) return;

    const containerRect = gravityContainer.getBoundingClientRect();
    const containerHeight = gravityContainer.offsetHeight;
    const containerWidth = gravityContainer.offsetWidth;

    // Initialize physics for each gravity item
    gravityItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const physics = {
        element: item,
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top + rect.height / 2,
        vx: 0,
        vy: 0,
        width: rect.width,
        height: rect.height,
        mass: 1 + Math.random() * 0.5, // Slight mass variation
        originalX: rect.left - containerRect.left,
        originalY: rect.top - containerRect.top,
        isDragging: false,
        settled: false,
        rotation: 0,
        rotationVelocity: 0
      };
      
      gravityPhysics[index] = physics;
      
      // Set initial position
      item.style.position = 'absolute';
      item.style.left = physics.originalX + 'px';
      item.style.top = physics.originalY + 'px';
      item.style.transformOrigin = 'center center';
    });

    // Start physics immediately if gravity has been triggered
    if (gravityTriggered) {
      startGravityPhysics();
    }

    // Mouse/touch event handlers for dragging - Enhanced like Google Gravity
    gravityItems.forEach((item, index) => {
      item.addEventListener('mousedown', (e) => {
        if (!gravityActive) return;
        e.preventDefault();
        startDragging(index, e.clientX, e.clientY);
      });

      item.addEventListener('touchstart', (e) => {
        if (!gravityActive) return;
        e.preventDefault();
        const touch = e.touches[0];
        startDragging(index, touch.clientX, touch.clientY);
      });
    });

    // Track mouse velocity for throwing effect
    document.addEventListener('mousemove', (e) => {
      mouseVelocityX = e.clientX - lastMouseX;
      mouseVelocityY = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      if (draggedItem !== null) {
        updateDraggedItem(e.clientX, e.clientY);
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (draggedItem !== null) {
        e.preventDefault();
        const touch = e.touches[0];
        updateDraggedItem(touch.clientX, touch.clientY);
      }
    });

    document.addEventListener('mouseup', () => {
      if (draggedItem !== null) {
        stopDragging();
      }
    });

    document.addEventListener('touchend', () => {
      if (draggedItem !== null) {
        stopDragging();
      }
    });
  };

  const startDragging = (index, clientX, clientY) => {
    draggedItem = index;
    const physics = gravityPhysics[index];
    const containerRect = document.querySelector('.gravity-container').getBoundingClientRect();
    
    physics.isDragging = true;
    physics.element.classList.add('dragging');
    physics.element.style.zIndex = '1000';
    
    // Calculate offset from element center
    dragOffset.x = clientX - (containerRect.left + physics.x);
    dragOffset.y = clientY - (containerRect.top + physics.y);
    
    // Stop current velocities
    physics.vx = 0;
    physics.vy = 0;
    physics.rotationVelocity = 0;
  };

  const updateDraggedItem = (clientX, clientY) => {
    if (draggedItem === null) return;
    
    const physics = gravityPhysics[draggedItem];
    const containerRect = document.querySelector('.gravity-container').getBoundingClientRect();
    
    physics.x = clientX - containerRect.left - dragOffset.x;
    physics.y = clientY - containerRect.top - dragOffset.y;
    
    // Update DOM position
    physics.element.style.left = (physics.x - physics.width / 2) + 'px';
    physics.element.style.top = (physics.y - physics.height / 2) + 'px';
  };

  const stopDragging = () => {
    if (draggedItem === null) return;
    
    const physics = gravityPhysics[draggedItem];
    physics.isDragging = false;
    physics.element.classList.remove('dragging');
    physics.element.style.zIndex = '';
    
    // Add throwing velocity based on mouse movement (Google Gravity style)
    const throwMultiplier = 0.3;
    physics.vx = mouseVelocityX * throwMultiplier;
    physics.vy = mouseVelocityY * throwMultiplier;
    
    // Add slight rotation based on throw direction
    physics.rotationVelocity = (mouseVelocityX * 0.1) + (Math.random() - 0.5) * 2;
    
    draggedItem = null;
  };

  const startGravityPhysics = () => {
    const animateGravity = () => {
      if (!gravityActive) return;
      
      const containerRect = document.querySelector('.gravity-container').getBoundingClientRect();
      const containerHeight = containerRect.height;
      const containerWidth = containerRect.width;
      
      gravityPhysics.forEach((physics, index) => {
        if (physics.isDragging) return;
        
        // Apply gravity - stronger than before
        physics.vy += GRAVITY;
        
        // Apply friction to horizontal movement
        physics.vx *= FRICTION;
        
        // Update rotation
        physics.rotation += physics.rotationVelocity;
        physics.rotationVelocity *= 0.99; // Rotation damping
        
        // Update position
        physics.x += physics.vx;
        physics.y += physics.vy;
        
        // Boundary collisions with enhanced bounce
        const halfWidth = physics.width / 2;
        const halfHeight = physics.height / 2;
        
        // Left/right boundaries
        if (physics.x - halfWidth <= 0) {
          physics.x = halfWidth;
          physics.vx *= -BOUNCE_DAMPING;
          physics.rotationVelocity += physics.vy * 0.1; // Add spin on bounce
        } else if (physics.x + halfWidth >= containerWidth) {
          physics.x = containerWidth - halfWidth;
          physics.vx *= -BOUNCE_DAMPING;
          physics.rotationVelocity -= physics.vy * 0.1;
        }
        
        // Top/bottom boundaries
        if (physics.y - halfHeight <= 0) {
          physics.y = halfHeight;
          physics.vy *= -BOUNCE_DAMPING;
          physics.rotationVelocity += physics.vx * 0.1;
        } else if (physics.y + halfHeight >= containerHeight) {
          physics.y = containerHeight - halfHeight;
          physics.vy *= -BOUNCE_DAMPING;
          physics.vx *= 0.85; // Ground friction
          physics.rotationVelocity *= 0.9; // Ground rotation damping
          
          // Settle if moving slowly (like Google Gravity)
          if (Math.abs(physics.vy) < MIN_VELOCITY && Math.abs(physics.vx) < MIN_VELOCITY) {
            physics.vy = 0;
            physics.vx *= 0.95;
            physics.settled = Math.abs(physics.vx) < 0.1;
            if (physics.settled) {
              physics.rotationVelocity *= 0.95;
            }
          }
        }
        
        // Enhanced inter-object collisions
        gravityPhysics.forEach((otherPhysics, otherIndex) => {
          if (index === otherIndex || otherPhysics.isDragging) return;
          
          const dx = otherPhysics.x - physics.x;
          const dy = otherPhysics.y - physics.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (physics.width + otherPhysics.width) / 2.5;
          
          if (distance < minDistance && distance > 0) {
            // Separate objects
            const overlap = minDistance - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;
            
            physics.x -= separationX;
            physics.y -= separationY;
            otherPhysics.x += separationX;
            otherPhysics.y += separationY;
            
            // Enhanced collision response with mass consideration
            const totalMass = physics.mass + otherPhysics.mass;
            const relativeVx = otherPhysics.vx - physics.vx;
            const relativeVy = otherPhysics.vy - physics.vy;
            
            const speed = relativeVx * (dx / distance) + relativeVy * (dy / distance);
            
            if (speed > 0) {
              const impulse = 2 * speed / totalMass;
              const impulseX = impulse * (dx / distance);
              const impulseY = impulse * (dy / distance);
              
              physics.vx += impulseX * otherPhysics.mass * BOUNCE_DAMPING;
              physics.vy += impulseY * otherPhysics.mass * BOUNCE_DAMPING;
              otherPhysics.vx -= impulseX * physics.mass * BOUNCE_DAMPING;
              otherPhysics.vy -= impulseY * physics.mass * BOUNCE_DAMPING;
              
              // Add rotational effects from collision
              physics.rotationVelocity += impulseX * 0.2;
              otherPhysics.rotationVelocity -= impulseX * 0.2;
            }
          }
        });
        
        // Update DOM position and rotation
        const halfWidth = physics.width / 2;
        const halfHeight = physics.height / 2;
        
        physics.element.style.left = (physics.x - halfWidth) + 'px';
        physics.element.style.top = (physics.y - halfHeight) + 'px';
        physics.element.style.transform = `rotate(${physics.rotation}deg)`;
      });
      
      requestAnimationFrame(animateGravity);
    };
    
    requestAnimationFrame(animateGravity);
  };

  const resetGravityItems = () => {
    gravityPhysics.forEach((physics) => {
      physics.x = physics.originalX + physics.width / 2;
      physics.y = physics.originalY + physics.height / 2;
      physics.vx = 0;
      physics.vy = 0;
      physics.rotation = 0;
      physics.rotationVelocity = 0;
      physics.settled = false;
      physics.isDragging = false;
      physics.element.classList.remove('dragging');
      physics.element.style.zIndex = '';
      
      // Animate back to original position
      physics.element.style.transition = 'all 0.5s ease';
      physics.element.style.left = physics.originalX + 'px';
      physics.element.style.top = physics.originalY + 'px';
      physics.element.style.transform = 'rotate(0deg)';
      
      setTimeout(() => {
        physics.element.style.transition = '';
      }, 500);
    });
  };

  // Scroll-based section management
  const handleScroll = debounce(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Show curricular section when scrolled past hero
    if (scrollY > windowHeight * 0.5) {
      curricularSection.classList.add('visible');
    }
    
    // Show extracurricular section when scrolled to it
    const extracurricularTop = extracurricularSection.offsetTop;
    if (scrollY + windowHeight >= extracurricularTop - windowHeight * 0.3) {
      extracurricularSection.classList.add('visible');
      }

    // Trigger gravity when the gravity container enters the viewport
    if (!gravityTriggered && gravityContainer) {
      const gravityTop = gravityContainer.offsetTop;
      if (scrollY + windowHeight >= gravityTop) {
        gravityActive = true;
        gravityTriggered = true;
        startGravityPhysics();

      }
    }
    
    updateDividerProgress();
  }, 16);

  // Setup item event listeners
  const setupItemListeners = (item, isExtracurricular = false) => {
    // Set initial ARIA attributes
    item.setAttribute('aria-expanded', 'false');
    
    // Click/touch events
    item.addEventListener('click', (e) => {
      // Prevent navigating via nested links
      if (e.target.tagName === 'A') {
        e.preventDefault();
      }

      if (isMobile()) {
        e.preventDefault();
        toggleMobileInfo(item);
      } else {
        // On desktop, clicking should show info immediately and keep it visible
        showInfo(item, isExtracurricular);
      }
    });
    
    // Keyboard navigation
    item.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (isMobile()) {
            toggleMobileInfo(item);
          } else {
            showInfo(item, isExtracurricular);
          }
          break;
        case 'Escape':
          if (isMobile()) {
            item.classList.remove('expanded');
            item.setAttribute('aria-expanded', 'false');
          } else {
            hideInfo(isExtracurricular, true); // Immediate hiding on escape
          }
          break;
      }
    });
  };

  // Setup all item listeners
  document.querySelectorAll('.curricular-section .item').forEach(item => {
    setupItemListeners(item, false);
  });
  
  document.querySelectorAll('.extracurricular-section .item').forEach(item => {
    setupItemListeners(item, true);
  });

  // Close button functionality
  if (infoClose) {
    infoClose.addEventListener('click', () => hideInfo(false, true));
    infoClose.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hideInfo(false, true);
      }
    });
  }
  
  if (infoExtraClose) {
    infoExtraClose.addEventListener('click', () => hideInfo(true, true));
    infoExtraClose.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hideInfo(true, true);
      }
    });
  }

  // Handle window resize
  const handleResize = debounce(() => {
    adjustInfoLayout();
    updateDividerProgress();
    
    // Reset mobile states on resize
    if (!isMobile()) {
      items.forEach(item => {
        item.classList.remove('expanded');
        item.setAttribute('aria-expanded', 'false');
      });
      // Clear all popups
      activePopups.clear();
      popupTimeouts.forEach(timeout => clearTimeout(timeout));
      popupTimeouts.clear();
      hideInfo(false, true);
      hideInfo(true, true);
    }
  }, 250);

  const dividers = document.querySelectorAll('.divider');
  const eduContainers = document.querySelectorAll('.edu-container');

  const updateDividerProgress = () => {
    dividers.forEach((divider, index) => {
      const container = eduContainers[index];
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const viewport = window.innerHeight;
      let progress = (viewport - rect.top) / (rect.height + viewport);
      
      if (progress < 0) {
        progress = 0;
      } else if (progress > 1) {
        progress = 1;
      }
      
      divider.style.setProperty('--progress', progress);
    });
  };

  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);

  // Intersection Observer for reveal animations
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.item').forEach(el => observer.observe(el));

  // Info layout adjustment
  const adjustInfoLayout = () => {
    [info, infoExtra].forEach(currentInfo => {
      if (!currentInfo || isMobile()) return;
      const imageWrapper = currentInfo.querySelector('[id$="-image-wrapper"]');
      const textWrapper = currentInfo.querySelector('[id$="-text-wrapper"]');
      if (!imageWrapper || !textWrapper) return;
      
      const totalWidth = imageWrapper.offsetWidth + textWrapper.offsetWidth;
      if (totalWidth > window.innerWidth * 0.8) {
        currentInfo.classList.add('stacked');
      } else {
        currentInfo.classList.remove('stacked');
      }
    });
  };

  // Initialize everything
  initializeImages();
  adjustInfoLayout();
  updateDividerProgress();
  
  // Initialize Google Gravity after a delay to ensure DOM is ready
  setTimeout(() => {
    initializeGoogleGravity();
  }, 1000);

  // Handle escape key globally
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (isMobile()) {
        items.forEach(item => {
          item.classList.remove('expanded');
          item.setAttribute('aria-expanded', 'false');
        });
      } else {
        // Clear all popups immediately
        activePopups.clear();
        popupTimeouts.forEach(timeout => clearTimeout(timeout));
        popupTimeouts.clear();
        hideInfo(false, true);
        hideInfo(true, true);
      }
    }
  });
  
  // Back to Top button functionality
  const backToTopButton = document.getElementById('backToTop');
  if (backToTopButton) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });

    backToTopButton.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Add gravity reset button (optional - like Google Gravity)
  const createGravityResetButton = () => {
    const resetButton = document.createElement('button');
    resetButton.innerHTML = '🔄 Reset';
    resetButton.className = 'gravity-reset-button';
    resetButton.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 2rem;
      padding: 0.8rem 1.2rem;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border: none;
      border-radius: 25px;
      cursor: pointer;
      font-size: 0.9rem;
      backdrop-filter: blur(10px);
      z-index: 1000;
      opacity: 0;
      transform: scale(0);
      transition: all 0.3s ease;
    `;
    
    resetButton.addEventListener('click', () => {
      gravityActive = false;
      resetGravityItems();
      setTimeout(() => {
        gravityActive = true;
        startGravityPhysics();
      }, 600);
    });
    
    document.body.appendChild(resetButton);
    
    // Show reset button when gravity is active
    const showResetButton = () => {
      if (gravityActive) {
        resetButton.style.opacity = '1';
        resetButton.style.transform = 'scale(1)';
      }
    };
    
    setTimeout(showResetButton, 2000);
  };
  
  // Create reset button
  createGravityResetButton();
});