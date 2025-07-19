document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  const color = localStorage.getItem('transitionColor');
  if (color) {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition';
    overlay.style.setProperty('--transition-color', color);
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('shrink'));
    overlay.addEventListener('transitionend', () => overlay.remove());
    localStorage.removeItem('transitionColor');
  }

  document.querySelectorAll('a:not(.section)').forEach(link => {
    link.addEventListener('click', e => {
      const url = link.getAttribute('href');
      if (!url || url.startsWith('http') || url.startsWith('mailto:')) return;
      e.preventDefault();
      document.body.classList.add('fade-out');
      setTimeout(() => {
        window.location = url;
      }, 400);
    });
  });
});