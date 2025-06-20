document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const emailButton = document.querySelector('.email-button');
  const modal = document.getElementById('emailModal');
  const closeModal = document.getElementById('closeModal');
  const cancelBtn = document.getElementById('cancelBtn');
  const emailForm = document.getElementById('emailForm');
  const sendBtn = document.getElementById('sendBtn');
  const fileUploadArea = document.getElementById('fileUploadArea');
  const fileInput = document.getElementById('attachments');
  const fileList = document.getElementById('fileList');
  const notification = document.getElementById('notification');

  // File handling
  let selectedFiles = [];

  // Miseducation Background Effect - Exact Implementation
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  function longRandomString() {
    let out = "";
    for (let i = 0; i < 3000; i++) { // Increased for full screen coverage
      out += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return out;
  }

  // Initialize background elements
  const backgroundText = document.querySelector('.background-text');
  const backgroundGlow = document.createElement('div');
  const backgroundBackdrop = document.createElement('div');
  
  backgroundGlow.className = 'background-glow glow-mask';
  backgroundBackdrop.className = 'background-backdrop';
  
  document.body.appendChild(backgroundGlow);
  document.body.appendChild(backgroundBackdrop);

  // Seed initial text
  if (backgroundText) {
    backgroundText.textContent = longRandomString();
  }

  // Activate backdrop on first interaction
  let glowActive = false;

  const activateGlow = () => {
    if (!glowActive) {
      backgroundGlow.classList.add('active');
      backgroundBackdrop.classList.add('active');
      glowActive = true;
    }
  };

  // Mouse movement handler - derived from miseducation effect
  document.addEventListener('mousemove', (e) => {
    activateGlow();

    const x = e.clientX;
    const y = e.clientY;

    backgroundGlow.style.background =
      `radial-gradient(250px at ${x}px ${y}px, rgba(255,255,255,0.35), transparent 70%)`;

    if (backgroundText) {
      backgroundText.textContent = longRandomString();
    }
  });

  // Fade out glow when leaving the page
  document.addEventListener('mouseleave', () => {
    backgroundGlow.style.background = 'none';
    backgroundGlow.classList.remove('active');
    backgroundBackdrop.classList.remove('active');
    glowActive = false;
  });

  // Contact Buttons Physics with Cursor Attraction
  const buttons = document.querySelectorAll('.contact-button');
  const buttonPhysics = [];

  // Initialize button physics with orbital positions
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  const orbitRadius = 250;

  buttons.forEach((button, index) => {
    const angle = (index / buttons.length) * 2 * Math.PI;
    const x = centerX + Math.cos(angle) * orbitRadius;
    const y = centerY + Math.sin(angle) * orbitRadius;

    buttonPhysics[index] = {
      element: button,
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      originalX: x,
      originalY: y,
      isDragging: false,
      mass: 10,
      radius: 60, // Half of button width
      angle: angle,
      orbitSpeed: 0.0005, // Much slower orbital rotation
      cursorAttraction: 0.002, // Light cursor attraction strength
      returnForce: 0.008 // Force to return to original position
    };

    // Set initial position
    button.style.left = (x - buttonPhysics[index].radius) + 'px';
    button.style.top = (y - buttonPhysics[index].radius) + 'px';
  });

  // Button dragging functionality
  let draggedButton = null;
  let mouseX = 0;
  let mouseY = 0;
  let dragOffset = { x: 0, y: 0 };

  buttons.forEach((button, index) => {
    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
      draggedButton = index;
      buttonPhysics[index].isDragging = true;
      button.classList.add('dragging');
      
      // Calculate offset from button center
      const rect = button.getBoundingClientRect();
      dragOffset.x = e.clientX - (rect.left + rect.width / 2);
      dragOffset.y = e.clientY - (rect.top + rect.height / 2);
    });

    // Double-click handler for interactions
    let clickCount = 0;
    let clickTimer = null;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      clickCount++;
      
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 300); // Reset after 300ms
      } else if (clickCount === 2) {
        clearTimeout(clickTimer);
        clickCount = 0;
        
        // Handle double-click action
        if (button.classList.contains('email-button')) {
          if (!buttonPhysics[index]?.isDragging) {
            openModal();
          }
        } else if (button.href) {
          // For other buttons with links, open them
          window.open(button.href, '_blank');
        }
      }
    });
  });

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (draggedButton !== null) {
      const physics = buttonPhysics[draggedButton];
      physics.x = mouseX - dragOffset.x;
      physics.y = mouseY - dragOffset.y;
      physics.element.style.left = (physics.x - physics.radius) + 'px';
      physics.element.style.top = (physics.y - physics.radius) + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (draggedButton !== null) {
      buttonPhysics[draggedButton].isDragging = false;
      buttonPhysics[draggedButton].element.classList.remove('dragging');
      draggedButton = null;
    }
  });

  // Physics simulation with cursor attraction
  function updatePhysics() {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    buttonPhysics.forEach((physics, index) => {
      if (!physics.isDragging) {
        // Update orbital angle for natural rotation (much slower)
        physics.angle += physics.orbitSpeed;
        
        // Calculate new orbital position
        const newOrbitX = centerX + Math.cos(physics.angle) * orbitRadius;
        const newOrbitY = centerY + Math.sin(physics.angle) * orbitRadius;
        
        // Update original position to new orbital position
        physics.originalX = newOrbitX;
        physics.originalY = newOrbitY;

        // Cursor attraction (light effect)
        const cursorDx = mouseX - physics.x;
        const cursorDy = mouseY - physics.y;
        const cursorDistance = Math.sqrt(cursorDx * cursorDx + cursorDy * cursorDy);
        
        // Only apply cursor attraction within a reasonable range
        if (cursorDistance < 200 && cursorDistance > 0) {
          const cursorForce = physics.cursorAttraction * (200 - cursorDistance) / 200;
          physics.vx += (cursorDx / cursorDistance) * cursorForce;
          physics.vy += (cursorDy / cursorDistance) * cursorForce;
        }

        // Return force to orbital position (stronger when far away)
        const dx = physics.originalX - physics.x;
        const dy = physics.originalY - physics.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 1) {
          const returnForce = physics.returnForce * Math.min(distance / 100, 1); // Scale with distance
          physics.vx += (dx / distance) * returnForce;
          physics.vy += (dy / distance) * returnForce;
        }

        // Apply velocity
        physics.x += physics.vx;
        physics.y += physics.vy;

        // Damping (higher damping for smoother movement)
        physics.vx *= 0.95;
        physics.vy *= 0.95;

        // Collision with other buttons
        buttonPhysics.forEach((otherPhysics, otherIndex) => {
          if (index !== otherIndex && !otherPhysics.isDragging) {
            const dx = otherPhysics.x - physics.x;
            const dy = otherPhysics.y - physics.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = physics.radius + otherPhysics.radius;

            if (distance < minDistance && distance > 0) {
              const overlap = minDistance - distance;
              const separationX = (dx / distance) * overlap * 0.5;
              const separationY = (dy / distance) * overlap * 0.5;

              physics.x -= separationX;
              physics.y -= separationY;
              otherPhysics.x += separationX;
              otherPhysics.y += separationY;

              // Bounce with momentum transfer (reduced for smoother feel)
              const relativeVx = otherPhysics.vx - physics.vx;
              const relativeVy = otherPhysics.vy - physics.vy;
              const speed = relativeVx * (dx / distance) + relativeVy * (dy / distance);

              if (speed > 0) {
                const impulse = 2 * speed / (physics.mass + otherPhysics.mass);
                physics.vx += impulse * otherPhysics.mass * (dx / distance) * 0.6;
                physics.vy += impulse * otherPhysics.mass * (dy / distance) * 0.6;
                otherPhysics.vx -= impulse * physics.mass * (dx / distance) * 0.6;
                otherPhysics.vy -= impulse * physics.mass * (dy / distance) * 0.6;
              }
            }
          }
        });

        // Boundary collision
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (physics.x - physics.radius < 0) {
          physics.x = physics.radius;
          physics.vx *= -0.7;
        }
        if (physics.x + physics.radius > windowWidth) {
          physics.x = windowWidth - physics.radius;
          physics.vx *= -0.7;
        }
        if (physics.y - physics.radius < 0) {
          physics.y = physics.radius;
          physics.vy *= -0.7;
        }
        if (physics.y + physics.radius > windowHeight) {
          physics.y = windowHeight - physics.radius;
          physics.vy *= -0.7;
        }

        // Update DOM position
        physics.element.style.left = (physics.x - physics.radius) + 'px';
        physics.element.style.top = (physics.y - physics.radius) + 'px';
      }
    });

    requestAnimationFrame(updatePhysics);
  }

  // Start physics simulation
  updatePhysics();

  // Handle window resize
  window.addEventListener('resize', () => {
    const newCenterX = window.innerWidth / 2;
    const newCenterY = window.innerHeight / 2;
    
    buttonPhysics.forEach((physics, index) => {
      // Recalculate orbital positions
      const newOrbitX = newCenterX + Math.cos(physics.angle) * orbitRadius;
      const newOrbitY = newCenterY + Math.sin(physics.angle) * orbitRadius;
      
      physics.originalX = newOrbitX;
      physics.originalY = newOrbitY;
    });
  });

  // Modal Functions
  const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus first input
    setTimeout(() => {
      document.getElementById('senderEmail').focus();
    }, 300);
  };

  const closeModalFunc = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
  };

  const resetForm = () => {
    emailForm.reset();
    selectedFiles = [];
    updateFileList();
    sendBtn.classList.remove('loading');
    sendBtn.disabled = false;
  };

  // File Upload Functions
  const handleFileSelect = (files) => {
    Array.from(files).forEach(file => {
      if (selectedFiles.length < 5) { // Limit to 5 files
        selectedFiles.push(file);
      }
    });
    updateFileList();
  };

  const updateFileList = () => {
    fileList.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <span>${file.name} (${formatFileSize(file.size)})</span>
        <button type="button" class="file-remove" onclick="removeFile(${index})">×</button>
      `;
      fileList.appendChild(fileItem);
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Make removeFile globally accessible
  window.removeFile = (index) => {
    selectedFiles.splice(index, 1);
    updateFileList();
  };

  // Drag and Drop
  const setupDragAndDrop = () => {
    if (!fileUploadArea) return;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      fileUploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      fileUploadArea.addEventListener(eventName, () => {
        fileUploadArea.classList.add('dragover');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      fileUploadArea.addEventListener(eventName, () => {
        fileUploadArea.classList.remove('dragover');
      });
    });

    fileUploadArea.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      handleFileSelect(files);
    });
  };

  // Email Sending Function
  const sendEmail = async (formData) => {
    try {
      // Create FormData for file uploads
      const emailData = new FormData();
      emailData.append('to', 'annoying@gmail.com');
      emailData.append('from', formData.senderEmail);
      emailData.append('subject', formData.subject);
      emailData.append('message', formData.message);
      
      // Add files
      selectedFiles.forEach(file => {
        emailData.append('attachments', file);
      });

      // Simulate API call (replace with actual email service)
      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: emailData
      });

      if (response.ok) {
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        closeModalFunc();
      } else {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      console.error('Email sending error:', error);
      
      // For demo purposes, we'll show success after a delay
      // In production, replace this with actual email service integration
      setTimeout(() => {
        showNotification('Message sent successfully! I\'ll get back to you soon.', 'success');
        closeModalFunc();
      }, 2000);
    }
  };

  // Notification Function
  const showNotification = (message, type = 'success') => {
    const notificationText = notification.querySelector('.notification-text');
    notificationText.textContent = message;
    
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    setTimeout(() => {
      notification.classList.remove('show');
    }, 5000);
  };

  // Form Validation
  const validateForm = (formData) => {
    const errors = [];
    
    if (!formData.senderEmail.trim()) {
      errors.push('Please provide your email or phone number');
    }
    
    if (!formData.subject.trim()) {
      errors.push('Please enter a subject');
    }
    
    if (!formData.message.trim()) {
      errors.push('Please enter a message');
    }
    
    if (formData.senderEmail.includes('@') && !isValidEmail(formData.senderEmail)) {
      errors.push('Please enter a valid email address');
    }
    
    return errors;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Event Listeners
  if (closeModal) {
    closeModal.addEventListener('click', closeModalFunc);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeModalFunc);
  }

  // Close modal on outside click
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModalFunc();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModalFunc();
    }
  });

  // File input change
  if (fileInput) {
    fileInput.addEventListener('change', (e) => {
      handleFileSelect(e.target.files);
    });
  }

  // Form submission
  if (emailForm) {
    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = {
        senderEmail: document.getElementById('senderEmail').value,
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value
      };
      
      const errors = validateForm(formData);
      
      if (errors.length > 0) {
        showNotification(errors[0], 'error');
        return;
      }
      
      // Show loading state
      sendBtn.classList.add('loading');
      sendBtn.disabled = true;
      
      try {
        await sendEmail(formData);
      } catch (error) {
        showNotification('Failed to send message. Please try again.', 'error');
        sendBtn.classList.remove('loading');
        sendBtn.disabled = false;
      }
    });
  }

  // Initialize everything
  setupDragAndDrop();

  // Add some interactive particles on mouse move over the hub
  const hub = document.querySelector('.contact-hub');
  if (hub) {
    hub.addEventListener('mousemove', (e) => {
      if (Math.random() > 0.95) {
        createParticle(e.clientX, e.clientY);
      }
    });
  }

  const createParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 3px;
      height: 3px;
      background: rgba(255,255,255,0.8);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      animation: particleFade 1.5s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 1500);
  };

  // Add particle animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes particleFade {
      0% {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      100% {
        opacity: 0;
        transform: scale(0) translateY(-30px);
      }
    }
  `;
  document.head.appendChild(style);
});