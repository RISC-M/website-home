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
});
