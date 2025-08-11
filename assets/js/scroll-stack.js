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
                orientation: 'horizontal',
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
    const stackPosition = '10%';
    const scaleEndPosition = '5%';
    const baseScale = 1;
    const blurAmount = 0;
    const cardRotations = cards.map(() => (Math.random() * 60 - 30));
    console.log(`Initializing scroll stack with ${cards.length} cards`);

    // Set initial card properties
    const totalCards = cards.length;
    const inner = scroller.querySelector('.scroll-stack-inner');

    function updatePadding() {
        if (inner) {
            const extraPadding = window.innerWidth * 0.1;
            inner.style.paddingRight = `${extraPadding}px`;
        }
        const end = scroller.querySelector('.scroll-stack-end');
        if (end) {
            const endWidth = window.innerWidth * 0.2;
            end.style.width = `${endWidth}px`;
        }
    }

    function updateCardSizes() {
        const minWidth = 30;
        const maxWidth = 60;
        const step = totalCards > 1 ? (maxWidth - minWidth) / (totalCards - 1) : 0;

        cards.forEach((card, i) => {
            if (i < totalCards - 1) {
                card.style.marginRight = `${itemDistance}px`;
            }

            const cardWidth = minWidth + step * i;
            const widthPx = window.innerWidth * (cardWidth / 100);
            const clampedWidth = Math.min(480, Math.max(220, widthPx));
            card.style.width = `${clampedWidth}px`;
            card.style.height = `${clampedWidth * 0.6}px`;
            card.style.willChange = 'transform, filter';
            card.style.transformOrigin = 'center left';
            card.style.backfaceVisibility = 'hidden';
            card.style.transform = 'translateZ(0)';
            card.style.webkitTransform = 'translateZ(0)';
            card.style.perspective = '1000px';
            card.style.webkitPerspective = '1000px';
        });
    }

    updateCardSizes();
    updatePadding();

    function parsePercentage(value, containerWidth) {
        if (typeof value === 'string' && value.includes('%')) {
            return (parseFloat(value) / 100) * containerWidth;
        }
        return parseFloat(value);
    }

    function calculateProgress(scrollLeft, start, end) {
        if (scrollLeft < start) return 0;
        if (scrollLeft > end) return 1;
        return (scrollLeft - start) / (end - start);
    }

    function updateCardTransforms() {
        const scrollLeft = scroller.scrollLeft;
        const containerWidth = scroller.clientWidth;
        const stackPos = parsePercentage(stackPosition, containerWidth);
        const scaleEndPos = parsePercentage(scaleEndPosition, containerWidth);
        const endElement = scroller.querySelector('.scroll-stack-end');
        const endElementLeft = endElement ? endElement.offsetLeft : scroller.scrollWidth;

        cards.forEach((card, i) => {
            const cardLeft = card.offsetLeft;
            const triggerStart = cardLeft - stackPos - itemStackDistance * i;
            const triggerEnd = cardLeft - scaleEndPos;
            const pinStart = cardLeft - stackPos - itemStackDistance * i;
            const pinEnd = endElementLeft - containerWidth / 2;

            const scaleProgress = calculateProgress(scrollLeft, triggerStart, triggerEnd);
            const targetScale = Math.min(1, baseScale + i * itemScale);
            const scale = 1 - scaleProgress * (1 - targetScale);
            const rotation = cardRotations[i] * scaleProgress;
            let blur = 0;
            if (blurAmount) {
                let topCardIndex = 0;
                for (let j = 0; j < cards.length; j++) {
                    const jCardLeft = cards[j].offsetLeft;
                    const jTriggerStart = jCardLeft - stackPos - itemStackDistance * j;
                    if (scrollLeft >= jTriggerStart) {
                        topCardIndex = j;
                    }
                }
                if (i < topCardIndex) {
                    const depthInStack = topCardIndex - i;
                    blur = Math.max(0, depthInStack * blurAmount);
                }
            }

            let translateX = 0;
            const isPinned = scrollLeft >= pinStart && scrollLeft <= pinEnd;
            if (isPinned) {
                translateX = scrollLeft - cardLeft + stackPos + itemStackDistance * i;
            } else if (scrollLeft > pinEnd) {
                translateX = pinEnd - cardLeft + stackPos + itemStackDistance * i;
            }

            const newTransform = {
                translateX: Math.round(translateX * 100) / 100,
                scale: Math.round(scale * 1000) / 1000,
                rotation: Math.round(rotation * 100) / 100,
                blur: Math.round(blur * 100) / 100
            };

            const last = lastTransforms.get(i);
            const hasChanged =
                !last ||
                Math.abs(last.translateX - newTransform.translateX) > 0.1 ||
                Math.abs(last.scale - newTransform.scale) > 0.001 ||
                Math.abs(last.rotation - newTransform.rotation) > 0.1 ||
                Math.abs(last.blur - newTransform.blur) > 0.1;

            if (hasChanged) {
                const transform = `translate3d(${newTransform.translateX}px, 0, 0) scale(${newTransform.scale}) rotate(${newTransform.rotation}deg)`;
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

    scroller.addEventListener('wheel', (e) => {
        const atLeft = scroller.scrollLeft <= 0;
        const atRight = scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 1;
        if ((atLeft && e.deltaY < 0) || (atRight && e.deltaY > 0)) {
            e.preventDefault();
            window.scrollBy({ top: e.deltaY, behavior: 'smooth' });
        } else {
            e.preventDefault();
            scroller.scrollLeft += e.deltaY;
        }
    }, { passive: false });

    // Initial update with delay to ensure layout is complete
    setTimeout(() => {
        updateCardTransforms();
    }, 100);

    // Handle resize
    window.addEventListener('resize', () => {
        updateCardSizes();
        updatePadding();
        setTimeout(updateCardTransforms, 100);
    });
});