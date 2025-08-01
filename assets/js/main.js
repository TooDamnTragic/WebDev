document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.home-nav');
  const loader = document.getElementById('loader');

  const skipLoader = localStorage.getItem('skipLoader') === 'true';
  if (skipLoader) {
    nav.classList.add('show');
    if (loader) loader.remove();
    const overlay = document.createElement('div');
    overlay.className = 'skip-overlay';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('fade-out'));
    overlay.addEventListener('transitionend', () => overlay.remove());
    localStorage.removeItem('skipLoader');
  } else {

    setTimeout(() => {
      nav.classList.add('show');
      if (loader) {
        loader.classList.add('hide');
        setTimeout(() => loader.remove(), 6000);
      }
    }, 3200);
  }

  document.querySelectorAll('.home-link').forEach(link => {
    const text = link.textContent.trim().split('');
    link.innerHTML = text.map(ch => `<span>${ch}</span>`).join('');

    link.addEventListener('click', e => {
      e.preventDefault();
      const color = getComputedStyle(link).getPropertyValue('--light') || '#000';
      localStorage.setItem('transitionColor', color.trim());
      link.classList.add('zoom');
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location = link.getAttribute('href');
      }, 600);
    });
  });

  // simple hover effects no longer need mouse tracking
});