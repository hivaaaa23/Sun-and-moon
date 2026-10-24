/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Cinematic Sun & Moon — Endure (Viral Trend Experience)
 * Pure pitch-black minimalism with:
 * - Diamond Ring Eclipse Flare & Corona Rays at climax (10s - 11.5s)
 * - Interactive Celestial Gravity & Cosmic Dust Trail
 * - Voice & Sound Breath Reactivity
 * - Stardust Particle Dissolve for Dialogue
 * - Horizontal Time Scrubbing via Drag/Swipe
 */

const TREND_CONFIG = {
  audio: {
    src: 'assets/aistudio/ENDURE___FABIO_ADELINO_DE_MORAIS_8f672a19.m4a',
    fallbackSrc: '/assets/aistudio/ENDURE___FABIO_ADELINO_DE_MORAIS_8f672a19.m4a',
    loopStart: 0.0,
    loopEnd: 12.8,
  },
  subtitles: [
    { start: 0.2, end: 3.2, speaker: 'moon', text: 'If I was the moon, would you still look for the stars?' },
    { start: 3.3, end: 6.8, speaker: 'sun', text: 'Only if you promise me to shine forever.' },
    { start: 6.9, end: 11.2, speaker: 'moon', text: 'But what if I can\'t shine forever?' }
  ],
  ascii: {
    sunChars: ['@', '#', '%', '*', '+', '=', '-', ':', '.', 'S', 'U', 'N', '8', '☀'],
    moonChars: ['@', '%', '#', '*', '+', '=', '-', ':', '.', 'M', 'O', 'O', 'N', '☾'],
    codeLines: [
      'clamp_stars(alpha, tg, fd, pv, hfu, nodj);',
      'vec2 uv = (gl_FragCoord.xy - 0.5 * res) / res.y;',
      'mat3 rot = rotation3D(axis, celestial_theta);',
      'float corona = pow(max(0.0, 1.0 - length(p)), 2.8);'
    ]
  }
};

// =============================================================================
// AUDIO ENGINE (Web Audio API + Precise Loop)
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
    this.energy = { bass: 0, mid: 0, overall: 0, vocalBreath: 0 };

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
      // Running in fallback timeline mode
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

  seek(sec) {
    const clamped = Math.max(0, Math.min(TREND_CONFIG.audio.loopEnd, sec));
    this.audio.currentTime = clamped;
  }

  updateMetrics() {
    if (!this.analyser || !this.isPlaying) {
      const t = performance.now() * 0.002;
      const pulse = (Math.sin(t * 1.5) * 0.5 + 0.5) * 0.2;
      this.energy.bass = pulse;
      this.energy.mid = pulse * 0.8;
      this.energy.overall = pulse;
      this.energy.vocalBreath = (Math.sin(t * 3) * 0.5 + 0.5) * 0.15;
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0, bassSum = 0, vocalSum = 0;
    const len = this.dataArray.length;
    for (let i = 0; i < len; i++) {
      const v = this.dataArray[i] / 255;
      sum += v;
      if (i < 4) bassSum += v;
      if (i >= 4 && i <= 14) vocalSum += v;
    }
    this.energy.overall = sum / len;
    this.energy.bass = bassSum / 4;
    this.energy.vocalBreath = vocalSum / 11;
    this.energy.mid = this.energy.overall;
  }

  getCurrentTime() {
    return this.audio.currentTime % TREND_CONFIG.audio.loopEnd;
  }
}

// =============================================================================
// COSMIC PARTICLES & INTERACTIVE DUST SYSTEM
// =============================================================================

class CosmicParticleSystem {
  constructor() {
    this.stars = [];
    this.crossStars = [];
    this.cursorDust = [];
    this.eclipseSparks = [];
    this.shockwaves = [];
    this.dialogueParticles = [];
  }

