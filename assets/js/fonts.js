document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.font-list li').forEach(li => {
    const tooltip = document.createElement('span');
    tooltip.className = 'font-tooltip';
    tooltip.textContent = li.textContent.trim();
    li.appendChild(tooltip);
  });
});