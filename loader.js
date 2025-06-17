// loader.js
/**
 *  Enhanced loader for TooDamnTragic water surface
 *  Simulates loading of water physics, glue system, and visual effects
 */

// Configuration - EXTENDED TIMING
const BOOT_TIME_MS = 2500; // Slightly longer for dramatic effect
const FADE_DURATION_MS = 5000; // Extended to 5 seconds

// Loading stages for realistic simulation
const loadingStages = [
  { name: 'Initializing Water Physics...', duration: 400 },
  { name: 'Loading Particle Systems...', duration: 600 },
  { name: 'Calibrating Glue Dynamics...', duration: 500 },
  { name: 'Rendering Surface Tension...', duration: 400 },
  { name: 'Optimizing Fluid Interactions...', duration: 600 }
];

let currentStage = 0;
let stageStartTime = 0;

// Enhanced boot sequence
window.addEventListener('load', () => {
  // Start the loading simulation
  simulateLoading();
  
  // Set the main boot timer
  setTimeout(() => {
    completeBootSequence();
  }, BOOT_TIME_MS);
});

function simulateLoading() {
  const scrim = document.getElementById('scrim');
  if (!scrim) return;
  
  stageStartTime = Date.now();
  
  // Add subtle loading indicator
  const loadingIndicator = document.createElement('div');
  loadingIndicator.style.cssText = `
    position: fixed;
    bottom: 20%;
    left: 50%;
    transform: translateX(-50%);
    color: #ff0000;
    font-family: "DiatypeMono", monospace;
    font-size: clamp(8px, 1vw, 12px);
    text-align: center;
    opacity: 0.7;
    animation: loadingPulse 1s ease-in-out infinite alternate;
    text-shadow: 0 0 3px #ff0000;
    letter-spacing: 0.1em;
  `;
  
  // Add loading animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes loadingPulse {
      0% { opacity: 0.4; transform: translateX(-50%) scale(0.95); }
      100% { opacity: 0.8; transform: translateX(-50%) scale(1.05); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(loadingIndicator);
  
  // Simulate loading stages
  function updateLoadingStage() {
    if (currentStage < loadingStages.length) {
      const stage = loadingStages[currentStage];
      loadingIndicator.textContent = stage.name;
      
      setTimeout(() => {
        currentStage++;
        updateLoadingStage();
      }, stage.duration);
    } else {
      // Final stage
      loadingIndicator.textContent = 'READY TO IMMERSE...';
      loadingIndicator.style.animation = 'loadingComplete 0.5s ease-out forwards';
      
      // Add completion animation
      const completeStyle = document.createElement('style');
      completeStyle.textContent = `
        @keyframes loadingComplete {
          0% { 
            opacity: 0.8; 
            transform: translateX(-50%) scale(1); 
            filter: drop-shadow(0 0 3px #ff0000);
          }
          50% { 
            opacity: 1; 
            transform: translateX(-50%) scale(1.1); 
            filter: drop-shadow(0 0 8px #ff0000);
          }
          100% { 
            opacity: 0; 
            transform: translateX(-50%) scale(1.2); 
            filter: drop-shadow(0 0 15px #ff0000);
          }
        }
      `;
      document.head.appendChild(completeStyle);
    }
  }
  
  updateLoadingStage();
}

function completeBootSequence() {
  // 1. Swap boot flag so the real site CSS becomes visible
  document.documentElement.dataset.boot = '1';
  
  // 2. Enhanced cleanup after fade animations - EXTENDED TIMING
  const scrim = document.getElementById('scrim');
  const loadingIndicator = document.querySelector('div[style*="loadingPulse"]');
  
  setTimeout(() => {
    // Remove ASCII scrim
    if (scrim && scrim.parentNode) {
      scrim.remove();
    }
    
    // Remove loading indicator
    if (loadingIndicator && loadingIndicator.parentNode) {
      loadingIndicator.remove();
    }
    
    // Clean up any temporary styles
    document.querySelectorAll('style').forEach(style => {
      if (style.textContent.includes('loadingPulse') || 
          style.textContent.includes('loadingComplete')) {
        style.remove();
      }
    });
    
    // Trigger water surface initialization if needed
    const event = new CustomEvent('loaderComplete', {
      detail: { 
        loadTime: BOOT_TIME_MS,
        stages: loadingStages.length 
      }
    });
    document.dispatchEvent(event);
    
  }, FADE_DURATION_MS); // Extended to 5 seconds
}

// Progress tracking for development/debugging
function getLoadingProgress() {
  const elapsed = Date.now() - stageStartTime;
  const totalDuration = loadingStages.reduce((sum, stage) => sum + stage.duration, 0);
  const currentStageDuration = loadingStages.slice(0, currentStage)
    .reduce((sum, stage) => sum + stage.duration, 0);
  
  return Math.min((currentStageDuration + elapsed) / totalDuration, 1);
}

// Export for potential external use
window.LoaderAPI = {
  getProgress: getLoadingProgress,
  getCurrentStage: () => currentStage < loadingStages.length ? 
    loadingStages[currentStage].name : 'Complete',
  isComplete: () => document.documentElement.dataset.boot === '1'
};

// Enhanced error handling
window.addEventListener('error', (e) => {
  console.warn('Loader encountered an error:', e.error);
  // Fallback: complete boot sequence anyway
  setTimeout(completeBootSequence, 1000);
});

// Preload critical resources
const preloadResources = [
  // Add any critical resources that should load before the app starts
];

preloadResources.forEach(resource => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = resource;
  link.as = 'script';
  document.head.appendChild(link);
});

// Performance monitoring
const perfStart = performance.now();
window.addEventListener('load', () => {
  const loadTime = performance.now() - perfStart;
  console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
});

// Accessibility: Announce loading completion to screen readers
document.addEventListener('loaderComplete', () => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  announcement.textContent = 'Water surface application loaded successfully';
  document.body.appendChild(announcement);
  
  setTimeout(() => {
    if (announcement.parentNode) {
      announcement.remove();
    }
  }, 1000);
});