/* ════════════════════════════════════════════════
   WEDDING INVITATION · script.js
   Nancy & Khaled · October 11 2026
   ════════════════════════════════════════════════ */

'use strict';

/* ── STATE ────────────────────────────────────────── */
let currentLang  = 'en';
let gifLoaded    = false;
let loadProgress = 0;
let doorPlayed   = false;

/* ── DOM REFS ─────────────────────────────────────── */
const pageLoading  = document.getElementById('page-loading');
const pageDoor     = document.getElementById('page-door');
const pageDetails  = document.getElementById('page-details');
const loadingBar   = document.getElementById('loading-bar');
const doorGif      = document.getElementById('door-gif');
const doorOverlay  = document.getElementById('door-overlay');
const doorGlowRing = document.getElementById('door-glow-ring');
const knockBtn     = document.getElementById('knock-btn');
const langBtnDoor  = document.getElementById('lang-btn-door');
const langBtnDet   = document.getElementById('lang-btn-details');
const music1       = document.getElementById('music1');
const music2       = document.getElementById('music2');
const rsvpForm     = document.getElementById('rsvp-form');
const rsvpSuccess  = document.getElementById('rsvp-success');
const particles    = document.getElementById('particles');
const petalsWrap   = document.getElementById('petals');

/* ════════════════════════════════════════════════
   PARTICLES (loading screen)
   ════════════════════════════════════════════════ */
function spawnParticles () {
  for (let i = 0; i < 22; i++) {
    const p   = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 12 + 8}s;
      animation-delay:${Math.random() * 10}s;
    `;
    particles.appendChild(p);
  }
}

/* ════════════════════════════════════════════════
   PETALS (details page)
   ════════════════════════════════════════════════ */
function spawnPetals () {
  petalsWrap.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const p   = document.createElement('div');
    p.className = 'petal';
    const size = Math.random() * 8 + 4;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random() * 100}%;
      animation-duration:${Math.random() * 18 + 12}s;
      animation-delay:${Math.random() * 14}s;
    `;
    petalsWrap.appendChild(p);
  }
}

/* ════════════════════════════════════════════════
   LOADING SCREEN LOGIC
   ════════════════════════════════════════════════ */
