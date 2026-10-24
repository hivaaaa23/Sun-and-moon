/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cinematic Sun & Moon — Endure (Viral Trend Loop)
 * Focuses purely on the iconic dialogue trend loop (0.0s - 12.8s) in pitch-black space.
 */

// =============================================================================
// CONFIGURATION: EXACT VIRAL TREND TIMELINE
// =============================================================================

const TREND_CONFIG = {
  audio: {
    src: 'assets/aistudio/ENDURE___FABIO_ADELINO_DE_MORAIS_8f672a19.m4a',
    fallbackSrc: '/assets/aistudio/ENDURE___FABIO_ADELINO_DE_MORAIS_8f672a19.m4a',
    loopStart: 0.0,
    loopEnd: 12.8, // The exact viral trend section cutoff
  },
  subtitles: [
    { start: 0.2, end: 3.2, text: 'If I was the moon, would you still look for the stars?' },
    { start: 3.3, end: 6.8, text: 'Only if you promise me to shine forever.' },
    { start: 6.9, end: 11.2, text: 'But what if I can\'t shine forever?' }
  ],
  ascii: {
    sunChars: ['@', '#', '%', '*', '+', '=', '-', ':', '.', 'S', 'U', 'N', '8'],
    moonChars: ['@', '%', '#', '*', '+', '=', '-', ':', '.', 'M', 'O', 'O', 'N'],
    codeLines: [
      'clamp_stars(alpha, tg, fd, pv, hfu, nodj);',
      'vec2 uv = (gl_FragCoord.xy - 0.5 * res) / res.y;',
      'mat3 rot = rotation3D(axis, celestial_theta);',
      'float corona = pow(max(0.0, 1.0 - length(p)), 2.8);'
    ]
  }
};

// =============================================================================
// AUDIO ENGINE (Trend Loop Controller)
// =============================================================================

class TrendAudioEngine {
  constructor() {
    this.audio = new Audio();
    this.audio.preload = 'auto';
    this.audio.crossOrigin = 'anonymous';

    this.ctx = null;
    this.analyser = null;
    this.dataArray = null;

    this.isPlaying = false;
    this.isMuted = false;
    this.energy = { bass: 0, mid: 0, overall: 0 };

    this.sources = [TREND_CONFIG.audio.src, TREND_CONFIG.audio.fallbackSrc];
    this.sourceIdx = 0;
    this.initAudio();
  }

  initAudio() {
    this.audio.src = this.sources[this.sourceIdx];
    this.audio.addEventListener('error', () => {
      if (this.sourceIdx < this.sources.length - 1) {
        this.sourceIdx++;
        this.audio.src = this.sources[this.sourceIdx];
      }
    });

    // Enforce exact trend loop boundary
    this.audio.addEventListener('timeupdate', () => {
      if (this.audio.currentTime >= TREND_CONFIG.audio.loopEnd) {
        this.audio.currentTime = TREND_CONFIG.audio.loopStart;
      }
    });
  }

  setupWebAudio() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      const source = this.ctx.createMediaElementSource(this.audio);
      source.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (e) {
      // Timeline fallback if audio context not permitted
    }
  }

  async play() {
    this.setupWebAudio();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    await this.audio.play();
    this.isPlaying = true;
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    this.audio.muted = this.isMuted;
    return this.isMuted;
  }

  updateMetrics() {
    if (!this.analyser || !this.isPlaying) {
      const t = performance.now() * 0.002;
      const pulse = (Math.sin(t) * 0.5 + 0.5) * 0.2;
      this.energy.bass = pulse;
      this.energy.mid = pulse * 0.8;
      this.energy.overall = pulse;
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0, bassSum = 0;
    const len = this.dataArray.length;
    for (let i = 0; i < len; i++) {
      const v = this.dataArray[i] / 255;
      sum += v;
      if (i < 5) bassSum += v;
    }
    this.energy.overall = sum / len;
    this.energy.bass = bassSum / 5;
    this.energy.mid = this.energy.overall;
  }

  getCurrentTime() {
    return this.audio.currentTime % TREND_CONFIG.audio.loopEnd;
  }
}

// =============================================================================
// PARTICLES & STARS (Minimalist Stars & Cross Stars on Pure Black)
// =============================================================================

class MinimalCosmos {
  constructor() {
    this.stars = [];
    this.crossStars = [];
  }