  init(width, height) {
    this.stars = [];
    this.crossStars = [];

    const starCount = Math.floor((width * height) / 5500);
    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.3,
        alpha: Math.random() * 0.65 + 0.2,
        speed: Math.random() * 2 + 1,
        offset: Math.random() * Math.PI * 2
      });
    }

    const crossCount = Math.max(6, Math.floor(width / 180));
    for (let i = 0; i < crossCount; i++) {
      this.crossStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        sz: Math.random() * 5 + 3.5,
        alpha: Math.random() * 0.55 + 0.35,
        pulseSpeed: Math.random() * 1.8 + 1,
        offset: Math.random() * Math.PI * 2
      });
    }
  }

  addCursorDust(x, y) {
    for (let i = 0; i < 2; i++) {
      this.cursorDust.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02,
        char: Math.random() > 0.5 ? '·' : '✦',
        color: Math.random() > 0.5 ? 'rgba(255, 215, 140,' : 'rgba(180, 220, 255,'
      });
    }
  }

  triggerEclipseBurst(cx, cy, radius) {
    // Shockwave ring
    this.shockwaves.push({
      x: cx,
      y: cy,
      radius: radius * 0.5,
      maxRadius: radius * 3.5,
      alpha: 0.9,
      lineWidth: 3
    });

    // Sparks bursting outward
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.eclipseSparks.push({
        x: cx + Math.cos(angle) * (radius * 0.9),
        y: cy + Math.sin(angle) * (radius * 0.9),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0,
        decay: Math.random() * 0.02 + 0.015,
        sz: Math.random() * 2.5 + 1,
        color: Math.random() > 0.4 ? '#ffdd88' : '#ffffff'
      });
    }
  }

  addDialogueDissolve(text, cx, cy) {
    if (!text) return;
    const count = Math.min(30, text.length * 2);
    for (let i = 0; i < count; i++) {
      this.dialogueParticles.push({
        x: cx + (Math.random() - 0.5) * 300,
        y: cy + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 1.2,
        vy: -Math.random() * 1.5 - 0.5,
        life: 1.0,
        decay: Math.random() * 0.025 + 0.015,
        char: text[Math.floor(Math.random() * text.length)] || '·',
        color: 'rgba(240, 245, 255,'
      });
    }
  }

  update(dt) {
    // Update cursor dust
    for (let i = this.cursorDust.length - 1; i >= 0; i--) {
      const p = this.cursorDust[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) this.cursorDust.splice(i, 1);
    }

    // Update eclipse sparks
    for (let i = this.eclipseSparks.length - 1; i >= 0; i--) {
      const sp = this.eclipseSparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.life -= sp.decay;
      if (sp.life <= 0) this.eclipseSparks.splice(i, 1);
    }

    // Update shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += (sw.maxRadius - sw.radius) * 0.07;
      sw.alpha -= 0.025;
      if (sw.alpha <= 0) this.shockwaves.splice(i, 1);
    }

    // Update dialogue particles
    for (let i = this.dialogueParticles.length - 1; i >= 0; i--) {
      const dp = this.dialogueParticles[i];
      dp.x += dp.vx;
      dp.y += dp.vy;
      dp.life -= dp.decay;
      if (dp.life <= 0) this.dialogueParticles.splice(i, 1);
    }
  }

  render(ctx, width, height, time) {
    // 1. Stars in deep black void
    for (let i = 0; i < this.stars.length; i++) {
      const s = this.stars[i];
      const twinkle = Math.sin(time * s.speed + s.offset) * 0.35 + 0.65;
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * twinkle})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Cross stars (✦)
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

    // 3. Shockwave rings
    for (let i = 0; i < this.shockwaves.length; i++) {
      const sw = this.shockwaves[i];
      ctx.save();
      ctx.strokeStyle = `rgba(255, 220, 150, ${sw.alpha * 0.6})`;
      ctx.lineWidth = sw.lineWidth;
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Cursor dust trail
    ctx.font = '10px "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < this.cursorDust.length; i++) {
      const p = this.cursorDust[i];
      ctx.fillStyle = `${p.color} ${p.life * 0.7})`;
      ctx.fillText(p.char, p.x, p.y);
    }

    // 5. Eclipse sparks
    for (let i = 0; i < this.eclipseSparks.length; i++) {
      const sp = this.eclipseSparks[i];
      ctx.fillStyle = sp.color;
      ctx.globalAlpha = sp.life;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.sz, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }

    // 6. Dialogue particles
    for (let i = 0; i < this.dialogueParticles.length; i++) {
      const dp = this.dialogueParticles[i];
      ctx.fillStyle = `${dp.color} ${dp.life * 0.8})`;
      ctx.fillText(dp.char, dp.x, dp.y);
    }
  }
}