function animateBar (target, duration) {
  const start = performance.now();
  const from  = loadProgress;

  function step (now) {
    const t = Math.min((now - start) / duration, 1);
    loadProgress = from + (target - from) * easeInOut(t);
    loadingBar.style.width = loadProgress + '%';
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function easeInOut (t) {
  return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/* Preload GIF */
function preloadGif () {
  return new Promise(resolve => {
    // Animate bar to 70% while gif loads
    animateBar(70, 1800);

    const img = new Image();
    img.onload = () => {
      gifLoaded = true;
      resolve();
    };
    img.onerror = resolve; // continue even on error
    img.src = doorGif.src;

    // Fallback: proceed after 4s regardless
    setTimeout(resolve, 4000);
  });
}

async function runLoadingScreen () {
  // Simulate initial progress
  animateBar(30, 800);
  spawnParticles();

  // Wait minimum display time + gif load
  await Promise.all([
    preloadGif(),
    new Promise(r => setTimeout(r, 2200))
  ]);

  // Complete bar
  animateBar(100, 500);
  await new Promise(r => setTimeout(r, 600));

  // Transition to door
  transitionToPage(pageLoading, pageDoor);
}

/* ════════════════════════════════════════════════
   PAGE TRANSITIONS
   ════════════════════════════════════════════════ */
function transitionToPage (fromPage, toPage, cb) {
  fromPage.classList.add('fade-out');
  setTimeout(() => {
    fromPage.classList.remove('active', 'fade-out');
    toPage.classList.add('active');
    if (cb) cb();
  }, 900);
}

/* ════════════════════════════════════════════════
   DOOR SCENE
   ════════════════════════════════════════════════ */
/* Freeze GIF on load by replacing src with still frame trick:
   We clone the src and only "restart" on click */
function freezeGif () {
  // Draw first frame to canvas then show canvas, hide img
  // Simpler: keep img but set src to empty then reassign on knock
  const originalSrc = doorGif.src;

  // Create a canvas snapshot of first frame
  const canvas  = document.createElement('canvas');
  const ctx     = canvas.getContext('2d');
  canvas.className = 'door-gif';
  canvas.id = 'door-canvas';

  const tmp = new Image();
  tmp.crossOrigin = 'anonymous';
  tmp.onload = () => {
    canvas.width  = tmp.naturalWidth  || 480;
    canvas.height = tmp.naturalHeight || 854;
    ctx.drawImage(tmp, 0, 0);
    doorGif.parentNode.insertBefore(canvas, doorGif);
    doorGif.style.display = 'none';
    canvas.style.cssText = doorGif.style.cssText;
    canvas.style.display = 'block';
  };
  tmp.onerror = () => {
    // fallback: just show gif normally paused-looking
  };
  tmp.src = originalSrc + '?' + Date.now(); // force fresh load for canvas

  return { originalSrc };
}

function playDoor (originalSrc) {
  if (doorPlayed) return;
  doorPlayed = true;

  // Remove canvas, show animated gif
  const canvas = document.getElementById('door-canvas');
  if (canvas) canvas.remove();

  doorGif.style.display = 'block';
  // Force restart GIF by reloading src
  doorGif.src = '';
  setTimeout(() => { doorGif.src = originalSrc; }, 50);

  // Glow effects
  doorGlowRing.classList.add('active');
  doorOverlay.style.opacity = '0.05';

  // Music 1
  tryPlayAudio(music1);

  // Knock animation on button
  knockBtn.style.animation = 'none';
  knockBtn.style.opacity   = '0.5';
  knockBtn.style.pointerEvents = 'none';

  // After 8s → details page
  setTimeout(() => {
    transitionToPage(pageDoor, pageDetails, () => {
      fadeOutMusic(music1);
      setTimeout(() => tryPlayAudio(music2), 800);
      spawnPetals();
      animateDetailCards();
    });
  }, 8000);
}

/* ════════════════════════════════════════════════
   AUDIO HELPERS
   ════════════════════════════════════════════════ */
function tryPlayAudio (el) {
  if (!el.src && !el.querySelector('source')?.src) return; // no file attached
  el.volume = 0;
  el.play().catch(() => {});
  fadeInMusic(el);
}

function fadeInMusic (el, targetVol = 0.65, ms = 1500) {
  const step = targetVol / (ms / 50);
  const id = setInterval(() => {
    el.volume = Math.min(el.volume + step, targetVol);
    if (el.volume >= targetVol) clearInterval(id);
  }, 50);
}

function fadeOutMusic (el, ms = 1800) {
  const step = el.volume / (ms / 50);
  const id = setInterval(() => {
    el.volume = Math.max(el.volume - step, 0);
    if (el.volume <= 0) { el.pause(); clearInterval(id); }
  }, 50);
}

/* ════════════════════════════════════════════════
   DETAILS PAGE ANIMATIONS
   ════════════════════════════════════════════════ */
function animateDetailCards () {
  const cards = pageDetails.querySelectorAll('.detail-card');
  cards.forEach((c, i) => {
    c.style.animationDelay = (0.15 * i + 0.2) + 's';
    c.style.animationFillMode = 'both';
  });
}

/* ════════════════════════════════════════════════
   LANGUAGE TOGGLE
   ════════════════════════════════════════════════ */
function toggleLanguage () {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  const html = document.documentElement;
  html.setAttribute('lang', currentLang);
  html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');

  // Update input placeholders
  document.querySelectorAll('[data-ar-placeholder]').forEach(el => {
    el.placeholder = currentLang === 'ar'
      ? el.dataset.arPlaceholder
      : el.dataset.arPlaceholder.replace(/[\u0600-\u06FF\s]+/, '') || 'Your name...';
  });

  // Friendly placeholder fallbacks
  const nameInput = document.getElementById('rsvp-name');
  const msgInput  = document.getElementById('rsvp-msg');
  if (nameInput) nameInput.placeholder = currentLang === 'ar' ? 'اسمك...' : 'Your name...';
  if (msgInput)  msgInput.placeholder  = currentLang === 'ar' ? 'أمنياتك الطيبة...' : 'Your warm wishes...';
}

/* ════════════════════════════════════════════════
   RSVP FORM
   ════════════════════════════════════════════════ */
function handleRSVP (e) {
  e.preventDefault();
  const name   = document.getElementById('rsvp-name').value.trim();
  const attend = document.querySelector('input[name="attend"]:checked');
  const msg    = document.getElementById('rsvp-msg').value.trim();

  if (!name || !attend) return;

  // Log (in a real app, send to server)
  console.log('RSVP:', { name, attend: attend.value, msg });

  // Show success
  rsvpForm.classList.add('hidden');
  rsvpSuccess.classList.remove('hidden');
}

/* ════════════════════════════════════════════════
   EVENT LISTENERS
   ════════════════════════════════════════════════ */
let gifOriginalSrc;

knockBtn.addEventListener('click', () => {
  playDoor(gifOriginalSrc);
});

langBtnDoor.addEventListener('click', toggleLanguage);
langBtnDet.addEventListener('click', toggleLanguage);

rsvpForm.addEventListener('submit', handleRSVP);

/* ════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  // Show loading page
  pageLoading.classList.add('active');

  // Store gif src before freeze
  gifOriginalSrc = doorGif.src;

  // Freeze gif until knock
  freezeGif();

  // Run loading screen
  await runLoadingScreen();
});

/* Unlock audio on any user interaction (iOS / mobile) */
document.addEventListener('touchstart', () => {
  [music1, music2].forEach(m => {
    if (m.paused) {
      m.volume = 0;
      m.play().then(() => m.pause()).catch(() => {});
    }
  });
}, { once: true });