  init(width, height) {
    this.stars = [];
    this.crossStars = [];

    // Subtle background stars
    const starCount = Math.floor((width * height) / 6000);
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.6 + 0.2,
        speed: Math.random() * 2 + 1,
        offset: Math.random() * Math.PI * 2
      });
    }

    // Iconic 4-point cross stars (✦)
    const crossCount = Math.max(6, Math.floor(width / 180));
    for (let i = 0; i < crossCount; i++) {
      this.crossStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        sz: Math.random() * 5 + 3.5,
        alpha: Math.random() * 0.5 + 0.3,
        pulseSpeed: Math.random() * 1.8 + 1,
        offset: Math.random() * Math.PI * 2
      });
    }
  }

  render(ctx, width, height, time) {
    // Render quiet twinkling stars
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const twinkle = Math.sin(time * s.speed + s.offset) * 0.35 + 0.65;
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * twinkle})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render cross stars (✦)
    for (let i = 0; i < this.crossStars.length; i++) {
      const cs = this.crossStars[i];
      const pulse = Math.sin(time * cs.pulseSpeed + cs.offset) * 0.4 + 0.6;
      const sz = cs.sz * pulse;

      ctx.save();
      ctx.translate(cs.x, cs.y);
      ctx.fillStyle = `rgba(255, 255, 255, ${cs.alpha * pulse})`;

      ctx.beginPath();
      ctx.moveTo(0, -sz);
      ctx.quadraticCurveTo(0, 0, sz, 0);
      ctx.quadraticCurveTo(0, 0, 0, sz);
      ctx.quadraticCurveTo(0, 0, -sz, 0);
      ctx.quadraticCurveTo(0, 0, 0, -sz);
      ctx.fill();
      ctx.restore();
    }
  }
}

// =============================================================================
// CELESTIAL BODIES RENDERER (ASCII & CINEMATIC)
// =============================================================================

class TrendRenderer {
  constructor() {
    this.mode = 0; // 0: Viral ASCII Code, 1: Cinematic
    this.sunRotation = 0;
    this.moonRotation = 0;
  }

  toggleMode() {
    this.mode = this.mode === 0 ? 1 : 0;
    return this.mode === 0 ? 'Viral ASCII' : 'Cinematic';
  }

