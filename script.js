/* ════════════════════════════════════════════════
   WEDDING INVITATION · script.js
   Nancy & Khaled · October 11 2026
   ════════════════════════════════════════════════ */

'use strict';

/* ── STATE ── */
let currentLang  = 'en';
let loadProgress = 0;
let doorPlayed   = false;

/* ── GIF SOURCE ─────────────────────────────────
   Stored here, NOT set on <img> until knock click.
   The GIF cannot play if src is empty.
   ─────────────────────────────────────────────── */
const GIF_SRC = 'image1.gif';

/* ── DOM REFS ── */
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

/* ════ PARTICLES ═════════════════════════════════ */
function spawnParticles () {
  for (let i = 0; i < 22; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';
    const size  = Math.random() * 6 + 2;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;animation-duration:${Math.random()*12+8}s;animation-delay:${Math.random()*10}s;`;
    particles.appendChild(p);
  }
}

/* ════ PETALS ════════════════════════════════════ */
function spawnPetals () {
  petalsWrap.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const p     = document.createElement('div');
    p.className = 'petal';
    const size  = Math.random() * 8 + 4;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;animation-duration:${Math.random()*18+12}s;animation-delay:${Math.random()*14}s;`;
    petalsWrap.appendChild(p);
  }
}

/* ════ LOADING BAR ═══════════════════════════════ */
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
function easeInOut (t) { return t < .5 ? 2*t*t : -1+(4-2*t)*t; }

/* ════ PRELOAD GIF IN BACKGROUND ════════════════
   Preload into memory so it starts instantly on
   knock, but never set doorGif.src until then.
   ════════════════════════════════════════════════ */
let gifPreloaded = false;
function preloadGif () {
  return new Promise(resolve => {
    animateBar(70, 1800);
    const img   = new Image();
    img.onload  = () => { gifPreloaded = true; resolve(); };
    img.onerror = () => resolve();
    img.src     = GIF_SRC;          // preload into browser cache only
    setTimeout(resolve, 4000);      // max 4 s wait
  });
}

/* ════ LOADING SCREEN ════════════════════════════ */
async function runLoadingScreen () {
  animateBar(30, 800);
  spawnParticles();
  await Promise.all([preloadGif(), new Promise(r => setTimeout(r, 2200))]);
  animateBar(100, 500);
  await new Promise(r => setTimeout(r, 600));
  transitionToPage(pageLoading, pageDoor);
}

/* ════ PAGE TRANSITIONS ══════════════════════════ */
function transitionToPage (fromPage, toPage, cb) {
  fromPage.classList.add('fade-out');
  setTimeout(() => {
    fromPage.classList.remove('active','fade-out');
    toPage.classList.add('active');
    if (cb) cb();
  }, 900);
}

/* ════ KNOCK → PLAY ══════════════════════════════ */
function playDoor () {
  if (doorPlayed) return;
  doorPlayed = true;

  /* NOW load the GIF — starts playing immediately from frame 1 */
  doorGif.src = GIF_SRC;
  /* Fade GIF layer over the static door image */
  document.querySelector(".door-bg-wrap").classList.add("revealed");

  /* Fade the dark overlay away */
  doorOverlay.style.opacity = '0';

  /* Gold glow ring */
  doorGlowRing.classList.add('active');

  /* Music */
  tryPlayAudio(music1);

  /* Hide button */
  knockBtn.style.opacity       = '0';
  knockBtn.style.pointerEvents = 'none';
  knockBtn.style.transform     = 'scale(0.8)';

  /* Go to details after 8 s */
  setTimeout(() => {
    transitionToPage(pageDoor, pageDetails, () => {
      fadeOutMusic(music1);
      setTimeout(() => tryPlayAudio(music2), 800);
      spawnPetals();
      animateDetailCards();
    });
  }, 8000);
}

/* ════ AUDIO ═════════════════════════════════════ */
function tryPlayAudio (el) {
  const src = el.querySelector('source')?.src || el.src || '';
  if (!src || src === window.location.href || src.endsWith('/')) return;
  el.volume = 0;
  el.play().catch(() => {});
  fadeInMusic(el);
}
function fadeInMusic (el, vol = 0.65, ms = 1500) {
  const step = vol / (ms / 50);
  const id   = setInterval(() => {
    el.volume = Math.min(el.volume + step, vol);
    if (el.volume >= vol) clearInterval(id);
  }, 50);
}
function fadeOutMusic (el, ms = 1800) {
  const step = el.volume / (ms / 50);
  const id   = setInterval(() => {
    el.volume = Math.max(el.volume - step, 0);
    if (el.volume <= 0) { el.pause(); clearInterval(id); }
  }, 50);
}

/* ════ DETAILS ANIMATIONS ════════════════════════ */
function animateDetailCards () {
  pageDetails.querySelectorAll('.detail-card').forEach((c, i) => {
    c.style.animationDelay    = (0.15 * i + 0.2) + 's';
    c.style.animationFillMode = 'both';
  });
}

/* ════ LANGUAGE ══════════════════════════════════ */
function toggleLanguage () {
  currentLang = currentLang === 'en' ? 'ar' : 'en';
  const html  = document.documentElement;
  html.setAttribute('lang', currentLang);
  html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  const nameEl = document.getElementById('rsvp-name');
  const msgEl  = document.getElementById('rsvp-msg');
  if (nameEl) nameEl.placeholder = currentLang === 'ar' ? 'اسمك...'           : 'Your name...';
  if (msgEl)  msgEl.placeholder  = currentLang === 'ar' ? 'أمنياتك الطيبة...' : 'Your warm wishes...';
}

/* ════ RSVP ══════════════════════════════════════ */
function handleRSVP (e) {
  e.preventDefault();
  const name   = document.getElementById('rsvp-name').value.trim();
  const attend = document.querySelector('input[name="attend"]:checked');
  if (!name || !attend) return;
  rsvpForm.classList.add('hidden');
  rsvpSuccess.classList.remove('hidden');
}

/* ════ EVENTS ════════════════════════════════════ */
knockBtn.addEventListener('click', playDoor);
langBtnDoor.addEventListener('click', toggleLanguage);
langBtnDet.addEventListener('click', toggleLanguage);
rsvpForm.addEventListener('submit', handleRSVP);

document.addEventListener('touchstart', () => {
  [music1, music2].forEach(m => {
    m.volume = 0; m.play().then(() => m.pause()).catch(() => {});
  });
}, { once: true });

/* ════ INIT ══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  pageLoading.classList.add('active');
  /* GIF has NO src yet — guaranteed frozen */
  doorGif.removeAttribute('src');
  await runLoadingScreen();
});
