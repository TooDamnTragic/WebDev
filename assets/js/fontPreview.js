document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.font-list li').forEach(li => {
    const font = li.style.fontFamily.replace(/["']/g, '').split(',')[0].trim();
    li.title = font;
  });
});