document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.item');
  const info = document.getElementById('info');
  const infoImage = document.getElementById('info-image');
  const infoText = document.getElementById('info-text');
    const body = document.body;
  const defaultBg = getComputedStyle(body).backgroundImage;

  items.forEach(item => {
    item.addEventListener('mouseenter', () => {
      const img = item.getAttribute('data-image');
      const text = item.getAttribute('data-text');
      if (img) infoImage.src = img;
      if (text) infoText.textContent = text;
      const color = item.getAttribute('data-color');
      if(color){
        body.style.background = `linear-gradient(to bottom, ${color},rgb(0, 255, 136))`;
      }
      body.classList.add('dimmed');
      if(item.classList.contains('left')){
        info.classList.add('right');
      } else {

        info.classList.remove('right');
      }
      info.classList.add('visible');
      const offset = item.offsetTop + item.offsetHeight / 2 - info.offsetHeight / 2;
      info.style.top = offset + 'px';
    });
    item.addEventListener('mouseleave', () => {
      info.classList.remove('visible');
      info.classList.remove('right');
      body.classList.remove('dimmed');
      body.style.background = defaultBg;
    });
  });

  setTimeout(() => {
    document.body.classList.add('show-content');
  }, 1000);

  const tabs = document.querySelector('.tabs');
  const title = document.querySelector('h1');

  const onScroll = () => {
    if (title.getBoundingClientRect().top <= 0) {
      tabs.classList.add('visible');
    } else {
      tabs.classList.remove('visible');
    }
  };
  window.addEventListener('scroll', onScroll);
  onScroll();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.item').forEach(el => observer.observe(el));
});