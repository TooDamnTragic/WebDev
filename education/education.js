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
  
  // Hover timeout management
  let hoverTimeout = null;
  let currentHoveredItem = null;
  
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

  // Show info function with improved timing
  const showInfo = (item, isExtracurricular = false) => {
    if (isMobile()) return; // Skip on mobile
    
    const img = item.getAttribute('data-image');
    const text = item.getAttribute('data-text');
    const color = item.getAttribute('data-color');
    
    const currentInfo = isExtracurricular ? infoExtra : info;
    const currentInfoImage = isExtracurricular ? infoExtraImage : infoImage;
    const currentInfoText = isExtracurricular ? infoExtraText : infoText;
    
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    
    currentHoveredItem = item;
    
    if (img) {
      const skeleton = currentInfo.querySelector('.image-skeleton');
      if (skeleton) {
        skeleton.style.display = 'block';
      }
      currentInfoImage.style.opacity = '0';
      currentInfoImage.src = img;
    }
    
    if (text) currentInfoText.textContent = text;
    
    if (color) {
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

  // Hide info function with delay
  const hideInfo = (isExtracurricular = false, immediate = false) => {
    if (isMobile()) return; // Skip on mobile
    
    const currentInfo = isExtracurricular ? infoExtra : info;
    
    if (immediate) {
      // Clear any existing timeout
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      
      currentInfo.classList.remove('visible');
      currentInfo.classList.remove('right');
      void currentInfo.offsetWidth;
      body.classList.remove('dimmed');
      body.style.background = defaultBg;
      currentHoveredItem = null;
    } else {
      // Set timeout for delayed hiding
      hoverTimeout = setTimeout(() => {
        currentInfo.classList.remove('visible');
        currentInfo.classList.remove('right');
        void currentInfo.offsetWidth;
        body.classList.remove('dimmed');
        body.style.background = defaultBg;
        currentHoveredItem = null;
        hoverTimeout = null;
      }, 2000); // 2 second delay
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

  // Gravity physics simulation
  const initializeGravity = () => {
    if (isMobile()) return; // Skip gravity on mobile for performance
    
    const gravityContainer = document.querySelector('.gravity-container');
    if (!gravityContainer) return;
    
    const containerRect = gravityContainer.getBoundingClientRect();
    const containerHeight = gravityContainer.offsetHeight;
    const containerWidth = gravityContainer.offsetWidth;
    
    gravityItems.forEach((item, index) => {
      // Set initial random positions at the top
      const initialX = Math.random() * (containerWidth - 280);
      const initialY = -150 - Math.random() * 300; // Start well above container
      
      // Physics properties
      let x = initialX;
      let y = initialY;
      let vx = (Math.random() - 0.5) * 8; // Random horizontal velocity
      let vy = Math.random() * 3; // Small initial downward velocity
      let rotation = Math.random() * 360;
      let rotationSpeed = (Math.random() - 0.5) * 8;
      
      const gravity = 0.5;
      const bounce = 0.75;
      const friction = 0.92;
      const groundY = containerHeight - item.offsetHeight - 20; // Ground level
      
      // Set initial position
      item.style.position = 'absolute';
      item.style.left = x + 'px';
      item.style.top = y + 'px';
      item.style.transform = `rotate(${rotation}deg)`;
      item.style.zIndex = Math.floor(Math.random() * 10) + 1;
      
      // Add some delay before starting animation
      setTimeout(() => {
        const animate = () => {
          // Apply gravity
          vy += gravity;
          
          // Update position
          x += vx;
          y += vy;
          rotation += rotationSpeed;
          
          // Bounce off walls
          if (x <= 0 || x >= containerWidth - item.offsetWidth) {
            vx *= -bounce;
            x = Math.max(0, Math.min(containerWidth - item.offsetWidth, x));
          }
          
          // Bounce off ground
          if (y >= groundY) {
            vy *= -bounce;
            vx *= friction;
            rotationSpeed *= friction;
            y = groundY;
            
            // Stop bouncing when velocity is very low
            if (Math.abs(vy) < 1.5) {
              vy = 0;
            }
          }
          
          // Apply position and rotation
          item.style.left = x + 'px';
          item.style.top = y + 'px';
          item.style.transform = `rotate(${rotation}deg)`;
          
          // Continue animation if still moving
          if (Math.abs(vx) > 0.2 || Math.abs(vy) > 0.2 || y < groundY) {
            requestAnimationFrame(animate);
          }
        };
        
        requestAnimationFrame(animate);
      }, index * 400 + Math.random() * 1500); // Staggered start times
    });
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
        hideInfo(false, true);
        hideInfo(true, true);
      }
    }
  });
});