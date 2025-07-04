document.addEventListener('DOMContentLoaded', () => {
  const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
  function longRandomString() {
    let out = "";
    for (let i = 0; i < 1500; i++) {
      out += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
    return out;
  }

  const card = document.getElementById("card");
  const glow = document.getElementById("glow");
  const randomText = document.getElementById("randomText");

  // Seed it once
  if (randomText) {
    randomText.textContent = longRandomString();
  }

  if (card && glow && randomText) {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      glow.style.background =
        `radial-gradient(250px at ${x}px ${y}px, rgba(255,255,255,0.35), transparent 70%)`;

      randomText.textContent = longRandomString();
    });

    card.addEventListener("mouseleave", () => {
      glow.style.background = "none";
    });
  }
});