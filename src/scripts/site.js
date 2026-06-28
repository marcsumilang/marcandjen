const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav?.classList.toggle('scrolled', window.scrollY > 40);
});

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  const open = navLinks?.classList.toggle('open') ?? false;
  navToggle.setAttribute('aria-expanded', String(open));
});
navLinks?.querySelectorAll('a').forEach((anchor) => anchor.addEventListener('click', () => {
  navLinks.classList.remove('open');
  navToggle?.setAttribute('aria-expanded', 'false');
}));

const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.15 });
revealEls.forEach((el) => revealObserver.observe(el));

const weddingDate = new Date('2026-08-14T15:00:00+08:00').getTime();
function tick() {
  const diff = Math.max(0, weddingDate - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);
  const pad = (value) => String(value).padStart(2, '0');
  document.getElementById('cd-days').textContent = pad(days);
  document.getElementById('cd-hours').textContent = pad(hours);
  document.getElementById('cd-mins').textContent = pad(mins);
  document.getElementById('cd-secs').textContent = pad(secs);
}
tick();
setInterval(tick, 1000);

const audio = document.getElementById('wedding-audio');
const musicToggle = document.getElementById('music-toggle');
const musicControl = document.getElementById('music-control');
const musicVolume = document.getElementById('music-volume');
const savedVolume = Number(localStorage.getItem('weddingMusicVolume'));
let musicAttempted = false;

function setMusicVolume(value) {
  if (!audio || !musicVolume) return;
  const volume = Math.min(100, Math.max(0, Number(value))) / 100;
  audio.volume = volume;
  musicVolume.value = String(Math.round(volume * 100));
  localStorage.setItem('weddingMusicVolume', musicVolume.value);
}

function syncMusicButton() {
  if (!audio || !musicToggle) return;
  const isPlaying = !audio.paused;
  musicToggle.classList.toggle('is-playing', isPlaying);
  musicToggle.setAttribute('aria-pressed', String(isPlaying));
  musicToggle.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
  musicToggle.querySelector('.music-icon').textContent = isPlaying ? 'Pause' : 'Play';
}

async function playMusicOnce() {
  if (!audio || musicAttempted) return;
  musicAttempted = true;
  try {
    await audio.play();
  } catch {
    musicAttempted = false;
  } finally {
    syncMusicButton();
  }
}

setMusicVolume(Number.isFinite(savedVolume) ? savedVolume : musicVolume?.value ?? 70);

window.addEventListener('scroll', playMusicOnce, { once: true, passive: true });
document.addEventListener('click', playMusicOnce, { once: true });
musicControl?.addEventListener('click', (event) => event.stopPropagation());
musicVolume?.addEventListener('input', (event) => {
  setMusicVolume(event.target.value);
});
musicToggle?.addEventListener('click', async (event) => {
  event.stopPropagation();
  if (!audio) return;
  if (audio.paused) {
    musicAttempted = true;
    await audio.play().catch(() => {});
  } else {
    audio.pause();
  }
  syncMusicButton();
});
audio?.addEventListener('play', syncMusicButton);
audio?.addEventListener('pause', syncMusicButton);
syncMusicButton();

const storyGrid = document.querySelector('.story-grid');
const galleryButtons = document.querySelectorAll('.gallery-option');
galleryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const layout = button.dataset.galleryLayout;
    storyGrid?.setAttribute('data-layout', layout);
    galleryButtons.forEach((option) => {
      const active = option === button;
      option.classList.toggle('active', active);
      option.setAttribute('aria-pressed', String(active));
    });
  });
});

const storyImages = Array.from(document.querySelectorAll('.story-grid .photo-frame img'));
let lightboxIndex = 0;
storyImages.forEach((img, index) => {
  const frame = img.closest('.photo-frame');
  frame.setAttribute('tabindex', '0');
  frame.setAttribute('role', 'button');
  frame.setAttribute('aria-label', `View photo ${index + 1}`);
  frame.addEventListener('click', () => openLightbox(index));
  frame.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openLightbox(index);
    }
  });
});

const lightbox = document.getElementById('image-lightbox');
const lightboxImage = document.getElementById('lightbox-image');

function openLightbox(index) {
  lightboxIndex = index;
  updateLightbox();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
  document.getElementById('lightbox-close').focus();
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function updateLightbox() {
  const source = storyImages[lightboxIndex];
  lightboxImage.src = source.src;
  lightboxImage.alt = source.alt || `Marc and Jen photo ${lightboxIndex + 1}`;
}

function moveLightbox(step) {
  lightboxIndex = (lightboxIndex + step + storyImages.length) % storyImages.length;
  updateLightbox();
}

document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev')?.addEventListener('click', () => moveLightbox(-1));
document.getElementById('lightbox-next')?.addEventListener('click', () => moveLightbox(1));
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (event) => {
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'Escape') closeLightbox();
  if (event.key === 'ArrowLeft') moveLightbox(-1);
  if (event.key === 'ArrowRight') moveLightbox(1);
});
