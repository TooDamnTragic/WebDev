document.addEventListener('DOMContentLoaded', () => {
    const scroller = document.getElementById('certificate-stack');
    if (!scroller) {
        console.error('Certificate stack scroller not found');
        return;
    }

    // Check if Lenis is available
    let lenis = null;
    if (typeof Lenis !== 'undefined') {
        try {
            lenis = new Lenis({
                wrapper: scroller,
                content: scroller.querySelector('.scroll-stack-inner'),
                duration: 0.3,
                easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                touchMultiplier: 8,
                normalizeWheel: true,
                wheelMultiplier: 2,
                touchInertiaMultiplier: 35,
                lerp: 0.1,
                syncTouch: true,
                syncTouchLerp: 0.075,
                touchInertia: 0.6
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);
        } catch (error) {
            console.warn('Lenis initialization failed, using native scroll:', error);
            lenis = null;
        }
    } else {
        console.warn('Lenis not available, using native scroll');
    }

    const cards = Array.from(scroller.querySelectorAll('.scroll-stack-card'));
    if (cards.length === 0) {
        console.warn('No scroll stack cards found');
        return;
    }

    const lastTransforms = new Map();
    const itemDistance = 100;
    const itemScale = 0.1;
    const itemStackDistance = 1;
    const stackPosition = '20%';
    const scaleEndPosition = '10%';
    const baseScale = 1;
    const rotationAmount = 1.5;
    const blurAmount = 0;
    console.log(`Initializing scroll stack with ${cards.length} cards`);

    // Set initial card properties
    const totalCards = cards.length;

    function updateCardSizes() {
        const minWidth = 40;
        const maxWidth = 80;
        const step = totalCards > 1 ? (maxWidth - minWidth) / (totalCards - 1) : 0;

        cards.forEach((card, i) => {
            if (i < totalCards - 1) {
                card.style.marginBottom = `${itemDistance}px`;
            }

            const cardWidth = minWidth + step * i;
            card.style.width = `${cardWidth}vw`;
            const widthPx = window.innerWidth * (cardWidth / 100);
            card.style.height = `${widthPx * 0.5}px`;
            card.style.willChange = 'transform, filter';
            card.style.transformOrigin = 'top center';
            card.style.backfaceVisibility = 'hidden';
            card.style.transform = 'translateZ(0)';
            card.style.webkitTransform = 'translateZ(0)';
            card.style.perspective = '1000px';
            card.style.webkitPerspective = '1000px';
        });
    }

    updateCardSizes();

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
        const endElementTop = endElement ? endElement.offsetTop : scroller.scrollHeight;

        cards.forEach((card, i) => {
            const cardTop = card.offsetTop;
            const triggerStart = cardTop - stackPos - itemStackDistance * i;
            const triggerEnd = cardTop - scaleEndPos;
            const pinStart = cardTop - stackPos - itemStackDistance * i;
            const pinEnd = endElementTop - containerHeight / 2;

            const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
            const targetScale = Math.min(1, baseScale + i * itemScale);
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

    // Set up scroll listener
    if (lenis) {
        lenis.on('scroll', updateCardTransforms);
    } else {
        scroller.addEventListener('scroll', updateCardTransforms);
    }

    // Initial update with delay to ensure layout is complete
    setTimeout(() => {
        updateCardTransforms();
    }, 100);

    // Handle resize
    window.addEventListener('resize', () => {
        updateCardSizes();
        setTimeout(updateCardTransforms, 100);
    });
});