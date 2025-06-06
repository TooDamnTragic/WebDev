document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.item');
  const infoImage = document.getElementById('info-image');
  const infoText = document.getElementById('info-text');

  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const img = item.getAttribute('data-image');
      const text = item.getAttribute('data-text');
      if (img) infoImage.src = img;
      if (text) infoText.textContent = text;
    });
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
});