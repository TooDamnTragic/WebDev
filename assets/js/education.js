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
  
  // Matter.js Physics System
  let matterEngine = null;
  let matterRender = null;
  let matterRunner = null;
  let matterMouseConstraint = null;
  let gravityActive = false;
  let gravityTriggered = false;
  let gravityBodies = [];
  let gravityElements = [];
  
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

  // Matter.js Falling Text Physics Implementation
  const initializeMatterJSGravity = () => {
    if (isMobile()) return; // Skip gravity on mobile for performance
    if (!gravityContainer || !window.Matter) return;

    const { Engine, Render, World, Bodies, Runner, Mouse, MouseConstraint, Body } = Matter;

    // Get container dimensions
    const containerRect = gravityContainer.getBoundingClientRect();
    const containerWidth = gravityContainer.offsetWidth;
    const containerHeight = gravityContainer.offsetHeight;

    // Create engine
    matterEngine = Engine.create();
    matterEngine.world.gravity.y = 0.56; // Match the component's gravity

    // Create renderer (invisible for our custom rendering)
    matterRender = Render.create({
      element: gravityContainer,
      engine: matterEngine,
      options: {
        width: containerWidth,
        height: containerHeight,
        background: 'transparent',
        wireframes: false,
        showVelocity: false,
        showAngleIndicator: false,
        showDebug: false,
        visible: false
      }
    });

    // Hide the Matter.js canvas
    if (matterRender.canvas) {
      matterRender.canvas.style.display = 'none';
    }

    // Create boundaries
    const boundaryOptions = {
      isStatic: true,
      render: { fillStyle: 'transparent' }
    };

    const floor = Bodies.rectangle(containerWidth / 2, containerHeight + 25, containerWidth, 50, boundaryOptions);
    const leftWall = Bodies.rectangle(-25, containerHeight / 2, 50, containerHeight, boundaryOptions);
    const rightWall = Bodies.rectangle(containerWidth + 25, containerHeight / 2, 50, containerHeight, boundaryOptions);
    const ceiling = Bodies.rectangle(containerWidth / 2, -25, containerWidth, 50, boundaryOptions);

    // Create physics bodies for gravity items
    gravityBodies = [];
    gravityElements = [];

    gravityItems.forEach((item, index) => {
      const rect = item.getBoundingClientRect();
      const containerRect = gravityContainer.getBoundingClientRect();
      
      // Calculate position relative to container
      const x = rect.left - containerRect.left + rect.width / 2;
      const y = rect.top - containerRect.top + rect.height / 2;

      // Create physics body
      const body = Bodies.rectangle(x, y, rect.width, rect.height, {
        render: { fillStyle: 'transparent' },
        restitution: 0.8,
        frictionAir: 0.01,
        friction: 0.2,
        density: 0.001
      });

      // Add initial random velocity
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 5,
        y: 0
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.05);

      gravityBodies.push(body);
      gravityElements.push({
        element: item,
        body: body,
        originalX: rect.left - containerRect.left,
        originalY: rect.top - containerRect.top
      });

      // Set initial positioning
      item.style.position = 'absolute';
      item.style.left = `${x - rect.width / 2}px`;
      item.style.top = `${y - rect.height / 2}px`;
      item.style.transformOrigin = 'center center';
    });

    // Create mouse constraint
    const mouse = Mouse.create(gravityContainer);
    matterMouseConstraint = MouseConstraint.create(matterEngine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.9, // Match mouseConstraintStiffness
        render: { visible: false }
      }
    });

    // Add all bodies to world
    World.add(matterEngine.world, [
      floor,
      leftWall,
      rightWall,
      ceiling,
      matterMouseConstraint,
      ...gravityBodies
    ]);

    // Create runner
    matterRunner = Runner.create();
    Runner.run(matterRunner, matterEngine);
    Render.run(matterRender);

    // Update loop to sync DOM elements with physics bodies
    const updateLoop = () => {
      if (!gravityActive) return;

      gravityElements.forEach(({ element, body }) => {
        const { x, y } = body.position;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.transform = `translate(-50%, -50%) rotate(${body.angle}rad)`;
      });

      requestAnimationFrame(updateLoop);
    };

    updateLoop();
  };

  const startMatterJSGravity = () => {
    if (!matterEngine) {
      initializeMatterJSGravity();
    }
    gravityActive = true;
  };

  const resetMatterJSGravity = () => {
    if (!matterEngine) return;

    gravityElements.forEach(({ element, body, originalX, originalY }) => {
      // Reset physics body
      Body.setPosition(body, { x: originalX + element.offsetWidth / 2, y: originalY + element.offsetHeight / 2 });
      Body.setVelocity(body, { x: 0, y: 0 });
      Body.setAngularVelocity(body, 0);
      Body.setAngle(body, 0);

      // Add small random initial velocity
      Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 3,
        y: 0
      });
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.03);

      // Reset DOM element with animation
      element.style.transition = 'all 0.5s ease';
      element.style.left = `${originalX}px`;
      element.style.top = `${originalY}px`;
      element.style.transform = 'rotate(0deg)';
      
      setTimeout(() => {
        element.style.transition = '';
      }, 500);
    });
  };

  const destroyMatterJSGravity = () => {
    if (matterRender) {
      Render.stop(matterRender);
      if (matterRender.canvas && matterRender.canvas.parentNode) {
        matterRender.canvas.parentNode.removeChild(matterRender.canvas);
      }
    }
    if (matterRunner) {
      Runner.stop(matterRunner);
    }
    if (matterEngine) {
      World.clear(matterEngine.world);
      Engine.clear(matterEngine);
    }
    
    matterEngine = null;
    matterRender = null;
    matterRunner = null;
    matterMouseConstraint = null;
    gravityBodies = [];
    gravityElements = [];
    gravityActive = false;
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
        gravityTriggered = true;
        // Load Matter.js if not already loaded
        if (!window.Matter) {
          loadMatterJS().then(() => {
            startMatterJSGravity();
          });
        } else {
          startMatterJSGravity();
        }
      }
    }
    
    updateDividerProgress();
  }, 16);

  // Load Matter.js dynamically
  const loadMatterJS = () => {
    return new Promise((resolve, reject) => {
      if (window.Matter) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
      script.onload = () => {
        console.log('Matter.js loaded successfully');
        resolve();
      };
      script.onerror = () => {
        console.error('Failed to load Matter.js');
        reject();
      };
      document.head.appendChild(script);
    });
  };

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

    // Reinitialize Matter.js on resize if active
    if (gravityActive && !isMobile()) {
      destroyMatterJSGravity();
      setTimeout(() => {
        initializeMatterJSGravity();
      }, 100);
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

  // Create gravity reset button
  const createGravityResetButton = () => {
    const resetButton = document.createElement('button');
    resetButton.innerHTML = '🔄 Reset Gravity';
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
      resetMatterJSGravity();
    });
    
    document.body.appendChild(resetButton);
    
    // Show reset button when gravity is active
    const showResetButton = () => {
      if (gravityActive && gravityTriggered) {
        resetButton.style.opacity = '1';
        resetButton.style.transform = 'scale(1)';
      }
    };
    
    setTimeout(showResetButton, 3000);
  };

  // Initialize everything
  initializeImages();
  adjustInfoLayout();
  updateDividerProgress();

  // Create reset button
  createGravityResetButton();

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

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    destroyMatterJSGravity();
  });
});