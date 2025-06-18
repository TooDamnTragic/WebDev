document.addEventListener('DOMContentLoaded', () => {
  // Works page specific functionality can go here
  console.log('Works page loaded');
  
  // Add any interactive elements or animations for the works page
  const worksContainer = document.querySelector('.works-container');
  
  if (worksContainer) {
    // Fade in animation
    setTimeout(() => {
      worksContainer.style.opacity = '1';
      worksContainer.style.transform = 'translateY(0)';
    }, 100);
  }
});