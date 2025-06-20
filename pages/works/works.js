document.addEventListener('DOMContentLoaded', () => {
  console.log('Works page loaded');
  
  const worksContainer = document.querySelector('.works-container');
  const sceneLoader = document.getElementById('scene-loader');
  const unicornScene = document.getElementById('unicorn-scene');
  
  // Fade in the container
  if (worksContainer) {
    setTimeout(() => {
      worksContainer.classList.add('loaded');
    }, 100);
  }
  
  // Initialize Unicorn Studio scene
  const initializeUnicornStudio = () => {
    if (window.UnicornStudio) {
      UnicornStudio.init()
        .then((scenes) => {
          console.log('Unicorn Studio scenes initialized:', scenes);
          
          // Hide loader when scene is ready
          if (sceneLoader) {
            setTimeout(() => {
              sceneLoader.classList.add('hidden');
            }, 1000);
          }
          
          // Add interaction hint
          addInteractionHint();
        })
        .catch((err) => {
          console.error('Error initializing Unicorn Studio:', err);
          
          // Hide loader and show error state
          if (sceneLoader) {
            sceneLoader.innerHTML = `
              <div style="color: #ff6b6b;">
                <p>Scene failed to load</p>
                <p style="font-size: 0.8rem; opacity: 0.7;">Please refresh the page</p>
              </div>
            `;
          }
        });
    } else {
      console.error('UnicornStudio not available');
      
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
      
      if (unicornScene && unicornScene.parentElement) {
        unicornScene.parentElement.appendChild(hint);
        
        // Remove hint after 8 seconds
        setTimeout(() => {
          hint.style.opacity = '0';
          setTimeout(() => {
            hint.remove();
          }, 500);
        }, 8000);
      }
    }
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUnicornStudio);
  } else {
    initializeUnicornStudio();
  }
  
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
});