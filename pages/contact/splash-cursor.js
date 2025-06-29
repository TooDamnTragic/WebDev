// Splash Color Cursor Effect - Converted from React to Vanilla JS
class SplashCursor {
  constructor(options = {}) {
    this.config = {
      SIM_RESOLUTION: options.SIM_RESOLUTION || 128,
      DYE_RESOLUTION: options.DYE_RESOLUTION || 1440,
      CAPTURE_RESOLUTION: options.CAPTURE_RESOLUTION || 512,
      DENSITY_DISSIPATION: options.DENSITY_DISSIPATION || 3.5,
      VELOCITY_DISSIPATION: options.VELOCITY_DISSIPATION || 2,
      PRESSURE: options.PRESSURE || 0.1,
      PRESSURE_ITERATIONS: options.PRESSURE_ITERATIONS || 20,
      CURL: options.CURL || 3,
      SPLAT_RADIUS: options.SPLAT_RADIUS || 0.2,
      SPLAT_FORCE: options.SPLAT_FORCE || 6000,
      SHADING: options.SHADING !== undefined ? options.SHADING : true,
      COLOR_UPDATE_SPEED: options.COLOR_UPDATE_SPEED || 10,
      BACK_COLOR: options.BACK_COLOR || { r: 0.5, g: 0, b: 0 },
      TRANSPARENT: options.TRANSPARENT !== undefined ? options.TRANSPARENT : true
    };

    this.pointers = [this.createPointer()];
    this.canvas = null;
    this.gl = null;
    this.ext = null;
    this.programs = {};
    this.framebuffers = {};
    this.lastUpdateTime = Date.now();
    this.colorUpdateTimer = 0.0;

    this.init();
  }

  createPointer() {
    return {
      id: -1,
      texcoordX: 0,
      texcoordY: 0,
      prevTexcoordX: 0,
      prevTexcoordY: 0,
      deltaX: 0,
      deltaY: 0,
      down: false,
      moved: false,
      color: [0, 0, 0]
    };
  }

