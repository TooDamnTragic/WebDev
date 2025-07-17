document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.font-list li').forEach(li => {
    const font = li.style.fontFamily.replace(/["']/g, '').split(',')[0].trim();
    const tooltip = document.createElement('span');
    tooltip.className = 'font-tooltip';
    tooltip.textContent = font;
    li.appendChild(tooltip);
  });
});
