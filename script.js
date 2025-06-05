document.addEventListener('DOMContentLoaded', function(){
  const nav = document.querySelector('.nav');
  setTimeout(()=>{nav.classList.add('show');}, 100);

  document.querySelectorAll('.section').forEach(link=>{
    const text = link.textContent.trim().split('');
    link.innerHTML = text.map(ch=>`<span>${ch}</span>`).join('');

    link.addEventListener('click', e=>{
      e.preventDefault();
      link.classList.add('zoom');
      setTimeout(()=>{ window.location = link.getAttribute('href'); }, 600);
    });
  });
});