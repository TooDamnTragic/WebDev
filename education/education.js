document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.item');
  const info = document.getElementById('info');
  const infoImage = document.getElementById('info-image');
  const infoText = document.getElementById('info-text');
    const body = document.body;
  const defaultBg = getComputedStyle(body).background;

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

  const divider = document.querySelector('.divider');
  const eduContainer = document.querySelector('.edu-container');

  function updateDividerProgress(){
    if(!divider || !eduContainer) return;
    const rect = eduContainer.getBoundingClientRect();
    const viewport = window.innerHeight;
    let progress = (viewport - rect.top) / (rect.height + viewport);
    if(progress < 0){
      progress = 0;
    } else if(progress > 1){
      progress = 1;
    }
    divider.style.setProperty('--progress', progress);
  }
  const onScroll = () => {
    if (title.getBoundingClientRect().top <= 0) {
      tabs.classList.add('visible');
    } else {
      tabs.classList.remove('visible');
    }
    updateDividerProgress();
  };
  window.addEventListener('scroll', onScroll);
  window.addEventListener('resize', updateDividerProgress);
  onScroll();

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.item').forEach(el => observer.observe(el));

  const infoImageWrapper = document.getElementById('info-image-wrapper');
  const infoTextWrapper = document.getElementById('info-text-wrapper');

  function adjustInfoLayout(){
    if(!infoImageWrapper || !infoTextWrapper) return;
    const totalWidth = infoImageWrapper.offsetWidth + infoTextWrapper.offsetWidth;
    if(totalWidth > window.innerWidth){
      info.classList.add('stacked');
    } else {
      info.classList.remove('stacked');
    }
  }

  window.addEventListener('resize', adjustInfoLayout);
  adjustInfoLayout();
  updateDividerProgress();
});