const PIXEL_RATIO = 0.25;
const FRAME_INTERVAL = 90;

function createOverlay() {
    const canvas = document.createElement('canvas');
    canvas.className = 'pixel-noise-overlay';
    canvas.setAttribute('aria-hidden', 'true');
    Object.assign(canvas.style, {
        position: 'fixed',
        inset: '0',
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: '5',
        mixBlendMode: 'screen',
        opacity: '0.08',
    });
    document.body.appendChild(canvas);
    return canvas;
}

function resizeCanvas(canvas) {
    const width = Math.ceil(window.innerWidth * PIXEL_RATIO);
    const height = Math.ceil(window.innerHeight * PIXEL_RATIO);
    if (canvas.width === width && canvas.height === height) return false;
    canvas.width = width;
    canvas.height = height;
    return true;
}

function drawNoise(canvas, context) {
    const imageData = context.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
        const shade = Math.random() * 255;
        data[i] = shade;
        data[i + 1] = shade;
        data[i + 2] = shade;
        data[i + 3] = 32;
    }
    context.putImageData(imageData, 0, 0);
}

function initPixelEffect() {
    const existing = document.querySelector('.pixel-noise-overlay');
    const canvas = existing || createOverlay();
    const context = canvas.getContext('2d');

    const render = () => {
        resizeCanvas(canvas);
        drawNoise(canvas, context);
    };

    let rafId = null;
    let timeoutId = null;

    const loop = () => {
        render();
        rafId = requestAnimationFrame(() => {
            timeoutId = setTimeout(loop, FRAME_INTERVAL);
        });
    };

    loop();

    const handleResize = () => {
        resizeCanvas(canvas);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeunload', () => {
        if (rafId) cancelAnimationFrame(rafId);
        if (timeoutId) clearTimeout(timeoutId);
        window.removeEventListener('resize', handleResize);
    });
}

document.addEventListener('DOMContentLoaded', initPixelEffect);