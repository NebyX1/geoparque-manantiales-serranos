export const photoProfiles = {
  'place-cover': {
    width: 4352,
    height: 2448,
    widths: [640, 960, 1280, 1920, 2560, 3840, 4352],
    fallback: 1280,
    sizes: '100vw',
  },
  'place-card': {
    width: 1280,
    height: 1600,
    widths: [320, 480, 640, 960, 1280],
    fallback: 640,
    sizes: '(max-width: 620px) 92vw, (max-width: 1050px) 46vw, 480px',
  },
  editorial: {
    width: 1920,
    height: 1080,
    widths: [480, 640, 960, 1280, 1920],
    fallback: 960,
    sizes: '(max-width: 700px) 92vw, 45vw',
  },
  reading: {
    width: 2560,
    height: 1440,
    widths: [480, 640, 960, 1280, 1920, 2560],
    fallback: 960,
    sizes: '(max-width: 800px) 94vw, 900px',
  },
  thumbnail: {
    width: 640,
    height: 480,
    widths: [160, 320, 640],
    fallback: 160,
    sizes: '88px',
  },
  gallery: {
    width: 2560,
    height: 1440,
    widths: [640, 960, 1280, 1920, 2560],
    fallback: 960,
    sizes: '(max-width: 1250px) 94vw, 1200px',
  },
  immersive: {
    width: 1600,
    height: 900,
    widths: [320, 480, 640, 960, 1280, 1600],
    fallback: 640,
    sizes: '(max-width: 480px) calc(100vw - 56px), 420px',
  },
};

export const heroDesktopProfile = { width: 3840, height: 2160 };

export const publishedPhotoFile = (key) => `src/assets/images/place-photo/published/${key}.webp`;
