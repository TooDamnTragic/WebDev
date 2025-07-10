// Realistic and artistic campsite background
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('campsite-background');
  if (!container) return;

  // Create canvas for the campsite scene
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  container.appendChild(canvas);

  // Set canvas styles
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '2';

  // Animation variables
  let animationTime = 0;
  let stars = [];

  // Initialize stars
  function initStars() {
    stars = [];
    const starCount = Math.floor(canvas.width / 8);
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        brightness: 0.3 + Math.random() * 0.7,
        size: 0.5 + Math.random() * 1.5,
        twinkleSpeed: 0.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  // Resize canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initStars();
    drawCampsiteScene();
  }

  // Perlin-like noise function for organic shapes
  function smoothNoise(x, y, scale = 1) {
    const X = Math.floor(x * scale) & 255;
    const Y = Math.floor(y * scale) & 255;
    const xf = (x * scale) - Math.floor(x * scale);
    const yf = (y * scale) - Math.floor(y * scale);
    
    const u = fade(xf);
    const v = fade(yf);
    
    const a = hash(X) + Y;
    const b = hash(X + 1) + Y;
    
    return lerp(v, 
      lerp(u, grad(hash(a), xf, yf), grad(hash(b), xf - 1, yf)),
      lerp(u, grad(hash(a + 1), xf, yf - 1), grad(hash(b + 1), xf - 1, yf - 1))
    );
  }

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(t, a, b) { return a + t * (b - a); }
  function grad(hash, x, y) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  function hash(x) {
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = ((x >> 16) ^ x) * 0x45d9f3b;
    x = (x >> 16) ^ x;
    return x;
  }

  // Draw the complete campsite scene
  function drawCampsiteScene() {
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas with night sky gradient
    const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
    skyGradient.addColorStop(0, '#0a0a1a');
    skyGradient.addColorStop(0.3, '#1a1a2e');
    skyGradient.addColorStop(0.7, '#16213e');
    skyGradient.addColorStop(1, '#0f1419');
    
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, width, height);

    // Draw scene layers from back to front
    drawStars(ctx, width, height);
    drawMoon(ctx, width, height);
    drawDistantMountains(ctx, width, height);
    drawMidMountains(ctx, width, height);
    drawForestLayers(ctx, width, height);
    drawDetailedTrees(ctx, width, height);
    drawCampfireGlow(ctx, width, height);
    drawGround(ctx, width, height);
  }

  // Draw twinkling stars
  function drawStars(ctx, width, height) {
    stars.forEach(star => {
      const twinkle = Math.sin(animationTime * star.twinkleSpeed + star.phase) * 0.3 + 0.7;
      const alpha = star.brightness * twinkle;
      
      // Star glow
      const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 3);
      glowGradient.addColorStop(0, `rgba(255, 255, 240, ${alpha})`);
      glowGradient.addColorStop(0.5, `rgba(255, 255, 240, ${alpha * 0.3})`);
      glowGradient.addColorStop(1, 'rgba(255, 255, 240, 0)');
      
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Star core
      ctx.fillStyle = `rgba(255, 255, 240, ${alpha})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // Draw moon with atmospheric glow
  function drawMoon(ctx, width, height) {
    const moonX = width * 0.8;
    const moonY = height * 0.2;
    const moonRadius = 40;
    
    // Moon glow
    const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonRadius * 4);
    moonGlow.addColorStop(0, 'rgba(255, 255, 220, 0.3)');
    moonGlow.addColorStop(0.3, 'rgba(255, 255, 220, 0.1)');
    moonGlow.addColorStop(1, 'rgba(255, 255, 220, 0)');
    
    ctx.fillStyle = moonGlow;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius * 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon surface
    const moonGradient = ctx.createRadialGradient(moonX - 10, moonY - 10, 0, moonX, moonY, moonRadius);
    moonGradient.addColorStop(0, '#f5f5dc');
    moonGradient.addColorStop(0.7, '#e6e6d4');
    moonGradient.addColorStop(1, '#d4d4c8');
    
    ctx.fillStyle = moonGradient;
    ctx.beginPath();
    ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Moon craters
    ctx.fillStyle = 'rgba(200, 200, 180, 0.3)';
    ctx.beginPath();
    ctx.arc(moonX - 8, moonY + 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(moonX + 12, moonY - 8, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw distant mountains with atmospheric perspective
  function drawDistantMountains(ctx, width, height) {
    const layers = 3;
    
    for (let layer = 0; layer < layers; layer++) {
      const opacity = 0.15 + layer * 0.05;
      const baseHeight = height * (0.4 + layer * 0.08);
      const hue = 220 + layer * 10;
      
      ctx.fillStyle = `hsla(${hue}, 30%, 25%, ${opacity})`;
      ctx.beginPath();
      ctx.moveTo(0, baseHeight);
      
      // Create mountain silhouette using noise
      for (let x = 0; x <= width; x += 20) {
        const noise1 = smoothNoise(x * 0.001, layer * 50, 1) * 60;
        const noise2 = smoothNoise(x * 0.003, layer * 100, 1) * 30;
        const peakHeight = baseHeight - 80 - noise1 - noise2;
        ctx.lineTo(x, peakHeight);
      }
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Draw mid-distance mountains with more detail
  function drawMidMountains(ctx, width, height) {
    const mountainGradient = ctx.createLinearGradient(0, height * 0.3, 0, height * 0.7);
    mountainGradient.addColorStop(0, 'rgba(40, 50, 80, 0.6)');
    mountainGradient.addColorStop(1, 'rgba(20, 30, 50, 0.8)');
    
    ctx.fillStyle = mountainGradient;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.55);
    
    // Create detailed mountain profile
    for (let x = 0; x <= width; x += 10) {
      const noise1 = smoothNoise(x * 0.002, 200, 1) * 80;
      const noise2 = smoothNoise(x * 0.008, 300, 1) * 25;
      const noise3 = smoothNoise(x * 0.02, 400, 1) * 10;
      const peakHeight = height * 0.45 - noise1 - noise2 - noise3;
      ctx.lineTo(x, peakHeight);
    }
    
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  }

  // Draw multiple forest layers for depth
  function drawForestLayers(ctx, width, height) {
    const forestLayers = 4;
    
    for (let layer = 0; layer < forestLayers; layer++) {
      const opacity = 0.4 + layer * 0.15;
      const baseHeight = height * (0.65 + layer * 0.05);
      const darkness = 15 + layer * 10;
      
      ctx.fillStyle = `rgba(${darkness}, ${darkness + 10}, ${darkness + 5}, ${opacity})`;
      ctx.beginPath();
      ctx.moveTo(0, baseHeight);
      
      // Create organic forest line with varying tree heights
      for (let x = 0; x <= width; x += 5) {
        const treeNoise = smoothNoise(x * 0.01, layer * 100, 1) * 30;
        const detailNoise = smoothNoise(x * 0.05, layer * 200, 1) * 15;
        const windSway = Math.sin(animationTime * 0.3 + x * 0.01) * 3;
        const forestHeight = baseHeight - 40 - treeNoise - detailNoise + windSway;
        ctx.lineTo(x, forestHeight);
      }
      
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Draw detailed foreground trees
  function drawDetailedTrees(ctx, width, height) {
    const treeCount = Math.floor(width / 150) + 3;
    
    for (let i = 0; i < treeCount; i++) {
      const x = (width / (treeCount + 1)) * (i + 1) + (Math.random() - 0.5) * 100;
      const size = 0.8 + Math.random() * 0.6;
      const treeType = Math.floor(Math.random() * 3);
      
      drawRealisticTree(ctx, x, height, size, treeType, i);
    }
  }

  // Draw individual realistic tree
  function drawRealisticTree(ctx, x, groundY, size, type, index) {
    const treeHeight = (120 + Math.random() * 80) * size;
    const baseY = groundY - 30;
    
    // Wind sway
    const sway = Math.sin(animationTime * 0.4 + index * 0.5) * (3 * size);
    const swayX = x + sway;
    
    ctx.save();
    ctx.translate(swayX, baseY);
    
    // Draw trunk
    drawTreeTrunk(ctx, treeHeight, size);
    
    // Draw foliage based on type
    switch(type) {
      case 0: drawPineTree(ctx, treeHeight, size); break;
      case 1: drawOakTree(ctx, treeHeight, size); break;
      case 2: drawBirchTree(ctx, treeHeight, size); break;
    }
    
    ctx.restore();
  }

  // Draw realistic tree trunk
  function drawTreeTrunk(ctx, height, size) {
    const trunkWidth = 12 * size;
    const trunkHeight = height * 0.4;
    
    // Trunk gradient for 3D effect
    const trunkGradient = ctx.createLinearGradient(-trunkWidth/2, 0, trunkWidth/2, 0);
    trunkGradient.addColorStop(0, 'rgba(25, 15, 10, 0.9)');
    trunkGradient.addColorStop(0.3, 'rgba(45, 30, 20, 1)');
    trunkGradient.addColorStop(0.7, 'rgba(35, 25, 15, 1)');
    trunkGradient.addColorStop(1, 'rgba(20, 12, 8, 0.8)');
    
    ctx.fillStyle = trunkGradient;
    
    // Draw trunk with slight taper
    ctx.beginPath();
    ctx.moveTo(-trunkWidth/2, 0);
    ctx.lineTo(-trunkWidth/3, -trunkHeight);
    ctx.lineTo(trunkWidth/3, -trunkHeight);
    ctx.lineTo(trunkWidth/2, 0);
    ctx.closePath();
    ctx.fill();
    
    // Add bark texture
    ctx.strokeStyle = 'rgba(15, 10, 5, 0.6)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = -trunkHeight * (i / 4);
      ctx.beginPath();
      ctx.moveTo(-trunkWidth/2, y);
      ctx.lineTo(trunkWidth/2, y + Math.random() * 3 - 1.5);
      ctx.stroke();
    }
  }

  // Draw pine tree
  function drawPineTree(ctx, height, size) {
    const layers = 5;
    const layerHeight = height * 0.15;
    
    for (let i = 0; i < layers; i++) {
      const y = -height * 0.3 - (i * layerHeight * 0.7);
      const width = (30 - i * 4) * size;
      
      // Pine layer gradient
      const pineGradient = ctx.createLinearGradient(0, y, 0, y + layerHeight);
      pineGradient.addColorStop(0, 'rgba(20, 40, 25, 0.9)');
      pineGradient.addColorStop(1, 'rgba(15, 30, 20, 1)');
      
      ctx.fillStyle = pineGradient;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(-width/2, y + layerHeight);
      ctx.lineTo(width/2, y + layerHeight);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Draw oak tree
  function drawOakTree(ctx, height, size) {
    const crownRadius = 40 * size;
    const crownY = -height * 0.7;
    
    // Oak crown gradient
    const oakGradient = ctx.createRadialGradient(0, crownY, 0, 0, crownY, crownRadius);
    oakGradient.addColorStop(0, 'rgba(25, 45, 30, 0.8)');
    oakGradient.addColorStop(0.7, 'rgba(20, 35, 25, 0.9)');
    oakGradient.addColorStop(1, 'rgba(15, 25, 20, 1)');
    
    ctx.fillStyle = oakGradient;
    
    // Draw irregular crown shape
    ctx.beginPath();
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
      const noise = smoothNoise(Math.cos(angle) * 10, Math.sin(angle) * 10, 1) * 15;
      const radius = crownRadius + noise;
      const x = Math.cos(angle) * radius;
      const y = crownY + Math.sin(angle) * radius * 0.8;
      
      if (angle === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
  }

  // Draw birch tree
  function drawBirchTree(ctx, height, size) {
    const crownRadius = 25 * size;
    const crownY = -height * 0.8;
    
    // Birch crown (more delicate)
    const birchGradient = ctx.createRadialGradient(0, crownY, 0, 0, crownY, crownRadius);
    birchGradient.addColorStop(0, 'rgba(30, 50, 35, 0.7)');
    birchGradient.addColorStop(1, 'rgba(20, 35, 25, 0.9)');
    
    ctx.fillStyle = birchGradient;
    ctx.beginPath();
    ctx.arc(0, crownY, crownRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add some branch details
    ctx.strokeStyle = 'rgba(15, 25, 20, 0.8)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const angle = (Math.PI * 2 / 3) * i;
      const branchLength = crownRadius * 0.6;
      ctx.beginPath();
      ctx.moveTo(0, crownY);
      ctx.lineTo(Math.cos(angle) * branchLength, crownY + Math.sin(angle) * branchLength);
      ctx.stroke();
    }
  }

  // Draw campfire glow
  function drawCampfireGlow(ctx, width, height) {
    const fireX = width * 0.3;
    const fireY = height - 50;
    
    // Animated fire glow
    const glowIntensity = 0.7 + Math.sin(animationTime * 2) * 0.3;
    const glowRadius = 150 * glowIntensity;
    
    // Outer glow
    const fireGlow = ctx.createRadialGradient(fireX, fireY, 0, fireX, fireY, glowRadius);
    fireGlow.addColorStop(0, `rgba(255, 100, 20, ${0.3 * glowIntensity})`);
    fireGlow.addColorStop(0.3, `rgba(255, 150, 50, ${0.2 * glowIntensity})`);
    fireGlow.addColorStop(0.6, `rgba(255, 200, 100, ${0.1 * glowIntensity})`);
    fireGlow.addColorStop(1, 'rgba(255, 200, 100, 0)');
    
    ctx.fillStyle = fireGlow;
    ctx.beginPath();
    ctx.arc(fireX, fireY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Inner fire core
    const coreGlow = ctx.createRadialGradient(fireX, fireY, 0, fireX, fireY, 30);
    coreGlow.addColorStop(0, `rgba(255, 200, 100, ${0.8 * glowIntensity})`);
    coreGlow.addColorStop(0.5, `rgba(255, 100, 20, ${0.6 * glowIntensity})`);
    coreGlow.addColorStop(1, `rgba(200, 50, 10, ${0.3 * glowIntensity})`);
    
    ctx.fillStyle = coreGlow;
    ctx.beginPath();
    ctx.arc(fireX, fireY, 30, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw ground with texture
  function drawGround(ctx, width, height) {
    const groundY = height - 40;
    
    // Ground gradient
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
    groundGradient.addColorStop(0, 'rgba(25, 20, 15, 0.8)');
    groundGradient.addColorStop(1, 'rgba(15, 12, 10, 1)');
    
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, width, height - groundY);
    
    // Add ground texture
    ctx.fillStyle = 'rgba(30, 25, 20, 0.5)';
    for (let x = 0; x < width; x += 20) {
      for (let y = groundY; y < height; y += 10) {
        if (Math.random() > 0.7) {
          ctx.fillRect(x + Math.random() * 10, y + Math.random() * 5, 2, 1);
        }
      }
    }
  }

  // Animation loop
  function animate() {
    animationTime += 0.016; // ~60fps
    drawCampsiteScene();
    requestAnimationFrame(animate);
  }

  // Initialize
  resizeCanvas();
  animate();

  // Handle resize
  window.addEventListener('resize', resizeCanvas);

  // Cleanup
  window.addEventListener('beforeunload', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});