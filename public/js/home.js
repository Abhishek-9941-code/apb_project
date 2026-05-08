
  // ── Countdown timers ──
  function countdown(hId, mId, sId, totalSecs) {
    let t = totalSecs;
    setInterval(() => {
      if (t <= 0) return;
      t--;
      const h = String(Math.floor(t / 3600)).padStart(2,'0');
      const m = String(Math.floor((t % 3600) / 60)).padStart(2,'0');
      const s = String(t % 60).padStart(2,'0');
      document.getElementById(hId).textContent = h;
      document.getElementById(mId).textContent = m;
      document.getElementById(sId).textContent = s;
    }, 1000);
  }
  countdown('h1','m1','s1', 8*3600 + 24*60 + 37);
  countdown('h2','m2','s2', 5*3600 + 59*60 + 12);
  countdown('h3','m3','s3', 12*3600);

  // ── Scroll reveal ──
  const reveals = document.querySelectorAll('.scroll-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  reveals.forEach(el => io.observe(el));

  // ── Wishlist toggle ──
  document.querySelectorAll('.prod-wishlist').forEach(btn => {
    btn.addEventListener('click', () => {
      const icon = btn.querySelector('i');
      icon.classList.toggle('fa-regular');
      icon.classList.toggle('fa-solid');
      icon.style.color = icon.classList.contains('fa-solid') ? '#E83D8B' : '';
    });
  });

  // ── Cart add feedback ──
  document.querySelectorAll('.btn-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const orig = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Added!';
      btn.style.background = '#10B981';
      setTimeout(() => { btn.innerHTML = orig; btn.style.background = ''; }, 1600);
    });
  });