  init() {
    // Create canvas
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'splash-cursor-canvas';
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 50;
      display: block;
    `;
    
    document.body.appendChild(this.canvas);

    // Initialize WebGL
    const { gl, ext } = this.getWebGLContext(this.canvas);
    this.gl = gl;
    this.ext = ext;

    if (!ext.supportLinearFiltering) {
      this.config.DYE_RESOLUTION = 256;
      this.config.SHADING = false;
    }

    this.initShaders();
    this.initFramebuffers();
    this.setupEventListeners();
    this.updateKeywords();
    this.startRenderLoop();
  }

  getWebGLContext(canvas) {
    const params = {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false,
    };

    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!isWebGL2) {
      gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
    }

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
    let formatRGBA, formatRG, formatR;

    if (isWebGL2) {
      formatRGBA = this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
      formatRG = this.getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
      formatR = this.getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
    } else {
      formatRGBA = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatRG = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
      formatR = this.getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }

    return {
      gl,
      ext: {
        formatRGBA,
        formatRG,
        formatR,
        halfFloatTexType,
        supportLinearFiltering,
      },
    };
  }

  getSupportedFormat(gl, internalFormat, format, type) {
    if (!this.supportRenderTextureFormat(gl, internalFormat, format, type)) {
      switch (internalFormat) {
        case gl.R16F:
          return this.getSupportedFormat(gl, gl.RG16F, gl.RG, type);
        case gl.RG16F:
          return this.getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
        default:
          return null;
      }
    }
    return { internalFormat, format };
  }

  supportRenderTextureFormat(gl, internalFormat, format, type) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status === gl.FRAMEBUFFER_COMPLETE;
  }

  initShaders() {
    const gl = this.gl;

    // Base vertex shader
    const baseVertexShader = this.compileShader(gl.VERTEX_SHADER, `
      precision highp float;
      attribute vec2 aPosition;
      varying vec2 vUv;
      varying vec2 vL;
      varying vec2 vR;
      varying vec2 vT;
      varying vec2 vB;
      uniform vec2 texelSize;

      void main () {
          vUv = aPosition * 0.5 + 0.5;
          vL = vUv - vec2(texelSize.x, 0.0);
          vR = vUv + vec2(texelSize.x, 0.0);
          vT = vUv + vec2(0.0, texelSize.y);
          vB = vUv - vec2(0.0, texelSize.y);
          gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `);

    // Fragment shaders
    const copyShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision mediump float;
      precision mediump sampler2D;
      varying highp vec2 vUv;
      uniform sampler2D uTexture;

      void main () {
          gl_FragColor = texture2D(uTexture, vUv);
      }
    `);

    const splatShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTarget;
      uniform float aspectRatio;
      uniform vec3 color;
      uniform vec2 point;
      uniform float radius;

      void main () {
          vec2 p = vUv - point.xy;
          p.x *= aspectRatio;
          vec3 splat = exp(-dot(p, p) / radius) * color;
          vec3 base = texture2D(uTarget, vUv).xyz;
          gl_FragColor = vec4(base + splat, 1.0);
      }
    `);

    const displayShader = this.compileShader(gl.FRAGMENT_SHADER, `
      precision highp float;
      precision highp sampler2D;
      varying vec2 vUv;
      uniform sampler2D uTexture;

      void main () {
          vec3 c = texture2D(uTexture, vUv).rgb;
          float a = max(c.r, max(c.g, c.b));
          gl_FragColor = vec4(c, a);
      }
    `);

    // Create programs
    this.programs.copy = this.createProgram(baseVertexShader, copyShader);
    this.programs.splat = this.createProgram(baseVertexShader, splatShader);
    this.programs.display = this.createProgram(baseVertexShader, displayShader);

    // Setup geometry
    this.setupGeometry();
  }

  compileShader(type, source, keywords) {
    const gl = this.gl;
    if (keywords) {
      let keywordsString = '';
      keywords.forEach((keyword) => {
        keywordsString += '#define ' + keyword + '\n';
      });
      source = keywordsString + source;
    }

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    }

    return shader;
  }

  createProgram(vertexShader, fragmentShader) {
    const gl = this.gl;
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
    }

    // Get uniforms
    const uniforms = {};
    const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
      const uniformName = gl.getActiveUniform(program, i).name;
      uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
    }

    return { program, uniforms };
  }

  setupGeometry() {
    const gl = this.gl;
    
    // Create vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW
    );

    // Create index buffer
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array([0, 1, 2, 0, 2, 3]),
      gl.STATIC_DRAW
    );

    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);
  }

  initFramebuffers() {
    const gl = this.gl;
    const dyeRes = this.getResolution(this.config.DYE_RESOLUTION);
    const texType = this.ext.halfFloatTexType;
    const rgba = this.ext.formatRGBA;
    const filtering = this.ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    gl.disable(gl.BLEND);

    this.framebuffers.dye = this.createDoubleFBO(
      dyeRes.width,
      dyeRes.height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering
    );
  }

  createFBO(w, h, internalFormat, format, type, param) {
    const gl = this.gl;
    
    gl.activeTexture(gl.TEXTURE0);
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    const fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    return {
      texture,
      fbo,
      width: w,
      height: h,
      texelSizeX: 1.0 / w,
      texelSizeY: 1.0 / h,
      attach(id) {
        gl.activeTexture(gl.TEXTURE0 + id);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        return id;
      },
    };
  }

  createDoubleFBO(w, h, internalFormat, format, type, param) {
    const fbo1 = this.createFBO(w, h, internalFormat, format, type, param);
    const fbo2 = this.createFBO(w, h, internalFormat, format, type, param);
    
    return {
      width: w,
      height: h,
      texelSizeX: fbo1.texelSizeX,
      texelSizeY: fbo1.texelSizeY,
      read: fbo1,
      write: fbo2,
      swap() {
        const temp = this.read;
        this.read = this.write;
        this.write = temp;
      },
    };
  }

  updateKeywords() {
    // Simple implementation for display shader
  }

  setupEventListeners() {
    // Mouse events
    window.addEventListener('mousedown', (e) => {
      const pointer = this.pointers[0];
      const posX = this.scaleByPixelRatio(e.clientX);
      const posY = this.scaleByPixelRatio(e.clientY);
      this.updatePointerDownData(pointer, -1, posX, posY);
      this.clickSplat(pointer);
    });

    window.addEventListener('mousemove', (e) => {
      const pointer = this.pointers[0];
      const posX = this.scaleByPixelRatio(e.clientX);
      const posY = this.scaleByPixelRatio(e.clientY);
      this.updatePointerMoveData(pointer, posX, posY, pointer.color);
    });

    // Touch events
    window.addEventListener('touchstart', (e) => {
      const touches = e.targetTouches;
      const pointer = this.pointers[0];
      for (let i = 0; i < touches.length; i++) {
        const posX = this.scaleByPixelRatio(touches[i].clientX);
        const posY = this.scaleByPixelRatio(touches[i].clientY);
        this.updatePointerDownData(pointer, touches[i].identifier, posX, posY);
      }
    });

    window.addEventListener('touchmove', (e) => {
      const touches = e.targetTouches;
      const pointer = this.pointers[0];
      for (let i = 0; i < touches.length; i++) {
        const posX = this.scaleByPixelRatio(touches[i].clientX);
        const posY = this.scaleByPixelRatio(touches[i].clientY);
        this.updatePointerMoveData(pointer, posX, posY, pointer.color);
      }
    }, false);

    window.addEventListener('touchend', (e) => {
      const pointer = this.pointers[0];
      this.updatePointerUpData(pointer);
    });

    // Resize event
    window.addEventListener('resize', () => {
      if (this.resizeCanvas()) {
        this.initFramebuffers();
      }
    });
  }

  updatePointerDownData(pointer, id, posX, posY) {
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = posX / this.canvas.width;
    pointer.texcoordY = 1.0 - posY / this.canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = this.generateColor();
  }

  updatePointerMoveData(pointer, posX, posY, color) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / this.canvas.width;
    pointer.texcoordY = 1.0 - posY / this.canvas.height;
    pointer.deltaX = this.correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = this.correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    pointer.color = color || this.generateColor();
  }

  updatePointerUpData(pointer) {
    pointer.down = false;
  }

  correctDeltaX(delta) {
    const aspectRatio = this.canvas.width / this.canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
  }

  correctDeltaY(delta) {
    const aspectRatio = this.canvas.width / this.canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
  }

  generateColor() {
    const c = this.HSVtoRGB(Math.random(), 1.0, 1.0);
    c.r *= 0.15;
    c.g *= 0.15;
    c.b *= 0.15;
    return c;
  }

  HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    
    switch (i % 6) {
      case 0: r = v; g = t; b = p; break;
      case 1: r = q; g = v; b = p; break;
      case 2: r = p; g = v; b = t; break;
      case 3: r = p; g = q; b = v; break;
      case 4: r = t; g = p; b = v; break;
      case 5: r = v; g = p; b = q; break;
    }
    
    return { r, g, b };
  }

  clickSplat(pointer) {
    const color = this.generateColor();
    color.r *= 10.0;
    color.g *= 10.0;
    color.b *= 10.0;
    const dx = 10 * (Math.random() - 0.5);
    const dy = 30 * (Math.random() - 0.5);
    this.splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
  }

  splat(x, y, dx, dy, color) {
    const gl = this.gl;
    const program = this.programs.splat;
    
    gl.useProgram(program.program);
    gl.uniform1i(program.uniforms.uTarget, this.framebuffers.dye.read.attach(0));
    gl.uniform1f(program.uniforms.aspectRatio, this.canvas.width / this.canvas.height);
    gl.uniform2f(program.uniforms.point, x, y);
    gl.uniform3f(program.uniforms.color, color.r, color.g, color.b);
    gl.uniform1f(program.uniforms.radius, this.correctRadius(this.config.SPLAT_RADIUS / 100.0));
    
    this.blit(this.framebuffers.dye.write);
    this.framebuffers.dye.swap();
  }

  correctRadius(radius) {
    const aspectRatio = this.canvas.width / this.canvas.height;
    if (aspectRatio > 1) radius *= aspectRatio;
    return radius;
  }

  blit(target) {
    const gl = this.gl;
    
    if (target == null) {
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    } else {
      gl.viewport(0, 0, target.width, target.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    }
    
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
  }

  render() {
    const gl = this.gl;
    const program = this.programs.display;
    
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);
    
    gl.useProgram(program.program);
    gl.uniform1i(program.uniforms.uTexture, this.framebuffers.dye.read.attach(0));
    this.blit(null);
  }

  startRenderLoop() {
    const updateFrame = () => {
      this.calcDeltaTime();
      if (this.resizeCanvas()) {
        this.initFramebuffers();
      }
      this.updateColors();
      this.applyInputs();
      this.render();
      requestAnimationFrame(updateFrame);
    };
    
    updateFrame();
  }

  calcDeltaTime() {
    const now = Date.now();
    let dt = (now - this.lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    this.lastUpdateTime = now;
    return dt;
  }

  resizeCanvas() {
    const width = this.scaleByPixelRatio(this.canvas.clientWidth);
    const height = this.scaleByPixelRatio(this.canvas.clientHeight);
    
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      return true;
    }
    return false;
  }

  updateColors() {
    const dt = this.calcDeltaTime();
    this.colorUpdateTimer += dt * this.config.COLOR_UPDATE_SPEED;
    
    if (this.colorUpdateTimer >= 1) {
      this.colorUpdateTimer = this.colorUpdateTimer % 1;
      this.pointers.forEach((p) => {
        p.color = this.generateColor();
      });
    }
  }

  applyInputs() {
    this.pointers.forEach((p) => {
      if (p.moved) {
        p.moved = false;
        this.splatPointer(p);
      }
    });
  }

  splatPointer(pointer) {
    const dx = pointer.deltaX * this.config.SPLAT_FORCE;
    const dy = pointer.deltaY * this.config.SPLAT_FORCE;
    this.splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
  }

  getResolution(resolution) {
    let aspectRatio = this.gl.drawingBufferWidth / this.gl.drawingBufferHeight;
    if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;
    
    const min = Math.round(resolution);
    const max = Math.round(resolution * aspectRatio);
    
    if (this.gl.drawingBufferWidth > this.gl.drawingBufferHeight) {
      return { width: max, height: min };
    } else {
      return { width: min, height: max };
    }
  }

  scaleByPixelRatio(input) {
    const pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
  }

  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Export for use
window.SplashCursor = SplashCursor;