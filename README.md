# Cinematic Sun & Moon — Endure

A poetic, cinematic interactive web animation and audio visualizer inspired by the viral Sun and Moon trend set to **"Endure"** by **Fabio Adelino de Morais**.

---

## ✦ Overview

The experience translates the emotional dialogue and sonic intensity of the viral trend into an interactive celestial dance between two bodies: the radiant **Sun** (warm amber, gold, solar prominences) and the serene **Moon** (silver-blue, lunar craters, directional shading).

### Key Features
1. **Dual Visual Engines (Toggle with `S` or Header Button)**:
   - **Viral ASCII Code Mode**: A faithful realization of the viral creative-coding trend. 3D ray-projected spherical coordinates rendered with typography (`@`, `#`, `*`, `+`, `~`, `SUN`, `MOON`, `ENDURE`), floating shader equations (`clamp_stars(...)`, `vec2 uv`), and sparkling diamond cross-stars (`✦`).
   - **Cinematic Ethereal Mode**: High-fidelity volumetric plasma rendering with dynamic solar granulations, magnetic loops, multi-layer bloom, and shaded lunar crater topography.
   - **Hybrid Matrix**: A synthesis layering the atmospheric plasma core beneath shimmering ASCII character matrices.
2. **5-Stage Story Choreography**:
   - **Stage I: Emergence** (0:00 – 0:11.8) — Dark cosmos, stars ignite, Sun and Moon awaken as the dialogue unfolds.
   - **Stage II: Yearning** (0:11.8 – 0:16.8) — Ambient string swell, slow camera push-in, subtle orbital drift.
   - **Stage III: Attraction** (0:16.8 – 0:52.5) — Beat drops, French vocals begin, celestial bodies gravitate towards each other, particle bridge ignites.
   - **Stage IV: Eclipse Waltz** (0:52.5 – 1:28.0) — Chorus climax, dramatic total solar-lunar alignment with radial diamond-ring corona burst, followed by a 3D orbital waltz around their shared barycenter.
   - **Stage V: Harmony** (1:28.0+) — Peaceful dual equilibrium in eternal orbital balance.
3. **Audio Reactivity & Web Audio API**:
   - Analyzes real-time frequency spectrum (bass, mids, highs).
   - Sun's corona and solar flares pulse to kick drums and bass swells.
   - Moon's rim glow and stardust respond to vocal frequencies.
4. **Interactive Controls & Parallax**:
   - Mouse & touch tilt parallax for 3D camera vantage.
   - Full timeline scrubber with live timecode.
   - Stage jumper buttons.
   - Custom soundtrack upload support (drag-and-drop or file selector for MP3, M4A, WAV, FLAC).
   - Keyboard shortcuts:
     - <kbd>Space</kbd> : Play / Pause
     - <kbd>S</kbd> : Cycle visual styles (Viral ASCII / Ethereal / Hybrid)
     - <kbd>M</kbd> : Mute / Unmute
     - <kbd>F</kbd> : Toggle Fullscreen
     - <kbd>&larr;</kbd> / <kbd>&rarr;</kbd> : Seek backward / forward 5s

---

## ✦ Project Structure

```
├── index.html        # Clean semantic HTML5 structure & UI console
├── style.css         # Glassmorphism styling, responsive typography & atmosphere
├── script.js         # Vanilla JavaScript: AudioEngine, Timeline, Particles, 3D Renderer
├── README.md         # Documentation & guide
└── public/
    └── assets/
        └── aistudio/ # Bundled audio soundtrack (Endure - Fabio Adelino de Morais)
```

---

## ✦ How to Run Locally

Because the project is built with standard HTML5, CSS3, and Vanilla JavaScript, it requires **no backend or build tools** to run:

1. **Directly via Browser**:
   Open `index.html` in any modern web browser (Chrome, Safari, Edge, Firefox).
2. **Via Local Static Server** (recommended for Web Audio API permissions):
   ```bash
   # Using Python 3:
   python3 -m http.server 3000

   # Or using Node:
   npx serve .
   ```
   Then navigate to `http://localhost:3000`.

---

## ✦ Credits & Inspiration
- Music: **"Endure"** by Fabio Adelino de Morais
- Visual Inspiration: The viral Sun and Moon celestial dialogue trend on TikTok & Reels.
