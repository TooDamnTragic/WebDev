//this shit is copy pasted, no idea how this actually works

document.addEventListener('DOMContentLoaded', () => {
const items = document.querySelectorAll('#extracurricular-menu .menu__item');
if (!items.length || typeof gsap === 'undefined') return;

// Duplicate marquee content so the horizontal scroll can loop seamlessly
document
    .querySelectorAll('#extracurricular-menu .marquee__inner')
    .forEach((inner) => {
    inner.innerHTML += inner.innerHTML;
    const singleWidth = inner.scrollWidth / 2;
    inner.style.setProperty('--marquee-width', `${singleWidth}px`);
    });
const animationDefaults = { duration: 0.6, ease: 'expo' };

const distMetric = (x, y, x2, y2) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
};
    
const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
};

items.forEach(item => {
    const marquee = item.querySelector('.marquee');
    const marqueeInner = item.querySelector('.marquee__inner-wrap');
    if (!marquee || !marqueeInner) return;

    item.addEventListener('mouseenter', ev => {
    const rect = item.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap.set(marquee, { y: edge === 'top' ? '-101%' : '101%' });
    gsap.set(marqueeInner, { y: edge === 'top' ? '101%' : '-101%' });
    gsap.to([marquee, marqueeInner], { y: '0%', ...animationDefaults });
    });

    item.addEventListener('mouseleave', ev => {
    const rect = item.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap.to(marquee, { y: edge === 'top' ? '-101%' : '101%', ...animationDefaults });
    gsap.to(marqueeInner, { y: edge === 'top' ? '101%' : '-101%', ...animationDefaults });
    });
});
});