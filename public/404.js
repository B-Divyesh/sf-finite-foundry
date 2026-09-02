const button = document.querySelector('[data-sound]');
let muted = false;
try { muted = localStorage.getItem('finite-foundry:mute') === 'true'; } catch { /* Keep the default. */ }

function update() {
  if (!button) return;
  button.textContent = muted ? 'Turn sound on' : 'Turn sound off';
  button.setAttribute('aria-pressed', String(muted));
}

button?.addEventListener('click', () => {
  muted = !muted;
  try { localStorage.setItem('finite-foundry:mute', String(muted)); } catch { /* The control still works for this page view. */ }
  update();
});

update();
