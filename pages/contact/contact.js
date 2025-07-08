document.addEventListener('DOMContentLoaded', () => {
  // Dither background initialization
  const ditherLoader = document.getElementById('dither-loader');
  const ditherContainer = document.getElementById('dither-background');
  let ditherBackground = null;
  
  // Initialize dither background
  const initDitherBackground = async () => {
    try {
      const { default: DitherBackground } = await import('../../assets/js/dither-background.js');
      
      ditherBackground = new DitherBackground(ditherContainer, {
        waveColor: [0.5, 0.5, 0.5],
        disableAnimation: false,
        enableMouseInteraction: true,
        mouseRadius: 0.3,
        colorNum: 4,
        waveAmplitude: 0.3,
        waveFrequency: 3,
        waveSpeed: 0.05,
        pixelSize: 2
      });
      
      console.log('Dither background initialized');
      
      // Hide loader after dither background loads
      setTimeout(() => {
        if (ditherLoader) {
          ditherLoader.classList.add('hidden');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Failed to initialize dither background:', error);
      
      // Hide loader and show fallback
      if (ditherLoader) {
        ditherLoader.classList.add('hidden');
      }
    }
  };
  
  // Initialize dither background
  initDitherBackground();
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (ditherBackground) {
      ditherBackground.destroy();
    }
  });
  
  // Fallback: Hide loader after 10 seconds regardless
  setTimeout(() => {
    if (ditherLoader && !ditherLoader.classList.contains('hidden')) {
      ditherLoader.classList.add('hidden');
      console.log('Dither background fallback timeout - using gradient background');
    }
  }, 10000);
  
  // Elements
  const emailCard = document.querySelector('.email-card');
});