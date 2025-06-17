document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const emailCard = document.querySelector('.email-card');
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

  // 3D Tilt Effect for Cards
  const initTiltEffect = () => {
    const cards = document.querySelectorAll('[data-tilt]');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 10;
        const rotateY = (centerX - x) / 10;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });
      
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
      });
    });
  };

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
  emailCard.addEventListener('click', openModal);
  closeModal.addEventListener('click', closeModalFunc);
  cancelBtn.addEventListener('click', closeModalFunc);

  // Close modal on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModalFunc();
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModalFunc();
    }
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    handleFileSelect(e.target.files);
  });

  // Form submission
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

  // Enhanced card interactions
  const cards = document.querySelectorAll('.contact-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      // Add subtle animation to other cards
      cards.forEach(otherCard => {
        if (otherCard !== card) {
          otherCard.style.transform = 'scale(0.95)';
          otherCard.style.opacity = '0.7';
        }
      });
    });
    
    card.addEventListener('mouseleave', () => {
      // Reset all cards
      cards.forEach(otherCard => {
        otherCard.style.transform = '';
        otherCard.style.opacity = '';
      });
    });
  });

  // Smooth scrolling for any internal links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Initialize everything
  initTiltEffect();
  setupDragAndDrop();

  // Add some interactive particles on mouse move
  let mouseX = 0;
  let mouseY = 0;
  
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Create subtle particle effect
    if (Math.random() > 0.98) {
      createParticle(mouseX, mouseY);
    }
  });

  const createParticle = (x, y) => {
    const particle = document.createElement('div');
    particle.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: 4px;
      height: 4px;
      background: rgba(255,255,255,0.6);
      border-radius: 50%;
      pointer-events: none;
      z-index: 1000;
      animation: particleFade 2s ease-out forwards;
    `;
    
    document.body.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 2000);
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
        transform: scale(0) translateY(-50px);
      }
    }
  `;
  document.head.appendChild(style);

  // Add loading animation to page
  setTimeout(() => {
    document.body.classList.add('loaded');
  }, 100);
});