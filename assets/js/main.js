document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const loader = document.getElementById('loader');
  
  // Initialize Unicorn Studio
  if (window.UnicornStudio) {
    UnicornStudio.init()
      .then(() => {
        console.log('Unicorn Studio scene initialized');
      })
      .catch((err) => {
        console.error('Unicorn Studio initialization error:', err);
      });
  }

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
});