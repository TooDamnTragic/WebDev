document.addEventListener('DOMContentLoaded', () => {
  // UnicornStudio background initialization
  const backgroundLoader = document.getElementById('background-loader');
  const unicornBackground = document.querySelector('.unicorn-background');
  let backgroundInitialized = false;
  
  // Monitor for UnicornStudio initialization
  const checkUnicornStudio = () => {
    // Check if UnicornStudio is loaded and canvas exists
    const canvas = unicornBackground ? unicornBackground.querySelector('canvas') : null;
    
    if (window.UnicornStudio && window.UnicornStudio.isInitialized && canvas) {
      console.log('UnicornStudio background initialized');
      backgroundInitialized = true;
      
      // Hide fallback background after UnicornStudio loads
      setTimeout(() => {
        if (backgroundLoader) {
          backgroundLoader.classList.add('hidden');
        }
      }, 1000);
    } else if (window.UnicornStudio && window.UnicornStudio.isInitialized) {
      // UnicornStudio loaded but no canvas yet, keep checking
      setTimeout(checkUnicornStudio, 200);
    } else {
      // Keep checking until UnicornStudio is ready
      setTimeout(checkUnicornStudio, 500);
    }
  };
  
  // Start checking for UnicornStudio
  setTimeout(checkUnicornStudio, 500);
  
  // Fallback: Hide loader after 15 seconds regardless
  setTimeout(() => {
    if (backgroundLoader && !backgroundLoader.classList.contains('hidden')) {
      backgroundLoader.classList.add('hidden');
      console.log('UnicornStudio background fallback timeout - using gradient background');
    }
  }, 15000);
  
  // Debug: Log when UnicornStudio script loads
  const originalInit = window.UnicornStudio?.init;
  if (window.UnicornStudio) {
    window.UnicornStudio.init = function() {
      console.log('UnicornStudio.init() called');
      if (originalInit) originalInit.apply(this, arguments);
    };
  }
  
  // Elements
  const emailCard = document.querySelector('.email-card');
});