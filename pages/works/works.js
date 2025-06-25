document.addEventListener('DOMContentLoaded', () => {
  console.log('Works page loaded with Framer UnicornStudio component');
  
  const sceneLoader = document.getElementById('scene-loader');
  const framerScene = document.getElementById('framer-scene');
  const scrollFooter = document.getElementById('scroll-footer');
  
  let sceneInitialized = false;
  let scrollTimeout;
  
  // Monitor for Framer component initialization
  const checkFramerComponent = () => {
    if (framerScene && framerScene.shadowRoot) {
      console.log('Framer UnicornStudio component initialized');
      sceneInitialized = true;
      
      // Hide loader when scene is ready
      if (sceneLoader) {
        setTimeout(() => {
          sceneLoader.classList.add('hidden');
          
          // Add interaction hint after loader disappears
          setTimeout(() => {
            addInteractionHint();
            addScrollIndicator();
          }, 500);
        }, 2000); // Give the scene time to fully load
      }
    } else {
      // Keep checking until component is ready
      setTimeout(checkFramerComponent, 500);
    }
  };
  
  // Start checking for Framer component
  setTimeout(checkFramerComponent, 1000);
  
  // Fallback: Hide loader after 10 seconds regardless
  setTimeout(() => {
    if (sceneLoader && !sceneLoader.classList.contains('hidden')) {
      sceneLoader.classList.add('hidden');
      addInteractionHint();
      addScrollIndicator();
    }
  }, 10000);
  
  // Add interaction hint
  const addInteractionHint = () => {
    if (window.innerWidth > 768) { // Only show on desktop
      const hint = document.createElement('div');
      hint.className = 'interaction-hint';
      hint.textContent = 'Move your mouse to interact with the scene';
      
      document.body.appendChild(hint);
      
      // Remove hint after 10 seconds
      setTimeout(() => {
        hint.style.opacity = '0';
        setTimeout(() => {
          hint.remove();
        }, 500);
      }, 10000);
    }
  };
  
  // Add scroll indicator
  const addScrollIndicator = () => {
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.innerHTML = 'Scroll down ↓';
    
    document.body.appendChild(indicator);
    
    // Show indicator after a delay
    setTimeout(() => {
      indicator.classList.add('visible');
    }, 3000);
    
    // Hide indicator when user scrolls
    const hideIndicator = () => {
      indicator.classList.remove('visible');
      window.removeEventListener('scroll', hideIndicator);
      setTimeout(() => {
        indicator.remove();
      }, 500);
    };
    
    window.addEventListener('scroll', hideIndicator);
  };
  
  // Handle scroll for footer visibility
  const handleScroll = () => {
    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Show footer when scrolled down significantly or near bottom
    const scrollThreshold = windowHeight * 0.3; // Show after 30% scroll
    const nearBottom = scrollY + windowHeight >= documentHeight - 100;
    
    if (scrollY > scrollThreshold || nearBottom) {
      scrollFooter.classList.add('visible');
    } else {
      scrollFooter.classList.remove('visible');
    }
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Hide footer after no scrolling for 3 seconds (unless at bottom)
    if (!nearBottom) {
      scrollTimeout = setTimeout(() => {
        if (window.scrollY > 0) {
          scrollFooter.classList.remove('visible');
        }
      }, 3000);
    }
  };
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Handle window resize for responsive scene
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // The Framer component should handle its own resizing
      console.log('Window resized, Framer component should auto-adjust');
    }, 250);
  });
  
  // Add some extra height to enable scrolling
  const addScrollableHeight = () => {
    const spacer = document.createElement('div');
    spacer.style.height = '50vh';
    spacer.style.background = 'transparent';
    document.body.appendChild(spacer);
  };
  
  // Add spacer after scene loads
  setTimeout(addScrollableHeight, 2000);
  
  // Error handling for Framer component
  const handleFramerError = () => {
    if (sceneLoader && !sceneLoader.classList.contains('hidden')) {
      sceneLoader.innerHTML = `
        <div style="color: #ff6b6b; text-align: center;">
          <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Scene failed to load</p>
          <p style="font-size: 0.9rem; opacity: 0.7; margin-bottom: 1rem;">Please refresh the page or check your connection</p>
          <button onclick="window.location.reload()" style="
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: transform 0.2s ease;
          " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            Refresh Page
          </button>
        </div>
      `;
    }
  };
  
  // Check for errors after a reasonable time
  setTimeout(() => {
    if (!sceneInitialized && sceneLoader && !sceneLoader.classList.contains('hidden')) {
      handleFramerError();
    }
  }, 15000);
});