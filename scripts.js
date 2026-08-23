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

  // Smooth scroll handler for anchor links (#about, #flagship, etc.)
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

  // 2. Vanta.js FOG for Homepage Landing Hero (Full Screen, Full Width)
  const heroFogEl = document.getElementById('hero-fog');
  if (heroFogEl && typeof THREE !== 'undefined' && typeof VANTA !== 'undefined' && VANTA.FOG) {
    try {
      VANTA.FOG({
        el: "#hero-fog",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0xffffff,
        midtoneColor: 0x00274c, // Michigan Dark Blue (#00274C)
        lowlightColor: 0x00274c, // Michigan Dark Blue (#00274C)
        baseColor: 0xffebeb,
        blurFactor: 0.6,
        speed: 1.00,
        zoom: 1.00,
        scale: 2.00,
        scaleMobile: 4.00
      });
    } catch (err) {
      console.warn("Vanta Fog initialization error:", err);
    }
  }
});
