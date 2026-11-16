type Gesture = { duration: number; tilt: number; nod: number; blink: number[]; smile?: number };
type AvatarState = 'ready' | 'thinking' | 'answering';

const gestures: Gesture[] = [
  { duration: 650, tilt: 0, nod: 0, blink: [0.42] },
  { duration: 900, tilt: 0, nod: 0, blink: [0.3, 0.56] },
  { duration: 1600, tilt: -1.6, nod: 1, blink: [0.35] },
  { duration: 1500, tilt: 1.35, nod: -1.2, blink: [0.7] },
  { duration: 1100, tilt: 0.35, nod: 5, blink: [0.43] },
  { duration: 1650, tilt: -0.4, nod: -1.5, blink: [], smile: 1.8 },
  { duration: 1700, tilt: 0.6, nod: -2.2, blink: [0.8], smile: 1 },
];

type Band = {
  left: number;
  width: number;
  top: number;
  center: number;
  slope: number;
  height: number;
};
// Coordinates on the unretouched 512 × 512 Gianna portrait.
const leftEye: Band = { left: 176, width: 65, top: 157, center: 183, slope: -5, height: 54 };
const rightEye: Band = { left: 259, width: 73, top: 144, center: 173, slope: -8, height: 51 };
const lips = { left: 224, right: 295, top: 236, bottom: 293 };

function warpBand(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  band: Band,
  amount: number,
) {
  if (Math.abs(amount) < 0.4) return;
  const { left, width, top, center, height, slope } = band;
  const bottom = top + height;
  for (let x = 0; x < width; x += 2) {
    const across = (x + 1) / width;
    const weight = Math.sin(across * Math.PI) ** 1.3;
    const position = left + x;
    const axis = center + (across - 0.5) * slope;
    const upper = axis - 9;
    const lower = axis + 9;
    const shift = amount * weight;
    const newUpper = upper - shift;
    const newLower = lower + shift;
    ctx.drawImage(image, position, top, 2, upper - top, position, top, 2, newUpper - top);
    ctx.drawImage(
      image,
      position,
      upper,
      2,
      lower - upper,
      position,
      newUpper,
      2,
      Math.max(0.2, newLower - newUpper),
    );
    ctx.drawImage(
      image,
      position,
      lower,
      2,
      bottom - lower,
      position,
      newLower,
      2,
      bottom - newLower,
    );
  }
}

function lipSeam(progress: number) {
  // Vertical cubic Bézier fitted to the seam and corners of the portrait.
  const rest = 1 - progress;
  return (
    258 * rest ** 3 +
    262 * 3 * rest ** 2 * progress +
    266 * 3 * rest * progress ** 2 +
    246 * progress ** 3
  );
}

function warpLips(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  opening: number,
  smile: number,
) {
  if (opening < 0.4 && smile < 0.4) return;
  const { left, right, top, bottom } = lips;
  const aperture = new Path2D();
  const lowerEdge: { x: number; y: number }[] = [];
  aperture.moveTo(left, lipSeam(0));
  for (let x = left; x < right; x++) {
    const center = x + 0.5;
    const progress = (center - left) / (right - left);
    const seam = lipSeam(progress);
    const weight = Math.sin(progress * Math.PI) ** 1.5;
    const lift = smile * weight * Math.abs(2 * progress - 1) * 2.3;
    const upper = seam - lift - opening * weight * 0.34;
    const lower = seam - lift + opening * weight;
    ctx.drawImage(image, x, top, 1, seam - top, x, top, 1, upper - top);
    ctx.drawImage(image, x, seam, 1, bottom - seam, x, lower, 1, bottom - lower);
    aperture.lineTo(center, upper);
    lowerEdge.push({ x: center, y: lower });
  }
  if (opening < 0.4) return;

  aperture.lineTo(right, lipSeam(1));
  for (const point of lowerEdge.reverse()) aperture.lineTo(point.x, point.y);
  aperture.closePath();
  const shading = ctx.createLinearGradient(0, 249, 0, 272);
  shading.addColorStop(0, '#56302b');
  shading.addColorStop(0.42, '#311817');
  shading.addColorStop(0.78, '#482322');
  shading.addColorStop(1, '#92534f');
  ctx.fillStyle = shading;
  ctx.fill(aperture);
}

