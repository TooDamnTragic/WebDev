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

  // Enhanced flashlight effect with unified lighting
  document.addEventListener('mousemove', e => {
    const glue = document.querySelector('.glue');
    
    // Update glue position to follow cursor precisely
    if (glue) {
      glue.style.left = e.clientX + 'px';
      glue.style.top = e.clientY + 'px';
      glue.style.transform = 'translate(-50%, -50%)';
    }

    document.querySelectorAll('.section').forEach(section => {
      const rect = section.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxDistance = Math.min(rect.width, rect.height) * 0.8; // Tighter range
      
      // Calculate intensity with sharp falloff for flashlight effect
      const intensity = Math.max(0, 1 - (distance / maxDistance));
      
      if (intensity > 0.1) {
        // Unified lighting - both background and text illuminate together
        const brightnessFactor = 1 + (intensity * 4); // Strong brightening
        
        // Update background colors to bright versions when illuminated
        if (section.classList.contains('education')) {
          section.style.setProperty('--light', `hsl(0, 100%, ${20 + intensity * 40}%)`);
          section.style.setProperty('--dark', `hsl(0, 80%, ${10 + intensity * 30}%)`);
          section.style.setProperty('--textColor', `hsl(0, 100%, ${60 + intensity * 40}%)`);
        } else if (section.classList.contains('works')) {
          section.style.setProperty('--light', `hsl(210, 100%, ${20 + intensity * 40}%)`);
          section.style.setProperty('--dark', `hsl(210, 80%, ${10 + intensity * 30}%)`);
          section.style.setProperty('--textColor', `hsl(210, 100%, ${60 + intensity * 40}%)`);
        } else if (section.classList.contains('contact')) {
          section.style.setProperty('--light', `hsl(120, 100%, ${20 + intensity * 40}%)`);
          section.style.setProperty('--dark', `hsl(120, 80%, ${10 + intensity * 30}%)`);
          section.style.setProperty('--textColor', `hsl(120, 100%, ${60 + intensity * 40}%)`);
        } else if (section.classList.contains('miseducation')) {
          section.style.setProperty('--light', `hsl(0, 0%, ${20 + intensity * 60}%)`);
          section.style.setProperty('--dark', `hsl(0, 0%, ${10 + intensity * 40}%)`);
          section.style.setProperty('--textColor', `hsl(0, 0%, ${70 + intensity * 30}%)`);
        }
        
        // Update the radial gradient position to match cursor position
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        section.style.background = `radial-gradient(circle at ${x}px ${y}px, var(--light), var(--dark) 70%)`;
        
      } else {
        // Reset to barely visible dark colors
        if (section.classList.contains('education')) {
          section.style.setProperty('--light', '#1a0a0a');
          section.style.setProperty('--dark', '#0f0505');
          section.style.setProperty('--textColor', '#2a1a1a');
        } else if (section.classList.contains('works')) {
          section.style.setProperty('--light', '#0a0f1a');
          section.style.setProperty('--dark', '#050a0f');
          section.style.setProperty('--textColor', '#1a1f2a');
        } else if (section.classList.contains('contact')) {
          section.style.setProperty('--light', '#0f1a0a');
          section.style.setProperty('--dark', '#080f05');
          section.style.setProperty('--textColor', '#1f2a1a');
        } else if (section.classList.contains('miseducation')) {
          section.style.setProperty('--light', '#0a0a0a');
          section.style.setProperty('--dark', '#050505');
          section.style.setProperty('--textColor', '#1a1a1a');
        }
        
        // Reset to centered gradient
        section.style.background = `radial-gradient(circle at 50% 50%, var(--light), var(--dark) 70%)`;
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
      // Reset to barely visible colors
      if (section.classList.contains('education')) {
        section.style.setProperty('--light', '#1a0a0a');
        section.style.setProperty('--dark', '#0f0505');
        section.style.setProperty('--textColor', '#2a1a1a');
      } else if (section.classList.contains('works')) {
        section.style.setProperty('--light', '#0a0f1a');
        section.style.setProperty('--dark', '#050a0f');
        section.style.setProperty('--textColor', '#1a1f2a');
      } else if (section.classList.contains('contact')) {
        section.style.setProperty('--light', '#0f1a0a');
        section.style.setProperty('--dark', '#080f05');
        section.style.setProperty('--textColor', '#1f2a1a');
      } else if (section.classList.contains('miseducation')) {
        section.style.setProperty('--light', '#0a0a0a');
        section.style.setProperty('--dark', '#050505');
        section.style.setProperty('--textColor', '#1a1a1a');
      }
      
      // Reset to centered gradient
      section.style.background = `radial-gradient(circle at 50% 50%, var(--light), var(--dark) 70%)`;
    });
  });
});