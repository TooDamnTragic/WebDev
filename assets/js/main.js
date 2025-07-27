document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const loader = document.getElementById('loader');

  const skipLoader = localStorage.getItem('skipLoader') === 'true';
  if (skipLoader) {
    nav.classList.add('show');
    if (loader) loader.remove();
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

  document.querySelectorAll('.section').forEach(link => {
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