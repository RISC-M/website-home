document.addEventListener("DOMContentLoaded", () => {
  // Initialize Smooth Scrolling (Lenis) - Desktop only for performance
  let lenisInstance = null;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (!isTouchDevice && typeof Lenis !== 'undefined') {
    // Prevent browser scroll restoration jumps on page reload for desktop Lenis
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
    // Restore default scroll restoration behavior for mobile native scrolling
    if (window.history && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('.anchor-link').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) { 
          if (lenisInstance) {
            e.preventDefault();
            lenisInstance.scrollTo(target); 
          }
        }
      }
    });
  });

  // Scroll Progress Bar
  window.addEventListener("scroll", () => {
    const scrollProgress = document.getElementById("scroll-progress");
    if (scrollProgress) {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      scrollProgress.style.width = scrolled + "%";
    }
  });

  // Mobile Menu Logic
  const menuButton = document.getElementById("mobile-menu-button");
  const closeButton = document.getElementById("close-menu-button");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-nav-link");

  if (mobileMenu) {
    if (menuButton) {
      menuButton.addEventListener("click", () => {
        mobileMenu.classList.remove("translate-x-full");
      });
    }

    if (closeButton) {
      closeButton.addEventListener("click", () => {
        mobileMenu.classList.add("translate-x-full");
      });
    }

    mobileLinks.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.add("translate-x-full");
      });
    });
  }

  // Scrollspy: Highlight Active Nav Link
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll("header nav a");
  const mobileNavLinks = document.querySelectorAll("#mobile-menu a.mobile-nav-link");

  const observerOptions = {
    root: null,
    rootMargin: "-25% 0px -55% 0px", // Trigger when section occupies the active view area
    threshold: 0
  };

  if (sections.length > 0 && Array.from(navLinks).some(link => link.getAttribute('href')?.startsWith('#'))) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          
          // Update desktop links
          navLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href === `#${id}` || (id === "about" && (href === "#" || href === "#about"))) {
              link.classList.add("underline", "decoration-2", "underline-offset-4");
              link.classList.remove("text-gray-500");
            } else {
              link.classList.remove("underline", "decoration-2", "underline-offset-4");
              link.classList.add("text-gray-500");
            }
          });
          
          // Update mobile links
          mobileNavLinks.forEach(link => {
            const href = link.getAttribute("href");
            if (href === `#${id}` || (id === "about" && (href === "#" || href === "#about"))) {
              link.classList.add("underline", "decoration-2", "underline-offset-4");
              link.classList.remove("text-gray-500");
            } else {
              link.classList.remove("underline", "decoration-2", "underline-offset-4");
              link.classList.add("text-gray-500");
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
  }

  // Scroll Reveal Animation Observer
  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        revealObserver.unobserve(entry.target); // animate only once
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -40px 0px"
  });

  revealElements.forEach(el => revealObserver.observe(el));
});
