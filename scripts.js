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

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.remove("translate-x-full");
    });
  }

  if (closeButton && mobileMenu) {
    closeButton.addEventListener("click", () => {
      mobileMenu.classList.add("translate-x-full");
    });
  }

  mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("translate-x-full");
    });
  });

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

    try {
      const response = await fetch('https://api.github.com/orgs/RISC-M/repos?sort=updated&direction=desc');
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      const repos = await response.json();
      const filteredRepos = repos.filter(repo => repo.name !== 'website-home');
      
      renderRepos(filteredRepos.length > 0 ? filteredRepos : fallbackRepos);
    } catch (error) {
      console.warn("Using fallback repositories due to GitHub API rate limit or network error:", error.message);
      renderRepos(fallbackRepos);
    }
  }

  function renderRepos(repos) {
    const container = document.getElementById('projects-container');
    if (!container) return;
    
    container.innerHTML = ''; // Clear loading skeleton

    repos.forEach((repo, index) => {
      const date = new Date(repo.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      let tagsHtml = '';
      if (repo.language) {
        tagsHtml += `<span class="px-3 py-1 bg-neutral-100 border border-black rounded-full text-xs font-bold uppercase tracking-wider">${repo.language}</span>`;
      }
      if (repo.topics && repo.topics.length > 0) {
        repo.topics.forEach(topic => {
          tagsHtml += `<span class="px-3 py-1 bg-neutral-100 border border-neutral-300 rounded-full text-xs font-semibold uppercase text-neutral-600 tracking-wider">${topic}</span>`;
        });
      }

      const article = document.createElement('article');
      article.className = 'border-2 border-black p-8 md:p-12 rounded-[2rem] w-full max-w-2xl flex flex-col justify-between transition-all duration-300 bg-white hover:-translate-y-1 hover-rainbow-card';
      article.innerHTML = `
        <div>
          <div class="flex flex-col items-center mb-6 border-b border-black pb-6 gap-4">
            <div class="text-center w-full">
              <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="hover:opacity-70 transition-opacity">
                <h2 class="text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-tighter mt-2 leading-none">${repo.name.replace(/-/g, ' ')}</h2>
              </a>
            </div>
            <div class="flex flex-col items-center">
              <div class="px-4 py-1 border border-black bg-black text-white rounded-full text-xs font-bold uppercase tracking-widest mb-2 inline-block">Active Repo</div>
              <span class="text-xs font-bold uppercase tracking-wider text-neutral-400 block">Updated: ${date}</span>
            </div>
          </div>
          <div class="space-y-4 text-center">
            <p class="text-base md:text-lg font-normal text-neutral-700 leading-relaxed">
              ${repo.description || 'No description provided for this repository.'}
            </p>
            <div class="flex flex-wrap justify-center gap-2 pt-4">
              ${tagsHtml}
            </div>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-black border-dashed flex justify-center">
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="text-sm font-bold uppercase tracking-widest hover:underline flex items-center gap-2">
            View on GitHub 
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
            </svg>
          </a>
        </div>
      `;
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

  // Run GitHub fetching
  fetchGitHubProjects();
});