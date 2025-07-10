// Campsite background with trees and mountains
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

  // Resize canvas
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawCampsiteScene();
  }

  // Draw the campsite scene
  function drawCampsiteScene() {
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw mountains (multiple layers for depth)
    drawMountains(ctx, width, height);
    
    // Draw trees
    drawTrees(ctx, width, height);
    
    // Draw ground/campsite area
    drawGround(ctx, width, height);
  }

  // Draw layered mountains
  function drawMountains(ctx, width, height) {
    // Back mountains (lightest)
    ctx.fillStyle = 'rgba(45, 55, 72, 0.6)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.4);
    
    // Create mountain peaks
    for (let i = 0; i <= width; i += width / 8) {
      const peakHeight = height * (0.2 + Math.random() * 0.15);
      ctx.lineTo(i, peakHeight);
    }
    ctx.lineTo(width, height * 0.4);
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Middle mountains (medium)
    ctx.fillStyle = 'rgba(30, 40, 55, 0.7)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    
    for (let i = 0; i <= width; i += width / 6) {
      const peakHeight = height * (0.25 + Math.random() * 0.2);
      ctx.lineTo(i, peakHeight);
    }
    ctx.lineTo(width, height * 0.5);
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    // Front mountains (darkest)
    ctx.fillStyle = 'rgba(20, 25, 35, 0.8)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.6);
    
    for (let i = 0; i <= width; i += width / 4) {
      const peakHeight = height * (0.3 + Math.random() * 0.25);
      ctx.lineTo(i, peakHeight);
    }
    ctx.lineTo(width, height * 0.6);
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();
  }

  // Draw forest of trees
  function drawTrees(ctx, width, height) {
    const treeCount = Math.floor(width / 80); // Responsive tree count
    
    for (let i = 0; i < treeCount; i++) {
      const x = (i * width) / treeCount + Math.random() * (width / treeCount);
      const treeHeight = height * (0.3 + Math.random() * 0.4);
      const treeWidth = 20 + Math.random() * 30;
      const y = height - treeHeight * 0.7; // Position trees on ground
      
      drawTree(ctx, x, y, treeWidth, treeHeight, i);
    }
  }

  // Draw individual tree
  function drawTree(ctx, x, y, width, height, index) {
    // Tree trunk
    const trunkWidth = width * 0.15;
    const trunkHeight = height * 0.3;
    
    ctx.fillStyle = 'rgba(40, 30, 20, 0.9)';
    ctx.fillRect(x - trunkWidth / 2, y + height * 0.7, trunkWidth, trunkHeight);

    // Tree foliage (multiple layers for depth)
    const layers = 3 + Math.floor(Math.random() * 2);
    
    for (let layer = 0; layer < layers; layer++) {
      const layerY = y + (layer * height) / (layers + 1);
      const layerWidth = width * (1 - layer * 0.2);
      const layerHeight = height * 0.6;
      
      // Vary tree colors slightly
      const greenVariation = Math.floor(Math.random() * 30);
      const alpha = 0.7 + Math.random() * 0.2;
      
      ctx.fillStyle = `rgba(${20 + greenVariation}, ${60 + greenVariation}, ${25 + greenVariation}, ${alpha})`;
      
      // Draw triangular tree shape
      ctx.beginPath();
      ctx.moveTo(x, layerY);
      ctx.lineTo(x - layerWidth / 2, layerY + layerHeight);
      ctx.lineTo(x + layerWidth / 2, layerY + layerHeight);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Draw ground/campsite area
  function drawGround(ctx, width, height) {
    // Ground gradient
    const groundGradient = ctx.createLinearGradient(0, height * 0.8, 0, height);
    groundGradient.addColorStop(0, 'rgba(25, 35, 25, 0.3)');
    groundGradient.addColorStop(0.5, 'rgba(20, 25, 20, 0.5)');
    groundGradient.addColorStop(1, 'rgba(15, 20, 15, 0.7)');
    
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, height * 0.8, width, height * 0.2);

    // Add some grass texture
    drawGrass(ctx, width, height);
  }

  // Draw grass details
  function drawGrass(ctx, width, height) {
    const grassCount = Math.floor(width / 20);
    
    ctx.strokeStyle = 'rgba(40, 60, 30, 0.4)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < grassCount; i++) {
      const x = Math.random() * width;
      const grassHeight = 5 + Math.random() * 15;
      const y = height * 0.8 + Math.random() * (height * 0.2 - grassHeight);
      
      ctx.beginPath();
      ctx.moveTo(x, y + grassHeight);
      ctx.lineTo(x + Math.random() * 4 - 2, y);
      ctx.stroke();
    }
  }

  // Initialize
  resizeCanvas();

  // Handle resize
  window.addEventListener('resize', resizeCanvas);

  // Add subtle animation to trees (swaying)
  let animationTime = 0;
  function animateScene() {
    animationTime += 0.01;
    
    // Redraw scene with slight variations for tree movement
    ctx.save();
    ctx.translate(Math.sin(animationTime) * 0.5, 0);
    // The trees will have a very subtle sway
    ctx.restore();
    
    requestAnimationFrame(animateScene);
  }
  
  // Start subtle animation
  animateScene();

  // Cleanup function
  window.addEventListener('beforeunload', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
});