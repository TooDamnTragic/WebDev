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
  
  // Scroll-based section visibility
  let extracurricularActivated = false;
  
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

  // Enhanced gravity physics simulation
  const initializeGravity = () => {
    if (isMobile()) return; // Skip gravity on mobile for performance

    const gravityContainer = document.querySelector('.gravity-container');
    if (!gravityContainer) return;

    const containerHeight = gravityContainer.offsetHeight;
    const containerWidth = gravityContainer.offsetWidth;

    // Priority-based z-index assignment
    const priorities = [
      'Wordsmiths Writing Club',
      'Phi Sigma Pi Frat',
      'Global Union',
      'Campus Volunteers',
      'Tech Support Club',
      'Gaming Society',
      'Green Initiative',
      'Photo Club',
      'Event Planning'
    ];

    const activeItems = [];

    gravityItems.forEach((item, index) => {
      // Assign z-index based on priority
      const itemTitle = item.querySelector('h4, h5')?.textContent || '';
      const priorityIndex = priorities.findIndex(p => itemTitle.includes(p.split(' ')[0]));
      const zIndex = priorityIndex !== -1 ? (priorities.length - priorityIndex) * 10 : 5;
      item.style.zIndex = zIndex;

      // Set initial random positions at the top
      const initialX = Math.random() * (containerWidth - 280); // Account for item width
      const initialY = -100 - Math.random() * 200; // Start above container

      // Physics properties with improved values
      const physicsData = {
        x: initialX,
        y: initialY,
        vx: (Math.random() - 0.5) * 6, // Reduced horizontal velocity
        vy: Math.random() * 2 + 1, // Consistent downward velocity
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 4, // Reduced rotation speed
        gravity: 0.4, // Reduced gravity for smoother fall
        bounce: 0.6, // Reduced bounce for more realistic physics
        friction: 0.96, // Increased friction for stability
        groundY: containerHeight - 120, // Account for item height
        width: 280,
        height: 120,
        settled: false
      };

      item.physicsData = physicsData;

      item.style.position = 'absolute';
      item.style.left = physicsData.x + 'px';
      item.style.top = physicsData.y + 'px';
      item.style.transform = `rotate(${physicsData.rotation}deg)`;

      activeItems.push(item);
    });

    const resolveCollisions = () => {
      for (let i = 0; i < activeItems.length; i++) {
        const a = activeItems[i].physicsData;
        if (a.settled) continue;
        
        for (let j = i + 1; j < activeItems.length; j++) {
          const b = activeItems[j].physicsData;
          if (b.settled) continue;
          
          const dx = (a.x + a.width / 2) - (b.x + b.width / 2);
          const dy = (a.y + a.height / 2) - (b.y + b.height / 2);
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = (a.width + b.width) / 3; // Overlap threshold
          
          if (distance < minDistance) {
            const overlap = minDistance - distance;
            const pushX = (dx / distance) * overlap * 0.5;
            const pushY = (dy / distance) * overlap * 0.5;
            
            a.x += pushX;
            a.y += pushY;
            b.x -= pushX;
            b.y -= pushY;
            
            // Exchange some velocity
            const tempVx = a.vx * 0.8;
            const tempVy = a.vy * 0.8;
            a.vx = b.vx * 0.8;
            a.vy = b.vy * 0.8;
            b.vx = tempVx;
            b.vy = tempVy;
          }
        }
      }
    };

    const animateAll = () => {
      activeItems.forEach(item => {
        const physicsData = item.physicsData;
        if (physicsData.settled) return;

        // Apply gravity
        physicsData.vy += physicsData.gravity;

        // Update position
        physicsData.x += physicsData.vx;
        physicsData.y += physicsData.vy;
        physicsData.rotation += physicsData.rotationSpeed;

        // Boundary checks
        if (physicsData.x <= 0) {
          physicsData.x = 0;
          physicsData.vx *= -physicsData.bounce;
        } else if (physicsData.x >= containerWidth - physicsData.width) {
          physicsData.x = containerWidth - physicsData.width;
          physicsData.vx *= -physicsData.bounce;
        }

        // Ground collision
        if (physicsData.y >= physicsData.groundY) {
          physicsData.y = physicsData.groundY;
          physicsData.vy *= -physicsData.bounce;
          physicsData.vx *= physicsData.friction;
          physicsData.rotationSpeed *= physicsData.friction;

          // Settle if moving slowly
          if (Math.abs(physicsData.vy) < 1 && Math.abs(physicsData.vx) < 1) {
            physicsData.vy = 0;
            physicsData.vx = 0;
            physicsData.rotationSpeed *= 0.9;
            
            if (Math.abs(physicsData.rotationSpeed) < 0.5) {
              physicsData.settled = true;
            }
          }
        }

        // Apply air resistance
        physicsData.vx *= 0.999;
        physicsData.rotationSpeed *= 0.999;
      });

      resolveCollisions();

      // Update DOM positions for non-hovered items
      activeItems.forEach(item => {
        const physicsData = item.physicsData;
        if (!item.matches(':hover')) {
          item.style.left = physicsData.x + 'px';
          item.style.top = physicsData.y + 'px';
          item.style.transform = `rotate(${physicsData.rotation}deg)`;
        }
      });

      requestAnimationFrame(animateAll);
    };

    // Start animation after a delay
    setTimeout(() => {
      requestAnimationFrame(animateAll);
    }, 1000);
  };

  // Scroll-based section management
  const handleScroll = debounce(() => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    
    // Show curricular section when scrolled past hero
    if (scrollY > windowHeight * 0.5) {
      curricularSection.classList.add('visible');
    }
    
    // Activate extracurricular overlay when scrolled to bottom of curricular
    const curricularRect = curricularSection.getBoundingClientRect();
    if (curricularRect.bottom <= windowHeight * 0.3 && !extracurricularActivated) {
      extracurricularSection.classList.add('active');
      extracurricularActivated = true;
      
      // Initialize gravity after extracurricular section is visible
      setTimeout(() => {
        initializeGravity();
      }, 800);
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

    item.addEventListener('blur', () => {
      if (!isMobile()) {
        const currentInfo = isExtracurricular ? infoExtra : info;
        // Delay hiding to allow for focus to move to close button
        setTimeout(() => {
          if (!currentInfo.contains(document.activeElement)) {
            hideInfo(isExtracurricular, false);
          }
        }, 100);
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