    (function () {
      const els = Array.from(document.querySelectorAll('.fade-up'));
      const seen = new Map();
      const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          const el = e.target;
          const parent = el.parentElement;
          const i = seen.get(parent) || 0;
          seen.set(parent, i + 1);
          el.style.transitionDelay = (i * 0.08) + 's';
          el.classList.add('in');
          io.unobserve(el);
        });
      }, { threshold: 0.08, rootMargin: '-100px 0px' });
      els.forEach(function (el) { io.observe(el); });
    })();

    (function () {
      const P1 = "Estamos construyendo un mundo donde la curiosidad no tiene límites — donde el tacto se vuelve vista.";
      const P2 = "Una plataforma donde la inclusión, la cultura y la tecnología fluyen juntas.";
      const nodes = document.querySelectorAll('[data-reveal]');
      nodes.forEach(function (node, idx) {
        const text = idx === 0 ? P1 : P2;
        node.innerHTML = text.split(' ').map(w => `<span class="mw">${w} </span>`).join('');
      });
      const words = Array.from(document.querySelectorAll('.mw'));
      function update() {
        const vh = window.innerHeight;
        words.forEach(function (w) {
          const r = w.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (vh * 0.95 - r.top) / (vh * 0.30)));
          w.style.opacity = (0.15 + p * 0.85).toFixed(3);
        });
      }
      window.addEventListener('scroll', update, { passive: true });
      update();
    })();

    (function() {
      const slider = document.getElementById('cases-slider');
      if (!slider) return;
      let isDown = false;
      let startX;
      let scrollLeft;
      let velocity = 0;
      let lastX;
      let lastTime;
      let animationId;

      const start = (e) => {
        isDown = true;
        slider.classList.add('is-dragging');
        startX = (e.pageX || e.touches[0].pageX) - slider.offsetLeft;
        scrollLeft = slider.scrollLeft;
        lastX = e.pageX || e.touches[0].pageX;
        lastTime = Date.now();
        velocity = 0;
        cancelAnimationFrame(animationId);
      };

      const end = () => {
        isDown = false;
        slider.classList.remove('is-dragging');
        
        const inertia = () => {
          if (Math.abs(velocity) > 0.1) {
            slider.scrollLeft -= velocity;
            velocity *= 0.95; // Friction coefficient
            animationId = requestAnimationFrame(inertia);
          }
        };
        animationId = requestAnimationFrame(inertia);
      };

      const move = (e) => {
        if (!isDown) return;
        const currentX = e.pageX || e.touches[0].pageX;
        const dx = currentX - lastX;
        const now = Date.now();
        const dt = now - lastTime;

        if (dt > 0) {
          velocity = (dx / dt) * 15;
        }

        lastX = currentX;
        lastTime = now;

        const x = currentX - slider.offsetLeft;
        const walk = (x - startX) * 1.5;
        slider.scrollLeft = scrollLeft - walk;
      };

      slider.addEventListener('mousedown', start);
      slider.addEventListener('touchstart', start, { passive: true });
      window.addEventListener('mouseup', end);
      window.addEventListener('touchend', end);
      slider.addEventListener('mousemove', move);
      slider.addEventListener('touchmove', move, { passive: false });
      slider.addEventListener('contextmenu', e => { if (isDown) e.preventDefault(); });
    })();

    (function () {
      const videos = [
        { id: 'hero-video', src: 'https://stream.mux.com/Db8ArMnXMFYlIQL0000325NtKGV01zbUqKUZiMsQalXkEo.m3u8' },
        { id: 'cta-video', src: 'https://stream.mux.com/8wrHPCX2dC3msyYU9ObwqNdm00u3ViXvOSHUMRYSEe5Q.m3u8' },
        { id: 'arch-video', src: 'https://stream.mux.com/deykjOBhsj9RZVhCdsIuM8hoPY402J6B02e9wofRCRF7I.m3u8' },
        { id: 'phi-video', src: 'https://stream.mux.com/0283AGmsTU3XshgKNqtpcKykwqCHNn00dAzTaEk9sC00cU.m3u8' },
        { id: 'mission-video', src: 'https://stream.mux.com/ZIY4H5id01IwzbvogiIuH2g95xYCcWVMOpuaynddzGyQ.m3u8' },
        { id: 'solution-video', src: 'https://stream.mux.com/koFjOKFJwMaR3lYs4R84PXc2ZplB4QXq9bKaCimXufE.m3u8' }
      ];

      videos.forEach(v => {
        const video = document.getElementById(v.id);
        if (!video) return;

        // Force loop if attribute is present
        if (video.hasAttribute('loop')) {
          video.addEventListener('ended', function() {
            video.play().catch(() => {});
          });
        }

        if (window.Hls && window.Hls.isSupported()) {
          const hls = new window.Hls();
          hls.loadSource(v.src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = v.src;
          video.addEventListener('loadedmetadata', () => {
            video.play().catch(() => {});
          });
        }
      });
    })();

    // --- DEMO MODAL ---
    window.abrirDemo = function() {
      const modal = document.getElementById('demoModal');
      const video = document.getElementById('videoDemo');
      if (modal) modal.classList.add('abierto');
      if (video) video.play().catch(() => {});
    };

    window.cerrarDemo = function() {
      const modal = document.getElementById('demoModal');
      const video = document.getElementById('videoDemo');
      if (modal) modal.classList.remove('abierto');
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    };

    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('btnVerDemo')?.addEventListener('click', abrirDemo);
      document.getElementById('demoModal')?.addEventListener('click', (e) => {
        if (e.target.id === 'demoModal') cerrarDemo();
      });
    });
  
