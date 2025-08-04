import { Renderer, Program, Mesh, Color, Triangle } from 'https://unpkg.com/ogl@1.0.11/src/index.js?module';

const VERT = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;

uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uIsLight;


varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv.xy * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - vec2(0.5)) * uAmplitude;
  
  float d = -uTime * 0.5 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 8.0; ++i) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }
  d += uTime * 0.5 * uSpeed;
  vec3 col = vec3(cos(uv * vec2(d, a)) * 0.6 + 0.4, cos(a + d) * 0.5 + 0.5);
  col = cos(col * cos(vec3(d, a, 2.5)) * 0.5 + 0.5);
  float t = clamp(col.r, 0.0, 1.0);
  vec3 gradAB = mix(uColor1, uColor2, smoothstep(0.0, 0.5, t));
  vec3 grad = mix(gradAB, uColor3, smoothstep(0.5, 1.0, t));
  vec3 finalCol = mix( grad + col,col, uIsLight);
  gl_FragColor = vec4(mix(t * finalCol, finalCol, uIsLight), 1.0);
}
`;

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('iridescence');
  if (!container) return;

  const renderer = new Renderer();
  const gl = renderer.gl;
  gl.clearColor(1, 1, 1, 1);

  const colorAttr1 = container.getAttribute('data-color-1') || container.getAttribute('data-color');
  const color1 = colorAttr1 ? colorAttr1.split(',').map(Number) : [1, 1, 1];
  const colorAttr2 = container.getAttribute('data-color-2');
  const color2 = colorAttr2 ? colorAttr2.split(',').map(Number) : color1;
  const colorAttr3 = container.getAttribute('data-color-3');
  const color3 = colorAttr3 ? colorAttr3.split(',').map(Number) : color2;
  const amplitude = parseFloat(container.getAttribute('data-amplitude')) || 0.1;
  const speed = parseFloat(container.getAttribute('data-speed')) || 1.0;
  const mouseReact = container.getAttribute('data-mouse-react') !== 'false';

  let program;

  function resize() {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    renderer.setSize(width, height);
    if (program) {
      program.uniforms.uResolution.value = new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    }
  }
  window.addEventListener('resize', resize);

  const geometry = new Triangle(gl);
  program = new Program(gl, {
    vertex: VERT,
    fragment: FRAG,
    uniforms: {
      uTime: { value: 0 },
      uColor1: { value: new Color(...color1) },
      uColor2: { value: new Color(...color2) },
      uColor3: { value: new Color(...color3) },
      uResolution: { value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
      uMouse: { value: new Float32Array([0.5, 0.5]) },
      uAmplitude: { value: amplitude },
      uSpeed: { value: speed },
      uIsLight: { value: document.documentElement.classList.contains('light-mode') ? 1 : 0 }
    }
  });

  const mesh = new Mesh(gl, { geometry, program });
  container.appendChild(gl.canvas);
  resize();

  const updateIsLight = () => {
    program.uniforms.uIsLight.value = document.documentElement.classList.contains('light-mode') ? 1 : 0;
  };

  const observer = new MutationObserver(updateIsLight);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  updateIsLight();

  let frame;
  function update(t) {
    frame = requestAnimationFrame(update);
    program.uniforms.uTime.value = t * 0.001;
    renderer.render({ scene: mesh });
  }
  frame = requestAnimationFrame(update);

  function handleMouseMove(e) {
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    program.uniforms.uMouse.value[0] = x;
    program.uniforms.uMouse.value[1] = y;
  }
  if (mouseReact) {
    container.addEventListener('mousemove', handleMouseMove);
  }

  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(frame);
    if (gl.canvas.parentNode === container) {
      container.removeChild(gl.canvas);
    }
    observer.disconnect();
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  });
});