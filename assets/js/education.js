document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.item');
  const info = document.getElementById('info');
  const infoExtra = document.getElementById('info-extra');
  const infoImage = document.getElementById('info-image');
  const infoText = document.getElementById('info-text');
  const infoExtraImage = document.getElementById('info-extra-image');
  const infoExtraText = document.getElementById('info-extra-text');
  const infoClose = document.getElementById('info-close');
  const infoExtraClose = document.getElementById('info-extra-close');
  const body = document.body;
  const defaultBg = getComputedStyle(body).background;
  
  const gravityItems = document.querySelectorAll('.gravity-item');
  
  // Mobile detection
  const isMobile = () => window.innerWidth <= 768;
  
  // Multiple popup management
  const activePopups = new Set();
  const popupTimeouts = new Map();
  
  // Physics state for window shake detection
  let lastWindowX = window.screenX;
  let lastWindowY = window.screenY;
  let windowShakeIntensity = 0;
  
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
    
    const currentInfo = isExtracurricular ? infoExtra : info;
    const currentInfoImage = isExtracurricular ? infoExtraImage : infoImage;
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

  // Window shake detection
  const detectWindowShake = () => {
    const currentX = window.screenX;
    const currentY = window.screenY;
    
    const deltaX = Math.abs(currentX - lastWindowX);
    const deltaY = Math.abs(currentY - lastWindowY);
    
    // Calculate shake intensity
    const shakeAmount = deltaX + deltaY;
    windowShakeIntensity = Math.min(shakeAmount / 10, 5); // Cap at 5
    
    // Apply shake to gravity items
    if (windowShakeIntensity > 0.5) {
      gravityItems.forEach(item => {
        if (item.physicsData) {
          // Add random velocity based on shake intensity
          item.physicsData.vx += (Math.random() - 0.5) * windowShakeIntensity;
          item.physicsData.vy += (Math.random() - 0.5) * windowShakeIntensity;
          item.physicsData.rotationSpeed += (Math.random() - 0.5) * windowShakeIntensity;
        }
      });
    }
    
    // Decay shake intensity
    windowShakeIntensity *= 0.9;
    
    lastWindowX = currentX;
    lastWindowY = currentY;
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
      const initialX = Math.random() * (containerWidth - item.offsetWidth);
      const initialY = -200 - Math.random() * 400; // Start well above container

      // Physics properties
      const physicsData = {
        x: initialX,
        y: initialY,
        vx: (Math.random() - 0.5) * 10,
        vy: Math.random() * 4,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.6,
        bounce: 0.8,
        friction: 0.94,
        groundY: containerHeight - item.offsetHeight - 20,
        width: item.offsetWidth,
        height: item.offsetHeight
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
        for (let j = i + 1; j < activeItems.length; j++) {
          const b = activeItems[j].physicsData;
          if (
            a.x < b.x + b.width &&
            a.x + a.width > b.x &&
            a.y < b.y + b.height &&
            a.y + a.height > b.y
          ) {
            const overlapX = (a.width + b.width) / 2 - Math.abs(a.x + a.width / 2 - (b.x + b.width / 2));
            const overlapY = (a.height + b.height) / 2 - Math.abs(a.y + a.height / 2 - (b.y + b.height / 2));

            if (overlapX > 0 && overlapY > 0) {
              if (overlapX < overlapY) {
                const push = overlapX / 2;
                if (a.x < b.x) {
                  a.x -= push;
                  b.x += push;
                } else {
                  a.x += push;
                  b.x -= push;
                }
                const temp = a.vx;
                a.vx = b.vx;
                b.vx = temp;
              } else {
                const push = overlapY / 2;
                if (a.y < b.y) {
                  a.y -= push;
                  b.y += push;
                } else {
                  a.y += push;
                  b.y -= push;
                }
                const temp = a.vy;
                a.vy = b.vy;
                b.vy = temp;
              }
            }
          }
        }
      }
    };

    const animateAll = () => {
      activeItems.forEach(item => {
        const physicsData = item.physicsData;

        physicsData.vy += physicsData.gravity;

        physicsData.x += physicsData.vx;
        physicsData.y += physicsData.vy;
        physicsData.rotation += physicsData.rotationSpeed;

        if (physicsData.x <= 0 || physicsData.x >= containerWidth - physicsData.width) {
          physicsData.vx *= -physicsData.bounce;
          physicsData.x = Math.max(0, Math.min(containerWidth - physicsData.width, physicsData.x));
        }

        if (physicsData.y >= physicsData.groundY) {
          physicsData.vy *= -physicsData.bounce;
          physicsData.vx *= physicsData.friction;
          physicsData.rotationSpeed *= physicsData.friction;
          physicsData.y = physicsData.groundY;

          if (Math.abs(physicsData.vy) < 2) {
            physicsData.vy = 0;
          }
        }
      });

      resolveCollisions();

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

    requestAnimationFrame(animateAll);

    // Start window shake detection
    const shakeLoop = () => {
      detectWindowShake();
      requestAnimationFrame(shakeLoop);
    };
    requestAnimationFrame(shakeLoop);
  };

  // Setup item event listeners
  const setupItemListeners = (item, isExtracurricular = false) => {
    // Set initial ARIA attributes
    item.setAttribute('aria-expanded', 'false');
    
    // Mouse events (desktop only)
    item.addEventListener('mouseenter', () => {
      if (!isMobile()) {
        showInfo(item, isExtracurricular);
      }
    });
    
    item.addEventListener('mouseleave', () => {
      if (!isMobile()) {
        hideInfo(isExtracurricular, false); // Use delayed hiding
      }
    });
    
    // Click/touch events
    item.addEventListener('click', (e) => {
      // Don't trigger if clicking on a link
      if (e.target.tagName === 'A') return;
      
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
    
    // Focus events for keyboard navigation
    item.addEventListener('focus', () => {
      if (!isMobile()) {
        showInfo(item, isExtracurricular);
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

  // Show content after initial load
  setTimeout(() => {
    document.body.classList.add('show-content');
    // Initialize gravity after content is shown
    setTimeout(() => {
      initializeGravity();
    }, 500);
  }, 1000);

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

  window.addEventListener('scroll', debounce(updateDividerProgress, 16));
  window.addEventListener('resize', handleResize);
  updateDividerProgress();

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