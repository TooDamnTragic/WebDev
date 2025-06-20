document.addEventListener('DOMContentLoaded', () => {
  console.log('Works page loaded');
  
  const sceneLoader = document.getElementById('scene-loader');
  const unicornScene = document.getElementById('unicorn-scene');
  const scrollFooter = document.getElementById('scroll-footer');
  
  let sceneInitialized = false;
  let scrollTimeout;
  
  // Initialize Unicorn Studio scene
  const initializeUnicornStudio = () => {
    if (window.UnicornStudio && !sceneInitialized) {
      UnicornStudio.init()
        .then((scenes) => {
          console.log('Unicorn Studio scenes initialized:', scenes);
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
            }, 1500);
          }
        })
        .catch((err) => {
          console.error('Error initializing Unicorn Studio:', err);
          
          // Hide loader and show error state
          if (sceneLoader) {
            sceneLoader.innerHTML = `
              <div style="color: #ff6b6b; text-align: center;">
                <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Scene failed to load</p>
                <p style="font-size: 0.9rem; opacity: 0.7;">Please refresh the page or check your connection</p>
              </div>
            `;
          }
        });
    } else if (!window.UnicornStudio) {
      // Retry after a short delay
      setTimeout(initializeUnicornStudio, 500);
    }
  };
  
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
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUnicornStudio);
  } else {
    initializeUnicornStudio();
  }
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Handle window resize for responsive scene
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Trigger scene resize if UnicornStudio is available
      if (window.UnicornStudio && window.UnicornStudio.scenes) {
        window.UnicornStudio.scenes.forEach(scene => {
          if (scene.resize) {
            scene.resize();
          }
        });
      }
    }, 250);
  });
  
  // Clean up on page unload (important for SPAs)
  window.addEventListener('beforeunload', () => {
    if (window.UnicornStudio) {
      UnicornStudio.destroy();
    }
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
});