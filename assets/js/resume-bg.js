document.addEventListener('DOMContentLoaded', () => {
const container = document.getElementById('dither-background');
if (!container) return;

import('./dither-background.js')
    .then(({ default: DitherBackground }) => {
    new DitherBackground(container, {
        colors: [
        [1, 0.3, 0.85],
        [0.98, 1, 0.6],
        [0.36, 1, 0.8],
        [0.45, 0.82, 1]
        ],
        enableMouseInteraction: true,
        mouseRadius: 0.3,
        colorNum: 4,
        waveAmplitude: 0.3,
        waveFrequency: 3,
        waveSpeed: 0.05,
        pixelSize: 2,
        disableAnimation: false
    });
    })
    .catch(err => {
    console.error('Failed to initialize dither background:', err);
    });
});