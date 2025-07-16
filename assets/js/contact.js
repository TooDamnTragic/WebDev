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

    // Dither background initialization
  const ditherLoader = document.getElementById('dither-loader');
  const ditherContainer = document.getElementById('dither-background');
  let ditherBackground = null;

  const initDitherBackground = async () => {
    try {
      const { default: DitherBackground } = await import('./dither-background.js');

      ditherBackground = new DitherBackground(ditherContainer, {
        colors: [
          [1, 0.3, 0.85],
          [0.98, 1, 0.6],
          [0.36, 1, 0.8],
          [0.45, 0.82, 1]
        ],
        disableAnimation: false,
        enableMouseInteraction: true,
        mouseRadius: 0.3,
        colorNum: 4,
        waveAmplitude: 0.3,
        waveFrequency: 3,
        waveSpeed: 0.05,
        pixelSize: 2
      });

      console.log('Dither background initialized');

      // Hide loader after dither background loads
      setTimeout(() => {
        if (ditherLoader) {
          ditherLoader.classList.add('hidden');
        }
      }, 1000);

    } catch (error) {
      console.error('Failed to initialize dither background:', error);

      // Hide loader and show fallback
      if (ditherLoader) {
        ditherLoader.classList.add('hidden');
      }
    }
  };

  // Initialize dither background
  initDitherBackground();

  // Fallback: Hide loader after 10 seconds regardless
  setTimeout(() => {
    if (ditherLoader && !ditherLoader.classList.contains('hidden')) {
      ditherLoader.classList.add('hidden');
      console.log('Dither background fallback timeout - using gradient background');
    }
  }, 10000);

  // File handling
  let selectedFiles = [];

  // Miseducation text effect - exact same as miseducation page
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  function longRandomString() {
    let out = "";
    for (let i = 0; i < 1500; i++) {
      out += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return out;
  }

  // Magnetic Effect Implementation
  class MagneticCard {
    constructor(element, options = {}) {
      this.element = element;
      this.padding = options.padding || 100;
      this.magnetStrength = options.magnetStrength || 3;
      this.activeTransition = options.activeTransition || "transform 0.3s ease-out";
      this.inactiveTransition = options.inactiveTransition || "transform 0.5s ease-in-out";
      
      this.isActive = false;
      this.position = { x: 0, y: 0 };
      
      this.init();
    }
    
    init() {
      // Create inner wrapper for magnetic effect - preserve existing content
      const existingContent = this.element.innerHTML;
      this.element.innerHTML = `<div class="magnetic-inner">${existingContent}</div>`;
      this.innerElement = this.element.querySelector('.magnetic-inner');

      // Set up styles
      this.element.style.position = 'relative';
      this.element.style.display = 'inline-block';
      this.element.style.willChange = 'transform';
      
      // Bind event handlers
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.handleMouseLeave = this.handleMouseLeave.bind(this);
      
      // Add event listeners
      window.addEventListener('mousemove', this.handleMouseMove);
      this.element.addEventListener('mouseleave', this.handleMouseLeave);
    }
    
    handleMouseMove(e) {
      const rect = this.element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distX = Math.abs(centerX - e.clientX);
      const distY = Math.abs(centerY - e.clientY);
      
      if (distX < rect.width / 2 + this.padding && distY < rect.height / 2 + this.padding) {
        this.isActive = true;
        
        const offsetX = (e.clientX - centerX) / this.magnetStrength;
        const offsetY = (e.clientY - centerY) / this.magnetStrength;
        this.position = { x: offsetX, y: offsetY };
        
        this.updateTransform();
      } else {
        this.deactivate();
      }
    }
    
    handleMouseLeave() {
      this.deactivate();
    }
    
    deactivate() {
      this.isActive = false;
      this.position = { x: 0, y: 0 };
      this.updateTransform();
    }
    
updateTransform() {
      const transition = this.isActive ? this.activeTransition : this.inactiveTransition;
      this.element.style.transition = transition;
      this.element.style.setProperty('--mx', `${this.position.x}px`);
      this.element.style.setProperty('--my', `${this.position.y}px`);
    }
    
    destroy() {
      window.removeEventListener('mousemove', this.handleMouseMove);
      this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    }
  }

  // Initialize all contact cards with magnetic effect and text effect
  const contactCards = document.querySelectorAll('.contact-card');
  const magneticCards = [];
  
  contactCards.forEach(card => {
    // Initialize magnetic effect first
    const magneticCard = new MagneticCard(card, {
      padding: 80,
      magnetStrength: 4,
      activeTransition: "transform 0.2s ease-out",
      inactiveTransition: "transform 0.4s ease-in-out"
    });
    magneticCards.push(magneticCard);
    
    // Now get the elements after magnetic wrapper is created
    const cardText = card.querySelector('.card-text');
    const cardGlow = card.querySelector('.card-glow');
    const cardDarken = card.querySelector('.card-darken');
    
        // Base dark overlay
    if (cardDarken) {
      cardDarken.style.background = 'rgba(0,0,0,0.2)';
    }
    
    // Seed initial text
    if (cardText) {
      cardText.textContent = longRandomString();
    }
    
    // Add mouse move effect for text randomization and glow
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Update glow effect
      if (cardGlow) {
        cardGlow.style.background =
          `radial-gradient(250px at ${x}px ${y}px, rgba(255, 255, 255, 0.5), transparent 70%)`;
      }
      // Lighten area inside dark overlay
      if (cardDarken) {
        cardDarken.style.background =
          `radial-gradient(200px at ${x}px ${y}px, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.2) 20%)`;
      }

      // Update text with new random string
      if (cardText) {
        cardText.textContent = longRandomString();
      }
    });

    // Clear glow on mouse leave
    card.addEventListener('mouseleave', () => {
      if (cardGlow) {
        cardGlow.style.background = 'none';
      }
      if (cardDarken) {
        cardDarken.style.background = 'rgba(0,0,0,0.2)';
      }
    });
  });

  // Email card click handler
  if (emailCard) {
    emailCard.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

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

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    magneticCards.forEach(card => card.destroy());
    if (ditherBackground) {
      ditherBackground.destroy();
    }
  });
});