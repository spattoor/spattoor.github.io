(() => {
  'use strict';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const button = document.querySelector('#motion-toggle');
  let manuallyPaused = false;

  function updateMotion() {
    const paused = reducedMotion.matches || manuallyPaused;
    document.documentElement.classList.toggle('motion-paused', paused);
    if (!button) return;
    button.hidden = false;
    button.disabled = reducedMotion.matches;
    button.setAttribute('aria-pressed', String(paused));
    button.textContent = reducedMotion.matches
      ? 'Reduced motion enabled'
      : manuallyPaused ? 'Resume animations' : 'Pause animations';
  }
  button?.addEventListener('click', () => {
    manuallyPaused = !manuallyPaused;
    updateMotion();
  });
  reducedMotion.addEventListener('change', updateMotion);
  updateMotion();

  const progress = document.querySelector('.scroll-progress');
  if (!progress) return;
  let pending = false;
  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
    pending = false;
  }
  function scheduleProgress() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(updateProgress);
  }
  window.addEventListener('scroll', scheduleProgress, { passive: true });
  window.addEventListener('resize', scheduleProgress);
  window.addEventListener('load', scheduleProgress, { once: true });
  document.querySelectorAll('details').forEach(details => {
    details.addEventListener('toggle', scheduleProgress);
  });
  updateProgress();
})();
