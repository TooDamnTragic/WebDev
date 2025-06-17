document.addEventListener('DOMContentLoaded', () => {
  // Initialize animations and interactions
  initializeAnimations();
  initializeScrollEffects();
  initializeAccessibility();
  
  // Smooth reveal animations
  function initializeAnimations() {
    // Simple intersection observer for animations
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          
          // Add AOS animation class
          if (entry.target.hasAttribute('data-aos')) {
            entry.target.classList.add('aos-animate');
          }
        }
      });
    }, observerOptions);
    
    // Observe all timeline items and activity cards
    document.querySelectorAll('.timeline-item, [data-aos]').forEach(el => {
      observer.observe(el);
    });
  }
  
  // Scroll effects for timeline
  function initializeScrollEffects() {
    const timelineLine = document.querySelector('.timeline-line');
    if (!timelineLine) return;
    
    const updateTimelineProgress = () => {
      const timelineContainer = document.querySelector('.timeline-container');
      if (!timelineContainer) return;
      
      const rect = timelineContainer.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate progress based on scroll position
      let progress = 0;
      if (rect.top < windowHeight && rect.bottom > 0) {
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        progress = visibleHeight / rect.height;
      }
      
      // Apply gradient effect to timeline
      timelineLine.style.background = `linear-gradient(to bottom, 
        transparent 0%, 
        #f0ead6 ${Math.max(0, (progress - 0.1) * 100)}%, 
        #f0ead6 ${Math.min(100, progress * 100)}%, 
        transparent 100%)`;
    };
    
    // Throttled scroll listener
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateTimelineProgress();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    updateTimelineProgress(); // Initial call
  }
  
  // Enhanced accessibility features
  function initializeAccessibility() {
    // Keyboard navigation for cards
    const interactiveCards = document.querySelectorAll('.activity-card, .program-card, .involvement-card');
    
    interactiveCards.forEach(card => {
      // Make cards focusable
      card.setAttribute('tabindex', '0');
      
      // Add keyboard interaction
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          card.click();
        }
      });
      
      // Enhanced focus styles
      card.addEventListener('focus', () => {
        card.style.outline = '2px solid #f0ead6';
        card.style.outlineOffset = '4px';
      });
      
      card.addEventListener('blur', () => {
        card.style.outline = 'none';
      });
    });
    
    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
    
    // Add ARIA labels for better screen reader support
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
      item.setAttribute('aria-label', `Education milestone ${index + 1}`);
    });
    
    const activityCards = document.querySelectorAll('.activity-card');
    activityCards.forEach((card, index) => {
      const title = card.querySelector('h3')?.textContent || `Activity ${index + 1}`;
      card.setAttribute('aria-label', `Leadership activity: ${title}`);
    });
  }
  
  // Enhanced card interactions
  function initializeCardInteractions() {
    const cards = document.querySelectorAll('.activity-card, .involvement-card, .program-card');
    
    cards.forEach(card => {
      let isPressed = false;
      
      // Mouse interactions
      card.addEventListener('mousedown', () => {
        isPressed = true;
        card.style.transform = 'translateY(-2px) scale(0.98)';
      });
      
      card.addEventListener('mouseup', () => {
        if (isPressed) {
          card.style.transform = '';
          isPressed = false;
        }
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        isPressed = false;
      });
      
      // Touch interactions for mobile
      card.addEventListener('touchstart', (e) => {
        card.style.transform = 'translateY(-2px) scale(0.98)';
      });
      
      card.addEventListener('touchend', (e) => {
        setTimeout(() => {
          card.style.transform = '';
        }, 150);
      });
    });
  }
  
  // Initialize card interactions
  initializeCardInteractions();
  
  // Parallax effect for header
  function initializeParallax() {
    const header = document.querySelector('.education-header');
    if (!header) return;
    
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.3;
      header.style.transform = `translateY(${rate}px)`;
    };
    
    // Only add parallax on larger screens
    if (window.innerWidth > 768) {
      window.addEventListener('scroll', handleScroll);
    }
  }
  
  initializeParallax();
  
  // Dynamic content loading simulation
  function simulateContentLoading() {
    const cards = document.querySelectorAll('.activity-card, .program-card, .involvement-card');
    
    cards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.6s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 100 + 500);
    });
  }
  
  // Initialize content loading
  simulateContentLoading();
  
  // Performance optimization: Debounced resize handler
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Handle window resize
  const handleResize = debounce(() => {
    // Recalculate any position-dependent elements
    initializeScrollEffects();
  }, 250);
  
  window.addEventListener('resize', handleResize);
  
  // Add loading state management
  document.body.classList.add('education-loaded');
  
  // Cleanup function for memory management
  window.addEventListener('beforeunload', () => {
    // Remove event listeners if needed
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
  });
  
  // Add subtle animation to page title
  const pageTitle = document.querySelector('.page-title');
  if (pageTitle) {
    let animationFrame;
    
    const animateTitle = () => {
      const time = Date.now() * 0.001;
      const intensity = 0.5 + Math.sin(time) * 0.2;
      pageTitle.style.filter = `brightness(${intensity}) drop-shadow(0 0 ${10 + intensity * 10}px rgba(240, 234, 214, ${intensity * 0.5}))`;
      
      animationFrame = requestAnimationFrame(animateTitle);
    };
    
    // Only animate if user hasn't requested reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animateTitle();
    }
    
    // Cleanup animation on page unload
    window.addEventListener('beforeunload', () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    });
  }
  
  console.log('Education page initialized successfully');
});