document.addEventListener('DOMContentLoaded', () => {
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