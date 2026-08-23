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

  // 2. Vanta.js CLOUDS2 for Landing / Hero Section
  const heroVantaEl = document.getElementById('hero-vanta');
  if (heroVantaEl && typeof THREE !== 'undefined' && typeof VANTA !== 'undefined' && VANTA.CLOUDS2) {
    try {
      VANTA.CLOUDS2({
        el: "#hero-vanta",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        texturePath: "./noise.png",
        backgroundColor: 0xededed,
        skyColor: 0x8bb2d6,
        cloudColor: 0xffffff,
        cloudShadowColor: 0x486b88,
        sunColor: 0xffb347,
        sunGlareColor: 0xffdfba,
        sunlightColor: 0xfff3e0,
        speed: 1.10
      });
    } catch (err) {
      console.warn("Vanta Clouds2 initialisation error:", err);
    }
  }

  // 3. Ambient Canvas Background (Tympanus Demo 3 'Shift' in Cloud Palette)
  // Provides organic, shifting atmospheric cloud hues across the rest of the site
  const ambientContainer = document.getElementById('ambient-canvas-container');
  if (ambientContainer) {
    // Simplex Noise Generator
    class SimplexNoise {
      constructor() {
        this.p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) this.p[i] = Math.floor(Math.random() * 256);
        this.perm = new Uint8Array(512);
        this.permMod12 = new Uint8Array(512);
        for (let i = 0; i < 512; i++) {
          this.perm[i] = this.p[i & 255];
          this.permMod12[i] = this.perm[i] % 12;
        }
      }
      noise3D(xin, yin, zin) {
        const F3 = 1.0 / 3.0, G3 = 1.0 / 6.0;
        const grad3 = [
          [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
          [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
          [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        let n0, n1, n2, n3;
        const s = (xin + yin + zin) * F3;
        const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
        const t = (i + j + k) * G3;
        const X0 = i - t, Y0 = j - t, Z0 = k - t;
        const x0 = xin - X0, y0 = yin - Y0, z0 = zin - Z0;
        let i1, j1, k1, i2, j2, k2;
        if (x0 >= y0) {
          if (y0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=1; k2=0; }
          else if (x0 >= z0) { i1=1; j1=0; k1=0; i2=1; j2=0; k2=1; }
          else { i1=0; j1=0; k1=1; i2=1; j2=0; k2=1; }
        } else {
          if (y0 < z0) { i1=0; j1=0; k1=1; i2=0; j2=1; k2=1; }
          else if (x0 < z0) { i1=0; j1=1; k1=0; i2=0; j2=1; k2=1; }
          else { i1=0; j1=1; k1=0; i2=1; j2=1; k2=0; }
        }
        const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2.0*G3, y2 = y0 - j2 + 2.0*G3, z2 = z0 - k2 + 2.0*G3;
        const x3 = x0 - 1.0 + 3.0*G3, y3 = y0 - 1.0 + 3.0*G3, z3 = z0 - 1.0 + 3.0*G3;
        const ii = i & 255, jj = j & 255, kk = k & 255;
        const gi0 = this.permMod12[ii + this.perm[jj + this.perm[kk]]];
        const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]];
        const gi2 = this.permMod12[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]];
        const gi3 = this.permMod12[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]];
        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        n0 = t0 < 0 ? 0.0 : (t0 *= t0, t0 * t0 * (grad3[gi0][0]*x0 + grad3[gi0][1]*y0 + grad3[gi0][2]*z0));
        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        n1 = t1 < 0 ? 0.0 : (t1 *= t1, t1 * t1 * (grad3[gi1][0]*x1 + grad3[gi1][1]*y1 + grad3[gi1][2]*z1));
        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        n2 = t2 < 0 ? 0.0 : (t2 *= t2, t2 * t2 * (grad3[gi2][0]*x2 + grad3[gi2][1]*y2 + grad3[gi2][2]*z2));
        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
        n3 = t3 < 0 ? 0.0 : (t3 *= t3, t3 * t3 * (grad3[gi3][0]*x3 + grad3[gi3][1]*y3 + grad3[gi3][2]*z3));
        return 32.0 * (n0 + n1 + n2 + n3);
      }
    }

    const { PI, cos, sin, abs, random } = Math;
    const TAU = 2 * PI;
    const rand = n => n * random();
    const fadeInOut = (t, m) => {
      let hm = 0.5 * m;
      return abs((t + hm) % m - hm) / hm;
    };

    const circleCount = 65;
    const circlePropCount = 9;
    const circlePropsLength = circleCount * circlePropCount;
    const baseSpeed = 0.15;
    const rangeSpeed = 0.6;
    const baseTTL = 160;
    const rangeTTL = 220;
    const baseRadius = 120;
    const rangeRadius = 240;
    const rangeHue = 45;
    const xOff = 0.0012;
    const yOff = 0.0012;
    const zOff = 0.0012;
    const backgroundColor = '#ededed';

    let canvasA = document.createElement('canvas');
    let canvasB = document.createElement('canvas');
    canvasB.style.position = 'fixed';
    canvasB.style.top = '0';
    canvasB.style.left = '0';
    canvasB.style.width = '100%';
    canvasB.style.height = '100%';
    canvasB.style.pointerEvents = 'none';
    canvasB.style.zIndex = '0';
    ambientContainer.appendChild(canvasB);

    let ctxA = canvasA.getContext('2d');
    let ctxB = canvasB.getContext('2d');
    let circleProps = new Float32Array(circlePropsLength);
    let simplex = new SimplexNoise();
    let baseHue = 205; // Sky blue baseline

    function resize() {
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvasA.width = width;
      canvasA.height = height;
      canvasB.width = width;
      canvasB.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    function initCircle(i) {
      const x = rand(canvasA.width);
      const y = rand(canvasA.height);
      const n = simplex.noise3D(x * xOff, y * yOff, baseHue * zOff);
      const t = rand(TAU);
      const speed = baseSpeed + rand(rangeSpeed);
      const vx = speed * cos(t);
      const vy = speed * sin(t);
      const life = 0;
      const ttl = baseTTL + rand(rangeTTL);
      const radius = baseRadius + rand(rangeRadius);
      // Harmonized cloud colors: sky blue (205), pale gold sun (40), misty lilac (260)
      const colorPalette = [205, 215, 195, 38, 260];
      const selectedHue = colorPalette[Math.floor(rand(colorPalette.length))];
      const hue = (selectedHue + n * rangeHue) % 360;
      const sat = selectedHue === 38 ? 75 : 55;

      circleProps.set([x, y, vx, vy, life, ttl, radius, hue, sat], i);
    }

    function initCircles() {
      for (let i = 0; i < circlePropsLength; i += circlePropCount) {
        initCircle(i);
      }
    }
    initCircles();

    function updateCircle(i) {
      let x = circleProps[i];
      let y = circleProps[i + 1];
      let vx = circleProps[i + 2];
      let vy = circleProps[i + 3];
      let life = circleProps[i + 4];
      let ttl = circleProps[i + 5];
      let radius = circleProps[i + 6];
      let hue = circleProps[i + 7];
      let sat = circleProps[i + 8];

      // Draw circle on offscreen canvas
      ctxA.save();
      const alpha = 0.28 * fadeInOut(life, ttl);
      ctxA.fillStyle = `hsla(${hue}, ${sat}%, 70%, ${alpha})`;
      ctxA.beginPath();
      ctxA.arc(x, y, radius, 0, TAU);
      ctxA.fill();
      ctxA.restore();

      life++;
      circleProps[i] = x + vx;
      circleProps[i + 1] = y + vy;
      circleProps[i + 4] = life;

      if (x < -radius || x > canvasA.width + radius || y < -radius || y > canvasA.height + radius || life > ttl) {
        initCircle(i);
      }
    }

    function draw() {
      ctxA.clearRect(0, 0, canvasA.width, canvasA.height);
      ctxB.fillStyle = backgroundColor;
      ctxB.fillRect(0, 0, canvasB.width, canvasB.height);

      baseHue += 0.05;

      for (let i = 0; i < circlePropsLength; i += circlePropCount) {
        updateCircle(i);
      }

      ctxB.save();
      ctxB.filter = 'blur(65px)';
      ctxB.drawImage(canvasA, 0, 0);
      ctxB.restore();

      requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
  }
});
