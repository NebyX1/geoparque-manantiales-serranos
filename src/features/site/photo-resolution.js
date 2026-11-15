/** Metadata travels with dynamic map/gallery images as well as server-rendered photos. */
export function applyPhotoMetadata(image, info) {
  for (const [key, value] of Object.entries({
    photoKey: info?.key,
    photoKind: info?.kind,
    photoFit: info && 'cover',
    photoProfile: info?.profile,
    photoWidth: info?.width,
    photoHeight: info?.height,
  })) {
    if (value === undefined) delete image.dataset[key];
    else image.dataset[key] = String(value);
  }
  if (info) {
    image.width = info.width;
    image.height = info.height;
    image.sizes = info.sizes;
    image.srcset = info.srcset;
    image.src = info.src;
  } else {
    for (const attribute of ['width', 'height', 'sizes', 'srcset']) {
      image.removeAttribute(attribute);
    }
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
        // The hero uses a different raster at mobile widths, with matching preloads.
        if (image.dataset.photoProfile === 'hero') continue;
        const width = Number(image.dataset.photoWidth);
        const height = Number(image.dataset.photoHeight);
        if (!width || !height) continue;
        const fit = getComputedStyle(image).objectFit;
        const scale = fit === 'contain' || fit === 'scale-down' ? Math.min : Math.max;
        const slot = scale(image.clientWidth, (image.clientHeight * width) / height);
        // The full ficha already declares the width needed for its crop in the HTML.
        if (!image.srcset || image.closest('.place-page .detail-hero')) continue;
        const sizes = `${Math.ceil(Math.min(width, slot * 1.04))}px`;
        if (image.sizes !== sizes) image.sizes = sizes;
      }
      pending.clear();
    });
  }
  const resize = new ResizeObserver((entries) => entries.forEach((entry) => queue(entry.target)));
  function visit(node, remove = false) {
    if (!(node instanceof Element)) return;
    const found = [...node.querySelectorAll('img[data-photo-width]')];
    if (node instanceof HTMLImageElement && (node.dataset.photoWidth || images.has(node))) {
      found.push(node);
    }
    for (const image of found) {
      if (remove || !image.dataset.photoWidth) {
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
    attributeFilter: ['data-photo-width', 'data-photo-height', 'srcset'],
  });
  c.listen(window, 'resize', () => images.forEach(queue), { passive: true });
  c.cleanups.push(() => {
    resize.disconnect();
    changes.disconnect();
    images.clear();
    pending.clear();
  });
}
