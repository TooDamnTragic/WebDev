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
  
  // Mobile detection
  const isMobile = () => window.innerWidth <= 768;
  
  // Multiple popup management
  const activePopups = new Set();
  const popupTimeouts = new Map();
  
  // Google Gravity Physics System
  let gravityActive = false;
  let gravityButton = null;
  const gravityPhysics = [];
  let mouseX = 0;
  let mouseY = 0;
  let draggedItem = null;
  let dragOffset = { x: 0, y: 0 };
  
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

  // Google Gravity Physics Implementation
  const initializeGoogleGravity = () => {
    if (isMobile()) return; // Skip gravity on mobile for performance

    const gravityContainer = document.querySelector('.gravity-container');
    if (!gravityContainer) return;

    // Create gravity toggle button
    gravityButton = document.createElement('button');
    gravityButton.className = 'gravity-toggle';
    gravityButton.innerHTML = '🌍';
    gravityButton.title = 'Toggle Gravity';
    document.body.appendChild(gravityButton);

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
        mass: 1,
        originalX: rect.left - containerRect.left,
        originalY: rect.top - containerRect.top,
        isDragging: false,
        settled: false
      };
      
      gravityPhysics[index] = physics;
      
      // Set initial position
      item.style.position = 'absolute';
      item.style.left = physics.originalX + 'px';
      item.style.top = physics.originalY + 'px';
    });

    // Gravity toggle functionality
    gravityButton.addEventListener('click', () => {
      gravityActive = !gravityActive;
      gravityButton.classList.toggle('active', gravityActive);
      
      if (gravityActive) {
        gravityButton.innerHTML = '🔴';
        gravityButton.title = 'Stop Gravity';
        startGravityPhysics();
      } else {
        gravityButton.innerHTML = '🌍';
        gravityButton.title = 'Start Gravity';
        resetGravityItems();
      }
    });

    // Mouse/touch event handlers for dragging
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

    document.addEventListener('mousemove', (e) => {
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
    
    // Calculate offset from element center
    dragOffset.x = clientX - (containerRect.left + physics.x);
    dragOffset.y = clientY - (containerRect.top + physics.y);
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
    
    // Add some velocity based on drag movement
    physics.vx = (mouseX - physics.x) * 0.1;
    physics.vy = (mouseY - physics.y) * 0.1;
    
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
        
        // Apply gravity
        physics.vy += 0.5; // Gravity strength
        
        // Update position
        physics.x += physics.vx;
        physics.y += physics.vy;
        
        // Boundary collisions
        const halfWidth = physics.width / 2;
        const halfHeight = physics.height / 2;
        
        // Left/right boundaries
        if (physics.x - halfWidth <= 0) {
          physics.x = halfWidth;
          physics.vx *= -0.7; // Bounce with energy loss
        } else if (physics.x + halfWidth >= containerWidth) {
          physics.x = containerWidth - halfWidth;
          physics.vx *= -0.7;
        }
        
        // Top/bottom boundaries
        if (physics.y - halfHeight <= 0) {
          physics.y = halfHeight;
          physics.vy *= -0.7;
        } else if (physics.y + halfHeight >= containerHeight) {
          physics.y = containerHeight - halfHeight;
          physics.vy *= -0.7;
          physics.vx *= 0.9; // Friction on ground
          
          // Settle if moving slowly
          if (Math.abs(physics.vy) < 1 && Math.abs(physics.vx) < 1) {
            physics.vy = 0;
            physics.vx *= 0.95;
            physics.settled = Math.abs(physics.vx) < 0.1;
          }
        }
        
        // Inter-object collisions
        gravityPhysics.forEach((otherPhysics, otherIndex) => {
          if (index === otherIndex || otherPhysics.isDragging) return;
          
          const dx = otherPhysics.x - physics.x;
          const dy = otherPhysics.y - physics.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (physics.width + otherPhysics.width) / 3;
          
          if (distance < minDistance && distance > 0) {
            // Separate objects
            const overlap = minDistance - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;
            
            physics.x -= separationX;
            physics.y -= separationY;
            otherPhysics.x += separationX;
            otherPhysics.y += separationY;
            
            // Exchange velocities (simplified collision)
            const tempVx = physics.vx * 0.8;
            const tempVy = physics.vy * 0.8;
            physics.vx = otherPhysics.vx * 0.8;
            physics.vy = otherPhysics.vy * 0.8;
            otherPhysics.vx = tempVx;
            otherPhysics.vy = tempVy;
          }
        });
        
        // Update DOM position
        physics.element.style.left = (physics.x - halfWidth) + 'px';
        physics.element.style.top = (physics.y - halfHeight) + 'px';
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
      physics.settled = false;
      physics.isDragging = false;
      physics.element.classList.remove('dragging');
      
      // Animate back to original position
      physics.element.style.transition = 'all 0.5s ease';
      physics.element.style.left = physics.originalX + 'px';
      physics.element.style.top = physics.originalY + 'px';
      
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
      
      // Show gravity button when extracurricular section is visible
      if (gravityButton && !isMobile()) {
        gravityButton.classList.add('visible');
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
});