// =============================================================================
// CELESTIAL BODIES RENDERER (ASCII & DIAMOND RING ECLIPSE)
// =============================================================================

class TrendRenderer {
  constructor() {
    this.mode = 0; // 0: Viral ASCII, 1: Cinematic
    this.sunRotation = 0;
    this.moonRotation = 0;
  }

  toggleMode() {
    this.mode = this.mode === 0 ? 1 : 0;
    return this.mode === 0 ? 'Viral ASCII' : 'Cinematic';
  }

  renderAsciiSphere(ctx, x, y, radius, type, rotationY, energy, lightVec, tilt) {
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

    // Atmospheric coronal glyphs
    const coronaGlyphs = ['*', '+', ':', '·', '°'];
    const coronaCount = isSun ? 26 : 14;
    const breath = 1 + energy.vocalBreath * 0.25;
    const coronaR = radius * (1.14 + energy.bass * 0.18) * breath;

    for (let i = 0; i < coronaCount; i++) {
      const angle = (i / coronaCount) * Math.PI * 2 + rotationY * 0.3;
      const fx = Math.cos(angle) * coronaR;
      const fy = Math.sin(angle) * coronaR;
      const glyph = coronaGlyphs[(i + Math.floor(rotationY * 3)) % coronaGlyphs.length];

      ctx.fillStyle = isSun
        ? `rgba(255, 170, 40, ${0.4 + energy.bass * 0.45})`
        : `rgba(160, 205, 255, 0.32)`;
      ctx.fillText(glyph, fx, fy);
    }

    // 3D Ray-projected spherical coordinates with mouse tilt
    for (let lat = -latRings; lat <= latRings; lat++) {
      const phi = (lat / latRings) * (Math.PI / 2);
      const ringR = radius * Math.cos(phi);
      let py = radius * Math.sin(phi);

      if (ringR <= 0) continue;
      const numPts = Math.max(6, Math.floor(lonPoints * Math.cos(phi)));

      for (let lon = 0; lon < numPts; lon++) {
        const theta = (lon / numPts) * Math.PI * 2 + rotationY;
        let px = ringR * Math.sin(theta);
        let pz = ringR * Math.cos(theta);

        // Interactive 3D tilt
        if (tilt) {
          const cosY = Math.cos(tilt.x);
          const sinY = Math.sin(tilt.x);
          const nx = px * cosY - pz * sinY;
          pz = px * sinY + pz * cosY;
          px = nx;
        }

        if (pz < -1) continue; // Front hemisphere

        const normX = px / radius;
        const normY = py / radius;
        const normZ = pz / radius;

        let intensity = 1.0;
        if (isSun) {
          intensity = normZ * 0.7 + 0.3 + energy.bass * 0.3;
        } else {
          const dot = normX * lightVec.x + normY * lightVec.y + normZ * lightVec.z;
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

  // ---------------------------------------------------------------------------
  // DIAMOND RING ECLIPSE BURST EFFECT (Moment of Climax at ~10.5s - 11.2s)
  // ---------------------------------------------------------------------------
  renderDiamondRingEclipse(ctx, sunPos, moonPos, alignmentRatio, energy) {
    if (alignmentRatio <= 0.05) return;

    ctx.save();
    ctx.translate(sunPos.x, sunPos.y);

    const radius = sunPos.r;
    const rayCount = 36;
    const rayLength = radius * (1.6 + alignmentRatio * 2.2 + energy.bass * 1.2);

    // Radiant Solar God Rays bursting behind the moon
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const len = rayLength * (0.6 + Math.sin(angle * 9) * 0.4);
      const rx = Math.cos(angle) * len;
      const ry = Math.sin(angle) * len;

      const grad = ctx.createLinearGradient(0, 0, rx, ry);
      grad.addColorStop(0, `rgba(255, 235, 180, ${alignmentRatio * 0.8})`);
      grad.addColorStop(0.3, `rgba(255, 160, 40, ${alignmentRatio * 0.4})`);
      grad.addColorStop(1, 'rgba(255, 90, 0, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = Math.max(1.5, radius * 0.028 * alignmentRatio);
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * radius * 0.9, Math.sin(angle) * radius * 0.9);
      ctx.lineTo(rx, ry);
      ctx.stroke();
    }

    // Specular Diamond Flare at contact point
    const dx = moonPos.x - sunPos.x;
    const dy = moonPos.y - sunPos.y;
    const contactAngle = Math.atan2(dy, dx) + Math.PI;
    const fx = Math.cos(contactAngle) * (moonPos.r * 0.95);
    const fy = Math.sin(contactAngle) * (moonPos.r * 0.95);

    const diamondGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, radius * 0.75 * alignmentRatio);
    diamondGrad.addColorStop(0, '#ffffff');
    diamondGrad.addColorStop(0.25, 'rgba(255, 230, 160, 0.9)');
    diamondGrad.addColorStop(0.65, 'rgba(255, 140, 20, 0.35)');
    diamondGrad.addColorStop(1, 'transparent');

    ctx.fillStyle = diamondGrad;
    ctx.beginPath();
    ctx.arc(fx, fy, radius * 0.75 * alignmentRatio, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  renderCinematicSun(ctx, x, y, radius, rotation, energy) {
    ctx.save();
    ctx.translate(x, y);

    const r = radius * (1 + energy.bass * 0.15);

    const glowGrad = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 2.8);
    glowGrad.addColorStop(0, 'rgba(255, 140, 20, 0.45)');
    glowGrad.addColorStop(0.5, 'rgba(220, 70, 0, 0.15)');
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.8, 0, Math.PI * 2);
    ctx.fill();

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

    const haloGrad = ctx.createRadialGradient(0, 0, r * 0.8, 0, 0, r * 2.2);
    haloGrad.addColorStop(0, 'rgba(170, 215, 255, 0.35)');
    haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(0, 0, r * 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#b0cbe8';
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

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
// MAIN APPLICATION (Interactive Celestial Experience)
// =============================================================================

class TrendApp {
  constructor() {
    this.canvas = document.getElementById('celestial-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container = document.getElementById('cosmos-container');

    this.audio = new TrendAudioEngine();
    this.cosmos = new CosmicParticleSystem();
    this.renderer = new TrendRenderer();

    this.subText = document.getElementById('dialogue-text');
    this.playOverlay = document.getElementById('play-overlay');
    this.hairlineFill = document.getElementById('hairline-fill');
    this.styleLabel = document.getElementById('style-label');
    this.styleToggleBtn = document.getElementById('style-toggle-btn');
    this.muteBtn = document.getElementById('mute-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');

    this.mouse = { x: 0, y: 0, normX: 0, normY: 0, isDragging: false, startX: 0, startTime: 0 };
    this.gravityOffset = { x: 0, y: 0 };
    this.lastSubtitle = '';

    this.standaloneTime = 0;
    this.lastTime = performance.now();
    this.burstTriggered = false;

    this.initEvents();
    this.resize();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  initEvents() {
    window.addEventListener('resize', () => this.resize());

    // Mouse Move: Celestial Gravity + Cosmic Dust Trail
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.normX = (e.clientX / this.width) * 2 - 1;
      this.mouse.normY = (e.clientY / this.height) * 2 - 1;

      // Add delicate stardust on cursor move
      this.cosmos.addCursorDust(e.clientX, e.clientY);

      // Interactive drag time scrub
      if (this.mouse.isDragging) {
        const deltaX = (e.clientX - this.mouse.startX) / this.width;
        const newTime = (this.mouse.startTime + deltaX * TREND_CONFIG.audio.loopEnd + TREND_CONFIG.audio.loopEnd) % TREND_CONFIG.audio.loopEnd;
        this.audio.seek(newTime);
        this.standaloneTime = newTime;
      }
    });

    // Touch Move for Mobile
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const t = e.touches[0];
        this.mouse.x = t.clientX;
        this.mouse.y = t.clientY;
        this.mouse.normX = (t.clientX / this.width) * 2 - 1;
        this.mouse.normY = (t.clientY / this.height) * 2 - 1;
        this.cosmos.addCursorDust(t.clientX, t.clientY);

        if (this.mouse.isDragging) {
          const deltaX = (t.clientX - this.mouse.startX) / this.width;
          const newTime = (this.mouse.startTime + deltaX * TREND_CONFIG.audio.loopEnd + TREND_CONFIG.audio.loopEnd) % TREND_CONFIG.audio.loopEnd;
          this.audio.seek(newTime);
          this.standaloneTime = newTime;
        }
      }
    }, { passive: true });

    // Drag start / Click anywhere on pure black space
    this.container.addEventListener('mousedown', (e) => {
      if (e.target.closest('#floating-controls')) return;
      this.mouse.isDragging = true;
      this.mouse.startX = e.clientX;
      this.mouse.startTime = this.audio.isPlaying ? this.audio.getCurrentTime() : this.standaloneTime;
    });

    window.addEventListener('mouseup', (e) => {
      if (!this.mouse.isDragging) return;
      const moved = Math.abs(e.clientX - this.mouse.startX);
      this.mouse.isDragging = false;

      // If it was just a tap/click, toggle playback
      if (moved < 6) {
        if (!this.audio.isPlaying) {
          this.audio.play().then(() => this.playOverlay.classList.add('hidden')).catch(() => {});
        } else {
          this.audio.pause();
          this.playOverlay.classList.remove('hidden');
        }
      }
    });

    // Touch start / end
    this.container.addEventListener('touchstart', (e) => {
      if (e.target.closest('#floating-controls')) return;
      if (e.touches.length > 0) {
        this.mouse.isDragging = true;
        this.mouse.startX = e.touches[0].clientX;
        this.mouse.startTime = this.audio.isPlaying ? this.audio.getCurrentTime() : this.standaloneTime;
      }
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      this.mouse.isDragging = false;
    });

    // Double Click / Double Tap: Instant Eclipse Shockwave Burst!
    this.container.addEventListener('dblclick', (e) => {
      if (e.target.closest('#floating-controls')) return;
      this.cosmos.triggerEclipseBurst(this.width * 0.5, this.height * 0.5, Math.min(this.width, this.height) * 0.16);
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
        : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>';
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

    const cx = w * 0.5 + this.gravityOffset.x;
    const cy = h * 0.5 + this.gravityOffset.y;

    let sunX, sunY, moonX, moonY;
    let isMoonInFront = true;
    let alignmentRatio = 0.0;

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
      const sunOffset = Math.sin(p * Math.PI) * (w * 0.04);
      sunX = cx - (w * 0.08) * (1 - p);
      sunY = cy + sunOffset * 0.3;

      moonX = cx + (w * 0.1) * (1 - p * 2);
      moonY = cy - sunOffset * 0.3;
      isMoonInFront = true;

      // Alignment ratio peaks when moon center aligns with sun center (around p ~ 0.7 to 0.9)
      const dist = Math.hypot(sunX - moonX, sunY - moonY);
      if (dist < sunR * 0.8) {
        alignmentRatio = 1 - (dist / (sunR * 0.8));
      }
    } else {
      const p = (time - 10.5) / 2.3;
      const ease = p * p * (3 - 2 * p);
      sunX = cx - w * (0.05 + ease * 0.27);
      sunY = cy;
      moonX = cx + w * (0.05 + ease * 0.27);
      moonY = cy;
      isMoonInFront = false;
    }

    return { sun: { x: sunX, y: sunY, r: sunR }, moon: { x: moonX, y: moonY, r: moonR }, isMoonInFront, alignmentRatio };
  }

  loop(currentTimeMs) {
    const dt = Math.min(0.1, (currentTimeMs - this.lastTime) * 0.001);
    this.lastTime = currentTimeMs;
    const timeSec = currentTimeMs * 0.001;

    // 1. Audio metrics
    this.audio.updateMetrics();
    const energy = this.audio.energy;

    // 2. Interactive Celestial Gravity pull
    const targetGravX = this.mouse.normX * (this.width * 0.04);
    const targetGravY = this.mouse.normY * (this.height * 0.04);
    this.gravityOffset.x += (targetGravX - this.gravityOffset.x) * 0.08;
    this.gravityOffset.y += (targetGravY - this.gravityOffset.y) * 0.08;

    // 3. Timeline progression
    let t = this.audio.isPlaying
      ? this.audio.getCurrentTime()
      : (this.standaloneTime = (this.standaloneTime + dt) % TREND_CONFIG.audio.loopEnd);

    // Update progress hairline
    const progress = Math.max(0, Math.min(1, t / TREND_CONFIG.audio.loopEnd));
    this.hairlineFill.style.width = `${progress * 100}%`;

    // 4. Subtitle detection & Stardust dissolve
    let currentSub = '';
    for (let i = 0; i < TREND_CONFIG.subtitles.length; i++) {
      const s = TREND_CONFIG.subtitles[i];
      if (t >= s.start && t <= s.end) {
        currentSub = s.text;
        break;
      }
    }

    if (this.lastSubtitle && !currentSub) {
      // Subtitle just finished: dissolve into stardust particles!
      this.cosmos.addDialogueDissolve(this.lastSubtitle, this.width * 0.5, this.height * 0.88);
    }
    this.lastSubtitle = currentSub;
    this.subText.textContent = currentSub;

    // 5. Update particle systems
    this.cosmos.update(dt);

    // 6. Clear canvas to PURE BLACK (#000000)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Render stars and cross stars
    this.cosmos.render(this.ctx, this.width, this.height, timeSec);

    // Background code lines from viral video
    this.renderer.renderCodeLines(this.ctx, timeSec);

    // 7. Celestial movement
    const choreo = this.getChoreography(t);
    const sunPos = choreo.sun;
    const moonPos = choreo.moon;

    // Trigger eclipse shockwave at climax
    if (choreo.alignmentRatio > 0.6 && !this.burstTriggered) {
      this.cosmos.triggerEclipseBurst(sunPos.x, sunPos.y, sunPos.r);
      this.burstTriggered = true;
    } else if (choreo.alignmentRatio < 0.2) {
      this.burstTriggered = false;
    }

    this.renderer.sunRotation += dt * 0.45;
    this.renderer.moonRotation += dt * 0.3;

    // Light vector from Moon to Sun
    const dx = sunPos.x - moonPos.x;
    const dy = sunPos.y - moonPos.y;
    const len = Math.hypot(dx, dy) || 1;
    const lightVec = { x: dx / len, y: dy / len, z: 0.35 };

    const tilt = { x: this.mouse.normX * 0.35, y: this.mouse.normY * 0.35 };

    const drawSun = () => {
      if (this.renderer.mode === 0) {
        this.renderer.renderAsciiSphere(
          this.ctx, sunPos.x, sunPos.y, sunPos.r, 'sun',
          this.renderer.sunRotation, energy, lightVec, tilt
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
          this.renderer.moonRotation, energy, lightVec, tilt
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
      // Render Diamond Ring Eclipse God-Rays bursting behind the Moon!
      this.renderer.renderDiamondRingEclipse(this.ctx, sunPos, moonPos, choreo.alignmentRatio, energy);
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
