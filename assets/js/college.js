document.addEventListener('DOMContentLoaded', () => {
  // Elements
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

  const curricularSection = document.getElementById('curricular-section');
  const extracurricularSection = document.getElementById('extracurricular-section');
  const adjustHeadingSizes = () => {
    document.querySelectorAll('.edu-container .item').forEach(item => {
      const heading = item.querySelector('h2, h3, h4, h5');
      if (!heading) return;

      const container = item.querySelector('.card-container') || item;
      const computed = getComputedStyle(container);
      const containerWidth = container.clientWidth -
        parseFloat(computed.paddingLeft || 0) -
        parseFloat(computed.paddingRight || 0);

      let size = 3.2; // start large
      const min = 1.2;
      heading.style.fontSize = `${size}rem`;
      heading.style.lineHeight = '1.2';
      heading.style.letterSpacing = '0.05em';

      while (heading.scrollWidth > containerWidth && size > min) {
        size -= 0.05;
        heading.style.fontSize = `${size}rem`;
      }
    });
  };


  // Enhanced font cycling effect for hero title - Mouse movement-based randomization
  const heroTitles = document.querySelectorAll('.college-hero .hero-title');
  
  // All available fonts from the fonts folder with adjusted scale values to prevent clipping
  const fontConfig = [
    { name: 'Hackney', scale: 1 },
    { name: 'DTGetai', scale: 0.95 }, 
    { name: 'Asember', scale: 0.9 },
    { name: 'Savate', scale: 1 },
    { name: 'Iconic', scale: 1 },
    { name: 'Catrose', scale: 0.95 },
    { name: 'Beautyful', scale: 1 },
    { name: 'Runtime', scale: 1 },
    { name: 'Arshine', scale: 1 },
    { name: 'Sophiamelanieregular', scale: 0.85 },
    { name: 'Crackchakingtrialregular', scale: 0.95 },
    { name: 'Johnfoster', scale: 1 },
    { name: 'Motterdam', scale: 1 },
    { name: 'Sacloud', scale: 0.95 },
    { name: 'Tfwanderclouddemo', scale: 1 }
  ];

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const wrapLettersInSpans = (element) => {
    const text = element.textContent;
    const wrappedText = text.split('').map(char => {
      if (char === ' ') {
        return ' ';
      }
      return `<span class="letter" style="display: inline-block;">${char}</span>`;
    }).join('');
    element.innerHTML = wrappedText;
    return element.querySelectorAll('.letter');
  };

  const applyFontToLetter = (letterElement, fontConfig) => {
    const fontName = fontConfig.name;
    const scale = fontConfig.scale;
    letterElement.style.fontFamily = `'${fontName}', sans-serif`;
    letterElement.style.setProperty('--letter-scale', scale);
    letterElement.setAttribute('data-font', fontName);
    letterElement.style.transition = 'all 0.3s ease';
  };

  const randomizeLetter = (letterElement, letterIndex, currentFonts) => {
    const randomFontConfig = fontConfig[Math.floor(Math.random() * fontConfig.length)];
    applyFontToLetter(letterElement, randomFontConfig);
    currentFonts[letterIndex] = randomFontConfig;
  };

  const calculateMouseSpeed = (currentX, currentY, lastMouse) => {
    const deltaX = Math.abs(currentX - lastMouse.x);
    const deltaY = Math.abs(currentY - lastMouse.y);
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    lastMouse.x = currentX;
    lastMouse.y = currentY;
    return distance;
  };

  const initHeroTitle = (heroTitle) => {
    let randomizeInterval;
    const letterElements = wrapLettersInSpans(heroTitle);
    const currentFonts = new Array(letterElements.length);
    const lastMouse = { x: 0, y: 0 };
    let mouseMovementTimeout;
    let isMouseMoving = false;
    let isHovering = false;

    const startRandomAppearance = () => {
      const appearanceOrder = shuffleArray([...Array(letterElements.length).keys()]);
      appearanceOrder.forEach((letterIndex, sequenceIndex) => {
        const randomFontConfig = fontConfig[Math.floor(Math.random() * fontConfig.length)];
        applyFontToLetter(letterElements[letterIndex], randomFontConfig);
        currentFonts[letterIndex] = randomFontConfig;
        setTimeout(() => {
          letterElements[letterIndex].classList.add('appear');
        }, sequenceIndex * 150);
      });
    };

    const startMouseRandomization = () => {
      if (randomizeInterval) {
        clearInterval(randomizeInterval);
      }
      randomizeInterval = setInterval(() => {
        if (isMouseMoving && isHovering) {
          const numLettersToRandomize = Math.floor(Math.random() * 3) + 2;
          const lettersToRandomize = [];
          for (let i = 0; i < numLettersToRandomize && i < letterElements.length; i++) {
            const randomIndex = Math.floor(Math.random() * letterElements.length);
            if (!lettersToRandomize.includes(randomIndex)) {
              lettersToRandomize.push(randomIndex);
            }
          }
          lettersToRandomize.forEach(index => {
            randomizeLetter(letterElements[index], index, currentFonts);
          });
        }
      }, 150);
    };

    const stopRandomizing = () => {
      if (randomizeInterval) {
        clearInterval(randomizeInterval);
        randomizeInterval = null;
      }
    };

    const handleMouseMovement = (e) => {
      if (!isHovering) return;
      const rect = heroTitle.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      const speed = calculateMouseSpeed(currentX, currentY, lastMouse);
      if (speed > 1) {
        isMouseMoving = true;
        if (mouseMovementTimeout) clearTimeout(mouseMovementTimeout);
        mouseMovementTimeout = setTimeout(() => {
          isMouseMoving = false;
        }, 100);
      }
    };

    setTimeout(startRandomAppearance, 1000);

    heroTitle.addEventListener('mouseenter', (e) => {
      isHovering = true;
      const rect = heroTitle.getBoundingClientRect();
      lastMouse.x = e.clientX - rect.left;
      lastMouse.y = e.clientY - rect.top;
      startMouseRandomization();
    });

    heroTitle.addEventListener('mousemove', handleMouseMovement);

    heroTitle.addEventListener('mouseleave', () => {
      isHovering = false;
      isMouseMoving = false;
      if (mouseMovementTimeout) clearTimeout(mouseMovementTimeout);
      stopRandomizing();
    });

    heroTitle.addEventListener('click', () => {
      if (!isHovering) {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const numLettersToRandomize = Math.floor(Math.random() * 4) + 2;
            const lettersToRandomize = [];
            for (let j = 0; j < numLettersToRandomize && j < letterElements.length; j++) {
              const randomIndex = Math.floor(Math.random() * letterElements.length);
              if (!lettersToRandomize.includes(randomIndex)) {
                lettersToRandomize.push(randomIndex);
              }
            }
            lettersToRandomize.forEach(index => {
              randomizeLetter(letterElements[index], index, currentFonts);
            });
          }, i * 200);
        }
      }
    });
  };

  heroTitles.forEach(initHeroTitle);

  // ProfileCard-style tilt effect for college items
  const initializeProfileCardEffects = () => {
    const ANIMATION_CONFIG = {
      SMOOTH_DURATION: 600,
      INITIAL_DURATION: 1500,
      INITIAL_X_OFFSET: 70,
      INITIAL_Y_OFFSET: 60,
    };

    const clamp = (value, min = 0, max = 100) =>
      Math.min(Math.max(value, min), max);

    const round = (value, precision = 3) =>
      parseFloat(value.toFixed(precision));

    const adjust = (value, fromMin, fromMax, toMin, toMax) =>
      round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));

    const easeInOutCubic = (x) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    items.forEach((item) => {
      // Wrap content in card container
      const content = item.innerHTML;
      item.innerHTML = `<div class="card-container"><div class="card-content">${content}</div></div>`;
      
      const cardContainer = item.querySelector('.card-container');
      let rafId = null;

      const updateCardTransform = (offsetX, offsetY) => {
        const width = cardContainer.clientWidth;
        const height = cardContainer.clientHeight;

        const percentX = clamp((100 / width) * offsetX);
        const percentY = clamp((100 / height) * offsetY);

        const centerX = percentX - 50;
        const centerY = percentY - 50;

        const properties = {
          "--pointer-x": `${percentX}%`,
          "--pointer-y": `${percentY}%`,
          "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
          "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
          "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
          "--pointer-from-top": `${percentY / 100}`,
          "--pointer-from-left": `${percentX / 100}`,
          "--rotate-x": `${round(-(centerX / 5))}deg`,
          "--rotate-y": `${round(centerY / 4)}deg`,
        };

        Object.entries(properties).forEach(([property, value]) => {
          item.style.setProperty(property, value);
        });
      };

      const createSmoothAnimation = (duration, startX, startY) => {
        const startTime = performance.now();
        const targetX = item.clientWidth / 2;
        const targetY = item.clientHeight / 2;

        const animationLoop = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = clamp(elapsed / duration);
          const easedProgress = easeInOutCubic(progress);

          const currentX = adjust(easedProgress, 0, 1, startX, targetX);
          const currentY = adjust(easedProgress, 0, 1, startY, targetY);

          updateCardTransform(currentX, currentY);

          if (progress < 1) {
            rafId = requestAnimationFrame(animationLoop);
          }
        };

        rafId = requestAnimationFrame(animationLoop);
      };

      const cancelAnimation = () => {
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };

      const handlePointerMove = (event) => {
        const rect = cardContainer.getBoundingClientRect();
        updateCardTransform(
          event.clientX - rect.left,
          event.clientY - rect.top
        );
      };

      const handlePointerEnter = () => {
        cancelAnimation();
        item.classList.add('active');
        cardContainer.classList.add('active');
      };

      const handlePointerLeave = (event) => {
        const rect = cardContainer.getBoundingClientRect();
        createSmoothAnimation(
          ANIMATION_CONFIG.SMOOTH_DURATION,
          event.clientX - rect.left,
          event.clientY - rect.top
        );
        item.classList.remove('active');
        cardContainer.classList.remove('active');
      };

      // Add event listeners
      cardContainer.addEventListener('pointerenter', handlePointerEnter);
      cardContainer.addEventListener('pointermove', handlePointerMove);
      cardContainer.addEventListener('pointerleave', handlePointerLeave);

      // Initial animation with different positions for each card
      let initialX, initialY;
      
      // Get the card's data attribute to identify it
      const cardType = item.getAttribute('data-card');
      
      // Set different initial positions based on card type
      switch(cardType) {
        case 'rit':
          initialX = item.clientWidth - 50;
          initialY = 40;
          break;
        case 'honors':
          initialX = 60;
          initialY = item.clientHeight - 80;
          break;
        case 'cybersecurity':
          initialX = item.clientWidth - 90;
          initialY = item.clientHeight - 50;
          break;
        case 'math':
          // Copy positioning from cybersecurity card for more randomness
          initialX = item.clientWidth - 90;
          initialY = item.clientHeight - 50;
          break;
        case 'sysadmin':
          initialX = 80;
          initialY = 60;
          break;
        default:
          initialX = item.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
          initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;
      }

      updateCardTransform(initialX, initialY);
      createSmoothAnimation(
        ANIMATION_CONFIG.INITIAL_DURATION,
        initialX,
        initialY
      );
    });
  };

  // Initialize ProfileCard effects
   const initializeTitlePressure = () => {
    document.querySelectorAll('.edu-container .item').forEach(item => {
      const cardContainer = item.querySelector('.card-container');
      const heading = item.querySelector('h2, h3, h4, h5');
      if (!cardContainer || !heading) return;

      const text = heading.textContent.trim();
      heading.textContent = '';
      const spans = [];
      text.split('').forEach(char => {
        const span = document.createElement('span');
        span.className = 'item-title-char';
        span.textContent = char;
        heading.appendChild(span);
        spans.push(span);
      });

      const updateChars = (e) => {
        const rect = cardContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const maxDist = Math.hypot(rect.width, rect.height) / 2;

        spans.forEach(span => {
          const sRect = span.getBoundingClientRect();
          const cx = sRect.left - rect.left + sRect.width / 2;
          const cy = sRect.top - rect.top + sRect.height / 2;
          const dist = Math.hypot(x - cx, y - cy);
          const scale = 1 + Math.max(0, (maxDist - dist) / maxDist) * 0.5;
          span.style.transform = `scale(${scale})`;
        });
      };

      const resetChars = () => {
        spans.forEach(span => {
          span.style.transform = 'scale(1)';
        });
      };

      cardContainer.addEventListener('pointermove', updateChars);
      cardContainer.addEventListener('pointerleave', resetChars);
    });
  };
   setTimeout(() => {
    initializeProfileCardEffects();
    adjustHeadingSizes();
    initializeTitlePressure();
  }, 500);

  window.addEventListener('resize', adjustHeadingSizes);
  
  // Mobile detection
  const isMobile = () => window.innerWidth <= 768;
  
  // Multiple popup management
  const activePopups = new Set();
  const popupTimeouts = new Map();
  
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
        // Match popup background to item color
    if (color) {
      currentInfo.querySelectorAll('.popup').forEach(p => {
        p.style.background = `linear-gradient(135deg, ${color}, #212427)`;
      });
    }
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
    
    updateDividerProgress();
  }, 16);

  // Setup item event listeners
  const setupItemListeners = (item, isExtracurricular = false) => {
    // Set initial ARIA attributes
    item.setAttribute('aria-expanded', 'false');
    
    // Hover interactions
    item.addEventListener('mouseenter', () => {
      if (!isMobile()) {
        showInfo(item, isExtracurricular);
      }
    });
    item.addEventListener('mouseleave', () => {
      if (!isMobile()) {
        hideInfo(isExtracurricular);
      }
    });

    // Click/touch events
    item.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        return;
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
      if (e.target.tagName === 'A') return;
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

    const setupInfoHoverListeners = (infoElement, isExtracurricular = false) => {
    if (!infoElement) return;
    const popupId = isExtracurricular ? 'extra' : 'main';

    infoElement.addEventListener('mouseenter', () => {
      if (popupTimeouts.has(popupId)) {
        clearTimeout(popupTimeouts.get(popupId));
        popupTimeouts.delete(popupId);
      }
    });

    infoElement.addEventListener('mouseleave', () => {
      hideInfo(isExtracurricular);
    });
  };
  // Setup all item listeners
  document.querySelectorAll('.curricular-section .item').forEach(item => {
    setupItemListeners(item, false);
  });
  

  setupInfoHoverListeners(info, false);
  setupInfoHoverListeners(infoExtra, true);

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
});