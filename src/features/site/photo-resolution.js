/** Metadata travels with dynamic map/gallery images as well as server-rendered photos. */
export function applyPhotoMetadata(image, info) {
  if (info?.srcset) image.srcset = info.srcset;
  else image.removeAttribute('srcset');
  for (const [key, value] of Object.entries({
    photoKey: info?.key,
    photoKind: info?.kind,
    photoFit: info?.fit,
    photoWidth: info?.width,
    photoHeight: info?.height,
  })) {
    if (value === undefined) delete image.dataset[key];
    else image.dataset[key] = String(value);
  }
  for (const dimension of ['width', 'height']) {
    if (info) image.style.setProperty(`--photo-${dimension}`, `${info[dimension]}px`);
    else image.style.removeProperty(`--photo-${dimension}`);
  }
}

/** One observer, batched work, and no per-frame polling; every resource belongs to the page. */
export function initPhotoResolution(c) {
  const images = new Set();
  const pending = new Set();
  let scheduled = false;
  function queue(image) {
    pending.add(image);
    if (scheduled) return;
    scheduled = true;
    c.raf(() => {
      scheduled = false;
      for (const image of pending) {
        if (!image.isConnected || !image.clientWidth || !image.clientHeight) continue;
        const mobile = innerWidth <= 620 && image.dataset.photoMobileWidth;
        const width = Number(mobile ? image.dataset.photoMobileWidth : image.dataset.photoWidth);
        const height = Number(mobile ? image.dataset.photoMobileHeight : image.dataset.photoHeight);
        if (!width || !height) continue;
        const fit = getComputedStyle(image).objectFit;
        const scale = fit === 'contain' || fit === 'scale-down' ? Math.min : Math.max;
        const slot = scale(image.clientWidth, (image.clientHeight * width) / height);
        image.dataset.photoLimited = String(slot * devicePixelRatio * 1.08 > width);
        // The hero owns art-directed sources and preload sizes; keep that contract intact.
        const hero = image.closest('.hero-image');
        if (hero) {
          const density = Number(getComputedStyle(image).getPropertyValue('--photo-density')) || 1;
          image.dataset.photoFramed = String(
            width / density < hero.clientWidth * 0.985 ||
              height / density < hero.clientHeight * 0.985,
          );
          continue;
        }
        if (!image.srcset) continue;
        const sizes = `${Math.ceil(slot * (image.dataset.photoLimited === 'true' ? 1 : 1.08))}px`;
        if (image.sizes !== sizes) image.sizes = sizes;
      }
      pending.clear();
    });
  }
  const resize = new ResizeObserver((entries) => entries.forEach((entry) => queue(entry.target)));
  function visit(node, remove = false) {
    if (!(node instanceof Element)) return;
    const found = [...node.querySelectorAll('img[data-photo-width]')];
    if (node.matches('img[data-photo-width]')) found.push(node);
    for (const image of found) {
      if (remove) {
        resize.unobserve(image);
        images.delete(image);
        pending.delete(image);
      } else {
        if (!images.has(image)) {
          images.add(image);
          resize.observe(image);
        }
        queue(image);
      }
    }
  }
  visit(document.documentElement);
  const changes = new MutationObserver((records) => {
    for (const record of records) {
      if (record.type === 'attributes') visit(record.target);
      else {
        record.removedNodes.forEach((node) => visit(node, true));
        record.addedNodes.forEach((node) => visit(node));
      }
    }
  });
  changes.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['data-photo-width', 'data-photo-height', 'data-photo-fit', 'srcset'],
  });
  c.listen(window, 'resize', () => images.forEach(queue), { passive: true });
  c.cleanups.push(() => {
    resize.disconnect();
    changes.disconnect();
    images.clear();
    pending.clear();
  });
}
