document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Smooth Scrolling (Lenis) - Desktop only
  let lenisInstance = null;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (!isTouchDevice && typeof Lenis !== 'undefined') {
    if (window.history && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    lenisInstance = new Lenis({ 
      duration: 1.0, 
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      syncTouch: false
    });
    
    function raf(time) { 
      if (lenisInstance) {
        lenisInstance.raf(time); 
        requestAnimationFrame(raf); 
      }
    }
    requestAnimationFrame(raf);
  } else {
    if (window.history && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
  }

  // Smooth scroll handler for anchor links (#projects, #team)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#') {
        const targetElem = document.querySelector(targetId);
        if (targetElem) {
          e.preventDefault();
          if (lenisInstance) {
            lenisInstance.scrollTo(targetElem, { offset: -70 });
          } else {
            targetElem.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    });
  });

  // 2. Interactive Semiconductor Wafer & Dual-Color Trace Pulse Canvas
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let dpr = window.devicePixelRatio || 1;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    let mouse = { x: width * 0.5, y: height * 0.4, targetX: width * 0.5, targetY: height * 0.4, active: false };
    
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    });

    window.addEventListener('mouseleave', () => {
      mouse.active = false;
    });

    const GRID_SIZE = 48;

    class SignalPulse {
      constructor() {
        this.reset();
      }
      reset() {
        const cols = Math.max(1, Math.floor(width / GRID_SIZE));
        const rows = Math.max(1, Math.floor(height / GRID_SIZE));
        this.gx = Math.floor(Math.random() * cols) * GRID_SIZE;
        this.gy = Math.floor(Math.random() * rows) * GRID_SIZE;
        this.x = this.gx;
        this.y = this.gy;
        
        this.dir = Math.floor(Math.random() * 4);
        this.speed = (Math.random() * 1.5 + 1.0);
        this.length = Math.random() * 40 + 25;
        this.life = Math.random() * 200 + 120;
        this.maxLife = this.life;
        this.opacity = Math.random() * 0.45 + 0.35;
        
        // Randomly assign UMich Blue or UMich Maize / Yellow
        this.rgb = Math.random() < 0.5 ? '0, 39, 76' : '220, 150, 0';
      }
      update() {
        this.life--;
        if (this.life <= 0) {
          this.reset();
          return;
        }

        if (this.dir === 0) this.x += this.speed;
        else if (this.dir === 1) this.y += this.speed;
        else if (this.dir === 2) this.x -= this.speed;
        else if (this.dir === 3) this.y -= this.speed;

        if (Math.abs((this.x % GRID_SIZE)) < this.speed && Math.abs((this.y % GRID_SIZE)) < this.speed) {
          if (Math.random() < 0.25) {
            this.dir = (this.dir % 2 === 0) ? (Math.random() < 0.5 ? 1 : 3) : (Math.random() < 0.5 ? 0 : 2);
          }
        }

        if (this.x < -100 || this.x > width + 100 || this.y < -100 || this.y > height + 100) {
          this.reset();
        }
      }
      draw(ctx) {
        const progress = this.life / this.maxLife;
        const alpha = Math.sin(progress * Math.PI) * this.opacity;
        if (alpha <= 0.001) return;

        ctx.save();
        ctx.beginPath();
        let tailX = this.x;
        let tailY = this.y;

        if (this.dir === 0) tailX = this.x - this.length;
        else if (this.dir === 1) tailY = this.y - this.length;
        else if (this.dir === 2) tailX = this.x + this.length;
        else if (this.dir === 3) tailY = this.y + this.length;

        const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        grad.addColorStop(0, 'rgba(' + this.rgb + ', 0)');
        grad.addColorStop(0.7, 'rgba(' + this.rgb + ', ' + (alpha * 0.75) + ')');
        grad.addColorStop(1, 'rgba(' + this.rgb + ', ' + alpha + ')');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        ctx.fillStyle = 'rgba(' + this.rgb + ', ' + Math.min(1, alpha * 1.25) + ')';
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    const pulses = Array.from({ length: 18 }, () => new SignalPulse());

    function animate() {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      const glowRadius = 240;
      ctx.lineWidth = 0.5;

      // Draw grid lines
      for (let x = 0; x <= width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.035)';
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.035)';
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw dots
      for (let x = 0; x <= width; x += GRID_SIZE) {
        for (let y = 0; y <= height; y += GRID_SIZE) {
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let dotAlpha = 0.07;
          let dotRadius = 0.9;

          if (mouse.active && dist < glowRadius) {
            const proximity = 1 - dist / glowRadius;
            dotAlpha += proximity * 0.32;
            dotRadius += proximity * 0.8;
          }

          ctx.fillStyle = 'rgba(0, 0, 0, ' + dotAlpha + ')';
          ctx.beginPath();
          ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw pulses
      pulses.forEach(pulse => {
        pulse.update();
        pulse.draw(ctx);
      });

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }
});