export function createAvatar(container: HTMLElement) {
  const image = container.querySelector<HTMLImageElement>('[data-serrana-image]')!;
  const canvas = container.querySelector('canvas')!;
  const stage = container.querySelector<HTMLElement>('.serrana-portrait')!;
  const label = container.querySelector<HTMLElement>('[data-serrana-avatar-label]')!;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let ctx: CanvasRenderingContext2D | null = null;
  let timer = 0;
  let frame = 0;
  let active = false;
  let gestureIndex = -1;
  let speaksUntil = 0;
  let phonemes = '';
  let speechStartedAt = 0;

  function resetFace() {
    canvas.hidden = true;
    stage.style.removeProperty('transform');
  }

  function stopMotion() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    speaksUntil = 0;
    resetFace();
  }

  function canMove() {
    return active && !media.matches && !document.hidden && image.complete && image.naturalWidth > 0;
  }

  function draw(tilt: number, nod: number, blink: number, mouth: number, smile = 0) {
    ctx ??= canvas.getContext('2d', { alpha: false });
    if (!ctx) return;
    ctx.drawImage(image, 0, 0, 512, 512);
    warpBand(ctx, image, leftEye, -8.65 * blink);
    warpBand(ctx, image, rightEye, -8.65 * blink);
    warpLips(ctx, image, mouth, smile);
    const zoom = 1 + Math.abs(tilt) * 0.006 + Math.abs(nod) * 0.0006;
    stage.style.transform = `translateY(${nod}px) rotate(${tilt}deg) scale(${zoom})`;
    canvas.hidden = false;
  }

  function idle() {
    stopMotion();
    if (!canMove()) return;
    timer = window.setTimeout(
      () => {
        const offset = 1 + Math.floor(Math.random() * (gestures.length - 1));
        gestureIndex = (gestureIndex + offset) % gestures.length;
        const gesture = gestures[gestureIndex]!;
        const start = performance.now();
        let previous = 0;
        const tick = (time: number) => {
          if (!canMove()) return resetFace();
          const progress = (time - start) / gesture.duration;
          if (progress >= 1) return idle();
          frame = requestAnimationFrame(tick);
          if (time - previous < 30) return;
          previous = time;
          const weight = Math.sin(progress * Math.PI);
          const blink = Math.max(
            0,
            ...gesture.blink.map((point) => 1 - Math.abs(progress - point) * 10),
          );
          draw(
            gesture.tilt * weight,
            gesture.nod * weight,
            blink,
            0,
            (gesture.smile ?? 0) * weight,
          );
        };
        frame = requestAnimationFrame(tick);
      },
      1250 + Math.random() * 2500,
    );
  }

  function talk(text: string) {
    if (!canMove() || !text.trim()) return;
    stopMotion();
    phonemes = text.replace(/\s+/g, ' ').slice(0, 140);
    speechStartedAt = performance.now();
    speaksUntil = speechStartedAt + Math.min(2300, 280 + phonemes.length * 23);
    let previous = 0;
    const tick = (time: number) => {
      if (time >= speaksUntil || !canMove()) return idle();
      frame = requestAnimationFrame(tick);
      if (time - previous < 30) return;
      previous = time;
      const elapsed = time - speechStartedAt;
      const phoneme = phonemes.charAt(Math.floor(elapsed / 90) % phonemes.length);
      const vowel = /[aeiouáéíóúü]/i.test(phoneme);
      const width = /[\p{L}\d]/u.test(phoneme) ? (vowel ? 9.5 : 5) : 1;
      const envelope = Math.min(1, elapsed / 140, (speaksUntil - time) / 160);
      const mouth = (0.2 + 0.8 * Math.abs(Math.sin(elapsed / 62))) * width * envelope;
      draw(
        Math.sin(elapsed / 560) * 0.8 * envelope,
        Math.sin(elapsed / 210) * 1.2 * envelope,
        0,
        mouth,
      );
    };
    frame = requestAnimationFrame(tick);
  }

  function open() {
    active = true;
    if (!image.getAttribute('src')) image.src = image.dataset.serranaImage!;
    idle();
  }

  function close() {
    active = false;
    stopMotion();
  }

  function update(value: AvatarState) {
    container.dataset.state = value;
    const text =
      value === 'ready'
        ? 'Lista para conversar'
        : value === 'thinking'
          ? 'Consultando la guía'
          : 'Respondiendo';
    label.lastChild!.textContent = text;
    if (value === 'ready') {
      const now = performance.now();
      if (active && now < speaksUntil) {
        // Finish the current mouth shape as the last text becomes visible.
        speaksUntil = Math.min(speaksUntil, now + 150);
      } else {
        idle();
      }
    }
  }

  return { image, media, open, close, update, talk, idle };
}
