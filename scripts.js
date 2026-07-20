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

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        
        // Update desktop links
        navLinks.forEach(link => {
          const href = link.getAttribute("href");
          if (href === `#${id}` || (id === "about" && href === "#")) {
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
          if (href === `#${id}`) {
            link.classList.add("underline", "decoration-2", "underline-offset-4");
          } else {
            link.classList.remove("underline", "decoration-2", "underline-offset-4");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

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
    rootMargin: "0px 0px -50px 0px"
  });
  revealElements.forEach(el => revealObserver.observe(el));

  // Fetch GitHub Projects Logic
  async function fetchGitHubProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    const startTime = Date.now();
    const minDelay = 800; // Enforce an 0.8s delay so the loading skeleton pulse animation is visible

    // Default fallback repos in case GitHub API fails or rate-limits
    const fallbackRepos = [
      {
        name: "perception-pipeline",
        html_url: "https://github.com/RISC-M",
        description: "An FPGA-accelerated perception pipeline for real-time computer vision applications in hardware design and autonomous vehicles.",
        language: "SystemVerilog",
        topics: ["fpga", "computer-vision", "hardware-acceleration", "verilog"],
        updated_at: new Date().toISOString()
      },
      {
        name: "rv32i-core",
        html_url: "https://github.com/RISC-M",
        description: "A custom 5-stage pipelined RISC-V processor implementing the RV32I ISA, fully optimized for FPGA synthesis and computer architecture research.",
        language: "SystemVerilog",
        topics: ["processor-design", "risc-v", "computer-architecture", "cpu"],
        updated_at: new Date().toISOString()
      }
    ];

    let reposToRender = fallbackRepos;

    try {
      const response = await fetch('https://api.github.com/orgs/RISC-M/repos?sort=updated&direction=desc');
      
      if (response.ok) {
        const repos = await response.json();
        const filteredRepos = repos.filter(repo => repo.name !== 'website-home');
        if (filteredRepos.length > 0) {
          reposToRender = filteredRepos;
        }
      } else {
        console.warn(`GitHub API error: ${response.status}`);
      }
    } catch (error) {
      console.warn("Using fallback repositories due to GitHub API rate limit or network error:", error.message);
    }

    // Calculate remaining delay time to ensure animation runs
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, minDelay - elapsedTime);

    setTimeout(() => {
      renderRepos(reposToRender);
    }, remainingTime);
  }

  function renderRepos(repos) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = ''; // Clear loading skeleton

    repos.forEach((repo, index) => {
      const date = new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      const article = document.createElement('article');
      article.className = 'border-2 border-black p-4 md:p-5 rounded-[1.5rem] w-full max-w-sm flex flex-col justify-between bg-white hover-offset-card fade-in-card cursor-pointer';
      article.setAttribute('role', 'link');
      article.tabIndex = 0;
      article.setAttribute('aria-label', `View ${repo.name} on GitHub`);
      article.innerHTML = `
        <div>
          <div class="flex flex-col items-center mb-4 border-b border-black pb-4 gap-3">
            <div class="text-center w-full">
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="hover:opacity-70 transition-opacity">
                <h2 class="project-card-title text-2xl md:text-3xl font-black uppercase tracking-tighter mt-1 leading-none">${repo.name.replace(/-/g, ' ')}</h2>
              </a>
            </div>
            <div class="flex flex-col items-center">
              <span class="px-4 py-1 border border-black bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest block">Updated: ${date}</span>
            </div>
          </div>
          <div class="space-y-4 text-center">
            <p class="project-card-description text-base md:text-lg font-normal text-neutral-700 leading-relaxed">
              ${repo.description || 'No description provided for this repository.'}
            </p>
          </div>
        </div>
        <div class="mt-6 pt-5 border-t border-black border-dashed flex justify-center">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-card-link text-sm font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
            View on GitHub 
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>
      `;
      const openRepository = () => window.open(repo.html_url, '_blank', 'noopener,noreferrer');
      article.addEventListener('click', (event) => {
        if (!event.target.closest('a')) openRepository();
      });
      article.addEventListener('keydown', (event) => {
        if (event.target.closest('a')) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openRepository();
        }
      });
      container.appendChild(article);
    });

    // Recalculate scroll height for Lenis smooth scrolling if active
    if (lenisInstance) {
      setTimeout(() => {
        if (lenisInstance) lenisInstance.resize();
      }, 120);
    }
  }

  // Text Scramble Cryptography Effect
  class TextScrambler {
    constructor(el) {
      this.el = el;
      this.update = this.update.bind(this);
    }
    setText(newText, maxFrames = 150) {
      const oldText = this.el.innerText;
      const length = Math.max(oldText.length, newText.length);
      const promise = new Promise((resolve) => this.resolve = resolve);
      this.queue = [];
      for (let i = 0; i < length; i++) {
        const from = oldText[i] || '';
        const to = newText[i] || '';
        const start = 0; // Starts scrambled on frame 0
        const progress = Math.pow(Math.random(), 2.5); // Slower ease-out curve (decelerates more)
        const end = Math.floor(progress * maxFrames) + 15; // Set duration
        this.queue.push({ from, to, start, end });
      }
      cancelAnimationFrame(this.frameRequest);
      this.frame = 0;
      this.update();
      return promise;
    }
    update() {
      let output = '';
      let complete = 0;
      for (let i = 0, n = this.queue.length; i < n; i++) {
        let { from, to, start, end, char } = this.queue[i];
        if (this.frame >= end) {
          complete++;
          output += to;
        } else if (this.frame >= start) {
          if (!char || Math.random() < 0.12) {
            char = this.randomChar(to);
            this.queue[i].char = char;
          }
          output += char;
        } else {
          output += from;
        }
      }
      this.el.innerHTML = output;
      if (complete === this.queue.length) {
        this.resolve();
      } else {
        this.frameRequest = requestAnimationFrame(this.update);
        this.frame++;
      }
    }
    randomChar(targetChar) {
      if (targetChar === ' ') return ' ';
      if (targetChar === '-') return '-';
      
      // Keep lowercase letters lowercase
      if (/[a-z]/.test(targetChar)) {
        const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
        return lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)];
      }
      // Keep uppercase letters uppercase
      if (/[A-Z]/.test(targetChar)) {
        const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        return uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)];
      }
      // Keep numbers numeric
      if (/[0-9]/.test(targetChar)) {
        const digitChars = '0123456789';
        return digitChars[Math.floor(Math.random() * digitChars.length)];
      }
      
      return targetChar;
    }
  }

  // Scramble the Hero subtitle element only, leaving the main title static
  const subtitleEl = document.getElementById('hero-subtitle');
  if (subtitleEl) {
    const subtitleText = subtitleEl.textContent.trim();
    const scrambler = new TextScrambler(subtitleEl);
    scrambler.setText(subtitleText, 80); // Fast, energetic scramble duration
  }

  // Trigger project loading on scroll intersection so skeletons are visible first
  const projectsSection = document.getElementById('projects');
  if (projectsSection) {
    const projectsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Ensure it's a real scroll intersection and not a load layout flash
          const isBelowFold = entry.boundingClientRect.top > 0;
          if (isBelowFold || window.scrollY > 50) {
            fetchGitHubProjects();
            projectsObserver.unobserve(entry.target); // Load only once
          }
        }
      });
    }, {
      threshold: 0.15, // Require 15% visibility to trigger
      rootMargin: "0px 0px -100px 0px" // Trigger when scrolled 100px inside viewport
    });
    
    // Let DOM layout and Lenis scroll restoration settle before observing
    setTimeout(() => {
      projectsObserver.observe(projectsSection);
    }, 100);
  }
});
