/* The contact bar stays out of the way while either full contact block is visible. */
(() => {
  'use strict';
  const bar = document.querySelector('.mobile-contact-bar');
  const firstContact = document.getElementById('pierwszy-kontakt');
  const lastContact = document.getElementById('ostatni-kontakt');
  const narrowScreen = window.matchMedia('(max-width: 760px)');
  if (!bar || !firstContact || !lastContact) return;

  let pendingFrame = false;
  const updateContactBar = () => {
    pendingFrame = false;
    const first = firstContact.getBoundingClientRect();
    const last = lastContact.getBoundingClientRect();
    const firstPassed = first.bottom < 0;
    const beforeFinalContact = last.top >= window.innerHeight;
    bar.hidden = !narrowScreen.matches || !firstPassed || !beforeFinalContact;
  };
  const scheduleUpdate = () => {
    if (!pendingFrame) {
      pendingFrame = true;
      window.requestAnimationFrame(updateContactBar);
    }
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('pageshow', updateContactBar);
  updateContactBar();
})();


/* If the mobile <source> cannot be decoded or loaded in Safari, fall back to
   the original full-resolution portrait rather than leaving an empty frame. */
(() => {
  const picture = document.querySelector('.hero-portrait picture');
  const img = picture?.querySelector('img');
  if (!picture || !img) return;
  let triedFallback = false;
  const useFallback = () => {
    if (triedFallback) return;
    triedFallback = true;
    picture.querySelectorAll('source').forEach((source) => source.remove());
    img.src = './assets/lukasz-basket.webp';
  };
  img.addEventListener('error', useFallback, { once: true });
  if (img.complete && img.naturalWidth === 0) useFallback();
})();
