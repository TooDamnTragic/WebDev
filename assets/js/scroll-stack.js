document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('certificate-stack');
    if (!scroller) return;

    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            wrapper: scroller,
            content: scroller.querySelector('.scroll-stack-inner'),
            duration: 1.2,
            easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            touchMultiplier: 2,
            normalizeWheel: true,
            wheelMultiplier: 1,
            touchInertiaMultiplier: 35,
            lerp: 0.1,
            syncTouch: true,
            syncTouchLerp: 0.075,
            touchInertia: 0.6
        });
    }

    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'));
    const lastTransforms = new Map();
    const itemDistance = 100;
    const itemScale = 0.03;
    const itemStackDistance = 30;
    const stackPosition = '20%';
    const scaleEndPosition = '10%';
    const baseScale = 0.85;
    const rotationAmount = 0;
    const blurAmount = 0;

    cards.forEach((card, i) => {
        if (i < cards.length - 1) {
            card.style.marginBottom = `${itemDistance}px`;
        }
        card.style.willChange = 'transform, filter';
        card.style.transformOrigin = 'top center';
        card.style.backfaceVisibility = 'hidden';
        card.style.transform = 'translateZ(0)';
        card.style.webkitTransform = 'translateZ(0)';
        card.style.perspective = '1000px';
        card.style.webkitPerspective = '1000px';
    });

    function parsePercentage(value, containerHeight) {
        if (typeof value === 'string' && value.includes('%')) {
            return (parseFloat(value) / 100) * containerHeight;
        }
        return parseFloat(value);
    }

    function calculateProgress(scrollTop, start, end) {
        if (scrollTop < start) return 0;
        if (scrollTop > end) return 1;
        return (scrollTop - start) / (end - start);
    }

    function updateCardTransforms() {
        const scrollTop = scroller.scrollTop;
        const containerHeight = scroller.clientHeight;
        const stackPos = parsePercentage(stackPosition, containerHeight);
        const scaleEndPos = parsePercentage(scaleEndPosition, containerHeight);
        const endElement = scroller.querySelector('.scroll-stack-end');
        const endElementTop = endElement ? endElement.offsetTop : 0;

        cards.forEach((card, i) => {
            const cardTop = card.offsetTop;
            const triggerStart = cardTop - stackPos - itemStackDistance * i;
            const triggerEnd = cardTop - scaleEndPos;
            const pinStart = cardTop - stackPos - itemStackDistance * i;
            const pinEnd = endElementTop - containerHeight / 2;

            const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
            const targetScale = baseScale + i * itemScale;
            const scale = 1 - scaleProgress * (1 - targetScale);
            const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

            let blur = 0;
            if (blurAmount) {
                let topCardIndex = 0;
                for (let j = 0; j < cards.length; j++) {
                    const jCardTop = cards[j].offsetTop;
                    const jTriggerStart = jCardTop - stackPos - itemStackDistance * j;
                    if (scrollTop >= jTriggerStart) {
                        topCardIndex = j;
                    }
                }
                if (i < topCardIndex) {
                    const depthInStack = topCardIndex - i;
                    blur = Math.max(0, depthInStack * blurAmount);
                }
            }

            let translateY = 0;
            const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;
            if (isPinned) {
                translateY = scrollTop - cardTop + stackPos + itemStackDistance * i;
            } else if (scrollTop > pinEnd) {
                translateY = pinEnd - cardTop + stackPos + itemStackDistance * i;
            }

            const newTransform = {
                translateY: Math.round(translateY * 100) / 100,
                scale: Math.round(scale * 1000) / 1000,
                rotation: Math.round(rotation * 100) / 100,
                blur: Math.round(blur * 100) / 100
            };

            const last = lastTransforms.get(i);
            const hasChanged =
                !last ||
                Math.abs(last.translateY - newTransform.translateY) > 0.1 ||
                Math.abs(last.scale - newTransform.scale) > 0.001 ||
                Math.abs(last.rotation - newTransform.rotation) > 0.1 ||
                Math.abs(last.blur - newTransform.blur) > 0.1;

            if (hasChanged) {
                const transform = `translate3d(0, ${newTransform.translateY}px, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
                const filter = newTransform.blur > 0 ? `blur(${newTransform.blur}px)` : '';
                card.style.transform = transform;
                card.style.filter = filter;
                lastTransforms.set(i, newTransform);
            }
        });
    }

    if (lenis) {
        lenis.on('scroll', updateCardTransforms);

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
    } else {
        scroller.addEventListener('scroll', updateCardTransforms);
    }

    updateCardTransforms();
});