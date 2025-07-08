document.addEventListener('DOMContentLoaded', () => {
  // UnicornStudio background initialization
  const backgroundLoader = document.getElementById('background-loader');
  let backgroundInitialized = false;
  
  // Monitor for UnicornStudio initialization
  const checkUnicornStudio = () => {
    if (window.UnicornStudio && window.UnicornStudio.isInitialized) {
      console.log('UnicornStudio background initialized');
      backgroundInitialized = true;
      
      // Hide fallback background after UnicornStudio loads
      setTimeout(() => {
        if (backgroundLoader) {
          backgroundLoader.classList.add('hidden');
        }
      }, 2000);
    } else {
      // Keep checking until UnicornStudio is ready
      setTimeout(checkUnicornStudio, 500);
    }
  };
  
  // Start checking for UnicornStudio
  setTimeout(checkUnicornStudio, 1000);
  
  // Fallback: Hide loader after 10 seconds regardless
  setTimeout(() => {
    if (backgroundLoader && !backgroundLoader.classList.contains('hidden')) {
      backgroundLoader.classList.add('hidden');
    }
  }, 10000);
  
  // Elements
  const emailCard = document.querySelector('.email-card');
});