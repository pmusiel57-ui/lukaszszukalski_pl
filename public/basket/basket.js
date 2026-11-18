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
