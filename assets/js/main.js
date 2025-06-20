document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav');
  const loader = document.getElementById('loader');
  
  setTimeout(() => {
    nav.classList.add('show');
    if(loader){
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 6000);
    }
  }, 3200);

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

  // Enhanced flashlight effect with tighter focus
  document.addEventListener('mousemove', e => {
    const glue = document.querySelector('.glue');
    
    // Update glue position to follow cursor more precisely
    if (glue) {
      glue.style.left = e.clientX + 'px';
      glue.style.top = e.clientY + 'px';
      glue.style.transform = 'translate(-50%, -50%)';
    }

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
      
      // Calculate intensity with tighter falloff for flashlight effect
      const intensity = Math.max(0, 1 - (dist / (maxDist * 0.6))); // Tighter falloff
      
      section.style.setProperty('--mx', `${x}px`);
      section.style.setProperty('--my', `${y}px`);
      section.style.setProperty('--intensity', intensity.toFixed(3));
      
      // Brighten colors when illuminated by flashlight
      if (intensity > 0.1) {
        const brightnessFactor = 1 + (intensity * 3); // More dramatic brightening
        section.style.filter = `brightness(${brightnessFactor})`;
        
        // Make text more visible when illuminated
        const textColor = section.classList.contains('education') ? '#ff6666' :
                         section.classList.contains('works') ? '#66aaff' :
                         section.classList.contains('contact') ? '#66ff66' :
                         '#ffffff';
        section.style.setProperty('--textColor', textColor);
      } else {
        section.style.filter = 'brightness(1)';
        // Reset to barely visible text
        const darkTextColor = section.classList.contains('education') ? '#2a1a1a' :
                             section.classList.contains('works') ? '#1a1f2a' :
                             section.classList.contains('contact') ? '#1f2a1a' :
                             '#1a1a1a';
        section.style.setProperty('--textColor', darkTextColor);
      }
    });
  });

  // Reset when mouse leaves the window
  document.addEventListener('mouseleave', () => {
    const glue = document.querySelector('.glue');
    if (glue) {
      glue.style.left = '50%';
      glue.style.top = '50vmin';
      glue.style.transform = 'translate(-50%, -50%)';
    }
    
    document.querySelectorAll('.section').forEach(section => {
      section.style.filter = 'brightness(1)';
      // Reset to barely visible text
      const darkTextColor = section.classList.contains('education') ? '#2a1a1a' :
                           section.classList.contains('works') ? '#1a1f2a' :
                           section.classList.contains('contact') ? '#1f2a1a' :
                           '#1a1a1a';
      section.style.setProperty('--textColor', darkTextColor);
    });
  });
});