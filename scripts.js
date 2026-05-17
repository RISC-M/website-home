document.addEventListener("DOMContentLoaded", () => {
  // Initialize Smooth Scrolling (Lenis)
  const lenis = new Lenis({ duration: 0.9, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
  
  function raf(time) { 
    lenis.raf(time); 
    requestAnimationFrame(raf); 
  }
  requestAnimationFrame(raf);
  
  // Smooth scroll for anchor links (e.g. "Join Us" button pointing to #join)
  document.querySelectorAll('.anchor-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) { lenis.scrollTo(target); }
    });
  });
});