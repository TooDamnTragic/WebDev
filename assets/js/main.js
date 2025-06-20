document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const loader = document.getElementById('loader');
  
  console.log('Main.js loaded');
  
  // Show loader initially, then hide it
  setTimeout(() => {
    if(loader){
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 6000);
    }
  }, 3200);

  // Set up intersection observer for navigation
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        console.log('Navigation trigger hit, showing nav');
        nav.classList.add('show');
        observer.unobserve(entry.target); // Only trigger once
      }
    });
  }, observerOptions);

  // Create a trigger element at the scroll position where nav should appear
  const navTrigger = document.createElement('div');
  navTrigger.style.position = 'absolute';
  navTrigger.style.top = '120vh'; // Trigger slightly before nav position
  navTrigger.style.height = '1px';
  navTrigger.style.width = '1px';
  navTrigger.style.pointerEvents = 'none';
  document.body.appendChild(navTrigger);

  // Start observing the trigger
  observer.observe(navTrigger);

  // Section click handlers
  document.querySelectorAll('.section').forEach(link => {
    const text = link.textContent.trim().split('');
    link.innerHTML = text.map(ch => `<span>${ch}</span>`).join('');

    link.addEventListener('click', e => {
      e.preventDefault();
      link.classList.add('zoom');
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location = link.getAttribute('href');
      }, 600);
    });
  });

  // Mouse movement effects for sections
  document.addEventListener('mousemove', e => {
    document.querySelectorAll('.section').forEach(section => {
      const rect = section.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.hypot(dx, dy);
      const maxDist = Math.hypot(rect.width, rect.height) / 2;
      const intensity = 1 - Math.min(dist / maxDist, 1);
      section.style.setProperty('--mx', `${x}px`);
      section.style.setProperty('--my', `${y}px`);
      section.style.setProperty('--intensity', intensity.toFixed(3));
    });
  });

  // Debug: Check for Unicorn Studio after some time
  setTimeout(() => {
    const unicornDiv = document.querySelector('[data-us-project]');
    if (unicornDiv) {
      const canvas = unicornDiv.querySelector('canvas');
      if (canvas) {
        console.log('✅ Unicorn Studio canvas found and loaded successfully!');
      } else {
        console.warn('⚠️ Unicorn Studio div found but no canvas yet. Still loading...');
        
        // Check again after more time
        setTimeout(() => {
          const canvas2 = unicornDiv.querySelector('canvas');
          if (canvas2) {
            console.log('✅ Unicorn Studio canvas loaded after delay!');
          } else {
            console.error('❌ Unicorn Studio failed to create canvas');
          }
        }, 3000);
      }
    } else {
      console.error('❌ Unicorn Studio div not found');
    }
  }, 2000);
});