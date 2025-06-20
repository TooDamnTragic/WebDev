document.addEventListener('DOMContentLoaded', () => {
  console.log('Works page loaded');
  
  const sceneLoader = document.getElementById('scene-loader');
  const unicornScene = document.getElementById('unicorn-scene');
  const scrollFooter = document.getElementById('scroll-footer');
  
  let sceneInitialized = false;
  let scrollTimeout;
  let retryCount = 0;
  const maxRetries = 3;
  
  // Add cache-busting parameter to force fresh load
  const addCacheBuster = () => {
    const currentProject = unicornScene.getAttribute('data-us-project');
    const timestamp = Date.now();
    unicornScene.setAttribute('data-us-project', `${currentProject}?update=${timestamp}`);
  };
  
  // Clear any existing UnicornStudio instances
  const clearExistingScenes = () => {
    if (window.UnicornStudio) {
      try {
        UnicornStudio.destroy();
        console.log('Cleared existing UnicornStudio scenes');
      } catch (e) {
        console.log('No existing scenes to clear');
      }
    }
  };
  
  // Initialize Unicorn Studio scene with retry logic
  const initializeUnicornStudio = () => {
    if (window.UnicornStudio && !sceneInitialized) {
      console.log('Attempting to initialize UnicornStudio...');
      
      // Clear existing scenes first
      clearExistingScenes();
      
      // Add cache buster
      addCacheBuster();
      
      UnicornStudio.init()
        .then((scenes) => {
          console.log('Unicorn Studio scenes initialized:', scenes);
          sceneInitialized = true;
          retryCount = 0;
          
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
          retryCount++;
          
          if (retryCount < maxRetries) {
            console.log(`Retrying initialization (${retryCount}/${maxRetries})...`);
            setTimeout(() => {
              sceneInitialized = false;
              initializeUnicornStudio();
            }, 2000);
          } else {
            // Show error state after max retries
            if (sceneLoader) {
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
          }
        });
    } else if (!window.UnicornStudio) {
      // Retry after a short delay if UnicornStudio isn't loaded yet
      setTimeout(initializeUnicornStudio, 500);
    }
  };
  
  // Force reload UnicornStudio script if needed
  const reloadUnicornStudioScript = () => {
    const existingScript = document.querySelector('script[src*="unicornStudio"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    const script = document.createElement('script');
    script.src = `https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.25/dist/unicornStudio.umd.js?t=${Date.now()}`;
    script.onload = () => {
      console.log('UnicornStudio script reloaded');
      setTimeout(initializeUnicornStudio, 100);
    };
    script.onerror = () => {
      console.error('Failed to reload UnicornStudio script');
    };
    document.head.appendChild(script);
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
    // Try normal initialization first
    setTimeout(initializeUnicornStudio, 100);
    
    // If it fails after 5 seconds, try reloading the script
    setTimeout(() => {
      if (!sceneInitialized) {
        console.log('Scene not initialized after 5 seconds, reloading script...');
        reloadUnicornStudioScript();
      }
    }, 5000);
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
  
  // Add manual refresh button for debugging
  const addRefreshButton = () => {
    const refreshBtn = document.createElement('button');
    refreshBtn.innerHTML = '🔄';
    refreshBtn.style.cssText = `
      position: fixed;
      top: 1rem;
      right: 1rem;
      background: rgba(0, 0, 0, 0.7);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      z-index: 1001;
      font-size: 1.2rem;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    `;
    
    refreshBtn.addEventListener('click', () => {
      sceneInitialized = false;
      retryCount = 0;
      clearExistingScenes();
      reloadUnicornStudioScript();
    });
    
    refreshBtn.addEventListener('mouseenter', () => {
      refreshBtn.style.transform = 'scale(1.1)';
      refreshBtn.style.background = 'rgba(0, 0, 0, 0.9)';
    });
    
    refreshBtn.addEventListener('mouseleave', () => {
      refreshBtn.style.transform = 'scale(1)';
      refreshBtn.style.background = 'rgba(0, 0, 0, 0.7)';
    });
    
    document.body.appendChild(refreshBtn);
  };
  
  // Add refresh button for debugging
  addRefreshButton();
  
  // Add some extra height to enable scrolling
  const addScrollableHeight = () => {
    const spacer = document.createElement('div');
    spacer.style.height = '50vh';
    spacer.style.background = 'transparent';
    document.body.appendChild(spacer);
  };
  
  // Add spacer after scene loads
  setTimeout(addScrollableHeight, 2000);
  
  // Force clear browser cache for this specific scene
  const clearSceneCache = () => {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name.includes('unicorn') || name.includes('5sDatTn9CTTI9BI4n19Q')) {
            caches.delete(name);
            console.log('Cleared cache:', name);
          }
        });
      });
    }
  };
  
  // Clear cache on load
  clearSceneCache();
});