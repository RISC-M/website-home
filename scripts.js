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
        const hiddenRepos = ['website-home', 'sponsorship-packet', 'sponsorship_packet', 'sponsorship packet'];
        const filteredRepos = repos.filter(repo => {
          const lowerName = repo.name.toLowerCase();
          const normalizedName = lowerName.replace(/[-_]/g, ' ');
          return !hiddenRepos.includes(lowerName) && !hiddenRepos.includes(normalizedName);
        });
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
      renderRepos(reposToRender.slice(0, 3));
    }, remainingTime);
  }

  function renderRepos(repos) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = ''; // Clear loading skeleton

    repos.slice(0, 3).forEach((repo, index) => {
      const date = new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      const article = document.createElement('article');
      article.className = 'group border border-black p-5 sm:p-6 w-full bg-white hover-offset-card fade-in-card cursor-pointer flex flex-col justify-between';
      article.setAttribute('role', 'link');
      article.tabIndex = 0;
      article.setAttribute('aria-label', `View ${repo.name} on GitHub`);
      article.innerHTML = `
        <div>
          <div class="flex items-center justify-between gap-3 mb-3">
            <h4 class="project-card-title text-xl sm:text-2xl font-bold uppercase tracking-tight text-black font-display">
              ${repo.name.replace(/-/g, ' ')}
            </h4>
            <span class="px-2.5 py-0.5 border border-black bg-black text-white rounded-[3px] text-xs font-semibold tracking-tight shrink-0">
              ${date}
            </span>
          </div>
          <p class="project-card-description text-sm sm:text-base font-normal text-neutral-700 leading-relaxed mb-4">
            ${repo.description || 'Open-source hardware repository and architecture implementation.'}
          </p>
        </div>
        <div class="pt-3 border-t border-black/15 flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span class="text-neutral-500">${repo.language || 'SystemVerilog'}</span>
          <span class="font-semibold text-black group-hover:underline flex items-center gap-1">
            View on GitHub &nearr;
          </span>
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
  const projectsContainer = document.getElementById('projects-container');
  if (projectsContainer) {
    let triggered = false;
    const triggerFetch = () => {
      if (!triggered) {
        triggered = true;
        fetchGitHubProjects();
      }
    };

    const projectsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          triggerFetch();
          projectsObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px 0px 150px 0px"
    });
    
    setTimeout(() => {
      projectsObserver.observe(projectsContainer);
      const rect = projectsContainer.getBoundingClientRect();
      if (rect.top < window.innerHeight + 150 && rect.bottom > 0) {
        triggerFetch();
      }
    }, 100);
  } else {
    fetchGitHubProjects();
  }
});
