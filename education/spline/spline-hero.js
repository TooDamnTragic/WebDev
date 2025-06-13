window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const y = window.scrollY;
    hero.style.transform = `translateY(${y * -0.2}px)`;
});