  renderAsciiSphere(ctx, x, y, radius, type, rotationY, energy, lightVec) {
    ctx.save();
    ctx.translate(x, y);

    const isSun = type === 'sun';
    const fontHeight = Math.max(8, Math.floor(radius / 11));
    ctx.font = `${fontHeight}px "Fira Code", monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const latRings = 22;
    const lonPoints = 32;
    const chars = isSun ? TREND_CONFIG.ascii.sunChars : TREND_CONFIG.ascii.moonChars;

    // Subtle atmospheric ASCII glow
    const coronaGlyphs = ['*', '+', ':', '·', '°'];
    const coronaCount = isSun ? 24 : 14;
    const coronaR = radius * (1.15 + energy.bass * 0.15);
    for (let i = 0; i < coronaCount; i++) {
      const angle = (i / coronaCount) * Math.PI * 2 + rotationY * 0.3;
      const fx = Math.cos(angle) * coronaR;
      const fy = Math.sin(angle) * coronaR;
      const glyph = coronaGlyphs[(i + Math.floor(rotationY * 3)) % coronaGlyphs.length];

      ctx.fillStyle = isSun
        ? `rgba(255, 170, 40, ${0.4 + energy.bass * 0.4})`
        : `rgba(160, 205, 255, 0.3)`;
      ctx.fillText(glyph, fx, fy);
    }

    // 3D Sphere Surface
    for (let lat = -latRings; lat <= latRings; lat++) {
      const phi = (lat / latRings) * (Math.PI / 2);
      const ringR = radius * Math.cos(phi);
      const py = radius * Math.sin(phi);

      if (ringR <= 0) continue;
      const numPts = Math.max(6, Math.floor(lonPoints * Math.cos(phi)));

      for (let lon = 0; lon < numPts; lon++) {
        const theta = (lon / numPts) * Math.PI * 2 + rotationY;
        const px = ringR * Math.sin(theta);
        const pz = ringR * Math.cos(theta);

        if (pz < -1) continue; // Front hemisphere

        const nx = px / radius;
        const ny = py / radius;
        const nz = pz / radius;

        let intensity = 1.0;
        if (isSun) {
          intensity = nz * 0.7 + 0.3 + energy.bass * 0.25;
        } else {
          const dot = nx * lightVec.x + ny * lightVec.y + nz * lightVec.z;
          const crater = (Math.sin(theta * 6) * Math.cos(phi * 7) + 1) * 0.15;
          intensity = Math.max(0.08, dot + crater) * 0.95;
        }
        intensity = Math.max(0, Math.min(1, intensity));

        const charIdx = Math.floor((1 - intensity) * (chars.length - 1));
        const char = chars[charIdx] || chars[chars.length - 1];

        if (isSun) {
          const g = Math.floor(155 + intensity * 95);
          const b = Math.floor(25 + intensity * 110);
          ctx.fillStyle = `rgba(255, ${g}, ${b}, ${0.5 + intensity * 0.5})`;
        } else {
          const r = Math.floor(130 + intensity * 125);
          const g = Math.floor(170 + intensity * 85);
          ctx.fillStyle = `rgba(${r}, ${g}, 255, ${0.45 + intensity * 0.55})`;
        }

        ctx.fillText(char, px, py);
      }
    }
    ctx.restore();
  }

  renderCinematicSun(ctx, x, y, radius, rotation, energy) {
    ctx.save();
    ctx.translate(x, y);

    const r = radius * (1 + energy.bass * 0.15);

    // Warm radial glow on black
    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 2.8);
    glowGrad.addColorStop(0, 'rgba(255, 140, 20, 0.45)');
    glowGrad.addColorStop(0.5, 'rgba(220, 70, 0, 0.15)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.8, 0, Math.PI * 2);
    ctx.fill();

    // Photosphere core
    const coreGrad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.4, '#ffc24a');
    coreGrad.addColorStop(0.85, '#e65c00');
    coreGrad.addColorStop(1, '#942b00');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderCinematicMoon(ctx, x, y, radius, lightVec) {
    ctx.save();
    ctx.translate(x, y);

    const r = radius;

    // Cool silver halo
    const haloGrad = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 2.2);
    haloGrad.addColorStop(0, 'rgba(170, 215, 255, 0.35)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Base surface
    ctx.fillStyle = '#b0cbe8';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // Directional Shadow
    const lightAngle = Math.atan2(lightVec.y, lightVec.x);
    const shadowGrad = ctx.createLinearGradient(
      Math.cos(lightAngle) * r, Math.sin(lightAngle) * r,
      -Math.cos(lightAngle) * r, -Math.sin(lightAngle) * r
    );
    shadowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
    shadowGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.1)');
    shadowGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.92)');

    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderCodeLines(ctx, time) {
    if (this.mode === 1) return;
    ctx.save();
    ctx.font = '11px "Fira Code", monospace';
    ctx.fillStyle = 'rgba(120, 160, 220, 0.15)';
    const lines = TREND_CONFIG.ascii.codeLines;
    for (let i = 0; i < lines.length; i++) {
      ctx.fillText(lines[i], 28, 45 + i * 22);
    }
    ctx.restore();
  }
}

// =============================================================================
// MAIN CONTROLLER
// =============================================================================

class TrendApp {
  constructor() {
    this.canvas = document.getElementById('celestial-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container = document.getElementById('cosmos-container');

    this.audio = new TrendAudioEngine();
    this.cosmos = new MinimalCosmos();
    this.renderer = new TrendRenderer();

    this.subText = document.getElementById('dialogue-text');
    this.playOverlay = document.getElementById('play-overlay');
    this.hairlineFill = document.getElementById('hairline-fill');
    this.styleLabel = document.getElementById('style-label');
    this.styleToggleBtn = document.getElementById('style-toggle-btn');
    this.muteBtn = document.getElementById('mute-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');

    this.standaloneTime = 0;
    this.lastTime = performance.now();

    this.initEvents();
    this.resize();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // Click anywhere on pure black space to play or pause
    this.container.addEventListener('click', async (e) => {
      // Don't trigger if clicked a floating button
      if (e.target.closest('#floating-controls')) return;

      if (!this.audio.isPlaying) {
        try {
          await this.audio.play();
          this.playOverlay.classList.add('hidden');
        } catch (err) {
          // Autoplay blocked fallback
        }
      } else {
        this.audio.pause();
        this.playOverlay.classList.remove('hidden');
      }
    });

    // Style switch
    this.styleToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = this.renderer.toggleMode();
      this.styleLabel.textContent = name;
    });

    // Mute toggle
    this.muteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const muted = this.audio.toggleMute();
      this.muteBtn.innerHTML = muted
        ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
        : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>';
    });

    // Fullscreen
    this.fullscreenBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Spacebar to toggle
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (this.audio.isPlaying) {
          this.audio.pause();
          this.playOverlay.classList.remove('hidden');
        } else {
          this.audio.play().then(() => this.playOverlay.classList.add('hidden')).catch(() => {});
        }
      } else if (e.code === 'KeyS') {
        const name = this.renderer.toggleMode();
        this.styleLabel.textContent = name;
      }
    });
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    this.cosmos.init(this.width, this.height);
  }

  getChoreography(time) {
    const w = this.width;
    const h = this.height;
    const minDim = Math.min(w, h);
    const sunR = minDim * 0.17;
    const moonR = minDim * 0.145;

    const cx = w * 0.5;
    const cy = h * 0.5;

    // Viral trend motion:
    // 0s - 3.5s: Separated on opposite sides
    // 3.5s - 7s: Attracted towards center
    // 7s - 10.5s: Moon crosses in front of Sun (Eclipse)
    // 10.5s - 12.8s: Complete orbit and glide back
    let sunX, sunY, moonX, moonY;
    let isMoonInFront = true;

    if (time < 3.5) {
      const sep = w * 0.32;
      sunX = cx - sep;
      sunY = cy;
      moonX = cx + sep;
      moonY = cy;
    } else if (time < 7.0) {
      const p = (time - 3.5) / 3.5;
      const ease = Math.sin(p * Math.PI * 0.5);
      const sep = w * (0.32 - ease * 0.22);
      sunX = cx - sep;
      sunY = cy;
      moonX = cx + sep;
      moonY = cy;
    } else if (time < 10.5) {
      const p = (time - 7.0) / 3.5;
      // Moon glides across the Sun
      const sunOffset = Math.sin(p * Math.PI) * (w * 0.04);
      sunX = cx - (w * 0.08) * (1 - p);
      sunY = cy + sunOffset * 0.3;

      moonX = cx + (w * 0.1) * (1 - p * 2);
      moonY = cy - sunOffset * 0.3;
      isMoonInFront = true;
    } else {
      const p = (time - 10.5) / 2.3;
      const ease = p * p * (3 - 2 * p);
      sunX = cx - w * (0.05 + ease * 0.27);
      sunY = cy;
      moonX = cx + w * (0.05 + ease * 0.27);
      moonY = cy;
      isMoonInFront = false;
    }

    return { sun: { x: sunX, y: sunY, r: sunR }, moon: { x: moonX, y: moonY, r: moonR }, isMoonInFront };
  }

  loop(currentTimeMs) {
    const dt = Math.min(0.1, (currentTimeMs - this.lastTime) * 0.001);
    this.lastTime = currentTimeMs;
    const timeSec = currentTimeMs * 0.001;

    // Update audio metrics
    this.audio.updateMetrics();
    const energy = this.audio.energy;

    // Timeline calculation
    let t = this.audio.isPlaying
      ? this.audio.getCurrentTime()
      : (this.standaloneTime = (this.standaloneTime + dt) % TREND_CONFIG.audio.loopEnd);

    // Update progress hairline
    const progress = Math.max(0, Math.min(1, t / TREND_CONFIG.audio.loopEnd));
    this.hairlineFill.style.width = `${progress * 100}%`;

    // Subtitle detection
    let currentSub = '';
    for (let i = 0; i < TREND_CONFIG.subtitles.length; i++) {
      const s = TREND_CONFIG.subtitles[i];
      if (t >= s.start && t <= s.end) {
        currentSub = s.text;
        break;
      }
    }
    this.subText.textContent = currentSub;

    // Clear canvas to PURE BLACK (#000000)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render stars and cross stars
    this.cosmos.render(this.ctx, this.width, this.height, timeSec);

    // Background code lines from viral video
    this.renderer.renderCodeLines(this.ctx, timeSec);

    // Celestial movement
    const choreo = this.getChoreography(t);
    const sunPos = choreo.sun;
    const moonPos = choreo.moon;

    this.renderer.sunRotation += dt * 0.45;
    this.renderer.moonRotation += dt * 0.3;

    // Light vector from Moon to Sun
    const dx = sunPos.x - moonPos.x;
    const dy = sunPos.y - moonPos.y;
    const len = Math.hypot(dx, dy) || 1;
    const lightVec = { x: dx / len, y: dy / len, z: 0.35 };

    const drawSun = () => {
      if (this.renderer.mode === 0) {
        this.renderer.renderAsciiSphere(
          this.ctx, sunPos.x, sunPos.y, sunPos.r, 'sun',
          this.renderer.sunRotation, energy, lightVec
        );
      } else {
        this.renderer.renderCinematicSun(
          this.ctx, sunPos.x, sunPos.y, sunPos.r,
          this.renderer.sunRotation, energy
        );
      }
    };

    const drawMoon = () => {
      if (this.renderer.mode === 0) {
        this.renderer.renderAsciiSphere(
          this.ctx, moonPos.x, moonPos.y, moonPos.r, 'moon',
          this.renderer.moonRotation, energy, lightVec
        );
      } else {
        this.renderer.renderCinematicMoon(
          this.ctx, moonPos.x, moonPos.y, moonPos.r, lightVec
        );
      }
    };

    // Render in proper front/back order
    if (choreo.isMoonInFront) {
      drawSun();
      drawMoon();
    } else {
      drawMoon();
      drawSun();
    }

    requestAnimationFrame(this.loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new TrendApp();
});
