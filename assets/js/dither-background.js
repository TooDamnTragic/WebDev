// Dither Background Effect - Vanilla Three.js implementation
import * as THREE from 'three';

class DitherBackground {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      waveSpeed: options.waveSpeed || 0.05,
      waveFrequency: options.waveFrequency || 3,
      waveAmplitude: options.waveAmplitude || 0.3,
      waveColor: options.waveColor || [0.5, 0.5, 0.5],
      colorNum: options.colorNum || 4,
      pixelSize: options.pixelSize || 2,
      disableAnimation: options.disableAnimation || false,
      enableMouseInteraction: options.enableMouseInteraction !== false,
      mouseRadius: options.mouseRadius || 1,
    };
    
    this.mouse = { x: 0, y: 0 };
    this.clock = new THREE.Clock();
    this.animationId = null;
    
    this.init();
  }
  
  init() {
    // Create scene, camera, renderer
    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      preserveDrawingBuffer: true,
      alpha: true 
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
    
    // Create wave shader material
    this.createWaveMaterial();
    
    // Create dither post-processing
    this.createDitherEffect();
    
    // Create geometry
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.waveMaterial);
    this.scene.add(this.mesh);
    
    // Add event listeners
    this.addEventListeners();
    
    // Start animation
    this.animate();
  }
  
  createWaveMaterial() {
    const waveVertexShader = `
      precision highp float;
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const waveFragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float waveSpeed;
      uniform float waveFrequency;
      uniform float waveAmplitude;
      uniform vec3 waveColor;
      uniform vec2 mousePos;
      uniform int enableMouseInteraction;
      uniform float mouseRadius;
      varying vec2 vUv;

      vec4 mod289(vec4 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      vec2 fade(vec2 t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

      float cnoise(vec2 P) {
        vec4 Pi = floor(P.xyxy) + vec4(0.0,0.0,1.0,1.0);
        vec4 Pf = fract(P.xyxy) - vec4(0.0,0.0,1.0,1.0);
        Pi = mod289(Pi);
        vec4 ix = Pi.xzxz;
        vec4 iy = Pi.yyww;
        vec4 fx = Pf.xzxz;
        vec4 fy = Pf.yyww;
        vec4 i = permute(permute(ix) + iy);
        vec4 gx = fract(i * (1.0/41.0)) * 2.0 - 1.0;
        vec4 gy = abs(gx) - 0.5;
        vec4 tx = floor(gx + 0.5);
        gx = gx - tx;
        vec2 g00 = vec2(gx.x, gy.x);
        vec2 g10 = vec2(gx.y, gy.y);
        vec2 g01 = vec2(gx.z, gy.z);
        vec2 g11 = vec2(gx.w, gy.w);
        vec4 norm = taylorInvSqrt(vec4(dot(g00,g00), dot(g01,g01), dot(g10,g10), dot(g11,g11)));
        g00 *= norm.x; g01 *= norm.y; g10 *= norm.z; g11 *= norm.w;
        float n00 = dot(g00, vec2(fx.x, fy.x));
        float n10 = dot(g10, vec2(fx.y, fy.y));
        float n01 = dot(g01, vec2(fx.z, fy.z));
        float n11 = dot(g11, vec2(fx.w, fy.w));
        vec2 fade_xy = fade(Pf.xy);
        vec2 n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
        return 2.3 * mix(n_x.x, n_x.y, fade_xy.y);
      }

      const int OCTAVES = 8;
      float fbm(vec2 p) {
        float value = 0.0;
        float amp = 1.0;
        float freq = waveFrequency;
        for (int i = 0; i < OCTAVES; i++) {
          value += amp * abs(cnoise(p));
          p *= freq;
          amp *= waveAmplitude;
        }
        return value;
      }

      float pattern(vec2 p) {
        vec2 p2 = p - time * waveSpeed;
        return fbm(p - fbm(p + fbm(p2)));
      }

      void main() {
        vec2 uv = vUv - 0.5;
        uv.x *= resolution.x / resolution.y;
        float f = pattern(uv);
        
        if (enableMouseInteraction == 1) {
          vec2 mouseNDC = (mousePos / resolution - 0.5) * vec2(1.0, -1.0);
          mouseNDC.x *= resolution.x / resolution.y;
          float dist = length(uv - mouseNDC);
          float effect = 1.0 - smoothstep(0.0, mouseRadius, dist);
          f -= 0.5 * effect;
        }
        
        vec3 col = mix(vec3(0.0), waveColor, f);
        gl_FragColor = vec4(col, 1.0);
      }
    `;
    
    this.waveMaterial = new THREE.ShaderMaterial({
      vertexShader: waveVertexShader,
      fragmentShader: waveFragmentShader,
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        waveSpeed: { value: this.options.waveSpeed },
        waveFrequency: { value: this.options.waveFrequency },
        waveAmplitude: { value: this.options.waveAmplitude },
        waveColor: { value: new THREE.Color(...this.options.waveColor) },
        mousePos: { value: new THREE.Vector2(0, 0) },
        enableMouseInteraction: { value: this.options.enableMouseInteraction ? 1 : 0 },
        mouseRadius: { value: this.options.mouseRadius },
      }
    });
  }
  
  createDitherEffect() {
    // Create render target for post-processing
    this.renderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth, 
      window.innerHeight,
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
        type: THREE.UnsignedByteType
      }
    );
    
    // Dither shader
    const ditherVertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;
    
    const ditherFragmentShader = `
      precision highp float;
      uniform sampler2D tDiffuse;
      uniform vec2 resolution;
      uniform float colorNum;
      uniform float pixelSize;
      varying vec2 vUv;
      
      const float bayerMatrix8x8[64] = float[64](
        0.0/64.0, 48.0/64.0, 12.0/64.0, 60.0/64.0,  3.0/64.0, 51.0/64.0, 15.0/64.0, 63.0/64.0,
        32.0/64.0,16.0/64.0, 44.0/64.0, 28.0/64.0, 35.0/64.0,19.0/64.0, 47.0/64.0, 31.0/64.0,
        8.0/64.0, 56.0/64.0,  4.0/64.0, 52.0/64.0, 11.0/64.0,59.0/64.0,  7.0/64.0, 55.0/64.0,
        40.0/64.0,24.0/64.0, 36.0/64.0, 20.0/64.0, 43.0/64.0,27.0/64.0, 39.0/64.0, 23.0/64.0,
        2.0/64.0, 50.0/64.0, 14.0/64.0, 62.0/64.0,  1.0/64.0,49.0/64.0, 13.0/64.0, 61.0/64.0,
        34.0/64.0,18.0/64.0, 46.0/64.0, 30.0/64.0, 33.0/64.0,17.0/64.0, 45.0/64.0, 29.0/64.0,
        10.0/64.0,58.0/64.0,  6.0/64.0, 54.0/64.0,  9.0/64.0,57.0/64.0,  5.0/64.0, 53.0/64.0,
        42.0/64.0,26.0/64.0, 38.0/64.0, 22.0/64.0, 41.0/64.0,25.0/64.0, 37.0/64.0, 21.0/64.0
      );

      vec3 dither(vec2 uv, vec3 color) {
        vec2 scaledCoord = floor(uv * resolution / pixelSize);
        int x = int(mod(scaledCoord.x, 8.0));
        int y = int(mod(scaledCoord.y, 8.0));
        float threshold = bayerMatrix8x8[y * 8 + x] - 0.25;
        float step = 1.0 / (colorNum - 1.0);
        color += threshold * step;
        float bias = 0.2;
        color = clamp(color - bias, 0.0, 1.0);
        return floor(color * (colorNum - 1.0) + 0.5) / (colorNum - 1.0);
      }

      void main() {
        vec2 normalizedPixelSize = pixelSize / resolution;
        vec2 uvPixel = normalizedPixelSize * floor(vUv / normalizedPixelSize);
        vec4 color = texture2D(tDiffuse, uvPixel);
        color.rgb = dither(vUv, color.rgb);
        gl_FragColor = color;
      }
    `;
    
    this.ditherMaterial = new THREE.ShaderMaterial({
      vertexShader: ditherVertexShader,
      fragmentShader: ditherFragmentShader,
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        colorNum: { value: this.options.colorNum },
        pixelSize: { value: this.options.pixelSize }
      }
    });
    
    // Create quad for post-processing
    const quadGeometry = new THREE.PlaneGeometry(2, 2);
    this.ditherQuad = new THREE.Mesh(quadGeometry, this.ditherMaterial);
    this.ditherScene = new THREE.Scene();
    this.ditherScene.add(this.ditherQuad);
  }
  
  addEventListeners() {
    // Mouse movement
    this.container.addEventListener('mousemove', (e) => {
      if (!this.options.enableMouseInteraction) return;
      
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = (e.clientX - rect.left) * window.devicePixelRatio;
      this.mouse.y = (e.clientY - rect.top) * window.devicePixelRatio;
      
      this.waveMaterial.uniforms.mousePos.value.set(this.mouse.x, this.mouse.y);
    });
    
    // Window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }
  
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.renderer.setSize(width, height);
    this.renderTarget.setSize(width, height);
    
    this.waveMaterial.uniforms.resolution.value.set(width, height);
    this.ditherMaterial.uniforms.resolution.value.set(width, height);
  }
  
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    if (!this.options.disableAnimation) {
      this.waveMaterial.uniforms.time.value = this.clock.getElapsedTime();
    }
    
    // Render to texture first
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);
    
    // Then render with dither effect
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.ditherScene, this.camera);
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.renderTarget) {
      this.renderTarget.dispose();
    }
  }
}

export default DitherBackground;