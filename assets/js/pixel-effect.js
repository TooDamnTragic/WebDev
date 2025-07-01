// Pixel effect for back buttons - converted from React component
class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  appear() {
    this.isIdle = false;
    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }
    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }
    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }
    this.draw();
  }

  disappear() {
    this.isShimmer = false;
    this.counter = 0;
    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }
    this.draw();
  }

  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }
    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

function getEffectiveSpeed(value, reducedMotion) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  const parsed = parseInt(value, 10);

  if (parsed <= min || reducedMotion) {
    return min;
  } else if (parsed >= max) {
    return max * throttle;
  } else {
    return parsed * throttle;
  }
}

class PixelEffect {
  constructor(element, options = {}) {
    this.element = element;
    this.canvas = null;
    this.ctx = null;
    this.pixels = [];
    this.animationId = null;
    this.timePrevious = performance.now();
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Configuration
    this.config = {
      gap: options.gap || 3,
      speed: options.speed || 35,
      colors: options.colors || "#f8fafc,#f1f5f9,#cbd5e1",
      ...options
    };
    
    this.init();
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Style canvas
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '1';
    this.canvas.style.opacity = '0';
    this.canvas.style.transition = 'opacity 0.3s ease';
    
    // Make element relative positioned
    const computedStyle = window.getComputedStyle(this.element);
    if (computedStyle.position === 'static') {
      this.element.style.position = 'relative';
    }
    
    // Add canvas to element
    this.element.appendChild(this.canvas);
    
    // Initialize pixels
    this.initPixels();
    
    // Add event listeners
    this.element.addEventListener('mouseenter', () => this.onMouseEnter());
    this.element.addEventListener('mouseleave', () => this.onMouseLeave());
    this.element.addEventListener('focus', (e) => this.onFocus(e));
    this.element.addEventListener('blur', (e) => this.onBlur(e));
    
    // Handle resize
    this.resizeObserver = new ResizeObserver(() => this.initPixels());
    this.resizeObserver.observe(this.element);
  }

  initPixels() {
    const rect = this.element.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    const colorsArray = this.config.colors.split(",");
    const pxs = [];
    
    for (let x = 0; x < width; x += parseInt(this.config.gap, 10)) {
      for (let y = 0; y < height; y += parseInt(this.config.gap, 10)) {
        const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];
        
        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = this.reducedMotion ? 0 : distance;

        pxs.push(
          new Pixel(
            this.canvas,
            this.ctx,
            x,
            y,
            color,
            getEffectiveSpeed(this.config.speed, this.reducedMotion),
            delay
          )
        );
      }
    }
    this.pixels = pxs;
  }

  doAnimate(fnName) {
    this.animationId = requestAnimationFrame(() => this.doAnimate(fnName));
    const timeNow = performance.now();
    const timePassed = timeNow - this.timePrevious;
    const timeInterval = 1000 / 60;

    if (timePassed < timeInterval) return;
    this.timePrevious = timeNow - (timePassed % timeInterval);

    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let allIdle = true;
    for (let i = 0; i < this.pixels.length; i++) {
      const pixel = this.pixels[i];
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle && fnName === 'disappear') {
      cancelAnimationFrame(this.animationId);
      this.canvas.style.opacity = '0';
    }
  }

  handleAnimation(name) {
    cancelAnimationFrame(this.animationId);
    if (name === 'appear') {
      this.canvas.style.opacity = '1';
    }
    this.animationId = requestAnimationFrame(() => this.doAnimate(name));
  }

  onMouseEnter() {
    this.handleAnimation("appear");
  }

  onMouseLeave() {
    this.handleAnimation("disappear");
  }

  onFocus(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    this.handleAnimation("appear");
  }

  onBlur(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    this.handleAnimation("disappear");
  }

  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Auto-initialize pixel effects on back buttons
document.addEventListener('DOMContentLoaded', () => {
  const backButtons = document.querySelectorAll('.back-link');
  const pixelEffects = [];
  
  backButtons.forEach(button => {
    // Remove existing hover effects
    button.style.transition = 'none';
    
    // Create pixel effect with custom colors for each page
    const effect = new PixelEffect(button, {
      gap: 4,
      speed: 100,
      colors: "#ffffff,#f0ead6,#667eea"
    });
    
    pixelEffects.push(effect);
  });
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    pixelEffects.forEach(effect => effect.destroy());
  });
});