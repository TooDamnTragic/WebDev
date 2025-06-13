document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.item');
  const info = document.getElementById('info');
  const infoImage = document.getElementById('info-image');
  const infoText = document.getElementById('info-text');
  const infoClose = document.getElementById('info-close');
  const body = document.body;
  const defaultBg = getComputedStyle(body).background;
  
  // Tab functionality
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  // Mobile detection
  const isMobile = () => window.innerWidth <= 768;
  
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
    // Desktop info panel image
    const infoImageSkeleton = document.querySelector('#info-image-wrapper .image-skeleton');
    if (infoImageSkeleton) {
      handleImageLoad(infoImage, infoImageSkeleton);
    }
    
    // Mobile images
    document.querySelectorAll('.mobile-image').forEach(img => {
      const skeleton = img.parentElement.querySelector('.image-skeleton');
      if (skeleton) {
        handleImageLoad(img, skeleton);
      }
    });
  };

  // Tab switching functionality
  const switchTab = (targetTabId) => {
    tabButtons.forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    
    tabContents.forEach(content => {
      content.classList.remove('active');
    });
    
    const activeButton = document.getElementById(`tab-${targetTabId}`);
    const activeContent = document.getElementById(targetTabId);
    
    if (activeButton && activeContent) {
      activeButton.classList.add('active');
      activeButton.setAttribute('aria-selected', 'true');
      activeContent.classList.add('active');
    }
  };

  // Tab button event listeners
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetTab = button.getAttribute('aria-controls');
      switchTab(targetTab);
    });
    
    // Keyboard navigation for tabs
    button.addEventListener('keydown', (e) => {
      const currentIndex = Array.from(tabButtons).indexOf(button);
      let nextIndex;
      
      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabButtons.length - 1;
          tabButtons[nextIndex].focus();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = currentIndex < tabButtons.length - 1 ? currentIndex + 1 : 0;
          tabButtons[nextIndex].focus();
          break;
        case 'Home':
          e.preventDefault();
          tabButtons[0].focus();
          break;
        case 'End':
          e.preventDefault();
          tabButtons[tabButtons.length - 1].focus();
          break;
      }
    });
  });

  // Show info function
  const showInfo = (item) => {
    const img = item.getAttribute('data-image');
    const text = item.getAttribute('data-text');
    const color = item.getAttribute('data-color');
    
    if (img) {
      const infoImageSkeleton = document.querySelector('#info-image-wrapper .image-skeleton');
      if (infoImageSkeleton) {
        infoImageSkeleton.style.display = 'block';
      }
      infoImage.style.opacity = '0';
      infoImage.src = img;
    }
    
    if (text) infoText.textContent = text;
    
    if (color && !isMobile()) {
      body.style.background = `linear-gradient(to bottom, ${color}, rgb(0, 255, 136))`;
    }
    
    if (!isMobile()) {
      body.classList.add('dimmed');
      
      if (item.classList.contains('left')) {
        info.classList.add('right');
      } else {
        info.classList.remove('right');
      }
      
      void info.offsetWidth; // force reflow
      info.classList.add('visible');
      
      const offset = item.offsetTop + item.offsetHeight / 2 - info.offsetHeight / 2;
      info.style.top = offset + 'px';
    }
  };

  // Hide info function
  const hideInfo = () => {
    if (!isMobile()) {
      info.classList.remove('visible');
      info.classList.remove('right');
      void info.offsetWidth;
      body.classList.remove('dimmed');
      body.style.background = defaultBg;
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

  // Item event listeners
  items.forEach(item => {
    // Set initial ARIA attributes
    item.setAttribute('aria-expanded', 'false');
    
    // Mouse events (desktop)
    item.addEventListener('mouseenter', () => {
      if (!isMobile()) {
        showInfo(item);
      }
    });
    
    item.addEventListener('mouseleave', () => {
      if (!isMobile()) {
        hideInfo();
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
        showInfo(item);
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
            showInfo(item);
          }
          break;
        case 'Escape':
          if (isMobile()) {
            item.classList.remove('expanded');
            item.setAttribute('aria-expanded', 'false');
          } else {
            hideInfo();
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          const nextItem = item.nextElementSibling;
          if (nextItem && nextItem.classList.contains('item')) {
            nextItem.focus();
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          const prevItem = item.previousElementSibling;
          if (prevItem && prevItem.classList.contains('item')) {
            prevItem.focus();
          }
          break;
      }
    });
    
    // Focus events for keyboard navigation
    item.addEventListener('focus', () => {
      if (!isMobile()) {
        showInfo(item);
      }
    });
    
    item.addEventListener('blur', () => {
      if (!isMobile()) {
        // Delay hiding to allow for focus to move to close button
        setTimeout(() => {
          if (!info.contains(document.activeElement)) {
            hideInfo();
          }
        }, 100);
      }
    });
  });

  // Close button functionality
  if (infoClose) {
    infoClose.addEventListener('click', hideInfo);
    infoClose.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hideInfo();
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
      hideInfo();
    }
  }, 250);

  // Show content after initial load
  setTimeout(() => {
    document.body.classList.add('show-content');
  }, 1000);

  // Sticky tabs functionality
  const tabs = document.querySelector('.tabs');
  const title = document.querySelector('h1');
  const divider = document.querySelector('.divider');
  const eduContainer = document.querySelector('.edu-container');

  const updateDividerProgress = () => {
    if (!divider || !eduContainer) return;
    const rect = eduContainer.getBoundingClientRect();
    const viewport = window.innerHeight;
    let progress = (viewport - rect.top) / (rect.height + viewport);
    if (progress < 0) {
      progress = 0;
    } else if (progress > 1) {
      progress = 1;
    }
    divider.style.setProperty('--progress', progress);
  };

  const onScroll = debounce(() => {
    if (title && title.getBoundingClientRect().top <= 0) {
      tabs.classList.add('visible');
    } else {
      tabs.classList.remove('visible');
    }
    updateDividerProgress();
  }, 16); // ~60fps

  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', handleResize);
  onScroll();

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
  const infoImageWrapper = document.getElementById('info-image-wrapper');
  const infoTextWrapper = document.getElementById('info-text-wrapper');

  const adjustInfoLayout = () => {
    if (!infoImageWrapper || !infoTextWrapper || isMobile()) return;
    const totalWidth = infoImageWrapper.offsetWidth + infoTextWrapper.offsetWidth;
    if (totalWidth > window.innerWidth * 0.8) {
      info.classList.add('stacked');
    } else {
      info.classList.remove('stacked');
    }
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
        hideInfo();
      }
    }
  });
});