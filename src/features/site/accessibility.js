const textSizeKey = 'manantiales-serranos:tamano-texto:v1';
const sizes = [100, 125, 150, 175, 200];
let textSize = 100;

export function initAccessibility(c) {
  const dialog = document.getElementById('accessibility-dialog');
  if (!dialog) return;
  try {
    textSize = Number(localStorage.getItem(textSizeKey) ?? 100);
  } catch {
    // The preference remains available in the current page session.
  }
  const root = document.documentElement;
  const status = dialog.querySelector('#text-size-status strong');
  const increase = dialog.querySelector('[data-text-size-step="1"]');
  const decrease = dialog.querySelector('[data-text-size-step="-1"]');
  const close = dialog.querySelector('.accessibility-close');
  let opener;

  function apply(value) {
    textSize = sizes.includes(value) ? value : 100;
    if (textSize === 100) delete root.dataset.textSize;
    else root.dataset.textSize = String(textSize);
    status.textContent = `${textSize} %`;
    increase.setAttribute('aria-disabled', String(textSize === 200));
    decrease.setAttribute('aria-disabled', String(textSize === 100));
    c.raf(() => c.configureGeoMotion());
  }

  function choose(value) {
    if (value === undefined || value === textSize) return;
    apply(value);
    try {
      if (textSize === 100) localStorage.removeItem(textSizeKey);
      else localStorage.setItem(textSizeKey, String(textSize));
    } catch {
      // The current document still uses the selected size.
    }
  }

  apply(textSize);
  for (const trigger of document.querySelectorAll('[data-accessibility-open]')) {
    trigger.hidden = false;
    c.listen(trigger, 'click', () => {
      opener = trigger;
      dialog.showModal();
      (textSize < 200 ? increase : close).focus();
    });
  }
  c.listen(decrease, 'click', () => choose(sizes[sizes.indexOf(textSize) - 1]));
  c.listen(increase, 'click', () => choose(sizes[sizes.indexOf(textSize) + 1]));
  c.listen(dialog.querySelector('[data-text-size-reset]'), 'click', () => choose(100));
  c.listen(dialog, 'close', () => {
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  c.listen(window, 'storage', (event) => {
    if (event.storageArea === localStorage && (event.key === textSizeKey || event.key === null))
      apply(Number(event.newValue));
  });
}
